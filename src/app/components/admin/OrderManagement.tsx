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
import {
  Package,
  Clock,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  RefreshCcw
} from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  date: string;
  items: number;
  total: number;
  status: "pending" | "confirmed" | "shipping" | "delivered" | "cancelled";
  paymentMethod: string;
  paymentStatus: "paid" | "unpaid" | "refunded";
}

export default function OrderManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const itemsPerPage = 10;

  const [orders] = useState<Order[]>([
    {
      id: "ORD-2026-001234",
      customerId: "CUST-123",
      customerName: "Nguyễn Thu Hương",
      customerEmail: "nguyen.huong@email.com",
      date: "2026-06-04 10:30",
      items: 3,
      total: 2420000,
      status: "delivered",
      paymentMethod: "VNPay",
      paymentStatus: "paid"
    },
    {
      id: "ORD-2026-001235",
      customerId: "CUST-124",
      customerName: "Trần Minh Anh",
      customerEmail: "tran.anh@email.com",
      date: "2026-06-04 14:15",
      items: 2,
      total: 1890000,
      status: "shipping",
      paymentMethod: "COD",
      paymentStatus: "unpaid"
    },
    {
      id: "ORD-2026-001236",
      customerId: "CUST-125",
      customerName: "Lê Thị Mai",
      customerEmail: "le.mai@email.com",
      date: "2026-06-05 09:20",
      items: 1,
      total: 450000,
      status: "confirmed",
      paymentMethod: "MoMo",
      paymentStatus: "paid"
    },
    {
      id: "ORD-2026-001237",
      customerId: "CUST-126",
      customerName: "Phạm Văn Đức",
      customerEmail: "pham.duc@email.com",
      date: "2026-06-05 11:45",
      items: 5,
      total: 3750000,
      status: "pending",
      paymentMethod: "Bank Transfer",
      paymentStatus: "unpaid"
    },
    {
      id: "ORD-2026-001238",
      customerId: "CUST-127",
      customerName: "Hoàng Thị Lan",
      customerEmail: "hoang.lan@email.com",
      date: "2026-06-05 13:10",
      items: 2,
      total: 980000,
      status: "cancelled",
      paymentMethod: "VNPay",
      paymentStatus: "refunded"
    },
    {
      id: "ORD-2026-001239",
      customerId: "CUST-128",
      customerName: "Vũ Minh Quân",
      customerEmail: "vu.quan@email.com",
      date: "2026-06-05 15:30",
      items: 4,
      total: 2150000,
      status: "shipping",
      paymentMethod: "COD",
      paymentStatus: "unpaid"
    },
    {
      id: "ORD-2026-001240",
      customerId: "CUST-129",
      customerName: "Đặng Thị Hoa",
      customerEmail: "dang.hoa@email.com",
      date: "2026-06-05 16:50",
      items: 1,
      total: 750000,
      status: "confirmed",
      paymentMethod: "VNPay",
      paymentStatus: "paid"
    }
  ]);

  const statusColors: Record<string, string> = {
    "pending": "bg-warning text-warning-foreground",
    "confirmed": "bg-info text-info-foreground",
    "shipping": "bg-primary text-primary-foreground",
    "delivered": "bg-success text-success-foreground",
    "cancelled": "bg-destructive text-destructive-foreground"
  };

  const paymentStatusColors: Record<string, string> = {
    "paid": "bg-success",
    "unpaid": "bg-warning",
    "refunded": "bg-info"
  };

  // Statistics
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "confirmed" || o.status === "shipping").length,
    completed: orders.filter(o => o.status === "delivered").length,
    revenue: orders.filter(o => o.paymentStatus === "paid").reduce((sum, o) => sum + o.total, 0)
  };

  // Filtering and Sorting
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesPayment = paymentFilter === "all" || order.paymentMethod.toLowerCase() === paymentFilter.toLowerCase();

    // Simple date filter
    let matchesDate = true;
    if (dateFilter !== "all") {
      const orderDate = new Date(order.date);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (dateFilter === "today") {
        matchesDate = orderDate >= today;
      } else if (dateFilter === "week") {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesDate = orderDate >= weekAgo;
      } else if (dateFilter === "month") {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        matchesDate = orderDate >= monthAgo;
      }
    }

    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  }).sort((a, b) => {
    switch (sortBy) {
      case "date-desc":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "date-asc":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "total-desc":
        return b.total - a.total;
      case "total-asc":
        return a.total - b.total;
      case "customer":
        return a.customerName.localeCompare(b.customerName);
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(paginatedOrders.map(o => o.id));
    }
  };

  const handleExport = () => {
    const ordersToExport = selectedOrders.length > 0
      ? orders.filter(o => selectedOrders.includes(o.id))
      : filteredOrders;

    toast.success(`Exporting ${ordersToExport.length} orders...`);
  };

  const handleBulkStatusUpdate = () => {
    if (selectedOrders.length === 0) {
      toast.error("Please select orders to update");
      return;
    }
    toast.success(`Updating ${selectedOrders.length} orders...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Order Management</h1>
        <p className="text-muted-foreground">Monitor and manage customer orders</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <Package className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
            <Clock className="size-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Processing
            </CardTitle>
            <RefreshCcw className="size-5 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-info">{stats.processing}</div>
            <p className="text-xs text-muted-foreground mt-1">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <CheckCircle className="size-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{stats.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="size-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">
              {(stats.revenue / 1000000).toFixed(1)}M ₫
            </div>
            <p className="text-xs text-muted-foreground mt-1">Paid orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search and Primary Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Order ID, Customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="size-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shipping">Shipping</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment</SelectItem>
                  <SelectItem value="vnpay">VNPay</SelectItem>
                  <SelectItem value="momo">MoMo</SelectItem>
                  <SelectItem value="cod">COD</SelectItem>
                  <SelectItem value="bank transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <Calendar className="size-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Secondary Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Newest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                    <SelectItem value="total-desc">Highest Value</SelectItem>
                    <SelectItem value="total-asc">Lowest Value</SelectItem>
                    <SelectItem value="customer">Customer A-Z</SelectItem>
                  </SelectContent>
                </Select>

                <span className="text-sm text-muted-foreground">
                  {filteredOrders.length} {filteredOrders.length === 1 ? "order" : "orders"}
                </span>
              </div>

              <div className="flex gap-2">
                {selectedOrders.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkStatusUpdate}
                    >
                      <Edit2 className="size-4 mr-2" />
                      Update Status ({selectedOrders.length})
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                >
                  <Download className="size-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <button onClick={handleSelectAll}>
                    {selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0 ? (
                      <CheckSquare className="size-4 text-accent" />
                    ) : (
                      <Square className="size-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-16">
                    <div className="flex flex-col items-center">
                      <div className="size-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                        <Package className="size-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                      <p className="text-muted-foreground text-sm">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-secondary/50">
                    <TableCell>
                      <button onClick={() => handleSelectOrder(order.id)}>
                        {selectedOrders.includes(order.id) ? (
                          <CheckSquare className="size-4 text-accent" />
                        ) : (
                          <Square className="size-4" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="font-mono font-medium">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="text-accent hover:underline"
                      >
                        {order.id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(order.date).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {order.items}
                    </TableCell>
                    <TableCell className="text-right font-bold text-accent">
                      {order.total.toLocaleString()} ₫
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[order.status]}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{order.paymentMethod}</p>
                        <Badge
                          variant="outline"
                          className={`text-xs ${paymentStatusColors[order.paymentStatus]}`}
                        >
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/admin/orders/${order.id}`}>
                          <Eye className="size-3 mr-1" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of{" "}
                {filteredOrders.length} orders
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="size-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      return page === 1 ||
                             page === totalPages ||
                             (page >= currentPage - 1 && page <= currentPage + 1);
                    })
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center">
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-10"
                        >
                          {page}
                        </Button>
                      </div>
                    ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
