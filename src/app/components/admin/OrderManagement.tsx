import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  orderService,
  type Order,
  type PaginationMeta,
} from "../../../services/order.service";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
  PaginationEllipsis,
} from "../ui/pagination";
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
  Truck,
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
  RefreshCcw,
} from "lucide-react";
import { toast } from "sonner";

export default function OrderManagement() {
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const itemsPerPage = 10;

  const [orders, setOrders] = useState<Order[]>([]);
  const fetchOrders = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.getAdminOrders(page);
      const data = res.data;
      if (data.success && data.data) {
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
      } else {
        setOrders([]);
        setPagination(null);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tải danh sách đơn hàng";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, fetchOrders]);

  const statusColors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700",
    Confirmed: "bg-blue-100 text-blue-700",
    Shipping: "bg-purple-100 text-purple-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  };
  const paymentStatusColors: Record<string, string> = {
    paid: "bg-success",
    unpaid: "bg-warning",
    refunded: "bg-info",
  };

  // Statistics
  const stats = useMemo(
    () => ({
      total: orders.length,

      pending: orders.filter((o) => o.status === "Pending").length,

      processing: orders.filter(
        (o) => o.status === "Confirmed" || o.status === "Shipping",
      ).length,

      completed: orders.filter((o) => o.status === "Delivered").length,

      revenue: orders
        .filter((o) => o.status === "Delivered")
        .reduce((sum, o) => sum + o.final_amount, 0),
    }),
    [orders],
  );

  // Filtering and Sorting
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();

      result = result.filter((o) => o.order_code.toLowerCase().includes(q));
    }

    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }

    if (dateFilter !== "all") {
      const now = new Date();

      result = result.filter((o) => {
        const date = new Date(o.created_at);

        switch (dateFilter) {
          case "today":
            return date.toDateString() === now.toDateString();

          case "week": {
            const weekAgo = new Date();
            weekAgo.setDate(now.getDate() - 7);
            return date >= weekAgo;
          }

          case "month": {
            const monthAgo = new Date();
            monthAgo.setMonth(now.getMonth() - 1);
            return date >= monthAgo;
          }

          default:
            return true;
        }
      });
    }

    switch (sortBy) {
      case "date-desc":
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        break;

      case "date-asc":
        result.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
        break;

      case "total-desc":
        result.sort((a, b) => b.final_amount - a.final_amount);
        break;

      case "total-asc":
        result.sort((a, b) => a.final_amount - b.final_amount);
        break;
    }

    return result;
  }, [orders, searchQuery, statusFilter, dateFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSelectOrder = (orderId: number) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId],
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(paginatedOrders.map((o) => o.order_id));
    }
  };

  const handleExport = () => {
    const ordersToExport =
      selectedOrders.length > 0
        ? orders.filter((o) => selectedOrders.includes(o.order_id))
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
        <h1 className="text-3xl font-bold mb-2">Quản lí đơn hàng</h1>
        <p className="text-muted-foreground">
          Theo dõi và quản lý đơn hàng của khách hàng
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng số đơn hàng
            </CardTitle>
            <Package className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Đơn hàng</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Chờ xác nhận
            </CardTitle>
            <Clock className="size-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">
              {stats.pending}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Đang chờ xác nhận
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Xử lí
            </CardTitle>
            <RefreshCcw className="size-5 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-info">
              {stats.processing}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Đang chuẩn bị đơn hàng
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vận chuyển
            </CardTitle>
            <Truck className="size-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {stats.completed}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Đang vận chuyển
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hoàn thành
            </CardTitle>
            <CheckCircle className="size-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {stats.completed}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Đã được giao</p>
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
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Shipping">Shipping</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
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
                  {filteredOrders.length}{" "}
                  {filteredOrders.length === 1 ? "order" : "orders"}
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
                <Button variant="outline" size="sm" onClick={handleExport}>
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
                    {selectedOrders.length === paginatedOrders.length &&
                    paginatedOrders.length > 0 ? (
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
                      <h3 className="text-lg font-semibold mb-2">
                        No orders found
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrders.map((order) => (
                  <TableRow
                    key={order.order_id}
                    className="hover:bg-secondary/50"
                  >
                    <TableCell>
                      <button onClick={() => handleSelectOrder(order.order_id)}>
                        {selectedOrders.includes(order.order_id) ? (
                          <CheckSquare className="size-4 text-accent" />
                        ) : (
                          <Square className="size-4" />
                        )}
                      </button>
                    </TableCell>

                    {/* Mã đơn */}
                    <TableCell className="font-mono font-medium">
                      <Link
                        to={`/admin/orders/${order.order_id}`}
                        className="text-accent hover:underline"
                      >
                        {order.order_code}
                      </Link>
                    </TableCell>

                    {/* Khách hàng */}
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {order.address?.recipient_name ?? "--"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.address?.phone ?? "--"}
                        </p>
                      </div>
                    </TableCell>

                    {/* Ngày đặt */}
                    <TableCell className="text-sm">
                      {new Date(order.created_at).toLocaleString("vi-VN")}
                    </TableCell>

                    {/* Số sản phẩm */}
                    <TableCell className="text-center font-medium">
                      {order.order_details?.length ?? 0}
                    </TableCell>

                    {/* Tổng tiền */}
                    <TableCell className="text-right font-bold text-accent">
                      {order.final_amount.toLocaleString()} ₫
                    </TableCell>

                    {/* Trạng thái */}
                    <TableCell>
                      <Badge className={statusColors[order.status]}>
                        {order.status}
                      </Badge>
                    </TableCell>

                    {/* Thanh toán */}
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {order.payment_method}
                        </p>

                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            paymentStatusColors[order.payment_status]
                          }`}
                        >
                          {order.payment_status}
                        </Badge>
                      </div>
                    </TableCell>

                    {/* Action */}
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/admin/orders/${order.order_id}`}>
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
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of{" "}
                {filteredOrders.length} orders
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="size-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      return (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      );
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
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
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
