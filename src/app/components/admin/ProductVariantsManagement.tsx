import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
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
  Edit2,
  Trash2,
  AlertTriangle,
  Package,
  Ban,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { toast } from "sonner";
import { variantService } from "../../../services/variant.service";
import { productService } from "../../../services/product.service";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Variant {
  variant_id: number;
  product_id: number;
  product_name?: string;
  sku: string;
  size: string | null;
  color: string | null;
  material: string | null;
  additional_price: number;
  stock_quantity: number;
  created_at: string;
  status?: string | number | boolean;
}

interface Product {
  product_id: number;
  product_name: string;
}

interface VariantFormData {
  product_id: string;
  sku: string;
  size: string;
  color: string;
  material: string;
  additional_price: string;
  stock_quantity: string;
}

interface PaginationMeta {
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

const formatPrice = (price: number): string =>
  price.toLocaleString() + " ₫";

const formatDate = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

/** Check if the variant is active based on its status field. */
const isVariantActive = (variant: Variant): boolean => {
  const s = variant.status;
  if (s === undefined || s === null) return true;
  if (typeof s === "boolean") return s;
  if (typeof s === "number") return s === 1;
  if (typeof s === "string") {
    if (s === "1" || s === "active" || s === "true") return true;
    return false;
  }
  return true;
};

const getStatusBadge = (variant: Variant) => {
  const active = isVariantActive(variant);
  if (active) {
    return (
      <Badge className="bg-success hover:bg-success/90 whitespace-nowrap">
        Hoạt động
      </Badge>
    );
  }
  return (
    <Badge
      variant="destructive"
      className="bg-destructive hover:bg-destructive/90 whitespace-nowrap"
    >
      Ngừng sử dụng
    </Badge>
  );
};

const getStockBadge = (quantity: number) => {
  if (quantity > 0) {
    return (
      <Badge className="bg-success hover:bg-success/90 whitespace-nowrap">
        Còn hàng ({quantity})
      </Badge>
    );
  }
  return (
    <Badge
      variant="destructive"
      className="bg-destructive hover:bg-destructive/90 whitespace-nowrap"
    >
      Hết hàng
    </Badge>
  );
};

const SKELETON_ROWS = 5;

const emptyFormData: VariantFormData = {
  product_id: "",
  sku: "",
  size: "",
  color: "",
  material: "",
  additional_price: "0",
  stock_quantity: "0",
};

const DEFAULT_PAGE_SIZE = 10;

/** Returns true if the given value represents "All products". */
const isAllProducts = (val: string | null | undefined): boolean =>
  val === "All" || val === "" || val === null || val === undefined;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProductVariantsManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const productIdFromUrl = searchParams.get("product_id");

  // ---- Data ---------------------------------------------------------------
  const [variants, setVariants] = useState<Variant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ---- Filters ------------------------------------------------------------
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string>(
    productIdFromUrl || "",
  );

  // ---- Pagination ---------------------------------------------------------
  const [page, setPage] = useState(1);
  const [limit] = useState(DEFAULT_PAGE_SIZE);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // ---- Dialog state -------------------------------------------------------
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSoftDeleteDialogOpen, setIsSoftDeleteDialogOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [formData, setFormData] = useState<VariantFormData>(emptyFormData);

  // ---- Product search (inside create dialog) ------------------------------
  const [productSearchText, setProductSearchText] = useState("");
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);

  // ---- Derived product labels ---------------------------------------------
  const selectedProductLabel = products.find(
    (p) => String(p.product_id) === formData.product_id,
  );

  const selectedFilterProductLabel = products.find(
    (p) => String(p.product_id) === selectedProductId,
  );

  // ---- Load products for dropdowns ----------------------------------------
  const loadProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const response = await productService.getAll({ limit: 1000 });
      console.log("Product response:", response); // Debug log
      const data = response.data?.data;
      setProducts(data?.products || []);
    } catch {
      // silent
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // ---- Load variants (server-side paginated) ------------------------------
  const loadVariants = useCallback(async () => {
    try {
      setLoading(true);

      const params: {
        page: number;
        limit: number;
        product_id?: number;
        search?: string;
      } = {
        page,
        limit,
      };

      if (!isAllProducts(selectedProductId)) {
        params.product_id = Number(selectedProductId);
      }

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const response = await variantService.getAll(params);
      const data = response.data?.data;

      // Support multiple response shapes
      const variantList: Variant[] = Array.isArray(data)
        ? data
        : data?.variants ?? data?.results ?? [];

      // Enrich with product name
      const productMap = new Map(
        products.map((p) => [p.product_id, p.product_name]),
      );
      const enrichedVariants = variantList.map((v) => ({
        ...v,
        product_name: productMap.get(v.product_id) || `ID: ${v.product_id}`,
      }));

      setVariants(enrichedVariants);

      // Pagination metadata from backend
      const paginationData = data?.pagination ?? data?.meta ?? data;
      if (paginationData && typeof paginationData.totalPages === "number") {
        setPagination({
          page: paginationData.page ?? page,
          limit: paginationData.limit ?? limit,
          total: paginationData.total ?? 0,
          totalPages: paginationData.totalPages ?? 1,
          hasNextPage: paginationData.hasNextPage ?? false,
          hasPrevPage: paginationData.hasPrevPage ?? false,
        });
      } else {
        // Fallback to calculating from returned items
        const totalItems = enrichedVariants.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / limit));
        setPagination({
          page: 1,
          limit,
          total: totalItems,
          totalPages,
          hasNextPage: false,
          hasPrevPage: false,
        });
      }
    } catch {
      toast.error("Tải danh sách biến thể thất bại");
    } finally {
      setLoading(false);
    }
  }, [selectedProductId, products, searchTerm, page, limit]);

  // ---- Initial load -------------------------------------------------------
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (products.length > 0) {
      setPage(1);
      loadVariants();
    }
  }, [selectedProductId, products]);

  // Reload when page changes
  useEffect(() => {
    if (products.length > 0) {
      loadVariants();
    }
  }, [page]);

  // ---- Debounced search ---------------------------------------------------
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setPage(1);
      if (products.length > 0) {
        loadVariants();
      }
    }, 500);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm]);

  // ---- Handle URL product_id filter ---------------------------------------
  useEffect(() => {
    if (productIdFromUrl && !isAllProducts(productIdFromUrl)) {
      setSelectedProductId(productIdFromUrl);
    }
  }, [productIdFromUrl]);

  // ---- Dialog helpers -----------------------------------------------------
  const resetForm = () => {
    setFormData(emptyFormData);
  };

  const handleOpenCreate = () => {
    resetForm();
    if (!isAllProducts(selectedProductId)) {
      setFormData((prev) => ({ ...prev, product_id: selectedProductId }));
    }
    setIsCreateDialogOpen(true);
  };

  const handleOpenEdit = async (variant: Variant) => {
    try {
      setSelectedVariant(variant);
      const response = await variantService.getById(variant.variant_id);
      const data = response.data?.data || response.data;

      setFormData({
        product_id: String(data.product_id),
        sku: data.sku || "",
        size: data.size || "",
        color: data.color || "",
        material: data.material || "",
        additional_price: String(data.additional_price ?? "0"),
        stock_quantity: String(data.stock_quantity ?? "0"),
      });
      setIsEditDialogOpen(true);
    } catch {
      toast.error("Tải thông tin biến thể thất bại");
    }
  };

  const handleOpenDelete = (variant: Variant) => {
    setSelectedVariant(variant);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenSoftDelete = (variant: Variant) => {
    setSelectedVariant(variant);
    setIsSoftDeleteDialogOpen(true);
  };

  // ---- Form handler -------------------------------------------------------
  const handleChange = (field: keyof VariantFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ---- Validation ---------------------------------------------------------
  const validateForm = (): string | null => {
    if (!formData.product_id) return "Vui lòng chọn sản phẩm";
    if (!formData.sku.trim()) return "Vui lòng nhập SKU";
    const additionalPrice = Number(formData.additional_price);
    if (isNaN(additionalPrice) || additionalPrice < 0)
      return "Giá cộng thêm phải >= 0";
    const stockQty = Number(formData.stock_quantity);
    if (isNaN(stockQty) || stockQty < 0)
      return "Số lượng tồn kho phải >= 0";
    return null;
  };

  // ---- Save ---------------------------------------------------------------
  const handleSave = async () => {
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = {
        sku: formData.sku.trim(),
        size: formData.size || null,
        color: formData.color || null,
        material: formData.material || null,
        additional_price: Number(formData.additional_price),
        stock_quantity: Number(formData.stock_quantity),
      };

      if (isEditDialogOpen && selectedVariant) {
        await variantService.update(selectedVariant.variant_id, payload);
        toast.success("Cập nhật biến thể thành công");
      } else {
        await variantService.create(Number(formData.product_id), payload);
        toast.success("Thêm biến thể thành công");
      }

      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
      resetForm();
      setPage(1);
      await loadVariants();
    } catch {
      const message = isEditDialogOpen
        ? "Cập nhật biến thể thất bại"
        : "Thêm biến thể thất bại";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // ---- Delete -------------------------------------------------------------
  const handleDelete = async () => {
    if (!selectedVariant) return;
    setIsSaving(true);
    try {
      await variantService.delete(selectedVariant.variant_id);
      toast.success("Xóa biến thể thành công");
      setIsDeleteDialogOpen(false);
      setSelectedVariant(null);
      await loadVariants();
    } catch {
      toast.error("Xóa biến thể thất bại");
    } finally {
      setIsSaving(false);
    }
  };

  // ---- Soft Delete --------------------------------------------------------
  const handleSoftDelete = async () => {
    if (!selectedVariant) return;
    setIsSaving(true);
    try {
      await variantService.softDelete(selectedVariant.variant_id);
      toast.success("Đã ngừng sử dụng biến thể");
      setIsSoftDeleteDialogOpen(false);
      setSelectedVariant(null);
      await loadVariants();
    } catch {
      toast.error("Ngừng sử dụng biến thể thất bại");
    } finally {
      setIsSaving(false);
    }
  };

  // ---- Pagination ---------------------------------------------------------
  const goToPage = useCallback((p: number) => {
    const target = Math.max(1, Math.min(p, pagination.totalPages));
    setPage(target);
  }, [pagination.totalPages]);

  const goFirstPage = useCallback(() => setPage(1), []);
  const goPreviousPage = useCallback(() => {
    setPage((prev) => Math.max(1, prev - 1));
  }, []);
  const goNextPage = useCallback(() => {
    setPage((prev) => Math.min(pagination.totalPages, prev + 1));
  }, [pagination.totalPages]);
  const goLastPage = useCallback(() => {
    setPage(pagination.totalPages);
  }, [pagination.totalPages]);

  // ---- Skeleton rows for loading state -----------------------------------
  const renderSkeletonRows = () =>
    Array.from({ length: SKELETON_ROWS }).map((_, i) => (
      <TableRow key={`skeleton-${i}`}>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell className="text-right">
          <div className="flex gap-1 justify-end">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </TableCell>
      </TableRow>
    ));

  // ---- Render -------------------------------------------------------------
  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Biến Thể Sản Phẩm</h1>
          <p className="text-muted-foreground">
            Quản lý biến thể sản phẩm, mã SKU, số lượng tồn kho và giá cộng thêm
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-accent hover:bg-accent/90"
        >
          <Plus className="size-4 mr-2" />
          Thêm Biến Thể
        </Button>
      </div>

      {/* FILTERS */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo SKU hoặc tên sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Product filter */}
            <div>
              <select
                value={selectedProductId || "All"}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedProductId(val);
                  setPage(1);
                  if (val && val !== "All") {
                    setSearchParams({ product_id: val });
                  } else {
                    setSearchParams({});
                  }
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="All">Tất cả sản phẩm</option>
                {products.map((product) => (
                  <option key={product.product_id} value={String(product.product_id)}>
                    {product.product_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* VARIANTS TABLE */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Kích thước</TableHead>
                <TableHead>Màu sắc</TableHead>
                <TableHead>Chất liệu</TableHead>
                <TableHead>Giá cộng thêm</TableHead>
                <TableHead>Tồn kho</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="w-28 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                renderSkeletonRows()
              ) : variants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-16">
                    <div className="flex flex-col items-center">
                      <Package className="size-12 text-muted-foreground mb-3" />
                      <h3 className="text-lg font-semibold mb-2">
                        Không tìm thấy biến thể nào
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        {searchTerm
                          ? "Thử điều chỉnh bộ lọc tìm kiếm"
                          : isAllProducts(selectedProductId)
                            ? "Chưa có biến thể nào trong hệ thống"
                            : "Thêm biến thể đầu tiên cho sản phẩm này"}
                      </p>
                      {!isAllProducts(selectedProductId) && (
                        <Button
                          onClick={handleOpenCreate}
                          className="bg-accent hover:bg-accent/90"
                        >
                          <Plus className="size-4 mr-2" />
                          Thêm Biến Thể
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                variants.map((variant) => (
                  <TableRow
                    key={variant.variant_id}
                    className="hover:bg-secondary/50"
                  >
                    <TableCell>
                      <span className="font-mono font-medium text-sm">
                        {variant.sku}
                      </span>
                    </TableCell>
                    <TableCell>{variant.product_name || "---"}</TableCell>
                    <TableCell>{variant.size || "---"}</TableCell>
                    <TableCell>
                      {variant.color ? (
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block size-4 rounded-full border border-border"
                            style={{
                              backgroundColor: variant.color.toLowerCase(),
                            }}
                          />
                          {variant.color}
                        </div>
                      ) : (
                        "---"
                      )}
                    </TableCell>
                    <TableCell>{variant.material || "---"}</TableCell>
                    <TableCell className="font-medium">
                      {variant.additional_price > 0
                        ? formatPrice(variant.additional_price)
                        : "---"}
                    </TableCell>
                    <TableCell>
                      {getStockBadge(variant.stock_quantity)}
                    </TableCell>
                    <TableCell>{getStatusBadge(variant)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(variant.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        {/* Edit */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(variant)}
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="size-3" />
                        </Button>
                        {/* Soft Delete */}
                        {isVariantActive(variant) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenSoftDelete(variant)}
                            className="text-warning hover:bg-warning/10 border-warning/30"
                            title="Ngừng sử dụng"
                          >
                            <Ban className="size-3" />
                          </Button>
                        )}
                        {/* Hard Delete */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDelete(variant)}
                          className="text-destructive hover:bg-destructive/10"
                          title="Xóa"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination footer */}
        {!loading && variants.length > 0 && (
          <div className="px-4 py-3 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              <span>
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <span className="mx-2">•</span>
              <span>Tổng số: {pagination.total} biến thể</span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={goFirstPage}
                disabled={page <= 1 || loading}
                title="Đầu"
              >
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goPreviousPage}
                disabled={page <= 1 || loading}
                title="Trước"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-3 min-w-[80px] text-center">
                {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={goNextPage}
                disabled={page >= pagination.totalPages || loading}
                title="Sau"
              >
                <ChevronRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goLastPage}
                disabled={page >= pagination.totalPages || loading}
                title="Cuối"
              >
                <ChevronsRight className="size-4" />
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
        <DialogContent className="max-w-lg">
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
              {isEditDialogOpen ? "Chỉnh Sửa Biến Thể" : "Thêm Biến Thể"}
            </DialogTitle>
            <DialogDescription>
              {isEditDialogOpen
                ? "Cập nhật thông tin biến thể"
                : "Tạo biến thể mới cho sản phẩm"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Product (create) — simple search + dropdown */}
            {!isEditDialogOpen && (
              <div>
                <Label className="mb-2" htmlFor="product_id">
                  Sản phẩm <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setProductDropdownOpen(!productDropdownOpen);
                      setProductSearchText("");
                    }}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    {selectedProductLabel
                      ? selectedProductLabel.product_name
                      : "Chọn sản phẩm..."}
                    <span className="ml-2 size-4 shrink-0 opacity-50">▼</span>
                  </button>

                  {productDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border border-input bg-background shadow-lg">
                      {/* Search input */}
                      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                        <Search className="size-4 shrink-0 opacity-50" />
                        <input
                          placeholder="Tìm kiếm sản phẩm..."
                          value={productSearchText}
                          onChange={(e) => setProductSearchText(e.target.value)}
                          className="flex h-8 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                          autoFocus
                        />
                      </div>

                      {/* Product list */}
                      <div className="max-h-[300px] overflow-y-auto">
                        {loadingProducts ? (
                          <div className="py-6 text-center text-sm text-muted-foreground">
                            Đang tải...
                          </div>
                        ) : (
                          (() => {
                            const filtered = productSearchText.trim()
                              ? products.filter((p) =>
                                  p.product_name
                                    .toLowerCase()
                                    .includes(productSearchText.trim().toLowerCase())
                                )
                              : products;

                            return filtered.length === 0 ? (
                              <div className="py-6 text-center text-sm text-muted-foreground">
                                Không tìm thấy sản phẩm
                              </div>
                            ) : (
                              filtered.map((product) => (
                                <button
                                  key={product.product_id}
                                  type="button"
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      product_id: String(product.product_id),
                                    }));
                                    setProductSearchText("");
                                    setProductDropdownOpen(false);
                                  }}
                                >
                                  {product.product_name}
                                </button>
                              ))
                            );
                          })()
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Product (edit - readonly) */}
            {isEditDialogOpen && selectedVariant && (
              <div>
                <Label className="mb-2">Sản phẩm</Label>
                <Input
                  value={selectedVariant.product_name || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
            )}

            {/* SKU */}
            <div>
              <Label className="mb-2" htmlFor="sku">
                SKU <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleChange("sku", e.target.value)}
                placeholder="VD: BMB-S-L-001"
              />
            </div>

            {/* Size, Color, Material */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="mb-2" htmlFor="size">
                  Kích thước
                </Label>
                <Input
                  id="size"
                  value={formData.size}
                  onChange={(e) => handleChange("size", e.target.value)}
                  placeholder="VD: S, M, L"
                />
              </div>
              <div>
                <Label className="mb-2" htmlFor="color">
                  Màu sắc
                </Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => handleChange("color", e.target.value)}
                  placeholder="VD: Đỏ, Xanh"
                />
              </div>
              <div>
                <Label className="mb-2" htmlFor="material">
                  Chất liệu
                </Label>
                <Input
                  id="material"
                  value={formData.material}
                  onChange={(e) => handleChange("material", e.target.value)}
                  placeholder="VD: Cotton"
                />
              </div>
            </div>

            {/* Additional Price & Stock Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2" htmlFor="additional_price">
                  Giá cộng thêm
                </Label>
                <Input
                  id="additional_price"
                  type="number"
                  min="0"
                  value={formData.additional_price}
                  onChange={(e) =>
                    handleChange("additional_price", e.target.value)
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="mb-2" htmlFor="stock_quantity">
                  {isEditDialogOpen ? "Tồn kho" : "Tồn kho ban đầu"}
                </Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  min="0"
                  value={
                    isEditDialogOpen
                      ? formData.stock_quantity
                      : "0"
                  }
                  onChange={(e) =>
                    handleChange("stock_quantity", e.target.value)
                  }
                  disabled={!isEditDialogOpen}
                  className={!isEditDialogOpen ? "bg-muted cursor-not-allowed" : ""}
                  placeholder="0"
                />
                {!isEditDialogOpen && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Tồn kho được quản lý qua thao tác nhập kho
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setIsEditDialogOpen(false);
              }}
              disabled={isSaving}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-accent hover:bg-accent/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" /> Đang lưu...
                </>
              ) : isEditDialogOpen ? (
                "Cập nhật"
              ) : (
                "Lưu"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SOFT DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={isSoftDeleteDialogOpen}
        onOpenChange={setIsSoftDeleteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-warning" />
              Ngừng sử dụng biến thể
            </DialogTitle>
            <DialogDescription>
              <p>Bạn có chắc muốn ngừng sử dụng biến thể này không?</p>
              {selectedVariant && (
                <div className="mt-3 space-y-1">
                  <p className="font-medium">
                    SKU:{" "}
                    <span className="font-mono">{selectedVariant.sku}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sản phẩm: {selectedVariant.product_name || "---"}
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSoftDeleteDialogOpen(false)}
              disabled={isSaving}
            >
              Hủy
            </Button>
            <Button
              variant="default"
              className="bg-warning hover:bg-warning/90 text-warning-foreground"
              onClick={handleSoftDelete}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" /> Đang xử lý...
                </>
              ) : (
                "Ngừng sử dụng"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              Xóa Biến Thể
            </DialogTitle>
            <DialogDescription>
              <p>Bạn có chắc chắn muốn xóa biến thể này?</p>
              {selectedVariant && (
                <p className="mt-2 font-medium">
                  SKU:{" "}
                  <span className="font-mono">{selectedVariant.sku}</span>
                </p>
              )}
              <p className="mt-1 text-sm text-destructive font-medium">
                Hành động này không thể hoàn tác.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSaving}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" /> Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}