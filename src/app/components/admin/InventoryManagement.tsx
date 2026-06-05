import { useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Package,
  AlertTriangle,
  XCircle,
  DollarSign,
  Search,
  Filter,
  Download,
  Upload,
  Edit2,
  TrendingDown,
  TrendingUp,
  Minus,
  Plus,
  CheckSquare,
  Square,
  History,
  FileSpreadsheet
} from "lucide-react";
import { toast } from "sonner";

interface InventoryItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  lastUpdated: string;
  image: string;
}

interface StockTransaction {
  id: string;
  sku: string;
  productName: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  reason: string;
  performedBy: string;
  date: string;
}

export default function InventoryManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<"add" | "remove">("add");
  const [adjustmentQuantity, setAdjustmentQuantity] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");

  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: "1",
      productId: "P1",
      sku: "BC-OCS-001",
      name: "Organic Cotton Onesie Set",
      category: "Baby Clothing",
      currentStock: 45,
      minStock: 20,
      maxStock: 100,
      unitPrice: 450000,
      lastUpdated: "2026-06-05 10:30",
      image: "🧸"
    },
    {
      id: "2",
      productId: "P2",
      sku: "SM-BMP-002",
      name: "Baby Monitor Premium",
      category: "Smart Monitoring",
      currentStock: 12,
      minStock: 15,
      maxStock: 50,
      unitPrice: 1250000,
      lastUpdated: "2026-06-05 09:15",
      image: "📹"
    },
    {
      id: "3",
      productId: "P3",
      sku: "SF-SFS-003",
      name: "Silicone Feeding Set",
      category: "Feeding",
      currentStock: 0,
      minStock: 25,
      maxStock: 150,
      unitPrice: 320000,
      lastUpdated: "2026-06-04 14:20",
      image: "🍽️"
    },
    {
      id: "4",
      productId: "P4",
      sku: "TR-SLW-004",
      name: "Baby Stroller Lightweight",
      category: "Travel",
      currentStock: 8,
      minStock: 10,
      maxStock: 30,
      unitPrice: 2850000,
      lastUpdated: "2026-06-05 11:00",
      image: "🚼"
    },
    {
      id: "5",
      productId: "P5",
      sku: "AC-DBB-005",
      name: "Diaper Bag Backpack",
      category: "Accessories",
      currentStock: 23,
      minStock: 15,
      maxStock: 75,
      unitPrice: 680000,
      lastUpdated: "2026-06-05 08:45",
      image: "🎒"
    },
    {
      id: "6",
      productId: "P6",
      sku: "TY-WES-006",
      name: "Wooden Educational Toy Set",
      category: "Toys",
      currentStock: 34,
      minStock: 20,
      maxStock: 80,
      unitPrice: 540000,
      lastUpdated: "2026-06-05 13:20",
      image: "🧩"
    }
  ]);

  const [transactions] = useState<StockTransaction[]>([
    {
      id: "T1",
      sku: "BC-OCS-001",
      productName: "Organic Cotton Onesie Set",
      type: "in",
      quantity: 50,
      reason: "Purchase Order #PO-2026-123",
      performedBy: "Admin",
      date: "2026-06-05 10:30"
    },
    {
      id: "T2",
      sku: "SM-BMP-002",
      productName: "Baby Monitor Premium",
      type: "out",
      quantity: 3,
      reason: "Order ORD-2026-001234",
      performedBy: "System",
      date: "2026-06-05 09:15"
    },
    {
      id: "T3",
      sku: "SF-SFS-003",
      productName: "Silicone Feeding Set",
      type: "out",
      quantity: 5,
      reason: "Order ORD-2026-001235",
      performedBy: "System",
      date: "2026-06-04 14:20"
    },
    {
      id: "T4",
      sku: "TR-SLW-004",
      productName: "Baby Stroller Lightweight",
      type: "adjustment",
      quantity: -2,
      reason: "Damaged during storage",
      performedBy: "Staff User",
      date: "2026-06-05 11:00"
    }
  ]);

  const getStockStatus = (item: InventoryItem): "out" | "low" | "ok" | "over" => {
    if (item.currentStock === 0) return "out";
    if (item.currentStock < item.minStock) return "low";
    if (item.currentStock > item.maxStock) return "over";
    return "ok";
  };

  const getStockBadge = (item: InventoryItem) => {
    const status = getStockStatus(item);
    switch (status) {
      case "out":
        return <Badge className="bg-destructive">Out of Stock</Badge>;
      case "low":
        return <Badge className="bg-warning">Low Stock</Badge>;
      case "over":
        return <Badge className="bg-info">Overstock</Badge>;
      case "ok":
        return <Badge className="bg-success">In Stock</Badge>;
    }
  };

  // Statistics
  const stats = {
    totalProducts: inventory.length,
    lowStock: inventory.filter(i => getStockStatus(i) === "low").length,
    outOfStock: inventory.filter(i => getStockStatus(i) === "out").length,
    totalValue: inventory.reduce((sum, i) => sum + (i.currentStock * i.unitPrice), 0)
  };

  // Filtering and Sorting
  const filteredInventory = inventory.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;

    let matchesStock = true;
    if (stockFilter === "low") matchesStock = getStockStatus(item) === "low";
    else if (stockFilter === "out") matchesStock = getStockStatus(item) === "out";
    else if (stockFilter === "ok") matchesStock = getStockStatus(item) === "ok";

    return matchesSearch && matchesCategory && matchesStock;
  }).sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "stock-asc":
        return a.currentStock - b.currentStock;
      case "stock-desc":
        return b.currentStock - a.currentStock;
      case "value-desc":
        return (b.currentStock * b.unitPrice) - (a.currentStock * a.unitPrice);
      default:
        return 0;
    }
  });

  const categories = ["all", ...Array.from(new Set(inventory.map(item => item.category)))];

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredInventory.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredInventory.map(i => i.id));
    }
  };

  const handleExport = () => {
    toast.success("Exporting inventory data...");
  };

  const handleAdjustStock = () => {
    if (selectedItems.length === 0) {
      toast.error("Please select items to adjust");
      return;
    }
    setIsAdjustDialogOpen(true);
  };

  const handleSaveAdjustment = () => {
    const qty = parseInt(adjustmentQuantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (!adjustmentReason.trim()) {
      toast.error("Please provide a reason");
      return;
    }

    setInventory(prev => prev.map(item => {
      if (selectedItems.includes(item.id)) {
        const newStock = adjustmentType === "add"
          ? item.currentStock + qty
          : Math.max(0, item.currentStock - qty);

        return {
          ...item,
          currentStock: newStock,
          lastUpdated: new Date().toISOString().split('T')[0] + " " + new Date().toLocaleTimeString()
        };
      }
      return item;
    }));

    toast.success(`Stock ${adjustmentType === "add" ? "added" : "removed"} for ${selectedItems.length} items`);
    setIsAdjustDialogOpen(false);
    setSelectedItems([]);
    setAdjustmentQuantity("");
    setAdjustmentReason("");
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "in":
        return <TrendingUp className="size-4 text-success" />;
      case "out":
        return <TrendingDown className="size-4 text-destructive" />;
      case "adjustment":
        return <Edit2 className="size-4 text-warning" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Inventory Management</h1>
        <p className="text-muted-foreground">Monitor and manage product stock levels</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Products
            </CardTitle>
            <Package className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">In inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Low Stock Alerts
            </CardTitle>
            <AlertTriangle className="size-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground mt-1">Below minimum threshold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Out of Stock
            </CardTitle>
            <XCircle className="size-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{stats.outOfStock}</div>
            <p className="text-xs text-muted-foreground mt-1">Needs immediate restock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Value
            </CardTitle>
            <DollarSign className="size-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">
              {(stats.totalValue / 1000000).toFixed(1)}M ₫
            </div>
            <p className="text-xs text-muted-foreground mt-1">Current inventory value</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList>
          <TabsTrigger value="inventory">
            <Package className="size-4 mr-2" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <History className="size-4 mr-2" />
            Transaction History
          </TabsTrigger>
        </TabsList>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          {/* Filters & Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Search and Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by Product Name or SKU..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <Filter className="size-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.filter(c => c !== "all").map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={stockFilter} onValueChange={setStockFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stock Levels</SelectItem>
                      <SelectItem value="out">Out of Stock</SelectItem>
                      <SelectItem value="low">Low Stock</SelectItem>
                      <SelectItem value="ok">In Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name A-Z</SelectItem>
                        <SelectItem value="stock-asc">Stock: Low to High</SelectItem>
                        <SelectItem value="stock-desc">Stock: High to Low</SelectItem>
                        <SelectItem value="value-desc">Highest Value</SelectItem>
                      </SelectContent>
                    </Select>

                    <span className="text-sm text-muted-foreground">
                      {filteredInventory.length} items
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {selectedItems.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAdjustStock}
                      >
                        <Edit2 className="size-4 mr-2" />
                        Adjust Stock ({selectedItems.length})
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExport}
                    >
                      <Download className="size-4 mr-2" />
                      Export
                    </Button>
                    <Button
                      size="sm"
                      className="bg-accent hover:bg-accent/90"
                      asChild
                    >
                      <Link to="/admin/inventory/import">
                        <Upload className="size-4 mr-2" />
                        Import
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Table */}
          <Card>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <button onClick={handleSelectAll}>
                        {selectedItems.length === filteredInventory.length && filteredInventory.length > 0 ? (
                          <CheckSquare className="size-4 text-accent" />
                        ) : (
                          <Square className="size-4" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-center">Min/Max</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-16">
                        <div className="flex flex-col items-center">
                          <div className="size-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                            <Package className="size-8 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">No inventory items found</h3>
                          <p className="text-muted-foreground text-sm">
                            Try adjusting your search or filters
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInventory.map((item) => (
                      <TableRow key={item.id} className="hover:bg-secondary/50">
                        <TableCell>
                          <button onClick={() => handleSelectItem(item.id)}>
                            {selectedItems.includes(item.id) ? (
                              <CheckSquare className="size-4 text-accent" />
                            ) : (
                              <Square className="size-4" />
                            )}
                          </button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-secondary flex items-center justify-center text-2xl">
                              {item.image}
                            </div>
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`font-bold ${
                            item.currentStock === 0 ? "text-destructive" :
                            item.currentStock < item.minStock ? "text-warning" :
                            "text-foreground"
                          }`}>
                            {item.currentStock}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-sm text-muted-foreground">
                          {item.minStock} / {item.maxStock}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.unitPrice.toLocaleString()} ₫
                        </TableCell>
                        <TableCell className="text-right font-bold text-accent">
                          {(item.currentStock * item.unitPrice).toLocaleString()} ₫
                        </TableCell>
                        <TableCell>
                          {getStockBadge(item)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.lastUpdated}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Transaction History Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Stock Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-full bg-secondary flex items-center justify-center">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{transaction.productName}</p>
                          <Badge variant="outline" className="text-xs">{transaction.sku}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{transaction.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          By {transaction.performedBy} • {transaction.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        transaction.type === "in" ? "text-success" :
                        transaction.type === "out" ? "text-destructive" :
                        "text-warning"
                      }`}>
                        {transaction.type === "in" && "+"}
                        {transaction.type === "out" && "-"}
                        {transaction.quantity}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {transaction.type === "in" ? "Stock In" :
                         transaction.type === "out" ? "Stock Out" :
                         "Adjustment"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Adjust Stock Dialog */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock Levels</DialogTitle>
            <DialogDescription>
              Adjust stock for {selectedItems.length} selected {selectedItems.length === 1 ? "item" : "items"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Adjustment Type</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={adjustmentType === "add" ? "default" : "outline"}
                  onClick={() => setAdjustmentType("add")}
                  className="flex-1"
                >
                  <Plus className="size-4 mr-2" />
                  Add Stock
                </Button>
                <Button
                  variant={adjustmentType === "remove" ? "default" : "outline"}
                  onClick={() => setAdjustmentType("remove")}
                  className="flex-1"
                >
                  <Minus className="size-4 mr-2" />
                  Remove Stock
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={adjustmentQuantity}
                onChange={(e) => setAdjustmentQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>

            <div>
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="e.g., Purchase order, Damaged goods, etc."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAdjustDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAdjustment}
              className="bg-accent hover:bg-accent/90"
            >
              Save Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
