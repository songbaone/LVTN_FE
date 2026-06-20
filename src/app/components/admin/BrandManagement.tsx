import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  Search,
  Loader2,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { brandService } from "../../../services/brand.service";

interface Brand {
  brand_id: number;
  brand_name: string;
  country: string;
  description: string;
  status: boolean; // true: active, false: inactive (from GET response)
  logo_url: string;
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const isValidPage = (p: any): p is number =>
  Number.isFinite(p) && p > 0;

/**
 * Convert a status value to backend-compatible string.
 * Backend expects: "1" (Active) or "0" (Inactive)
 */
const toStatusString = (status: any): "1" | "0" => {
  if (status === "1" || status === 1 || status === true) return "1";
  return "0";
};

/**
 * Convert boolean status (from GET response) to display-friendly string.
 */
const fromStatusBoolean = (status: boolean): "1" | "0" => {
  return status ? "1" : "0";
};

export default function BrandManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // formData.status is always "1" or "0" (string) — matches backend expectation
  const [formData, setFormData] = useState({
    brand_name: "",
    country: "",
    description: "",
    status: "1" as "1" | "0",
  });

  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Safe page: always a valid positive integer
  const safePage = isValidPage(page) ? page : 1;

  useEffect(() => {
    loadBrands();
  }, [safePage]);

  const loadBrands = useCallback(async () => {
    try {
      setLoading(true);
      const response = await brandService.getAll({ page: safePage, limit });
      const data = response.data?.data;
      setBrands(data?.brands || []);
      if (data?.pagination && isValidPage(data.pagination.page)) {
        setPagination(data.pagination);
      } else {
        setPagination({ page: 1, limit: 10, total: 0, totalPages: 1 });
      }
    } catch {
      toast.error("Tải danh sách thương hiệu thất bại");
    } finally {
      setLoading(false);
    }
  }, [safePage, limit]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setSelectedLogo(null);
    setLogoPreview(null);
    setCurrentLogoUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      brand_name: "",
      country: "",
      description: "",
      status: "1",
    });
    setSelectedLogo(null);
    setLogoPreview(null);
    setCurrentLogoUrl("");
    setIsCreateDialogOpen(true);
  };

  const handleOpenEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setFormData({
      brand_name: brand.brand_name,
      country: brand.country || "",
      description: brand.description || "",
      // Convert GET response boolean → "1" / "0" string
      status: fromStatusBoolean(brand.status),
    });
    setSelectedLogo(null);
    setLogoPreview(null);
    setCurrentLogoUrl(brand.logo_url || "");
    setIsEditDialogOpen(true);
  };

  const handleOpenDelete = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveBrand = async () => {
    if (!formData.brand_name.trim()) {
      toast.error("Vui lòng nhập tên thương hiệu");
      return;
    }

    setIsSaving(true);

    try {
      const formPayload = new FormData();
      formPayload.append("brand_name", formData.brand_name.trim());

      if (formData.country) {
        formPayload.append("country", formData.country.trim());
      }

      if (formData.description) {
        formPayload.append("description", formData.description.trim());
      }

      // Always send status as "1" or "0" — backend validates isIn([0, 1, '0', '1'])
      const statusValue = toStatusString(formData.status);
      formPayload.append("status", statusValue);

      if (selectedLogo) {
        formPayload.append("logo", selectedLogo);
      }

      // Debug payload
      console.log(
        isEditDialogOpen ? "UPDATE BRAND PAYLOAD" : "CREATE BRAND PAYLOAD",
        Object.fromEntries(formPayload.entries())
      );

      if (isEditDialogOpen && selectedBrand) {
        await brandService.update(selectedBrand.brand_id, formPayload);
        toast.success("Cập nhật thương hiệu thành công");
      } else {
        await brandService.create(formPayload);
        toast.success("Thêm thương hiệu thành công");
      }

      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
      await loadBrands();
    } catch {
      const message = isEditDialogOpen
        ? "Cập nhật thương hiệu thất bại"
        : "Thêm thương hiệu thất bại";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBrand) return;

    setIsSaving(true);

    try {
      await brandService.delete(selectedBrand.brand_id);
      toast.success("Xóa thương hiệu thành công");
      setIsDeleteDialogOpen(false);
      await loadBrands();
    } catch {
      toast.error("Xóa thương hiệu thất bại");
    } finally {
      setIsSaving(false);
    }
  };

  // Safe page setter — guarantees page is always a valid positive integer
  const goToPage = useCallback((p: number) => {
    if (isValidPage(p)) {
      setPage(p);
    } else {
      setPage(1);
    }
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

  const getStatusBadge = (status: boolean) => {
    if (status) {
      return <Badge className="bg-success">Hoạt động</Badge>;
    }
    return <Badge className="bg-warning">Ngừng hoạt động</Badge>;
  };

  const getLogoUrl = (logo_url: string) => {
    if (!logo_url) return "";
    if (logo_url.startsWith("http")) return logo_url;
    return `http://localhost:3000${logo_url}`;
  };

  // Pagination helpers
  const startPage = Math.max(1, pagination.page - 2);
  const endPage = Math.min(pagination.totalPages, pagination.page + 2);
  const pageNumbers: number[] = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quản Lý Thương Hiệu</h1>
          <p className="text-muted-foreground">Quản lý thương hiệu sản phẩm</p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-accent hover:bg-accent/90"
        >
          <Plus className="size-4 mr-2" />
          Thêm Thương Hiệu
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm thương hiệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brands Table */}
      <Card>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logo</TableHead>
                <TableHead>Tên Thương Hiệu</TableHead>
                <TableHead>Quốc Gia</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead>Ngày Tạo</TableHead>
                <TableHead className="text-right">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <div className="flex justify-center">
                      <Loader2 className="size-8 animate-spin text-muted-foreground" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : brands.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center">
                      <div className="size-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                        <Award className="size-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        Không có thương hiệu nào
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Hãy thêm thương hiệu đầu tiên
                      </p>
                      <Button
                        onClick={handleOpenCreate}
                        className="bg-accent hover:bg-accent/90"
                      >
                        <Plus className="size-4 mr-2" />
                        Thêm Thương Hiệu
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                brands.map((brand) => (
                  <TableRow key={brand.brand_id} className="hover:bg-secondary/50">
                    <TableCell>
                      <div className="size-14 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
                        {brand.logo_url ? (
                          <img
                            src={getLogoUrl(brand.logo_url)}
                            alt={brand.brand_name}
                            className="size-14 object-cover"
                          />
                        ) : (
                          <ImageIcon className="size-6 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold">{brand.brand_name}</p>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {brand.country || "---"}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(brand.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {brand.created_at
                        ? new Date(brand.created_at).toLocaleDateString("vi-VN")
                        : "---"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(brand)}
                        >
                          <Edit2 className="size-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDelete(brand)}
                          className="text-destructive hover:bg-destructive/10"
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
        </div>

        {/* Page Info & Pagination */}
        {!loading && brands.length > 0 && (
          <div className="px-4 py-3 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Page info */}
            <div className="text-sm text-muted-foreground">
              <span>Hiển thị {brands.length} thương hiệu</span>
              <span className="mx-2">•</span>
              <span>
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <span className="mx-2">•</span>
              <span>Tổng số: {pagination.total} thương hiệu</span>
            </div>

            {/* Pagination buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goPreviousPage}
                disabled={!isValidPage(page) || page <= 1 || loading}
              >
                <ChevronLeft className="size-4 mr-1" />
                Trước
              </Button>

              {pageNumbers.map((p) => (
                <Button
                  key={p}
                  variant={p === pagination.page ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(p)}
                  disabled={loading}
                  className={
                    p === pagination.page
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }
                >
                  {p}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={goNextPage}
                disabled={
                  !isValidPage(page) ||
                  page >= pagination.totalPages ||
                  loading
                }
              >
                Sau
                <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen ? "Cập nhật thương hiệu" : "Thêm thương hiệu"}
            </DialogTitle>
            <DialogDescription>
              {isEditDialogOpen
                ? "Cập nhật thông tin thương hiệu"
                : "Thêm thương hiệu sản phẩm mới"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Logo upload */}
            <div>
              <Label className="mb-2">Logo thương hiệu</Label>
              <div className="mt-2 space-y-3">
                {(logoPreview || currentLogoUrl) && (
                  <div className="relative inline-block">
                    <img
                      src={logoPreview || getLogoUrl(currentLogoUrl)}
                      alt="Logo preview"
                      className="size-24 rounded-lg object-cover border border-border"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 size-5 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/90"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                )}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleLogoSelect}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent/90 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Chấp nhận: JPEG, PNG, WebP
                </p>
              </div>
            </div>

            {/* Brand name */}
            <div>
              <Label className="mb-2" htmlFor="brand_name">
                Tên thương hiệu <span className="text-destructive">*</span>
              </Label>
              <Input
                id="brand_name"
                value={formData.brand_name}
                onChange={(e) => handleChange("brand_name", e.target.value)}
                placeholder="VD: BabyCare"
              />
            </div>

            {/* Country */}
            <div>
              <Label className="mb-2" htmlFor="country">Quốc gia</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleChange("country", e.target.value)}
                placeholder="VD: Việt Nam"
              />
            </div>

            {/* Status — values are "1" and "0" to match backend expectation */}
            <div>
              <Label className="mb-2" htmlFor="status">Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Hoạt động</SelectItem>
                  <SelectItem value="0">Ngừng hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <Label className="mb-2" htmlFor="description">
                Mô tả
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Mô tả ngắn về thương hiệu"
                rows={4}
              />
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
              onClick={handleSaveBrand}
              disabled={isSaving}
              className="bg-accent hover:bg-accent/90"
            >
              {isSaving && <Loader2 className="size-4 mr-2 animate-spin" />}
              {isSaving
                ? "Đang lưu..."
                : isEditDialogOpen
                  ? "Cập nhật thương hiệu"
                  : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa Thương Hiệu</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa "{selectedBrand?.brand_name}"? Hành
              động này không thể hoàn tác.
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
              {isSaving && <Loader2 className="size-4 mr-2 animate-spin" />}
              {isSaving ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}