import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
  orderService,
  type Order,
  type PaginationMeta,
} from "../../../services/order.service";
import { formatDateTime } from "../../../helpers/format";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import { ScrollArea } from "../ui/scroll-area";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { toast } from "sonner";
import {
  ShoppingBag,
  AlertCircle,
  PackageOpen,
  Loader2,
  ChevronRight,
  XCircle,
  Search,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  RotateCcw,
  Ban,
  CircleCheckBig,
} from "lucide-react";

// ── Status Constants ──
// These must match the backend ORDER_STATUS_VALUES exactly
const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Shipping",
  "Delivered",
  "Cancelled",
] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];

// ── Status Badge Config ──
// Single source of truth for status badge mapping
const STATUS_BADGE_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  Pending: {
    label: "Chờ xác nhận",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  },
  Confirmed: {
    label: "Đã xác nhận",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  Shipping: {
    label: "Đang vận chuyển",
    className: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  },
  Delivered: {
    label: "Đã giao hàng",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  Cancelled: {
    label: "Đã hủy",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
};

function getBadgeProps(status: string) {
  return (
    STATUS_BADGE_CONFIG[status] ?? {
      label: status,
      className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    }
  );
}

// ── Status Tab Config ──
const STATUS_TABS = [
  { key: "all", label: "Tất cả" },
  ...ORDER_STATUSES.map((s) => ({
    key: s,
    label: STATUS_BADGE_CONFIG[s].label,
  })),
] as const;

// ── Stats Card Config ──
const STATS_CARDS = [
  {
    key: "Pending",
    label: "Chờ xác nhận",
    icon: Clock,
    gradient: "from-yellow-50 to-yellow-100/40",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    textColor: "text-yellow-700",
    labelColor: "text-yellow-600/80",
  },
  {
    key: "Confirmed",
    label: "Đã xác nhận",
    icon: CircleCheckBig,
    gradient: "from-blue-50 to-blue-100/40",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    textColor: "text-blue-700",
    labelColor: "text-blue-600/80",
  },
  {
    key: "Shipping",
    label: "Đang vận chuyển",
    icon: Truck,
    gradient: "from-purple-50 to-purple-100/40",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    textColor: "text-purple-700",
    labelColor: "text-purple-600/80",
  },
  {
    key: "Delivered",
    label: "Đã giao hàng",
    icon: CheckCircle2,
    gradient: "from-green-50 to-green-100/40",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    textColor: "text-green-700",
    labelColor: "text-green-600/80",
  },
  {
    key: "Cancelled",
    label: "Đã hủy",
    icon: Ban,
    gradient: "from-red-50 to-red-100/40",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    textColor: "text-red-700",
    labelColor: "text-red-600/80",
  },
] as const;

// ── Format Price ──

function formatPrice(price?: number): string {
  return (price ?? 0).toLocaleString("vi-VN") + " ₫";
}

// ── Component ──

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // ── Fetch orders ──
  const fetchOrders = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.getOrders(page);
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

  // ── Cancel order ──

  const handleCancelOrder = async (orderId: number) => {
    setCancellingId(orderId);
    try {
      await orderService.cancelOrder(orderId);
      toast.success("Đã hủy đơn hàng thành công!");
      fetchOrders(currentPage);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể hủy đơn hàng";
      toast.error(msg);
    } finally {
      setCancellingId(null);
    }
  };

  // ── Filtered & searched orders ──
  const filteredOrders = useMemo(() => {
    let result = orders;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((o) => o.order_code.toLowerCase().includes(q));
    }

    // Status filter
    if (activeTab !== "all") {
      result = result.filter((o) => o.status === activeTab);
    }

    // Newest first
    return [...result].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [orders, activeTab, searchQuery]);

  // ── Statistics ──
  const statistics = useMemo(() => {
    const stats = {
      Pending: 0,
      Confirmed: 0,
      Shipping: 0,
      Delivered: 0,
      Cancelled: 0,
    };

    orders.forEach((order) => {
      if (stats.hasOwnProperty(order.status)) {
        stats[order.status as keyof typeof stats]++;
      }
    });

    return stats;
  }, [orders]);

  // ── Pagination helper ──

  const getPageNumbers = () => {
    if (!pagination) return [];
    const total = pagination.last_page;
    const current = pagination.current_page;
    const delta = 1;
    const range: (number | "ellipsis")[] = [];

    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        (i >= current - delta && i <= current + delta)
      ) {
        range.push(i);
      } else if (range[range.length - 1] !== "ellipsis") {
        range.push("ellipsis");
      }
    }
    return range;
  };

  // ── Loading State ──

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Page title skeleton */}
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-64 mt-2" />

        {/* Stats skeletons */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mt-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="border-border/60">
              <CardContent className="p-4 sm:p-5">
                <Skeleton className="size-10 rounded-lg" />
                <Skeleton className="h-7 w-16 mt-3" />
                <Skeleton className="h-4 w-20 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search & tabs skeleton */}
        <div className="mt-6 space-y-4">
          <Skeleton className="h-10 w-full max-w-sm" />
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-9 w-28 shrink-0 rounded-full" />
            ))}
          </div>
        </div>

        {/* Card skeletons */}
        <div className="space-y-4 mt-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border/60">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-4 w-44" />
                  </div>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <div className="flex gap-4">
                  <Skeleton className="size-16 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/40">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-28" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ── Error State ──

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="size-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertCircle className="size-10 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Không thể tải đơn hàng</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
            {error}
          </p>
          <Button variant="outline" onClick={() => fetchOrders(currentPage)}>
            <Loader2 className="size-4 mr-2" />
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  // ── Empty State (no orders at all) ──

  if (!loading && orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="size-28 rounded-full bg-secondary flex items-center justify-center mb-6">
            <PackageOpen className="size-14 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            Bạn chưa có đơn hàng nào
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
            Hãy khám phá các sản phẩm dành cho bé và đặt hàng ngay hôm nay!
          </p>
          <Button
            className="bg-accent hover:bg-accent/90 h-11 px-8"
            onClick={() => navigate("/products")}
          >
            <ShoppingBag className="size-4 mr-2" />
            Tiếp tục mua sắm
          </Button>
        </div>
      </div>
    );
  }

  // ── Main Render ──

  const pageNumbers = getPageNumbers();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* ─────── Page Header ─────── */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Đơn hàng của tôi
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý và theo dõi các đơn hàng của bạn
          </p>
        </div>

        {/* ─────── Statistics Cards ─────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
          {STATS_CARDS.map((card) => {
            const Icon = card.icon;
            const count = statistics[card.key] ?? 0;

            return (
              <Card
                key={card.key}
                className="border-border/60 shadow-sm overflow-hidden"
              >
                <CardContent
                  className={`p-4 sm:p-5 bg-gradient-to-br ${card.gradient}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-10 rounded-lg ${card.iconBg} flex items-center justify-center shrink-0`}
                    >
                      <Icon className={`size-5 ${card.iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-2xl font-bold ${card.textColor}`}>
                        {count}
                      </p>
                      <p className={`text-xs ${card.labelColor} truncate`}>
                        {card.label}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ─────── Search ─────── */}
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo mã đơn hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-white dark:bg-card border-border/60"
          />
        </div>

        {/* ─────── Status Tabs ─────── */}
        <ScrollArea className="pb-1 mb-6">
          <div className="flex gap-2 min-w-max">
            {STATUS_TABS.map((tab) => {
              const isActive = activeTab === tab.key;

              const count =
                tab.key === "all"
                  ? orders.length
                  : orders.filter((o) => o.status === tab.key).length;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? "bg-accent text-accent-foreground shadow-sm"
                      : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-accent-foreground/15 text-accent-foreground"
                        : "bg-muted-foreground/10 text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </ScrollArea>

        {/* ─────── Filtered empty state ─────── */}
        {filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="size-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <PackageOpen className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">
              Không tìm thấy đơn hàng
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              {searchQuery
                ? `Không có đơn hàng nào khớp với "${searchQuery}"`
                : "Không có đơn hàng nào ở trạng thái này"}
            </p>
            <div className="flex gap-3 mt-4">
              {(searchQuery || activeTab !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveTab("all");
                  }}
                >
                  Xóa bộ lọc
                </Button>
              )}
              <Button
                className="bg-accent hover:bg-accent/90"
                onClick={() => navigate("/products")}
              >
                <ShoppingBag className="size-4 mr-2" />
                Tiếp tục mua sắm
              </Button>
            </div>
          </div>
        )}

        {/* ─────── Order Cards ─────── */}
        {filteredOrders.length > 0 && (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const status = getBadgeProps(order.status);
              const canCancel = order.status === "Pending";
              const isDelivered = order.status === "Delivered";

              return (
                <Card
                  key={order.order_id}
                  className="border-border/60 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 bg-secondary/30 border-b border-border/40">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-semibold text-foreground">
                        {order.order_code}
                      </p>
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        •
                      </span>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(order.created_at)}
                      </p>
                    </div>
                    <Badge className={`${status.className} text-xs px-3 py-1`}>
                      {status.label}
                    </Badge>
                  </div>

                  <CardContent className="p-5 sm:p-6">
                    {/* Product Preview */}
                    <div className="flex items-start gap-4">
                      <div className="size-14 sm:size-16 rounded-lg overflow-hidden bg-secondary/50 border border-border/40 flex items-center justify-center shrink-0">
                        <Package className="size-7 sm:size-8 text-muted-foreground/60" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground">
                          <Link
                            to={`/orders/${order.order_id}`}
                            className="text-accent hover:underline font-medium"
                          >
                            Xem chi tiết đơn hàng
                          </Link>{" "}
                          để xem sản phẩm đã mua
                        </p>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Order Summary */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tạm tính</span>
                        <span>{formatPrice(order.total_amount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Phí vận chuyển
                        </span>
                        <span>
                          {order.shipping_fee === 0 ? (
                            <span className="text-green-600">Miễn phí</span>
                          ) : (
                            formatPrice(order.shipping_fee)
                          )}
                        </span>
                      </div>
                      {order.discount_amount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Giảm giá
                          </span>
                          <span className="text-green-600">
                            -{formatPrice(order.discount_amount)}
                          </span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between">
                        <span className="font-semibold">Thành tiền</span>
                        <span className="text-lg font-bold text-accent">
                          {formatPrice(order.final_amount)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mt-4 pt-4 border-t border-border/40">
                      <Button variant="outline" asChild size="sm">
                        <Link to={`/orders/${order.order_id}`}>
                          <ChevronRight className="size-4 mr-1" />
                          Xem chi tiết
                        </Link>
                      </Button>

                      {canCancel && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive border-destructive/30 hover:bg-destructive/10"
                            >
                              <XCircle className="size-4 mr-1" />
                              Hủy đơn
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Xác nhận hủy đơn hàng
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc chắn muốn hủy đơn hàng{" "}
                                <span className="font-semibold">
                                  {order.order_code}
                                </span>
                                ? Hành động này không thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Quay lại</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                disabled={cancellingId === order.order_id}
                                onClick={() =>
                                  handleCancelOrder(order.order_id)
                                }
                              >
                                {cancellingId === order.order_id && (
                                  <Loader2 className="size-4 mr-2 animate-spin" />
                                )}
                                Xác nhận hủy
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      {isDelivered && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate("/products")}
                        >
                          <RotateCcw className="size-4 mr-1" />
                          Mua lại
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* ─────── Pagination ─────── */}
        {pagination && pagination.last_page > 1 && (
          <div className="mt-8 mb-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={
                      currentPage <= 1 ? "pointer-events-none opacity-40" : ""
                    }
                  />
                </PaginationItem>

                {pageNumbers.map((page, idx) =>
                  page === "ellipsis" ? (
                    <PaginationItem key={`e-${idx}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={page === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < pagination.last_page)
                        setCurrentPage(currentPage + 1);
                    }}
                    className={
                      currentPage >= pagination.last_page
                        ? "pointer-events-none opacity-40"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
