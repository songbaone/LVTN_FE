import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSearchParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  adminOrderService,
  type DashboardData,
  type AdminPagination,
} from "../../../services/admin-order.service";
import type { Order } from "../../../services/order.service";
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
  CheckSquare,
  Square,
  RefreshCcw,
  XCircle,
  Loader2,
  MapPin,
  CreditCard,
  MoreHorizontalIcon,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import OrderInvoicePrint from "../customer/OrderInvoicePrint";
import { Separator } from "../ui/separator";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
  PaginationEllipsis,
} from "../ui/pagination";
import * as XLSX from "xlsx";

// ── Date filter helpers ──

function getDateRange(dateFilter: string): { start: Date; end: Date } | null {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  switch (dateFilter) {
    case "today": {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }
    case "yesterday": {
      const start = new Date(now);
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      const yEnd = new Date(now);
      yEnd.setDate(yEnd.getDate() - 1);
      yEnd.setHours(23, 59, 59, 999);
      return { start, end: yEnd };
    }
    case "week": {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }
    case "month": {
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }
    case "this-month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }
    case "last-month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      start.setHours(0, 0, 0, 0);
      const lmEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      lmEnd.setHours(23, 59, 59, 999);
      return { start, end: lmEnd };
    }
    default:
      return null;
  }
}

function filterByDate(order: Order, dateFilter: string): boolean {
  if (dateFilter === "all") return true;
  const range = getDateRange(dateFilter);
  if (!range) return true;
  const orderDate = new Date(order.created_at);
  return orderDate >= range.start && orderDate <= range.end;
}

function sortOrders(orders: Order[], sortBy: string): Order[] {
  const sorted = [...orders];
  switch (sortBy) {
    case "date-asc":
      return sorted.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
    case "total-desc":
      return sorted.sort((a, b) => b.final_amount - a.final_amount);
    case "total-asc":
      return sorted.sort((a, b) => a.final_amount - b.final_amount);
    case "date-desc":
    default:
      return sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }
}

export default function OrderManagement() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Loading & Error ──
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Pagination ──
  const [pagination, setPagination] = useState<AdminPagination | null>(null);
  const [page, setPage] = useState(() => {
    const p = searchParams.get("page");
    return p ? parseInt(p, 10) : 1;
  });
  const limit = 10;

  // ── Filters (initialized from URL) ──
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("search") || "",
  );
  const [debouncedSearch, setDebouncedSearch] = useState(
    () => searchParams.get("search") || "",
  );
  const [statusFilter, setStatusFilter] = useState(
    () => searchParams.get("status") || "all",
  );
  const [paymentFilter, setPaymentFilter] = useState(
    () => searchParams.get("payment") || "all",
  );
  const [dateFilter, setDateFilter] = useState(
    () => searchParams.get("date") || "all",
  );
  const [sortBy, setSortBy] = useState(
    () => searchParams.get("sort") || "date-desc",
  );

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  // ── Selection ──
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);

  // ── Data ──
  const [orders, setOrders] = useState<Order[]>([]);
  const [rawOrders, setRawOrders] = useState<Order[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  // ── Order Detail Dialog ──
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailData, setDetailData] = useState<{
    address?: {
      province: string;
      district: string;
      ward: string;
      address_line: string;
      detail_address: string;
      receiver_phone?: string;
      receiver_name?: string;
    };
    coupon?: {
      coupon_code: string;
      coupon_name: string;
      discount_value: number;
    } | null;
    order_details?: Array<{
      order_detail_id: number;
      product_id: number;
      product_name: string;
      sku: string;
      color: string;
      size: string;
      material: string;
      quantity: number;
      unit_price: number;
      subtotal: number;
      thumbnail?: string;
    }>;
  } | null>(null);

  // ── Status Update Dialog ──
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusUpdateTarget, setStatusUpdateTarget] = useState<Order | null>(
    null,
  );
  const [newStatus, setNewStatus] = useState("");

  // ── Debounce search ──
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery]);

  // ── Sync filters to URL ──
  useEffect(() => {
    const params: Record<string, string> = {};
    if (page > 1) params.page = String(page);
    if (debouncedSearch) params.search = debouncedSearch;
    if (statusFilter !== "all") params.status = statusFilter;
    if (paymentFilter !== "all") params.payment = paymentFilter;
    if (dateFilter !== "all") params.date = dateFilter;
    if (sortBy !== "date-desc") params.sort = sortBy;
    setSearchParams(params, { replace: true });
  }, [page, debouncedSearch, statusFilter, paymentFilter, dateFilter, sortBy, setSearchParams]);

  // ── Build query params from filters ──
  const buildQueryParams = useCallback(
    (pageNum: number) => {
      const params: Record<string, string | number> = { page: pageNum, limit };
      if (debouncedSearch.trim()) params.order_code = debouncedSearch.trim();
      if (statusFilter !== "all") params.order_status = statusFilter;
      if (paymentFilter !== "all") params.payment_method = paymentFilter;
      if (sortBy !== "date-desc") params.sort = sortBy;
      return params;
    },
    [debouncedSearch, statusFilter, paymentFilter, sortBy],
  );

  // ── Fetch Dashboard (only on mount) ──
  const fetchDashboard = useCallback(async () => {
    setDashboardLoading(true);
    try {
      const res = await adminOrderService.getDashboard();
      if (res.data.success && res.data.data) {
        setDashboard(res.data.data);
      }
    } catch (err: any) {
      // Silent fail
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  // ── Fetch Orders ──
  const fetchOrders = useCallback(
    async (pageNum: number, showLoader = true) => {
      if (showLoader) setLoading(true);
      setError(null);
      try {
        const params = buildQueryParams(pageNum);
        const res = await adminOrderService.getOrders(params);
        const data = res.data;
        if (data.success && data.data) {
          // Store all orders for client-side filtering
          // If date filter is active, we need all orders across pages for accurate date filter
          // But since backend paginates, we apply date filter client-side on the returned page
          let filteredOrders = data.data.orders;

          // Client-side date filtering
          if (dateFilter !== "all") {
            filteredOrders = filteredOrders.filter((o) =>
              filterByDate(o, dateFilter),
            );
          }

          // Client-side sorting as fallback
          filteredOrders = sortOrders(filteredOrders, sortBy);

          setOrders(filteredOrders);
          setRawOrders(data.data.orders);
          setPagination(data.data.pagination);
        } else {
          setOrders([]);
          setRawOrders([]);
          setPagination(null);
        }
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Không thể tải danh sách đơn hàng";
        setError(msg);
        toast.error(msg);
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [buildQueryParams, dateFilter, sortBy],
  );

  // ── Fetch Detail ──
  const fetchOrderDetail = useCallback(async (orderId: number | string) => {
    setDetailLoading(true);
    try {
      const res = await adminOrderService.getOrderById(orderId);
      if (res.data.success && res.data.data) {
        setDetailData({
          address: res.data.data.address,
          coupon: res.data.data.coupon,
          order_details: res.data.data.order_details,
        });
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tải chi tiết đơn hàng";
      toast.error(msg);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // ── Initial Load ──
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ── Fetch orders when page or filters change ──
  useEffect(() => {
    fetchOrders(page);
  }, [page, fetchOrders]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, paymentFilter, dateFilter, sortBy]);

  // Mark initial mount complete
  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  // ── Status Colors ──
  const statusColors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700",
    Confirmed: "bg-blue-100 text-blue-700",
    Shipping: "bg-orange-100 text-orange-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  const paymentStatusColors: Record<string, string> = {
    paid: "bg-success",
    unpaid: "bg-warning",
    refunded: "bg-info",
  };

  // ── Status display labels ──
  const statusLabels: Record<string, string> = {
    Pending: "Chờ xác nhận",
    Confirmed: "Đã xác nhận",
    Shipping: "Đang vận chuyển",
    Delivered: "Đã giao",
    Cancelled: "Đã hủy",
  };

  const paymentStatusLabels: Record<string, string> = {
    Pending: "Chờ thanh toán",
    paid: "Đã thanh toán",
    unpaid: "Chưa thanh toán",
    Failed: "Thanh toán thất bại",
    Refunded: "Đã hoàn tiền",
    refunded: "Đã hoàn tiền",
  };

  const paymentMethodLabels: Record<string, string> = {
    cod: "COD",
    vnpay: "VNPay",
  };

  // ── Current orders for display (already filtered/sorted) ──
  const displayOrders = useMemo(() => orders, [orders]);

  // ── Handle View Detail ──
  const handleViewDetail = async (order: Order) => {
    setSelectedOrder(order);
    setDetailData(null);
    setDetailOpen(true);
    await fetchOrderDetail(order.order_id);
  };

  // ── Handle Print ──
  const handlePrintInvoice = () => {
    if (!selectedOrder || !detailData) return;
    window.print();
  };

  const handleOpenStatusUpdate = (order: Order) => {
    setStatusUpdateTarget(order);
    setNewStatus(order.status);
    setStatusDialogOpen(true);
  };

  // ── Handle Status Update ──
  const handleUpdateStatus = async () => {
    if (
      !statusUpdateTarget ||
      !newStatus ||
      newStatus === statusUpdateTarget.status
    ) {
      return;
    }
    setUpdatingStatus(true);
    try {
      await adminOrderService.updateOrderStatus(
        statusUpdateTarget.order_id,
        newStatus,
      );
      toast.success("Cập nhật trạng thái đơn hàng thành công");
      setStatusDialogOpen(false);
      await fetchOrders(page, false);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể cập nhật trạng thái";
      toast.error(msg);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSelectOrder = (orderId: number) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId],
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((o) => o.order_id));
    }
  };

  // ── Handle Export Excel ──
  const handleExport = async () => {
    const ordersToExport =
      selectedOrders.length > 0
        ? displayOrders.filter((o) => selectedOrders.includes(o.order_id))
        : displayOrders;

    if (ordersToExport.length === 0) {
      toast.error("Không có đơn hàng nào để xuất");
      return;
    }

    setExporting(true);
    try {
      // Build worksheet data
      const wsData = ordersToExport.map((order, index) => ({
        STT: index + 1,
        "Mã đơn hàng": order.order_code,
        "Ngày tạo": new Date(order.created_at).toLocaleString("vi-VN"),
        "Người nhận": order.customer_name || "--",
        "Số điện thoại": "",
        "Trạng thái":
          statusLabels[order.order_status] || order.order_status,
        "Phương thức thanh toán":
          paymentMethodLabels[order.payment_method?.toLowerCase()] ||
          order.payment_method ||
          "--",
        "Trạng thái thanh toán":
          paymentStatusLabels[order.payment_status] ||
          order.payment_status ||
          "--",
        "Tạm tính": order.total_amount,
        "Phí vận chuyển": order.shipping_fee,
        "Giảm giá": order.discount_amount || 0,
        "Thành tiền": order.final_amount,
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(wsData);

      // Column widths
      const colWidths = [
        { wch: 5 },  // STT
        { wch: 22 }, // Mã đơn hàng
        { wch: 18 }, // Ngày tạo
        { wch: 25 }, // Người nhận
        { wch: 15 }, // Số điện thoại
        { wch: 16 }, // Trạng thái
        { wch: 22 }, // Phương thức thanh toán
        { wch: 20 }, // Trạng thái thanh toán
        { wch: 14 }, // Tạm tính
        { wch: 14 }, // Phí vận chuyển
        { wch: 12 }, // Giảm giá
        { wch: 14 }, // Thành tiền
      ];
      ws["!cols"] = colWidths;

      // Header styling range
      const range = XLSX.utils.decode_range(ws["!ref"] || "A1:L1");
      for (let C = range.s.c; C <= range.e.c; C++) {
        const addr = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!ws[addr]) continue;
        ws[addr].s = {
          font: { bold: true, sz: 11 },
          alignment: { horizontal: "center" },
          fill: { fgColor: { rgb: "D9E2F3" } },
        };
      }

      XLSX.utils.book_append_sheet(wb, ws, "Đơn hàng");

      // Generate filename
      const today = new Date().toISOString().split("T")[0];
      const filename = `orders-${today}.xlsx`;

      XLSX.writeFile(wb, filename);
      toast.success(`Xuất ${ordersToExport.length} đơn hàng thành công!`);
    } catch (err: any) {
      toast.error("Xuất Excel thất bại");
    } finally {
      setExporting(false);
    }
  };

  const handleBulkStatusUpdate = () => {
    if (selectedOrders.length === 0) {
      toast.error("Vui lòng chọn đơn hàng để cập nhật");
      return;
    }
    toast.success(`Đang cập nhật ${selectedOrders.length} đơn hàng...`);
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

      {/* ─── KPI Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {/* Total Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng số đơn hàng
            </CardTitle>
            <Package className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold">
                {dashboard?.total_orders ?? 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Đơn hàng</p>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Chờ xác nhận
            </CardTitle>
            <Clock className="size-5 text-warning" />
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold text-warning">
                {dashboard?.pending_orders ?? 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Đang chờ xác nhận
            </p>
          </CardContent>
        </Card>

        {/* Confirmed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đã xác nhận
            </CardTitle>
            <CheckCircle className="size-5 text-info" />
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold text-info">
                {dashboard?.confirmed_orders ?? 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Đã xác nhận đơn hàng
            </p>
          </CardContent>
        </Card>

        {/* Shipping */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đang vận chuyển
            </CardTitle>
            <Truck className="size-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold text-orange-500">
                {dashboard?.shipping_orders ?? 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Đang vận chuyển
            </p>
          </CardContent>
        </Card>

        {/* Delivered */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đã giao
            </CardTitle>
            <CheckCircle className="size-5 text-success" />
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold text-success">
                {dashboard?.delivered_orders ?? 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Đã được giao
            </p>
          </CardContent>
        </Card>

        {/* Cancelled */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đã hủy
            </CardTitle>
            <XCircle className="size-5 text-destructive" />
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold text-destructive">
                {dashboard?.cancelled_orders ?? 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Đơn hàng đã hủy
            </p>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng doanh thu
            </CardTitle>
            <DollarSign className="size-5 text-accent" />
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-accent">
                {(dashboard?.total_revenue ?? 0).toLocaleString()} ₫
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Tổng doanh thu</p>
          </CardContent>
        </Card>

        {/* Today's Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đơn hôm nay
            </CardTitle>
            <TrendingUp className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">
                {dashboard?.today_orders ?? 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Đơn hôm nay</p>
          </CardContent>
        </Card>

        {/* Today's Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Doanh thu hôm nay
            </CardTitle>
            <DollarSign className="size-5 text-success" />
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-success">
                {(dashboard?.today_revenue ?? 0).toLocaleString()} ₫
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Doanh thu hôm nay
            </p>
          </CardContent>
        </Card>

        {/* This Month Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đơn tháng này
            </CardTitle>
            <RefreshCcw className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">
                {dashboard?.this_month_orders ?? 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Đơn trong tháng
            </p>
          </CardContent>
        </Card>

        {/* This Month Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Doanh thu tháng này
            </CardTitle>
            <TrendingUp className="size-5 text-accent" />
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-accent">
                {(dashboard?.this_month_revenue ?? 0).toLocaleString()} ₫
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Doanh thu trong tháng
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Filters & Actions ─── */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search and Primary Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm đơn hàng..."
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
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="Pending">Chờ xác nhận</SelectItem>
                  <SelectItem value="Confirmed">Đã xác nhận</SelectItem>
                  <SelectItem value="Shipping">Đang vận chuyển</SelectItem>
                  <SelectItem value="Delivered">Đã giao</SelectItem>
                  <SelectItem value="Cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả phương thức</SelectItem>
                  <SelectItem value="COD">Thanh toán khi nhận hàng (COD)</SelectItem>
                  <SelectItem value="VNPAY">Thanh toán qua VNPay</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <Calendar className="size-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả thời gian</SelectItem>
                  <SelectItem value="today">Hôm nay</SelectItem>
                  <SelectItem value="yesterday">Hôm qua</SelectItem>
                  <SelectItem value="week">7 ngày qua</SelectItem>
                  <SelectItem value="month">30 ngày qua</SelectItem>
                  <SelectItem value="this-month">Tháng này</SelectItem>
                  <SelectItem value="last-month">Tháng trước</SelectItem>
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
                    <SelectItem value="date-desc">Mới nhất</SelectItem>
                    <SelectItem value="date-asc">Cũ nhất</SelectItem>
                    <SelectItem value="total-desc">Giá trị cao nhất</SelectItem>
                    <SelectItem value="total-asc">Giá trị thấp nhất</SelectItem>
                  </SelectContent>
                </Select>

                <span className="text-sm text-muted-foreground">
                  {pagination?.total ?? 0} đơn hàng
                  {pagination &&
                    ` (trang ${pagination.page}/${pagination.totalPages})`}
                </span>
              </div>

              <div className="flex gap-2">
                {selectedOrders.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkStatusUpdate}
                  >
                    <Edit2 className="size-4 mr-2" />
                    Cập nhật trạng thái ({selectedOrders.length})
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  disabled={exporting}
                >
                  {exporting ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="size-4 mr-2" />
                  )}
                  {exporting ? "Đang xuất..." : "Xuất Excel"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Orders Table ─── */}
      <Card>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <button onClick={handleSelectAll}>
                    {selectedOrders.length === orders.length &&
                      orders.length > 0 ? (
                      <CheckSquare className="size-4 text-accent" />
                    ) : (
                      <Square className="size-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>Mã đơn hàng</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead className="text-center">
                  Phương thức thanh toán
                </TableHead>
                <TableHead className="text-center">
                  Trạng thái thanh toán
                </TableHead>
                <TableHead>Trạng thái đơn hàng</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell>
                      <Skeleton className="h-4 w-4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16 mx-auto" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16 mx-auto" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24 ml-auto" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : displayOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-16">
                    <div className="flex flex-col items-center">
                      <div className="size-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                        <Package className="size-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        Không tìm thấy đơn hàng phù hợp
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Thử điều chỉnh tìm kiếm hoặc bộ lọc
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                displayOrders.map((order) => (
                  <TableRow
                    key={order.order_id}
                    className="hover:bg-secondary/50"
                  >
                    <TableCell>
                      <button
                        onClick={() => handleSelectOrder(order.order_id)}
                      >
                        {selectedOrders.includes(order.order_id) ? (
                          <CheckSquare className="size-4 text-accent" />
                        ) : (
                          <Square className="size-4" />
                        )}
                      </button>
                    </TableCell>

                    <TableCell className="font-mono font-medium">
                      {order.order_code}
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {order.customer_name ?? "--"}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="text-center text-sm">
                      {paymentMethodLabels[
                        order.payment_method?.toLowerCase()
                      ] || order.payment_method || "--"}
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={`text-xs ${paymentStatusColors[order.payment_status] || ""
                          }`}
                      >
                        {paymentStatusLabels[order.payment_status] ||
                          order.payment_status ||
                          "--"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={statusColors[order.order_status] || ""}
                      >
                        {statusLabels[order.order_status] ||
                          order.order_status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right font-bold text-accent">
                      {order.final_amount.toLocaleString()} ₫
                    </TableCell>

                    <TableCell className="text-sm">
                      {new Date(order.created_at).toLocaleString("vi-VN")}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetail(order)}
                        >
                          <Eye className="size-3 mr-1" />
                          Xem chi tiết
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenStatusUpdate(order)}
                        >
                          <Edit2 className="size-3 mr-1" />
                          Trạng thái
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && !loading && (
          <CardContent className="pt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination.hasPrevPage) setPage((p) => p - 1);
                    }}
                    className={
                      !pagination.hasPrevPage
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>

                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1,
                )
                  .filter((p) => {
                    return (
                      p === 1 ||
                      p === pagination.totalPages ||
                      (p >= page - 1 && p <= page + 1)
                    );
                  })
                  .map((p, index, array) => (
                    <PaginationItem key={p}>
                      {index > 0 && array[index - 1] !== p - 1 && (
                        <PaginationEllipsis />
                      )}
                      <PaginationLink
                        href="#"
                        isActive={page === p}
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(p);
                        }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination.hasNextPage) setPage((p) => p + 1);
                    }}
                    className={
                      !pagination.hasNextPage
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardContent>
        )}
      </Card>

      {/* ─── Order Detail Dialog ─── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent
          className=" w-[95vw]
      max-w-7xl
      h-[90vh]
      overflow-hidden
      p-0"
        >
          <div className="h-full overflow-y-auto p-6">
            <DialogHeader>
              <div className="flex items-center justify-between w-full pr-10">
                <DialogTitle>
                  Chi tiết đơn hàng{" "}
                  <span className="font-mono">
                    {selectedOrder?.order_code}
                  </span>
                </DialogTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrintInvoice}
                  className="shrink-0"
                >
                  <Printer className="size-4 mr-2" />
                  In hóa đơn
                </Button>
              </div>
            </DialogHeader>

            {selectedOrder && detailData && (
              <div className="hidden-print-invoice" aria-hidden="true">
                <OrderInvoicePrint
                  order={selectedOrder}
                  address={detailData.address ?? null}
                  coupon={detailData.coupon ?? null}
                  orderDetails={detailData.order_details ?? []}
                  isAdmin={true}
                />
              </div>
            )}

            {detailLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              </div>
            ) : detailData ? (
              <div className="space-y-6">
                {/* Order Information */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Package className="size-4" />
                    Thông tin đơn hàng
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm bg-secondary/50 p-4 rounded-lg">
                    <div>
                      <span className="text-muted-foreground">Mã đơn:</span>{" "}
                      <span className="font-medium font-mono">
                        {selectedOrder?.order_code}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Trạng thái:</span>{" "}
                      <Badge
                        className={
                          statusColors[selectedOrder?.order_status || ""]
                        }
                      >
                        {statusLabels[selectedOrder?.order_status || ""] ||
                          selectedOrder?.order_status}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ngày tạo:</span>{" "}
                      <span className="font-medium">
                        {selectedOrder?.created_at
                          ? new Date(
                            selectedOrder.created_at,
                          ).toLocaleString("vi-VN")
                          : "--"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ghi chú:</span>{" "}
                      <span>{selectedOrder?.note || "--"}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                {detailData.address && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="size-4" />
                      Địa chỉ giao hàng
                    </h3>
                    <div className="text-sm bg-secondary/50 p-4 rounded-lg space-y-1">
                      <p>
                        <span className="text-muted-foreground">
                          Người nhận:
                        </span>{" "}
                        <span className="font-medium">
                          {detailData.address.receiver_name}
                        </span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">SĐT:</span>{" "}
                        <span>{detailData.address.receiver_phone}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Địa chỉ:</span>{" "}
                        <span>
                          {detailData.address.address_line},{" "}
                          {detailData.address.ward},{" "}
                          {detailData.address.district},{" "}
                          {detailData.address.province}
                        </span>
                      </p>
                      {detailData.address.detail_address && (
                        <p>
                          <span className="text-muted-foreground">
                            Chi tiết:
                          </span>{" "}
                          <span>{detailData.address.detail_address}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Information */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CreditCard className="size-4" />
                    Thông tin thanh toán
                  </h3>
                  <div className="text-sm bg-secondary/50 p-4 rounded-lg space-y-1">
                    <p>
                      <span className="text-muted-foreground">
                        Phương thức:
                      </span>{" "}
                      <span className="font-medium">
                        {paymentMethodLabels[
                          selectedOrder?.payment_method?.toLowerCase()
                        ] || selectedOrder?.payment_method || "--"}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">
                        Trạng thái:
                      </span>{" "}
                      <Badge
                        variant="outline"
                        className={`text-xs ${paymentStatusColors[
                          selectedOrder?.payment_status || ""
                        ] || ""
                          }`}
                      >
                        {paymentStatusLabels[
                          selectedOrder?.payment_status || ""
                        ] || selectedOrder?.payment_status || "--"}
                      </Badge>
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                {detailData.order_details &&
                  detailData.order_details.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Package className="size-4" />
                        Sản phẩm
                      </h3>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Sản phẩm</TableHead>
                              <TableHead>SKU</TableHead>
                              <TableHead>Phân loại</TableHead>
                              <TableHead className="text-right">SL</TableHead>
                              <TableHead className="text-right">
                                Đơn giá
                              </TableHead>
                              <TableHead className="text-right">
                                Thành tiền
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {detailData.order_details.map((item) => (
                              <TableRow key={item.order_detail_id}>
                                <TableCell className="font-medium">
                                  {item.product_name}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {item.sku}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {[item.color, item.size, item.material]
                                    .filter(Boolean)
                                    .join(" / ") || "--"}
                                </TableCell>
                                <TableCell className="text-right">
                                  {item.quantity}
                                </TableCell>
                                <TableCell className="text-right">
                                  {item.unit_price.toLocaleString()} ₫
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {item.subtotal.toLocaleString()} ₫
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                {/* Coupon */}
                {detailData.coupon && (
                  <div>
                    <h3 className="font-semibold mb-2">Mã giảm giá</h3>
                    <div className="text-sm bg-secondary/50 p-4 rounded-lg">
                      <p>
                        <span className="text-muted-foreground">Mã:</span>{" "}
                        <span className="font-medium">
                          {detailData.coupon.coupon_code}
                        </span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Giảm:</span>{" "}
                        <span className="font-medium text-success">
                          -{detailData.coupon.discount_value.toLocaleString()} ₫
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Totals */}
                <Separator />
                <div className="space-y-2 max-w-sm ml-auto">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính:</span>
                    <span className="font-medium">
                      {(selectedOrder?.total_amount ?? 0).toLocaleString()} ₫
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Phí vận chuyển:
                    </span>
                    <span className="font-medium">
                      {(selectedOrder?.shipping_fee ?? 0).toLocaleString()} ₫
                    </span>
                  </div>
                  {selectedOrder?.discount_amount ? (
                    <div className="flex justify-between text-sm text-success">
                      <span>Giảm giá:</span>
                      <span className="font-medium">
                        -{selectedOrder.discount_amount.toLocaleString()} ₫
                      </span>
                    </div>
                  ) : null}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-accent">
                      {(selectedOrder?.final_amount ?? 0).toLocaleString()} ₫
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Không thể tải thông tin đơn hàng
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Status Update Dialog ─── */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Cập nhật trạng thái đơn hàng{" "}
              <span className="font-mono">
                {statusUpdateTarget?.order_code}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Trạng thái hiện tại:{" "}
                <Badge
                  className={
                    statusColors[statusUpdateTarget?.order_status || ""]
                  }
                >
                  {statusLabels[statusUpdateTarget?.order_status || ""] ||
                    statusUpdateTarget?.order_status}
                </Badge>
              </p>
            </div>

            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái mới" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Chờ xác nhận</SelectItem>
                <SelectItem value="Confirmed">Đã xác nhận</SelectItem>
                <SelectItem value="Shipping">Đang vận chuyển</SelectItem>
                <SelectItem value="Delivered">Đã giao</SelectItem>
                <SelectItem value="Cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setStatusDialogOpen(false)}
                disabled={updatingStatus}
              >
                Hủy
              </Button>
              <Button
                onClick={handleUpdateStatus}
                disabled={
                  updatingStatus ||
                  !newStatus ||
                  newStatus === statusUpdateTarget?.status
                }
              >
                {updatingStatus && (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                )}
                Cập nhật
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}