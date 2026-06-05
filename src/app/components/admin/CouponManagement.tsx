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
  Tag,
  Plus,
  Edit2,
  Trash2,
  Search,
  Eye,
  TrendingUp,
  Percent,
  Users,
  DollarSign,
  Copy,
  Calendar,
  Loader2,
  BarChart3,
  CheckSquare,
  Square
} from "lucide-react";
import { toast } from "sonner";

interface Coupon {
  id: string;
  code: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
  minPurchase: number;
  maxDiscount: number;
  usageCount: number;
  usageLimit: number;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "scheduled";
  applicableTo: "all" | "category" | "product";
  createdAt: string;
}

interface UsageHistory {
  id: string;
  orderId: string;
  customerName: string;
  orderTotal: number;
  discount: number;
  date: string;
}

export default function CouponManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [selectedCoupons, setSelectedCoupons] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "percentage" as "percentage" | "fixed",
    value: "",
    minPurchase: "",
    maxDiscount: "",
    usageLimit: "",
    startDate: "",
    endDate: "",
    applicableTo: "all" as "all" | "category" | "product",
    description: ""
  });

  const [coupons, setCoupons] = useState<Coupon[]>([
    {
      id: "1",
      code: "SUMMER2026",
      name: "Summer Sale 2026",
      type: "percentage",
      value: 20,
      minPurchase: 500000,
      maxDiscount: 200000,
      usageCount: 156,
      usageLimit: 500,
      startDate: "2026-06-01",
      endDate: "2026-08-31",
      status: "active",
      applicableTo: "all",
      createdAt: "2026-05-15"
    },
    {
      id: "2",
      code: "WELCOME100",
      name: "Welcome Discount",
      type: "fixed",
      value: 100000,
      minPurchase: 500000,
      maxDiscount: 100000,
      usageCount: 89,
      usageLimit: 1000,
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      status: "active",
      applicableTo: "all",
      createdAt: "2026-01-01"
    },
    {
      id: "3",
      code: "SPRING50",
      name: "Spring Flash Sale",
      type: "fixed",
      value: 50000,
      minPurchase: 300000,
      maxDiscount: 50000,
      usageCount: 234,
      usageLimit: 500,
      startDate: "2026-03-01",
      endDate: "2026-05-31",
      status: "expired",
      applicableTo: "category",
      createdAt: "2026-02-25"
    },
    {
      id: "4",
      code: "VIP15",
      name: "VIP Member Exclusive",
      type: "percentage",
      value: 15,
      minPurchase: 1000000,
      maxDiscount: 300000,
      usageCount: 45,
      usageLimit: 200,
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      status: "active",
      applicableTo: "all",
      createdAt: "2026-01-01"
    },
    {
      id: "5",
      code: "BLACKFRIDAY",
      name: "Black Friday Mega Sale",
      type: "percentage",
      value: 30,
      minPurchase: 0,
      maxDiscount: 500000,
      usageCount: 0,
      usageLimit: 1000,
      startDate: "2026-11-27",
      endDate: "2026-11-29",
      status: "scheduled",
      applicableTo: "all",
      createdAt: "2026-06-01"
    }
  ]);

  const usageHistory: UsageHistory[] = [
    { id: "1", orderId: "ORD-001234", customerName: "Nguyễn Thu Hương", orderTotal: 2420000, discount: 200000, date: "2026-06-04 10:30" },
    { id: "2", orderId: "ORD-001235", customerName: "Trần Minh Anh", orderTotal: 1890000, discount: 189000, date: "2026-06-04 14:15" },
    { id: "3", orderId: "ORD-001236", customerName: "Lê Thị Mai", orderTotal: 980000, discount: 98000, date: "2026-06-05 09:20" }
  ];

  // Statistics
  const stats = {
    total: coupons.length,
    active: coupons.filter(c => c.status === "active").length,
    expired: coupons.filter(c => c.status === "expired").length,
    usageRate: ((coupons.reduce((sum, c) => sum + c.usageCount, 0) /
                  coupons.reduce((sum, c) => sum + c.usageLimit, 0)) * 100).toFixed(1)
  };

  const statusColors: Record<string, string> = {
    "active": "bg-success",
    "expired": "bg-destructive",
    "scheduled": "bg-info"
  };

  // Filtering and Sorting
  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch =
      coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || coupon.status === statusFilter;
    const matchesType = typeFilter === "all" || coupon.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  }).sort((a, b) => {
    switch (sortBy) {
      case "date-desc":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "usage-desc":
        return b.usageCount - a.usageCount;
      case "code":
        return a.code.localeCompare(b.code);
      default:
        return 0;
    }
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOpenCreate = () => {
    setFormData({
      code: "",
      name: "",
      type: "percentage",
      value: "",
      minPurchase: "",
      maxDiscount: "",
      usageLimit: "",
      startDate: "",
      endDate: "",
      applicableTo: "all",
      description: ""
    });
    setIsCreateDialogOpen(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      type: coupon.type,
      value: coupon.value.toString(),
      minPurchase: coupon.minPurchase.toString(),
      maxDiscount: coupon.maxDiscount.toString(),
      usageLimit: coupon.usageLimit.toString(),
      startDate: coupon.startDate,
      endDate: coupon.endDate,
      applicableTo: coupon.applicableTo,
      description: ""
    });
    setIsEditDialogOpen(true);
  };

  const handleOpenDelete = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenDetail = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsDetailDialogOpen(true);
  };

  const handleSaveCoupon = async () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error("Code and name are required");
      return;
    }

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (isEditDialogOpen) {
      toast.success("Coupon updated successfully");
    } else {
      toast.success("Coupon created successfully");
    }

    setIsSaving(false);
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
  };

  const handleDelete = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success("Coupon deleted successfully");
    setIsSaving(false);
    setIsDeleteDialogOpen(false);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied to clipboard");
  };

  const handleSelectCoupon = (id: string) => {
    setSelectedCoupons(prev =>
      prev.includes(id)
        ? prev.filter(couponId => couponId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedCoupons.length === filteredCoupons.length) {
      setSelectedCoupons([]);
    } else {
      setSelectedCoupons(filteredCoupons.map(c => c.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Coupon Management</h1>
          <p className="text-muted-foreground">Create and manage promotional coupons</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-accent hover:bg-accent/90">
          <Plus className="size-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Coupons
            </CardTitle>
            <Tag className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All coupons</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Coupons
            </CardTitle>
            <TrendingUp className="size-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expired Coupons
            </CardTitle>
            <Calendar className="size-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{stats.expired}</div>
            <p className="text-xs text-muted-foreground mt-1">Past validity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Usage Rate
            </CardTitle>
            <Percent className="size-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{stats.usageRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Overall usage</p>
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
                placeholder="Search by code or name..."
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
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="usage-desc">Most Used</SelectItem>
                <SelectItem value="code">Code A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Coupons Table */}
      <Card>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <button onClick={handleSelectAll}>
                    {selectedCoupons.length === filteredCoupons.length && filteredCoupons.length > 0 ? (
                      <CheckSquare className="size-4 text-accent" />
                    ) : (
                      <Square className="size-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>Coupon Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead className="text-center">Usage</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-16">
                    <div className="flex flex-col items-center">
                      <div className="size-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                        <Tag className="size-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No coupons found</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Create your first promotional coupon
                      </p>
                      <Button onClick={handleOpenCreate} className="bg-accent hover:bg-accent/90">
                        <Plus className="size-4 mr-2" />
                        Create Coupon
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCoupons.map((coupon) => (
                  <TableRow key={coupon.id} className="hover:bg-secondary/50">
                    <TableCell>
                      <button onClick={() => handleSelectCoupon(coupon.id)}>
                        {selectedCoupons.includes(coupon.id) ? (
                          <CheckSquare className="size-4 text-accent" />
                        ) : (
                          <Square className="size-4" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 rounded bg-secondary font-mono text-sm font-semibold">
                          {coupon.code}
                        </code>
                        <button
                          onClick={() => handleCopyCode(coupon.code)}
                          className="hover:text-accent transition-colors"
                        >
                          <Copy className="size-3" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{coupon.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {coupon.type === "percentage" ? "Percentage" : "Fixed Amount"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-accent">
                      {coupon.type === "percentage"
                        ? `${coupon.value}%`
                        : `${coupon.value.toLocaleString()} ₫`}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="font-medium">
                        {coupon.usageCount} / {coupon.usageLimit}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {((coupon.usageCount / coupon.usageLimit) * 100).toFixed(0)}%
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>{new Date(coupon.startDate).toLocaleDateString()}</div>
                      <div className="text-muted-foreground">
                        to {new Date(coupon.endDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[coupon.status]}>
                        {coupon.status.charAt(0).toUpperCase() + coupon.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDetail(coupon)}
                        >
                          <Eye className="size-3 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(coupon)}
                        >
                          <Edit2 className="size-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDelete(coupon)}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen ? "Edit Coupon" : "Create New Coupon"}
            </DialogTitle>
            <DialogDescription>
              {isEditDialogOpen ? "Update coupon details" : "Add a new promotional coupon"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">
                  Coupon Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                  placeholder="SUMMER2026"
                  className="font-mono"
                />
              </div>

              <div>
                <Label htmlFor="name">
                  Coupon Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Summer Sale 2026"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="type">Discount Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => handleChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₫)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="value">
                  Discount Value <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => handleChange("value", e.target.value)}
                  placeholder={formData.type === "percentage" ? "20" : "100000"}
                />
              </div>

              <div>
                <Label htmlFor="maxDiscount">Max Discount (₫)</Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) => handleChange("maxDiscount", e.target.value)}
                  placeholder="200000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minPurchase">Min Purchase Amount (₫)</Label>
                <Input
                  id="minPurchase"
                  type="number"
                  value={formData.minPurchase}
                  onChange={(e) => handleChange("minPurchase", e.target.value)}
                  placeholder="500000"
                />
              </div>

              <div>
                <Label htmlFor="usageLimit">Usage Limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => handleChange("usageLimit", e.target.value)}
                  placeholder="500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="applicableTo">Applicable To</Label>
              <Select value={formData.applicableTo} onValueChange={(value: any) => handleChange("applicableTo", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="category">Specific Categories</SelectItem>
                  <SelectItem value="product">Specific Products</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Promotional details..."
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
              Cancel
            </Button>
            <Button
              onClick={handleSaveCoupon}
              disabled={isSaving}
              className="bg-accent hover:bg-accent/90"
            >
              {isSaving && <Loader2 className="size-4 mr-2 animate-spin" />}
              {isSaving ? "Saving..." : isEditDialogOpen ? "Update Coupon" : "Create Coupon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Coupon</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete coupon "{selectedCoupon?.code}"? This action cannot be undone.
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
            <DialogTitle>Coupon Details</DialogTitle>
          </DialogHeader>

          {selectedCoupon && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <code className="px-3 py-2 rounded-lg bg-accent/10 text-accent font-mono text-2xl font-bold">
                    {selectedCoupon.code}
                  </code>
                  <h2 className="text-xl font-bold mt-3">{selectedCoupon.name}</h2>
                  <Badge className={`${statusColors[selectedCoupon.status]} mt-2`}>
                    {selectedCoupon.status.charAt(0).toUpperCase() + selectedCoupon.status.slice(1)}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyCode(selectedCoupon.code)}
                >
                  <Copy className="size-4 mr-2" />
                  Copy Code
                </Button>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Discount
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-accent">
                      {selectedCoupon.type === "percentage"
                        ? `${selectedCoupon.value}%`
                        : `${selectedCoupon.value.toLocaleString()} ₫`}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {selectedCoupon.usageCount} / {selectedCoupon.usageLimit}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Min Purchase
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">
                      {selectedCoupon.minPurchase.toLocaleString()} ₫
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Max Discount
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">
                      {selectedCoupon.maxDiscount.toLocaleString()} ₫
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Validity Period</h3>
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="text-muted-foreground">Start:</span>{" "}
                      <span className="font-medium">{new Date(selectedCoupon.startDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">End:</span>{" "}
                      <span className="font-medium">{new Date(selectedCoupon.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Applicable To</h3>
                  <Badge variant="outline" className="capitalize">
                    {selectedCoupon.applicableTo === "all" ? "All Products" : selectedCoupon.applicableTo}
                  </Badge>
                </div>
              </div>

              <Tabs defaultValue="usage">
                <TabsList>
                  <TabsTrigger value="usage">Usage History</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="usage" className="space-y-3 mt-4">
                  {usageHistory.map((usage) => (
                    <div
                      key={usage.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border"
                    >
                      <div>
                        <p className="font-semibold">{usage.customerName}</p>
                        <p className="text-sm text-muted-foreground">Order: {usage.orderId}</p>
                        <p className="text-xs text-muted-foreground">{usage.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Order Total</p>
                        <p className="font-bold">{usage.orderTotal.toLocaleString()} ₫</p>
                        <p className="text-sm text-success">-{usage.discount.toLocaleString()} ₫</p>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="analytics" className="mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Usage Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-accent">
                          {((selectedCoupon.usageCount / selectedCoupon.usageLimit) * 100).toFixed(1)}%
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total Savings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-success">
                          {(selectedCoupon.usageCount * 150000 / 1000).toFixed(0)}K ₫
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Conversion</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">12.5%</div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
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
