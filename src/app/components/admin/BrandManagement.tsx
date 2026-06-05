import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  Search,
  Upload,
  Eye,
  TrendingUp,
  Package,
  DollarSign,
  Star,
  Loader2,
  Image as ImageIcon,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  productCount: number;
  totalRevenue: number;
  status: "active" | "inactive";
  createdAt: string;
  website: string;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
}

export default function BrandManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    website: "",
    status: "active" as "active" | "inactive"
  });

  const [brands, setBrands] = useState<Brand[]>([
    {
      id: "1",
      name: "BabyCare",
      slug: "babycare",
      logo: "🍼",
      description: "Premium baby care products for modern parents",
      productCount: 45,
      totalRevenue: 125000000,
      status: "active",
      createdAt: "2023-06-15",
      website: "https://babycare.com",
      topProducts: [
        { id: "P1", name: "Organic Cotton Onesie Set", sales: 234, revenue: 105300000 },
        { id: "P2", name: "Baby Monitor Premium", sales: 89, revenue: 111250000 },
        { id: "P3", name: "Silicone Feeding Set", sales: 156, revenue: 49920000 }
      ]
    },
    {
      id: "2",
      name: "SmartBaby",
      slug: "smartbaby",
      logo: "🤖",
      description: "Smart monitoring and safety solutions",
      productCount: 18,
      totalRevenue: 78500000,
      status: "active",
      createdAt: "2023-08-20",
      website: "https://smartbaby.com",
      topProducts: [
        { id: "P4", name: "Video Monitor HD", sales: 67, revenue: 83750000 },
        { id: "P5", name: "Smart Thermometer", sales: 45, revenue: 22500000 }
      ]
    },
    {
      id: "3",
      name: "TinyTots",
      slug: "tinytots",
      logo: "👶",
      description: "Comfortable and stylish baby clothing",
      productCount: 67,
      totalRevenue: 156000000,
      status: "active",
      createdAt: "2023-03-10",
      website: "https://tinytots.com",
      topProducts: [
        { id: "P6", name: "Onesie Collection", sales: 312, revenue: 140400000 },
        { id: "P7", name: "Baby Sleepwear Set", sales: 189, revenue: 94500000 }
      ]
    },
    {
      id: "4",
      name: "SafeRide",
      slug: "saferide",
      logo: "🚗",
      description: "Trusted car seats and travel gear",
      productCount: 22,
      totalRevenue: 98700000,
      status: "active",
      createdAt: "2023-01-05",
      website: "https://saferide.com",
      topProducts: [
        { id: "P8", name: "Convertible Car Seat", sales: 78, revenue: 97500000 }
      ]
    },
    {
      id: "5",
      name: "PlayLearn",
      slug: "playlearn",
      logo: "🧸",
      description: "Educational toys for early development",
      productCount: 89,
      totalRevenue: 134000000,
      status: "active",
      createdAt: "2023-05-18",
      website: "https://playlearn.com",
      topProducts: [
        { id: "P9", name: "Wooden Toy Set", sales: 245, revenue: 132300000 },
        { id: "P10", name: "Musical Instruments", sales: 123, revenue: 61500000 }
      ]
    },
    {
      id: "6",
      name: "EcoKids",
      slug: "ecokids",
      logo: "🌱",
      description: "Sustainable and eco-friendly baby products",
      productCount: 34,
      totalRevenue: 45000000,
      status: "inactive",
      createdAt: "2024-02-12",
      website: "https://ecokids.com",
      topProducts: []
    }
  ]);

  // Statistics
  const stats = {
    total: brands.length,
    active: brands.filter(b => b.status === "active").length,
    totalProducts: brands.reduce((sum, b) => sum + b.productCount, 0),
    totalRevenue: brands.reduce((sum, b) => sum + b.totalRevenue, 0)
  };

  const topBrands = [...brands]
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  // Filtering and Sorting
  const filteredBrands = brands.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || brand.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "products-desc":
        return b.productCount - a.productCount;
      case "revenue-desc":
        return b.totalRevenue - a.totalRevenue;
      case "date-desc":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOpenCreate = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      website: "",
      status: "active"
    });
    setIsCreateDialogOpen(true);
  };

  const handleOpenEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setFormData({
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      website: brand.website,
      status: brand.status
    });
    setIsEditDialogOpen(true);
  };

  const handleOpenDelete = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenDetail = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsDetailDialogOpen(true);
  };

  const handleSaveBrand = async () => {
    if (!formData.name.trim()) {
      toast.error("Brand name is required");
      return;
    }

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (isEditDialogOpen) {
      toast.success("Brand updated successfully");
    } else {
      toast.success("Brand created successfully");
    }

    setIsSaving(false);
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
  };

  const handleDelete = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success("Brand deleted successfully");
    setIsSaving(false);
    setIsDeleteDialogOpen(false);
  };

  const handleLogoUpload = () => {
    toast.success("Logo uploaded successfully");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Brand Management</h1>
          <p className="text-muted-foreground">Manage product brands and manufacturers</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-accent hover:bg-accent/90">
          <Plus className="size-4 mr-2" />
          Add Brand
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Brands
            </CardTitle>
            <Award className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered brands</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Brands
            </CardTitle>
            <TrendingUp className="size-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Products
            </CardTitle>
            <Package className="size-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all brands</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="size-5 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-info">
              {(stats.totalRevenue / 1000000).toFixed(0)}M ₫
            </div>
            <p className="text-xs text-muted-foreground mt-1">From brand products</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Brands */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="size-5 text-warning" />
            Top Performing Brands
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topBrands.map((brand, index) => (
              <div
                key={brand.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="size-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div className="size-12 rounded-lg bg-secondary flex items-center justify-center text-2xl">
                    {brand.logo}
                  </div>
                  <div>
                    <p className="font-semibold">{brand.name}</p>
                    <p className="text-sm text-muted-foreground">{brand.productCount} products</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-accent">
                    {(brand.totalRevenue / 1000000).toFixed(1)}M ₫
                  </p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search brands..."
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
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="products-desc">Most Products</SelectItem>
                <SelectItem value="revenue-desc">Highest Revenue</SelectItem>
                <SelectItem value="date-desc">Newest First</SelectItem>
              </SelectContent>
            </Select>
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
                <TableHead>Brand Name</TableHead>
                <TableHead className="text-center">Products</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBrands.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center">
                      <div className="size-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                        <Award className="size-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No brands found</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Get started by adding your first brand
                      </p>
                      <Button onClick={handleOpenCreate} className="bg-accent hover:bg-accent/90">
                        <Plus className="size-4 mr-2" />
                        Add Brand
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBrands.map((brand) => (
                  <TableRow key={brand.id} className="hover:bg-secondary/50">
                    <TableCell>
                      <div className="size-14 rounded-lg bg-secondary flex items-center justify-center text-3xl">
                        {brand.logo}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{brand.name}</p>
                        <p className="text-xs text-muted-foreground">{brand.website}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">{brand.productCount}</TableCell>
                    <TableCell className="text-right font-bold text-accent">
                      {(brand.totalRevenue / 1000000).toFixed(1)}M ₫
                    </TableCell>
                    <TableCell>
                      <Badge className={brand.status === "active" ? "bg-success" : "bg-warning"}>
                        {brand.status.charAt(0).toUpperCase() + brand.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(brand.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDetail(brand)}
                        >
                          <Eye className="size-3 mr-1" />
                          View
                        </Button>
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
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen ? "Edit Brand" : "Create New Brand"}
            </DialogTitle>
            <DialogDescription>
              {isEditDialogOpen ? "Update brand information" : "Add a new product brand"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Brand Logo</Label>
              <div className="flex items-center gap-4 mt-2">
                <div className="size-20 rounded-lg bg-secondary flex items-center justify-center text-4xl border-2 border-dashed border-border">
                  <ImageIcon className="size-8 text-muted-foreground" />
                </div>
                <Button variant="outline" size="sm" onClick={handleLogoUpload}>
                  <Upload className="size-4 mr-2" />
                  Upload Logo
                </Button>
                <p className="text-xs text-muted-foreground">
                  PNG or JPG. Max 2MB. Recommended: 400x400px
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">
                  Brand Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g., BabyCare"
                />
              </div>

              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  placeholder="babycare"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => handleChange("status", value)}>
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
                placeholder="Brief description of the brand"
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
              Cancel
            </Button>
            <Button
              onClick={handleSaveBrand}
              disabled={isSaving}
              className="bg-accent hover:bg-accent/90"
            >
              {isSaving && <Loader2 className="size-4 mr-2 animate-spin" />}
              {isSaving ? "Saving..." : isEditDialogOpen ? "Update Brand" : "Create Brand"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Brand</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedBrand?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
              {isSaving && <Loader2 className="size-4 mr-2 animate-spin" />}
              {isSaving ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Brand Details</DialogTitle>
          </DialogHeader>

          {selectedBrand && (
            <div className="space-y-6">
              <div className="flex items-start gap-6">
                <div className="size-24 rounded-lg bg-secondary flex items-center justify-center text-5xl border-2 border-border">
                  {selectedBrand.logo}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">{selectedBrand.name}</h2>
                  <p className="text-sm text-muted-foreground mb-2">{selectedBrand.website}</p>
                  <Badge className={selectedBrand.status === "active" ? "bg-success" : "bg-warning"}>
                    {selectedBrand.status.charAt(0).toUpperCase() + selectedBrand.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Package className="size-4" />
                      Products
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedBrand.productCount}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <DollarSign className="size-4" />
                      Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-accent">
                      {(selectedBrand.totalRevenue / 1000000).toFixed(1)}M ₫
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <BarChart3 className="size-4" />
                      Avg per Product
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">
                      {((selectedBrand.totalRevenue / selectedBrand.productCount) / 1000).toFixed(0)}K ₫
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedBrand.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{selectedBrand.description}</p>
                </div>
              )}

              {selectedBrand.topProducts.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Top Products</h3>
                  <div className="space-y-2">
                    {selectedBrand.topProducts.map((product, index) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-sm">
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-accent">{(product.revenue / 1000000).toFixed(1)}M ₫</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
