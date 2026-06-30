import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import {
  orderService,
  type Order,
  type OrderAddress,
  type OrderCoupon,
  type OrderItem,
} from "../../../services/order.service";
import { formatDateTime } from "../../../helpers/format";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import { ImageWithFallback } from "../figma/ImageWithFallback";
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
  ArrowLeft,
  Package,
  MapPin,
  ShoppingBag,
  Tag,
  Receipt,
  Loader2,
  AlertCircle,
  XCircle,
  CreditCard,
  Banknote,
  FileText,
} from "lucide-react";

// ── Status Badge Colors ──

const statusConfig: Record<string, { label: string; className: string }> = {
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
    statusConfig[status] ?? {
      label: status,
      className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    }
  );
}

// ── Format Price ──

function formatPrice(price?: number): string {
  return (price ?? 0).toLocaleString("vi-VN") + " ₫";
}

// ── Payment method mapping ──

const paymentMethodLabels: Record<string, string> = {
  cod: "Thanh toán khi nhận hàng (COD)",
  transfer: "Chuyển khoản ngân hàng",
  vnpay: "VNPay",
  momo: "Ví MoMo",
  zalopay: "ZaloPay",
};

function getPaymentMethodLabel(method: string): string {
  return paymentMethodLabels[method.toLowerCase()] || method;
}

// ── Payment status mapping ──

const paymentStatusConfig: Record<
  string,
  { label: string; className: string }
> = {
  unpaid: {
    label: "Chưa thanh toán",
    className: "bg-yellow-100 text-yellow-800",
  },
  paid: { label: "Đã thanh toán", className: "bg-green-100 text-green-800" },
  refunded: { label: "Đã hoàn tiền", className: "bg-blue-100 text-blue-800" },
  failed: {
    label: "Thanh toán thất bại",
    className: "bg-red-100 text-red-800",
  },
};

function getPaymentStatusProps(status: string) {
  return (
    paymentStatusConfig[status.toLowerCase()] ?? {
      label: status,
      className: "bg-gray-100 text-gray-800",
    }
  );
}

// ── Component ──

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [address, setAddress] = useState<OrderAddress | null>(null);
  const [coupon, setCoupon] = useState<OrderCoupon | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.getOrderById(id);
      console.log("data from res: ", res.data);
      const data = res.data;
      if (data.success && data.data) {
        setOrder(data.data.order);
        setAddress(data.data.address);
        setCoupon(data.data?.coupon);
        setOrderDetails(data.data.order_details);
      } else {
        setError("Không tìm thấy đơn hàng");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tải chi tiết đơn hàng";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!id) return;
    setCancelling(true);
    try {
      await orderService.cancelOrder(id);
      toast.success("Đã hủy đơn hàng thành công!");
      fetchOrder();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể hủy đơn hàng";
      toast.error(msg);
    } finally {
      setCancelling(false);
    }
  };

  // ── Loading State ──

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-5 w-32 mb-6" />
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="size-16 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── Error State ──

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          to="/orders"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-4 mr-1" />
          Quay lại đơn hàng
        </Link>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="size-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertCircle className="size-10 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Không thể tải đơn hàng</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
            {error}
          </p>
          <Button variant="outline" onClick={fetchOrder}>
            <Loader2 className="size-4 mr-2" />
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const status = getBadgeProps(order.order_status);
  const paymentStatus = getPaymentStatusProps(order.payment_status);
  const canCancel = order.order_status === "Pending";

  // ── Render ──

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back navigation */}
      <Link
        to="/orders"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-4 mr-1" />
        Quay lại đơn hàng
      </Link>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Chi tiết đơn hàng</h1>
          <p className="text-muted-foreground mt-1">{order.order_code}</p>
        </div>
        {canCancel && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <XCircle className="size-4 mr-2" />
                Hủy đơn hàng
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận hủy đơn hàng</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn hủy đơn hàng{" "}
                  <span className="font-semibold">{order.order_code}</span>?
                  Hành động này không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Quay lại</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90"
                  disabled={cancelling}
                  onClick={handleCancelOrder}
                >
                  {cancelling && (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  )}
                  Xác nhận hủy
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* ───────── SECTION 1: Order Information ───────── */}
      <Card className="border-border/60 shadow-sm mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="size-5 text-primary" />
            Thông tin đơn hàng
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
              <p className="font-semibold">{order.order_code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trạng thái</p>
              <Badge className={status.className}>{status.label}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Phương thức thanh toán
              </p>
              <p className="font-semibold flex items-center gap-1.5">
                {order.payment_method?.toLowerCase() === "cod" ? (
                  <Banknote className="size-4 text-muted-foreground" />
                ) : (
                  <CreditCard className="size-4 text-muted-foreground" />
                )}
                {getPaymentMethodLabel(order.payment_method)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Trạng thái thanh toán
              </p>
              <Badge className={paymentStatus.className}>
                {paymentStatus.label}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngày đặt</p>
              <p className="font-semibold">
                {formatDateTime(order.created_at)}
              </p>
            </div>
            {order.note && (
              <div className="sm:col-span-2 lg:col-span-3">
                <p className="text-sm text-muted-foreground">Ghi chú</p>
                <p className="font-medium text-muted-foreground bg-secondary/30 rounded-lg p-3 mt-1">
                  <FileText className="size-4 inline mr-1.5 -mt-0.5" />
                  {order.note}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ───────── SECTION 2: Shipping Address ───────── */}
      {address && (
        <Card className="border-border/60 shadow-sm mb-6">
          <CardHeader className="pb-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="size-5 text-primary" />
              Địa chỉ giao hàng
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-3">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="size-5 text-primary" />
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-base">
                  {address.recipient_name}
                </p>
                <p className="text-muted-foreground">{address.phone}</p>
                <p>{address.address_line}</p>
                <p className="text-muted-foreground">
                  {address.ward}, {address.district}, {address.province}
                </p>
                <p className="text-muted-foreground">
                  Địa chỉ chi tiết: {address.detail_address}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ───────── SECTION 3: Products ───────── */}
      <Card className="border-border/60 shadow-sm mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingBag className="size-5 text-primary" />
            Sản phẩm đã mua
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="space-y-4">
            {orderDetails.map((item) => (
              <div
                key={item.order_detail_id}
                className="flex gap-4 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors"
              >
                {/* Product Image */}
                <div className="size-16 sm:size-20 rounded-lg overflow-hidden bg-white border border-border shrink-0 flex items-center justify-center">
                  {item.thumbnail ? (
                    <ImageWithFallback
                      src={`http://localhost:3000${item.thumbnail}`}
                      alt={item.product_name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <Package className="size-8 text-muted-foreground" />
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${item.product_id}`}
                    className="font-semibold text-sm hover:text-accent transition-colors line-clamp-2"
                  >
                    {item.product_name}
                  </Link>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                    <span>SKU: {item.sku}</span>
                    {item.color && <span>Màu: {item.color}</span>}
                    {item.size && <span>Kích thước: {item.size}</span>}
                    {item.material && <span>Chất liệu: {item.material}</span>}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">
                        {formatPrice(item.unit_price)} x {item.quantity}
                      </span>
                    </div>
                    <span className="font-semibold text-sm text-accent">
                      {formatPrice(item.subtotal)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ───────── SECTION 4: Order Summary ───────── */}
      <Card className="border-border/60 shadow-sm mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="size-5 text-primary" />
            Tổng cộng
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tạm tính</span>
              <span className="font-medium">
                {formatPrice(order.total_amount)}
              </span>
            </div>

            {order.discount_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Giảm giá</span>
                <span className="font-medium text-green-600">
                  -{formatPrice(order.discount_amount)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Phí vận chuyển</span>
              <span className="font-medium">
                {order.shipping_fee === 0 ? (
                  <span className="text-green-600">Miễn phí</span>
                ) : (
                  formatPrice(order.shipping_fee)
                )}
              </span>
            </div>

            <Separator />

            <div className="flex justify-between text-base">
              <span className="font-semibold">Thành tiền</span>
              <span className="font-bold text-lg text-accent">
                {formatPrice(order.final_amount)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ───────── SECTION 5: Coupon ───────── */}
      {coupon && (
        <Card className="border-border/60 shadow-sm mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Tag className="size-5 text-primary" />
              Mã giảm giá
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Tag className="size-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-base">{coupon.coupon_code}</p>
                <p className="text-sm text-muted-foreground">
                  {coupon.coupon_name}
                </p>
                <p className="text-sm font-semibold text-green-600 mt-1">
                  Giảm {formatPrice(coupon.discount_value)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
