import { useState } from "react";
import { Link } from "react-router";

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
  Tag,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  description: string;
  productCount: number;
  status: "active" | "inactive";
  createdAt: string;
  banner: string;
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
  children?: Category[];
}

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

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    parentId: "",
    description: "",
    status: "active" as "active" | "inactive",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  });

  const [categories, setCategories] = useState<Category[]>([
    {
      id: "1",
      name: "Baby Clothing",
      slug: "baby-clothing",
      parentId: null,
      description: "Comfortable and safe clothing for babies",
      productCount: 45,
      status: "active",
      createdAt: "2024-01-15",
      banner: "🧸",
      seo: {
        title: "Baby Clothing - Soft & Comfortable",
        description: "Shop premium baby clothing collection",
        keywords: "baby clothes, infant wear, baby outfits",
      },
      children: [
        {
          id: "1-1",
          name: "Onesies",
          slug: "onesies",
          parentId: "1",
          description: "Cute onesies for babies",
          productCount: 23,
          status: "active",
          createdAt: "2024-01-20",
          banner: "👶",
          seo: { title: "", description: "", keywords: "" },
        },
        {
          id: "1-2",
          name: "Sleepwear",
          slug: "sleepwear",
          parentId: "1",
          description: "Comfortable sleepwear",
          productCount: 15,
          status: "active",
          createdAt: "2024-01-25",
          banner: "🌙",
          seo: { title: "", description: "", keywords: "" },
        },
        {
          id: "1-3",
          name: "Outerwear",
          slug: "outerwear",
          parentId: "1",
          description: "Jackets and coats for babies",
          productCount: 7,
          status: "active",
          createdAt: "2024-02-01",
          banner: "🧥",
          seo: { title: "", description: "", keywords: "" },
        },
      ],
    },
    {
      id: "2",
      name: "Smart Monitoring",
      slug: "smart-monitoring",
      parentId: null,
      description: "Smart devices to monitor your baby",
      productCount: 18,
      status: "active",
      createdAt: "2024-01-10",
      banner: "📹",
      seo: {
        title: "Smart Baby Monitors",
        description: "Advanced baby monitoring solutions",
        keywords: "baby monitor, smart camera, baby safety",
      },
      children: [
        {
          id: "2-1",
          name: "Video Monitors",
          slug: "video-monitors",
          parentId: "2",
          description: "HD video baby monitors",
          productCount: 12,
          status: "active",
          createdAt: "2024-01-18",
          banner: "🎥",
          seo: { title: "", description: "", keywords: "" },
        },
        {
          id: "2-2",
          name: "Audio Monitors",
          slug: "audio-monitors",
          parentId: "2",
          description: "Audio-only baby monitors",
          productCount: 6,
          status: "active",
          createdAt: "2024-01-22",
          banner: "🔊",
          seo: { title: "", description: "", keywords: "" },
        },
      ],
    },
    {
      id: "3",
      name: "Feeding",
      slug: "feeding",
      parentId: null,
      description: "Baby feeding essentials",
      productCount: 34,
      status: "active",
      createdAt: "2024-01-12",
      banner: "🍽️",
      seo: {
        title: "Baby Feeding Products",
        description: "Safe and quality feeding products",
        keywords: "baby bottles, feeding set, baby utensils",
      },
    },
    {
      id: "4",
      name: "Travel",
      slug: "travel",
      parentId: null,
      description: "Strollers and travel gear",
      productCount: 22,
      status: "active",
      createdAt: "2024-01-08",
      banner: "🚼",
      seo: {
        title: "Baby Travel Gear",
        description: "Strollers, car seats, and travel accessories",
        keywords: "baby stroller, car seat, travel gear",
      },
      children: [
        {
          id: "4-1",
          name: "Strollers",
          slug: "strollers",
          parentId: "4",
          description: "Lightweight and sturdy strollers",
          productCount: 14,
          status: "active",
          createdAt: "2024-01-16",
          banner: "🛒",
          seo: { title: "", description: "", keywords: "" },
        },
        {
          id: "4-2",
          name: "Car Seats",
          slug: "car-seats",
          parentId: "4",
          description: "Safety car seats for infants",
          productCount: 8,
          status: "inactive",
          createdAt: "2024-01-19",
          banner: "🚗",
          seo: { title: "", description: "", keywords: "" },
        },
      ],
    },
    {
      id: "5",
      name: "Toys",
      slug: "toys",
      parentId: null,
      description: "Educational and fun toys",
      productCount: 56,
      status: "active",
      createdAt: "2024-01-05",
      banner: "🧩",
      seo: {
        title: "Educational Baby Toys",
        description: "Safe and educational toys for development",
        keywords: "baby toys, educational toys, wooden toys",
      },
    },
  ]);

  // Statistics
  const stats = {
    total: categories.reduce(
      (sum, cat) => sum + 1 + (cat.children?.length || 0),
      0,
    ),
    active:
      categories.filter((c) => c.status === "active").length +
      categories
        .flatMap((c) => c.children || [])
        .filter((c) => c.status === "active").length,
    totalProducts: categories.reduce((sum, cat) => sum + cat.productCount, 0),
    parents: categories.length,
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

  const handleOpenCreate = () => {
    setFormData({
      name: "",
      slug: "",
      parentId: "",
      description: "",
      status: "active",
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
    });
    setIsCreateDialogOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId || "",
      description: category.description,
      status: category.status,
      seoTitle: category.seo.title,
      seoDescription: category.seo.description,
      seoKeywords: category.seo.keywords,
    });
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
      toast.error("Category name is required");
      return;
    }

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (isEditDialogOpen && selectedCategory) {
      toast.success("Category updated successfully");
    } else {
      toast.success("Category created successfully");
    }

    setIsSaving(false);
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
  };

  const handleDelete = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success("Category deleted successfully");
    setIsSaving(false);
    setIsDeleteDialogOpen(false);
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
                  {category.banner}
                </div>
                <span className="font-medium">{category.name}</span>
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
              <span className="text-muted-foreground text-sm">Root</span>
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
              {category.status.charAt(0).toUpperCase() +
                category.status.slice(1)}
            </Badge>
          </TableCell>
          <TableCell className="text-sm text-muted-foreground">
            {new Date(category.createdAt).toLocaleDateString()}
          </TableCell>
          <TableCell className="text-right">
            <div className="flex gap-1 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenDetail(category)}
              >
                <Eye className="size-3 mr-1" />
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
          <h1 className="text-3xl font-bold mb-2">Quản lí danh mục</h1>
          <p className="text-muted-foreground">
            Sắp xếp sản phẩm thành các danh mục
          </p>
        </div>
        <Button className="bg-accent hover:bg-accent/90" asChild>
          <Link to="/admin/categories/new">
            <Plus className="size-4 mr-2" />
            Thêm danh mục mới
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Số lượng danh mục
            </CardTitle>
            <Folder className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.parents} Danh mục cha
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Các danh mục đang hoạt động
            </CardTitle>
            <FolderOpen className="size-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {stats.active}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Đang hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng số sản phẩm
            </CardTitle>
            <Package className="size-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">
              {stats.totalProducts}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Trên tất cả danh mục
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Trung bình số lượng sản phẩm
            </CardTitle>
            <TrendingUp className="size-5 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-info">
              {Math.round(stats.totalProducts / stats.total)}
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
                placeholder="Tìm kiếm thông tin danh mục....."
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
                <SelectItem value="inactive">Ngưng hoạt động</SelectItem>
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
                <TableHead>Tên danh mục</TableHead>
                <TableHead>Danh mục cha</TableHead>
                <TableHead className="text-center">Tổng sô sản phẩm</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-center">Công cụ</TableHead>
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
                        Không có danh mục nào để hiển thị
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Bắt đầu tạo danh mục đầu tiên của bạn!
                      </p>
                      <Button
                        onClick={handleOpenCreate}
                        className="bg-accent hover:bg-accent/90"
                      >
                        <Plus className="size-4 mr-2" />
                        Thêm mới
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
              {isEditDialogOpen ? "Edit Category" : "Create New Category"}
            </DialogTitle>
            <DialogDescription>
              {isEditDialogOpen
                ? "Update category information"
                : "Add a new product category"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">
                  Category Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g., Baby Clothing"
                />
              </div>

              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  placeholder="baby-clothing"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parentId">Parent Category</Label>
                <Select
                  value={formData.parentId}
                  onValueChange={(value) => handleChange("parentId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (Root Category)</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => handleChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Brief description of this category"
                rows={3}
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Tag className="size-4" />
                SEO Information
              </h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    value={formData.seoTitle}
                    onChange={(e) => handleChange("seoTitle", e.target.value)}
                    placeholder="Baby Clothing - Soft & Comfortable"
                  />
                </div>
                <div>
                  <Label htmlFor="seoDescription">SEO Description</Label>
                  <Textarea
                    id="seoDescription"
                    value={formData.seoDescription}
                    onChange={(e) =>
                      handleChange("seoDescription", e.target.value)
                    }
                    placeholder="Shop our premium baby clothing collection"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="seoKeywords">
                    Keywords (comma separated)
                  </Label>
                  <Input
                    id="seoKeywords"
                    value={formData.seoKeywords}
                    onChange={(e) =>
                      handleChange("seoKeywords", e.target.value)
                    }
                    placeholder="baby clothes, infant wear, baby outfits"
                  />
                </div>
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
              Cancel
            </Button>
            <Button
              onClick={handleSaveCategory}
              disabled={isSaving}
              className="bg-accent hover:bg-accent/90"
            >
              {isSaving && <Loader2 className="size-4 mr-2 animate-spin" />}
              {isSaving
                ? "Saving..."
                : isEditDialogOpen
                  ? "Update Category"
                  : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedCategory?.name}"?
              {selectedCategory?.children &&
                selectedCategory.children.length > 0 && (
                  <span className="block mt-2 text-destructive">
                    <AlertCircle className="size-4 inline mr-1" />
                    This category has {selectedCategory.children.length}{" "}
                    subcategories that will also be deleted.
                  </span>
                )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="size-4 mr-2 animate-spin" />}
              {isSaving ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Category Details</DialogTitle>
          </DialogHeader>

          {selectedCategory && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="size-20 rounded-lg bg-secondary flex items-center justify-center text-4xl">
                  {selectedCategory.banner}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">
                    {selectedCategory.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-2">
                    /{selectedCategory.slug}
                  </p>
                  <Badge
                    className={
                      selectedCategory.status === "active"
                        ? "bg-success"
                        : "bg-warning"
                    }
                  >
                    {selectedCategory.status.charAt(0).toUpperCase() +
                      selectedCategory.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Products
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
                      Subcategories
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
                      Created
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-medium">
                      {new Date(
                        selectedCategory.createdAt,
                      ).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedCategory.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedCategory.description}
                  </p>
                </div>
              )}

              {selectedCategory.seo.title && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Tag className="size-4" />
                    SEO Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Title:</span>{" "}
                      {selectedCategory.seo.title}
                    </div>
                    <div>
                      <span className="font-medium">Description:</span>{" "}
                      {selectedCategory.seo.description}
                    </div>
                    <div>
                      <span className="font-medium">Keywords:</span>{" "}
                      {selectedCategory.seo.keywords}
                    </div>
                  </div>
                </div>
              )}

              {selectedCategory.children &&
                selectedCategory.children.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">
                      Subcategories ({selectedCategory.children.length})
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedCategory.children.map((child) => (
                        <div
                          key={child.id}
                          className="flex items-center gap-2 p-2 rounded-lg border border-border"
                        >
                          <div className="size-8 rounded bg-secondary flex items-center justify-center text-lg">
                            {child.banner}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {child.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {child.productCount} products
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
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
