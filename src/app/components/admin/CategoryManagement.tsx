import { useState, useRef } from "react";
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
  Folder,
  FolderOpen,
  Plus,
  Edit2,
  Trash2,
  Search,
  ChevronRight,
  ChevronDown,
  Package,
  TrendingUp,
  Eye,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  parentId: string | null;
  description: string;
  productCount: number;
  status: "active" | "inactive";
  createdAt: string;
  imageUrl: string;
  children?: Category[];
}

const mapCategory = (item: any): Category => ({
  id: String(item.category_id),
  name: item.category_name,
  parentId: item.parent_id ? String(item.parent_id) : null,

  description: item.description || "",

  productCount: item.product_count || 0,

  status: item.status ? "active" : "inactive",

  createdAt: new Date().toISOString(),

  imageUrl: item.image_url || "",

  children: item.children?.map(mapCategory) || [],
});

import { useEffect } from "react";
import { categoryService } from "./../../../services/category.service";

export default function CategoryManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "1",
    "2",
    "4",
  ]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    parentId: "",
    description: "",
    status: "active" as "active" | "inactive",
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [statistics, setStatistics] = useState({
    total_categories: 0,
    active_categories: 0,
    total_products: 0,
    average_products_per_category: 0,
    parent_categories: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setStatsLoading(true);
      const response = await categoryService.getStatistics();
      setStatistics(response.data.data);
    } catch {
      toast.error("Không thể tải thống kê danh mục");
    } finally {
      setStatsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);

      const response = await categoryService.getTree();

      setCategories(response.data.data.tree.map(mapCategory));
    } catch (error) {
      toast.error("Tải danh mục thất bại");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const getAllCategories = (): Category[] => {
    const all: Category[] = [];
    categories.forEach((cat) => {
      all.push(cat);
      if (cat.children) {
        all.push(...cat.children);
      }
    });
    return all;
  };

  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || category.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setCurrentImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      name: "",
      parentId: "",
      description: "",
      status: "active",
    });
    setSelectedImage(null);
    setImagePreview(null);
    setCurrentImageUrl("");
    setIsCreateDialogOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      parentId: category.parentId || "",
      description: category.description,
      status: category.status,
    });
    setSelectedImage(null);
    setImagePreview(null);
    setCurrentImageUrl(category.imageUrl || "");
    setIsEditDialogOpen(true);
  };

  const handleOpenDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenDetail = (category: Category) => {
    setSelectedCategory(category);
    setIsDetailDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    setIsSaving(true);

    try {
      const formPayload = new FormData();
      formPayload.append("category_name", formData.name);

      if (formData.parentId && formData.parentId !== "root") {
        formPayload.append("parent_id", formData.parentId);
      }

      if (formData.description) {
        formPayload.append("description", formData.description);
      }

      formPayload.append("status", formData.status === "active" ? "1" : "0");

      if (selectedImage) {
        formPayload.append("image", selectedImage);
      }

      if (isEditDialogOpen && selectedCategory) {
        await categoryService.update(Number(selectedCategory.id), formPayload);
        toast.success("Cập nhật danh mục thành công");
      } else {
        await categoryService.create(formPayload);
        toast.success("Danh mục đã được tạo thành công");
      }

      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
      await Promise.all([loadCategories(), loadStatistics()]);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        (isEditDialogOpen
          ? "Không thể cập nhật danh mục"
          : "Không thể tạo danh mục");
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    setIsDeleting(true);

    try {
      await categoryService.delete(Number(selectedCategory.id));
      toast.success("Xóa danh mục thành công");
      setIsDeleteDialogOpen(false);
      await Promise.all([loadCategories(), loadStatistics()]);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không thể xóa danh mục";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusText = (status: string) => {
    return status === "active" ? "Hoạt động" : "Ngừng hoạt động";
  };

  const renderCategoryRow = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.includes(category.id);

    return (
      <>
        <TableRow key={category.id} className="hover:bg-secondary/50">
          <TableCell>
            <div
              className="flex items-center gap-2"
              style={{ paddingLeft: `${level * 24}px` }}
            >
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(category.id)}
                  className="hover:bg-secondary p-1 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="size-4" />
                  ) : (
                    <ChevronRight className="size-4" />
                  )}
                </button>
              ) : (
                <div className="w-6" />
              )}
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-secondary flex items-center justify-center text-2xl">
                  {category.imageUrl ? (
                    <img
                      src={"http://localhost:3000" + category.imageUrl}
                      alt={category.name}
                      className="size-10 rounded-lg object-cover"
                    />
                  ) : (
                    <Folder className="size-5 text-muted-foreground" />
                  )}
                </div>
                <span className="font-medium">{category.name}</span>
                <Badge variant="secondary" className="text-xs font-medium ml-1">
                  {category.productCount}
                </Badge>
              </div>
            </div>
          </TableCell>
          <TableCell>
            {category.parentId ? (
              <Badge variant="outline">
                {categories.find((c) => c.id === category.parentId)?.name ||
                  "N/A"}
              </Badge>
            ) : (
              <span className="text-muted-foreground text-sm">Gốc</span>
            )}
          </TableCell>
          <TableCell className="text-center font-medium">
            {category.productCount}
          </TableCell>
          <TableCell>
            <Badge
              className={
                category.status === "active" ? "bg-success" : "bg-warning"
              }
            >
              {getStatusText(category.status)}
            </Badge>
          </TableCell>
          <TableCell className="text-sm text-muted-foreground">
            {new Date(selectedCategory?.createdAt).toLocaleDateString("vi-VN")}
          </TableCell>
          <TableCell className="text-right">
            <div className="flex gap-1 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenDetail(category)}
              >
                <Eye className="size-3 mr-1" />
                Xem
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEdit(category)}
              >
                <Edit2 className="size-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenDelete(category)}
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          </TableCell>
        </TableRow>

        {hasChildren &&
          isExpanded &&
          category.children!.map((child) =>
            renderCategoryRow(child, level + 1),
          )}
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quản Lý Danh Mục</h1>
          <p className="text-muted-foreground">
            Quản lý và tổ chức danh mục sản phẩm
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-accent hover:bg-accent/90"
        >
          <Plus className="size-4 mr-2" />
          Thêm Danh Mục
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng Danh Mục
            </CardTitle>
            <Folder className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {statsLoading ? "--" : statistics?.total_categories}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {statsLoading
                ? "--"
                : `${statistics?.parent_categories} danh mục cha`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Danh Mục Hoạt Động
            </CardTitle>
            <FolderOpen className="size-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {statsLoading ? "--" : statistics?.active_categories}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Đang hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng Sản Phẩm
            </CardTitle>
            <Package className="size-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">
              {statsLoading ? "--" : statistics?.total_products}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Trên toàn bộ danh mục
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Trung Bình Sản Phẩm
            </CardTitle>
            <TrendingUp className="size-5 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-info">
              {statsLoading ? "--" : statistics?.average_products_per_category}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Mỗi danh mục</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm danh mục..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Categories Tree Table */}
      <Card>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên Danh Mục</TableHead>
                <TableHead>Danh Mục Cha</TableHead>
                <TableHead className="text-center">Sản Phẩm</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead>Ngày Tạo</TableHead>
                <TableHead className="text-right">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center">
                      <div className="size-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                        <Folder className="size-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        Không tìm thấy danh mục nào
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Hãy bắt đầu bằng cách tạo danh mục đầu tiên
                      </p>
                      <Button
                        onClick={handleOpenCreate}
                        className="bg-accent hover:bg-accent/90"
                      >
                        <Plus className="size-4 mr-2" />
                        Thêm Danh Mục
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category) =>
                  renderCategoryRow(category),
                )
              )}
            </TableBody>
          </Table>
        </div>
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
              {isEditDialogOpen ? "Cập nhật danh mục" : "Thêm danh mục"}
            </DialogTitle>
            <DialogDescription>
              {isEditDialogOpen
                ? "Cập nhật thông tin danh mục"
                : "Thêm danh mục sản phẩm mới"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">
                  Tên danh mục <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  className="mt-2"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="VD: Quần áo trẻ em"
                />
              </div>

              <div>
                <Label htmlFor="parentId" className="mb-2">
                  Danh mục cha
                </Label>
                <Select
                  value={formData.parentId}
                  onValueChange={(value) => handleChange("parentId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục cha (không bắt buộc)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="root">
                      Không có (danh mục gốc)
                    </SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status" className="mb-2">
                  Trạng thái
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => handleChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Ảnh danh mục</Label>
                <div className="mt-2 space-y-3">
                  {(imagePreview || currentImageUrl) && (
                    <div className="relative inline-block">
                      <img
                        src={
                          imagePreview ||
                          "http://localhost:3000" + currentImageUrl
                        }
                        alt="Preview"
                        className="size-24 rounded-lg object-cover border border-border"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
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
                      onChange={handleImageSelect}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent/90 cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Chấp nhận: JPEG, PNG, WebP
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                className="mt-2"
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Mô tả ngắn về danh mục"
                rows={3}
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
              onClick={handleSaveCategory}
              disabled={isSaving}
              className="bg-accent hover:bg-accent/90"
            >
              {isSaving && <Loader2 className="size-4 mr-2 animate-spin" />}
              {isSaving
                ? "Đang lưu..."
                : isEditDialogOpen
                  ? "Cập nhật danh mục"
                  : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa Danh Mục</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa "{selectedCategory?.name}"?
              {selectedCategory?.children &&
                selectedCategory.children.length > 0 && (
                  <span className="block mt-2 text-destructive">
                    <AlertCircle className="size-4 inline mr-1" />
                    Danh mục này có {selectedCategory.children.length} danh mục
                    con cũng sẽ bị xóa.
                  </span>
                )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="size-4 mr-2 animate-spin" />}
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi Tiết Danh Mục</DialogTitle>
          </DialogHeader>

          {selectedCategory && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="size-20 rounded-lg bg-secondary flex items-center justify-center text-4xl">
                  {selectedCategory.imageUrl ? (
                    <img
                      src={"http://localhost:3000" + selectedCategory.imageUrl}
                      alt={selectedCategory.name}
                      className="size-20 rounded-lg object-cover"
                    />
                  ) : (
                    <Folder className="size-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">
                    {selectedCategory.name}
                  </h2>
                  <Badge
                    className={
                      selectedCategory.status === "active"
                        ? "bg-success"
                        : "bg-warning"
                    }
                  >
                    {getStatusText(selectedCategory.status)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Sản Phẩm
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {selectedCategory.productCount}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Danh Mục Con
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {selectedCategory.children?.length || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Ngày Tạo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-medium">
                      {new Date(selectedCategory?.createdAt).toLocaleDateString(
                        "vi-VN",
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedCategory.description && (
                <div>
                  <h3 className="font-semibold mb-2">Mô Tả</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedCategory.description}
                  </p>
                </div>
              )}

              {selectedCategory.children &&
                selectedCategory.children.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">
                      Danh Mục Con ({selectedCategory.children.length})
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedCategory.children.map((child) => (
                        <div
                          key={child.id}
                          className="flex items-center gap-2 p-2 rounded-lg border border-border"
                        >
                          <div className="size-8 rounded bg-secondary flex items-center justify-center text-lg">
                            {child.imageUrl ? (
                              <img
                                src={"http://localhost:3000" + child.imageUrl}
                                alt={child.name}
                                className="size-8 rounded object-cover"
                              />
                            ) : (
                              <Folder className="size-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {child.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {child.productCount} sản phẩm
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailDialogOpen(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
