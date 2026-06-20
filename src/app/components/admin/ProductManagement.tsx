import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Plus,
  Search,
  Loader2,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit2,
  Star,
  Upload,
  AlertTriangle,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { productService, API_BASE_URL } from "../../../services/product.service";
import { categoryService } from "../../../services/category.service";
import { brandService } from "../../../services/brand.service";

const MAX_IMAGES = 10;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProductImage {
  image_id: number;
  image_url: string;
  is_main: boolean;
}

interface Product {
  product_id: number;
  product_name: string;
  category_id: number;
  category_name: string;
  brand_id: number;
  brand_name: string;
  price: number;
  discount_price: number | null;
  short_description: string;
  description: string;
  weight: number | null;
  age_from: number | null;
  age_to: number | null;
  status: boolean;
  thumbnail: string | null;
  images: ProductImage[];
  variant_count: number;
  total_stock: number;
  created_at: string;
}

interface Category {
  category_id: number;
  category_name: string;
}

interface Brand {
  brand_id: number;
  brand_name: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const isValidPage = (p: any): p is number =>
  Number.isFinite(p) && p > 0;

const toStatusString = (status: any): "1" | "0" => {
  if (status === "1" || status === 1 || status === true) return "1";
  return "0";
};

const buildImageUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `http://localhost:3000${url}`;
};

const getThumbnail = (product: Product): string => {
  if (product.thumbnail) return buildImageUrl(product.thumbnail);
  if (product.images?.length) return buildImageUrl(product.images[0].image_url);
  return "";
};

const formatPrice = (price: number) => price.toLocaleString() + " ₫";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProductManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteMainImageDialogOpen, setIsDeleteMainImageDialogOpen] = useState(false);
  const [pendingDeleteImageId, setPendingDeleteImageId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // ---- Form state ---------------------------------------------------------
  const [formData, setFormData] = useState({
    product_name: "",
    category_id: "",
    brand_id: "",
    price: "",
    discount_price: "",
    short_description: "",
    description: "",
    weight: "",
    age_from: "",
    age_to: "",
    status: "1" as "1" | "0",
  });

  // ---- Image management ---------------------------------------------------
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newFilePreviews, setNewFilePreviews] = useState<string[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number>(-1);

  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [mainImageId, setMainImageId] = useState<number | null>(null);

  // ---- Data ---------------------------------------------------------------
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // ---- Pagination ---------------------------------------------------------
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const safePage = isValidPage(page) ? page : 1;

  // ---- Debounced search ---------------------------------------------------
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);



  useEffect(() => {
    loadProducts();
  }, [safePage]);

  useEffect(() => {
    loadOptions();
  }, []);

  // ---- Data loading -------------------------------------------------------

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { page: safePage, limit };
      if (searchTerm.trim()) params.product_name = searchTerm.trim();
      const response = await productService.getAll(params);
      const data = response.data?.data;
      setProducts(data?.products || []);
      if (data?.pagination && isValidPage(data.pagination.page)) {
        setPagination(data.pagination);
      } else {
        setPagination({
          page: 1, limit: 10, total: 0, totalPages: 1,
          hasNextPage: false, hasPrevPage: false,
        });
      }
    } catch {
      toast.error("Tải danh sách sản phẩm thất bại");
    } finally {
      setLoading(false);
    }
  }, [safePage, limit, searchTerm]);


  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setPage(1);

      if (safePage === 1) {
        loadProducts();
      }
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm]);

  const loadOptions = async () => {
    try {
      setLoadingOptions(true);
      const [catRes, brandRes] = await Promise.all([
        categoryService.getAll({ limit: 100 }),
        brandService.getAll({ limit: 100 }),
      ]);
      const catData = catRes.data?.data;
      const brandData = brandRes.data?.data;
      setCategories(catData?.categories || catData || []);
      setBrands(brandData?.brands || brandData || []);
    } catch {
      // silent
    } finally {
      setLoadingOptions(false);
    }
  };

  // ---- Form handlers ------------------------------------------------------

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ---- Image handlers (new files) -----------------------------------------

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const totalAfterAdd = existingImages.length + newFiles.length + files.length;
    if (totalAfterAdd > MAX_IMAGES) {
      toast.error(`Chỉ được tối đa ${MAX_IMAGES} ảnh`);
      return;
    }

    setNewFiles((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewFilePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveNewFile = (index: number) => {
    const wasMain = mainImageIndex === index;
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewFilePreviews((prev) => prev.filter((_, i) => i !== index));

    if (wasMain) {
      const remainingNewCount = newFiles.length - 1;
      if (remainingNewCount > 0) {
        const newMainIdx = index < newFiles.length - 1 ? index : 0;
        setMainImageIndex(newMainIdx);
      } else if (existingImages.length > 0) {
        const firstExisting = existingImages.find(
          (img) => !deletedImageIds.includes(img.image_id)
        );
        if (firstExisting) {
          setMainImageId(firstExisting.image_id);
          setMainImageIndex(-1);
        }
      } else {
        setMainImageIndex(-1);
      }
    } else if (mainImageIndex > index) {
      setMainImageIndex((prev) => prev - 1);
    }
  };

  const handleSetNewMain = (index: number) => {
    setMainImageIndex(index);
    setMainImageId(null);
  };

  // ---- Image handlers (existing images - edit mode only) ------------------

  const handleDeleteExistingImage = (imageId: number) => {
    const isMain = mainImageId === imageId;

    if (isMain) {
      setPendingDeleteImageId(imageId);
      setIsDeleteMainImageDialogOpen(true);
    } else {
      executeDeleteExistingImage(imageId);
    }
  };

  const executeDeleteExistingImage = (imageId: number) => {
    const wasMain = mainImageId === imageId;

    setDeletedImageIds((prev) => [...prev, imageId]);
    setExistingImages((prev) => prev.filter((img) => img.image_id !== imageId));

    if (wasMain) {
      const remainingExisting = existingImages.filter(
        (img) => img.image_id !== imageId && !deletedImageIds.includes(img.image_id)
      );
      if (remainingExisting.length > 0) {
        setMainImageId(remainingExisting[0].image_id);
      } else if (newFiles.length > 0) {
        setMainImageIndex(0);
        setMainImageId(null);
      } else {
        setMainImageId(null);
      }
    }
  };

  const confirmDeleteMainImage = () => {
    if (pendingDeleteImageId !== null) {
      executeDeleteExistingImage(pendingDeleteImageId);
      setPendingDeleteImageId(null);
    }
    setIsDeleteMainImageDialogOpen(false);
  };

  const handleSetExistingMain = (imageId: number) => {
    setMainImageId(imageId);
    setMainImageIndex(-1);
  };

  // ---- Dialog open / close ------------------------------------------------

  const resetAllState = () => {
    setNewFiles([]);
    setNewFilePreviews([]);
    setMainImageIndex(-1);
    setExistingImages([]);
    setDeletedImageIds([]);
    setMainImageId(null);
    setPendingDeleteImageId(null);
    setIsDeleteMainImageDialogOpen(false);
  };

  const handleOpenCreate = () => {
    setFormData({
      product_name: "",
      category_id: "",
      brand_id: "",
      price: "",
      discount_price: "",
      short_description: "",
      description: "",
      weight: "",
      age_from: "",
      age_to: "",
      status: "1",
    });
    resetAllState();
    setIsCreateDialogOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      product_name: product.product_name,
      category_id: String(product.category_id),
      brand_id: String(product.brand_id),
      price: String(product.price),
      discount_price: product.discount_price ? String(product.discount_price) : "",
      short_description: product.short_description || "",
      description: product.description || "",
      weight: product.weight ? String(product.weight) : "",
      age_from: product.age_from ? String(product.age_from) : "",
      age_to: product.age_to ? String(product.age_to) : "",
      status: toStatusString(product.status),
    });
    resetAllState();
    setExistingImages(product.images || []);

    const mainImg = (product.images || []).find((img) => img.is_main);
    if (mainImg) setMainImageId(mainImg.image_id);
    setIsEditDialogOpen(true);
  };

  const handleOpenDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  // ---- Save ---------------------------------------------------------------

  const handleSaveProduct = async () => {
    if (!formData.product_name.trim()) {
      toast.error("Vui lòng nhập tên sản phẩm");
      return;
    }
    if (!formData.category_id) {
      toast.error("Vui lòng chọn danh mục");
      return;
    }
    if (!formData.brand_id) {
      toast.error("Vui lòng chọn thương hiệu");
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      toast.error("Vui lòng nhập giá hợp lệ");
      return;
    }

    setIsSaving(true);

    try {
      const fp = new FormData();
      fp.append("product_name", formData.product_name.trim());
      fp.append("category_id", formData.category_id);
      fp.append("brand_id", formData.brand_id);
      fp.append("price", formData.price);
      fp.append("status", formData.status);

      if (formData.discount_price) fp.append("discount_price", formData.discount_price);
      if (formData.short_description) fp.append("short_description", formData.short_description.trim());
      if (formData.description) fp.append("description", formData.description.trim());
      if (formData.weight) fp.append("weight", formData.weight);
      if (formData.age_from) fp.append("age_from", formData.age_from);
      if (formData.age_to) fp.append("age_to", formData.age_to);

      if (isEditDialogOpen && selectedProduct) {
        if (deletedImageIds.length > 0) {
          fp.append("delete_image_ids", JSON.stringify(deletedImageIds));
        }
        if (mainImageId !== null) {
          fp.append("main_image_id", String(mainImageId));
        } else if (mainImageIndex >= 0) {
          fp.append("main_image_index", String(mainImageIndex));
        }
        newFiles.forEach((file) => fp.append("images", file));

        await productService.update(selectedProduct.product_id, fp);
        toast.success("Cập nhật sản phẩm thành công");
      } else {
        if (mainImageIndex >= 0) {
          fp.append("main_image_index", String(mainImageIndex));
        }
        newFiles.forEach((file) => fp.append("images", file));

        await productService.create(fp);
        toast.success("Thêm sản phẩm thành công");
      }

      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
      await loadProducts();
    } catch {
      const message = isEditDialogOpen
        ? "Cập nhật sản phẩm thất bại"
        : "Thêm sản phẩm thất bại";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // ---- Delete -------------------------------------------------------------

  const handleDelete = async () => {
    if (!selectedProduct) return;
    setIsSaving(true);
    try {
      await productService.delete(selectedProduct.product_id);
      toast.success("Xóa sản phẩm thành công");
      setIsDeleteDialogOpen(false);
      await loadProducts();
    } catch {
      toast.error("Xóa sản phẩm thất bại");
    } finally {
      setIsSaving(false);
    }
  };

  // ---- Pagination navigation ----------------------------------------------

  const goToPage = useCallback((p: number) => {
    if (isValidPage(p)) setPage(p);
    else setPage(1);
  }, []);

  const goPreviousPage = useCallback(() => {
    setPage((prev) => {
      const next = prev - 1;
      return isValidPage(next) ? next : 1;
    });
  }, []);

  const goNextPage = useCallback(() => {
    setPage((prev) => {
      const next = prev + 1;
      return next <= pagination.totalPages ? next : prev;
    });
  }, [pagination.totalPages]);

  // ---- UI helpers ---------------------------------------------------------

  const getStatusBadge = (status: boolean) => {
    if (status) return <Badge className="bg-success">Hoạt động</Badge>;
    return <Badge className="bg-warning">Ngừng hoạt động</Badge>;
  };

  const getStockBadge = (totalStock: number) => {
    if (totalStock > 0) {
      return <Badge className="bg-success">Còn hàng ({totalStock})</Badge>;
    }
    return <Badge variant="secondary">Hết hàng</Badge>;
  };

  const startPage = Math.max(1, pagination.page - 2);
  const endPage = Math.min(pagination.totalPages, pagination.page + 2);
  const pageNumbers: number[] = [];
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

  const totalImages = existingImages.length + newFiles.length;

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Sản Phẩm</h1>
          <p className="text-muted-foreground">Quản lý danh sách sản phẩm</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-accent hover:bg-accent/90">
          <Plus className="size-4 mr-2" />
          Thêm sản phẩm
        </Button>
      </div>

      {/* FILTERS */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (debounceRef.current) clearTimeout(debounceRef.current);
                  setPage(1);
                }
              }}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* PRODUCT TABLE */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hình ảnh</TableHead>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Thương hiệu</TableHead>
                <TableHead>Đơn giá</TableHead>
                <TableHead>Giá KM</TableHead>
                <TableHead>Biến thể</TableHead>
                <TableHead>Tồn kho</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="w-20 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-16">
                    <div className="flex justify-center">
                      <Loader2 className="size-8 animate-spin text-muted-foreground" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-16">
                    <div className="flex flex-col items-center">
                      <h3 className="text-lg font-semibold mb-2">Không có sản phẩm nào</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Hãy thêm sản phẩm đầu tiên
                      </p>
                      <Button onClick={handleOpenCreate} className="bg-accent hover:bg-accent/90">
                        <Plus className="size-4 mr-2" />
                        Thêm sản phẩm
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const thumb = getThumbnail(product);
                  return (
                    <TableRow key={product.product_id} className="hover:bg-secondary/50">
                      <TableCell>
                        <div className="size-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
                          {thumb ? (
                            <img src={thumb} alt={product.product_name} className="size-12 object-cover" />
                          ) : (
                            <ImageIcon className="size-5 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{product.product_name}</span>
                      </TableCell>
                      <TableCell>{product.category_name || "---"}</TableCell>
                      <TableCell>{product.brand_name || "---"}</TableCell>
                      <TableCell className="font-medium">{formatPrice(product.price)}</TableCell>
                      <TableCell>
                        {product.discount_price ? (
                          <span className="text-destructive font-medium">
                            {formatPrice(product.discount_price)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">---</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          <Layers className="size-3" />
                          {product.variant_count}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStockBadge(product.total_stock)}</TableCell>
                      <TableCell>{getStatusBadge(product.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {product.created_at
                          ? new Date(product.created_at).toLocaleDateString("vi-VN")
                          : "---"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="outline" size="sm" onClick={() => handleOpenEdit(product)}>
                            <Edit2 className="size-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDelete(product)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination footer */}
        {!loading && products.length > 0 && (
          <div className="px-4 py-3 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              <span>Hiển thị {products.length} sản phẩm</span>
              <span className="mx-2">•</span>
              <span>Trang {pagination.page} / {pagination.totalPages}</span>
              <span className="mx-2">•</span>
              <span>Tổng số: {pagination.total} sản phẩm</span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goPreviousPage}
                disabled={!isValidPage(page) || page <= 1 || loading}>
                <ChevronLeft className="size-4 mr-1" /> Trước
              </Button>
              {pageNumbers.map((p) => (
                <Button
                  key={p}
                  variant={p === pagination.page ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(p)}
                  disabled={loading}
                  className={p === pagination.page ? "bg-accent text-accent-foreground" : ""}
                >
                  {p}
                </Button>
              ))}
              <Button variant="outline" size="sm" onClick={goNextPage}
                disabled={!isValidPage(page) || page >= pagination.totalPages || loading}>
                Sau <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* CREATE / EDIT DIALOG */}
      <Dialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {isSaving && (
            <div className="absolute inset-0 z-50 bg-background/80 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <Loader2 className="size-10 animate-spin mx-auto mb-2 text-accent" />
                <p className="text-sm text-muted-foreground">Đang lưu...</p>
              </div>
            </div>
          )}

          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
            </DialogTitle>
            <DialogDescription>
              {isEditDialogOpen ? "Cập nhật thông tin sản phẩm" : "Thêm sản phẩm mới"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Product name */}
            <div>
              <Label className="mb-2" htmlFor="product_name">
                Tên sản phẩm <span className="text-destructive">*</span>
              </Label>
              <Input
                id="product_name"
                value={formData.product_name}
                onChange={(e) => handleChange("product_name", e.target.value)}
                placeholder="VD: Bỉm em bé"
              />

              {/* Read-only variant info under product name (edit mode only) */}
              {isEditDialogOpen && selectedProduct && (
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>
                    Biến thể: <strong>{selectedProduct.variant_count}</strong>
                  </span>
                  <span>
                    Tồn kho: <strong>{selectedProduct.total_stock}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Category & Brand */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2" htmlFor="category_id">
                  Danh mục <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => handleChange("category_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingOptions ? "Đang tải..." : "Chọn danh mục"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.category_id || cat.id} value={String(cat.category_id || cat.id)}>
                        {cat.category_name || cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2" htmlFor="brand_id">
                  Thương hiệu <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.brand_id}
                  onValueChange={(value) => handleChange("brand_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingOptions ? "Đang tải..." : "Chọn thương hiệu"} />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand: any) => (
                      <SelectItem key={brand.brand_id || brand.id} value={String(brand.brand_id || brand.id)}>
                        {brand.brand_name || brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price & Discount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2" htmlFor="price">
                  Đơn giá <span className="text-destructive">*</span>
                </Label>
                <Input id="price" type="number" min="0" value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)} placeholder="150000" />
              </div>
              <div>
                <Label className="mb-2" htmlFor="discount_price">
                  Giá khuyến mãi
                </Label>
                <Input id="discount_price" type="number" min="0" value={formData.discount_price}
                  onChange={(e) => handleChange("discount_price", e.target.value)} placeholder="120000" />
              </div>
            </div>

            {/* Weight, Age range, Status */}
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label className="mb-2" htmlFor="weight">
                  Cân nặng (g)
                </Label>
                <Input id="weight" type="number" min="0" value={formData.weight}
                  onChange={(e) => handleChange("weight", e.target.value)} placeholder="500" />
              </div>
              <div>
                <Label className="mb-2" htmlFor="age_from">
                  Tuổi từ
                </Label>
                <Input id="age_from" type="number" min="0" value={formData.age_from}
                  onChange={(e) => handleChange("age_from", e.target.value)} placeholder="0" />
              </div>
              <div>
                <Label className="mb-2" htmlFor="age_to">
                  Tuổi đến
                </Label>
                <Input id="age_to" type="number" min="0" value={formData.age_to}
                  onChange={(e) => handleChange("age_to", e.target.value)} placeholder="12" />
              </div>
              <div>
                <Label className="mb-2" htmlFor="status">
                  Trạng thái
                </Label>
                <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Hoạt động</SelectItem>
                    <SelectItem value="0">Ngừng hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Short description */}
            <div>
              <Label className="mb-2" htmlFor="short_description">
                Mô tả ngắn
              </Label>
              <Textarea id="short_description" value={formData.short_description}
                onChange={(e) => handleChange("short_description", e.target.value)}
                placeholder="Mô tả ngắn về sản phẩm" rows={2} />
            </div>

            {/* Description */}
            <div>
              <Label className="mb-2" htmlFor="description">
                Mô tả chi tiết
              </Label>
              <Textarea id="description" value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Mô tả chi tiết sản phẩm" rows={4} />
            </div>

            {/* IMAGE GALLERY */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="mb-2">Hình ảnh sản phẩm</Label>
                <span className="text-xs text-muted-foreground">
                  {totalImages} / {MAX_IMAGES} ảnh
                </span>
              </div>

              <div className="space-y-3">
                {isEditDialogOpen && existingImages.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {existingImages.map((img) => {
                      const isMain = mainImageId === img.image_id;
                      const isDeleted = deletedImageIds.includes(img.image_id);
                      if (isDeleted) return null;

                      return (
                        <div
                          key={img.image_id}
                          className={`relative group rounded-lg border-2 overflow-hidden ${isMain ? "border-accent" : "border-border"
                            }`}
                        >
                          <img src={buildImageUrl(img.image_url)} alt="" className="size-28 object-cover" />
                          {isMain && (
                            <div className="absolute top-1 left-1 bg-accent text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Star className="size-3 fill-current" /> Main
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!isMain && (
                              <button type="button" onClick={() => handleSetExistingMain(img.image_id)}
                                className="size-8 rounded-full bg-white/90 text-accent flex items-center justify-center hover:bg-white" title="Đặt làm ảnh chính">
                                <Star className="size-4" />
                              </button>
                            )}
                            <button type="button" onClick={() => handleDeleteExistingImage(img.image_id)}
                              className="size-8 rounded-full bg-white/90 text-destructive flex items-center justify-center hover:bg-white" title="Xóa ảnh">
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {newFilePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {newFilePreviews.map((preview, index) => {
                      const isMain = mainImageIndex === index;
                      return (
                        <div key={`new-${index}`}
                          className={`relative group rounded-lg border-2 overflow-hidden ${isMain ? "border-accent" : "border-border"}`}>
                          <img src={preview} alt="" className="size-28 object-cover" />
                          {isMain && (
                            <div className="absolute top-1 left-1 bg-accent text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Star className="size-3 fill-current" /> Main
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!isMain && (
                              <button type="button" onClick={() => handleSetNewMain(index)}
                                className="size-8 rounded-full bg-white/90 text-accent flex items-center justify-center hover:bg-white" title="Đặt làm ảnh chính">
                                <Star className="size-4" />
                              </button>
                            )}
                            <button type="button" onClick={() => handleRemoveNewFile(index)}
                              className="size-8 rounded-full bg-white/90 text-destructive flex items-center justify-center hover:bg-white" title="Xóa">
                              <X className="size-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {totalImages < MAX_IMAGES && (
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent/50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="size-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Nhấp để chọn ảnh</p>
                    <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP. Tối đa {MAX_IMAGES} ảnh.</p>
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple
                      onChange={handleFileSelect} className="hidden" />
                  </div>
                )}

                {totalImages === 0 && (
                  <p className="text-xs text-muted-foreground">Chưa có ảnh nào. Vui lòng thêm ảnh cho sản phẩm.</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline"
              onClick={() => { setIsCreateDialogOpen(false); setIsEditDialogOpen(false); }}
              disabled={isSaving}>
              Hủy
            </Button>
            <Button onClick={handleSaveProduct} disabled={isSaving} className="bg-accent hover:bg-accent/90">
              {isSaving ? (
                <><Loader2 className="size-4 mr-2 animate-spin" /> Đang lưu...</>
              ) : isEditDialogOpen ? (
                "Cập nhật sản phẩm"
              ) : (
                "Lưu"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE MAIN IMAGE CONFIRMATION DIALOG */}
      <Dialog open={isDeleteMainImageDialogOpen} onOpenChange={setIsDeleteMainImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-warning" />
              Xóa ảnh chính
            </DialogTitle>
            <DialogDescription>
              <p>Ảnh này hiện đang là ảnh chính của sản phẩm.</p>
              <p className="mt-2">Nếu xóa, ảnh khác sẽ tự động được chọn làm ảnh chính.</p>
              <p className="mt-2 font-medium">Bạn có muốn tiếp tục?</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDeleteMainImageDialogOpen(false); setPendingDeleteImageId(null); }}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDeleteMainImage}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE PRODUCT CONFIRMATION DIALOG */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              Xóa Sản Phẩm
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa "{selectedProduct?.product_name}"? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isSaving}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
              {isSaving ? <><Loader2 className="size-4 mr-2 animate-spin" /> Đang xóa...</> : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}