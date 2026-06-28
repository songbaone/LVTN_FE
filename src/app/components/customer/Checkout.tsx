import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import {
  MapPin,
  Home,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CreditCard,
  Banknote,
  Ticket,
  ShoppingBag,
  Package,
  ChevronRight,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { addressService } from "../../../services/address.service";
import { checkoutService, type CheckoutRequest, type CheckoutResponse } from "../../../services/checkout.service";
import { cartService } from "../../../services/cart.service";
import { useCartStore } from "../../../helpers/cartStore";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useOrderPreview, type CouponStatus } from "./useOrderPreview";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface Address {
  address_id: number;
  recipient_name: string;
  phone: string;
  address_line: string;
  ward: string;
  district: string;
  province: string;
  is_default: boolean;
}

const paymentMethods = [
  { value: "COD", label: "Thanh toán khi nhận hàng (COD)", icon: Banknote },
  { value: "VNPAY", label: "VNPAY", icon: CreditCard },
];

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + " ₫";
}

// ──────────────────────────────────────────────
// Coupon Status Display
// ──────────────────────────────────────────────

function CouponStatusMessage({ status }: { status: CouponStatus }) {
  if (status.type === "idle") return null;

  if (status.type === "applied") {
    return (
      <p className="flex items-center gap-1 text-sm text-success mt-2">
        <CheckCircle2 className="size-4" />
        Đã áp dụng mã {status.code}
      </p>
    );
  }

  if (status.type === "error") {
    return (
      <p className="flex items-center gap-1 text-sm text-destructive mt-2">
        <AlertCircle className="size-4" />
        {status.message}
      </p>
    );
  }

  return null;
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, fetchCart } = useCartStore();

  // ── Addresses ──
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  // ── Payment ──
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // ── Coupon ──
  const [couponCode, setCouponCode] = useState("");
  const couponInputRef = useRef<HTMLInputElement>(null);

  // ── Checkout state ──
  const [checkingOut, setCheckingOut] = useState(false);

  // ── Order Preview ──
  const {
    preview,
    previewLoading,
    applyCoupon,
    couponStatus,
  } = useOrderPreview({
    addressId: selectedAddressId,
    couponCode,
  });

  // ────────────────────────────────────────
  // Load cart & addresses
  // ────────────────────────────────────────

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const fetchAddresses = useCallback(async () => {
    setLoadingAddresses(true);
    setAddressError(null);
    try {
      const res = await addressService.getAll();
      const data: Address[] = res.data.data.addresses ?? res.data ?? [];
      setAddresses(data);

      // Auto-select default or first
      if (data.length > 0) {
        const defaultAddr = data.find((a) => a.is_default);
        setSelectedAddressId(defaultAddr ? defaultAddr.address_id : data[0].address_id);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tải danh sách địa chỉ";
      setAddressError(msg);
      toast.error(msg);
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // ── Coupon key handlers ──

  const handleCouponKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        applyCoupon();
      }
    },
    [applyCoupon]
  );

  const handleCouponBlur = useCallback(() => {
    applyCoupon();
  }, [applyCoupon]);

  // ── Derived cart totals (fallback when preview is not loaded yet) ──

  const localSubtotal = useMemo(() => {
    if (!cart?.items) return 0;
    return cart.items.reduce(
      (sum, item) => sum + item.pricing.selling_price * item.quantity,
      0
    );
  }, [cart]);

  const localDiscount = useMemo(() => {
    if (!cart?.items) return 0;
    return cart.items.reduce(
      (sum, item) =>
        sum +
        (item.pricing.price - item.pricing.selling_price) * item.quantity,
      0
    );
  }, [cart]);

  // ── Use preview values when available, fall back to local calculation ──

  const subtotal = preview?.subtotal ?? localSubtotal;
  const discountAmount = preview?.discount_amount ?? 0;
  const shippingFee = preview?.shipping_fee ?? 0;
  const finalAmount = preview?.final_amount ?? (localSubtotal + 0);
  const hasCoupon = preview?.coupon != null || discountAmount > 0;

  // ────────────────────────────────────────
  // Handle checkout
  // ────────────────────────────────────────

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      toast.error("Vui lòng chọn địa chỉ nhận hàng");
      return;
    }
    if (!paymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán");
      return;
    }
    if (!cart || cart.items.length === 0) {
      toast.error("Giỏ hàng của bạn đang trống");
      return;
    }

    setCheckingOut(true);

    try {
      const payload: CheckoutRequest = {
        address_id: selectedAddressId,
        payment_method: paymentMethod,
      };

      if (couponCode.trim()) {
        payload.coupon_code = couponCode.trim();
      }

      const res = await checkoutService.checkout(payload);
      // Try res.data.data (project convention) or fall back to res.data (flat response)
      const responseData: CheckoutResponse = (res.data?.data ?? res.data) as CheckoutResponse;

      // ── VNPAY: redirect to payment gateway immediately ──
      // Do NOT show success toast, do NOT navigate, do NOT clear cart
      if (paymentMethod === "VNPAY" && responseData.payment?.payment_url) {
        window.location.replace(responseData.payment.payment_url);
        return;
      }

      // ── COD: success flow ──
      toast.success("Đặt hàng thành công!");

      try {
        await cartService.clearCart();
        // Refresh cart state so badge and pages reflect empty cart
        await fetchCart();
      } catch {
        toast.warning("Không thể đồng bộ giỏ hàng. Vui lòng kiểm tra lại sau.");
      }

      // Navigate to order detail / orders page
      const orderId = responseData.order_id;
      if (orderId) {
        navigate(`/orders/${orderId}`);
      } else {
        navigate("/orders");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Đặt hàng thất bại, vui lòng thử lại";
      toast.error(msg);
    } finally {
      setCheckingOut(false);
    }
  };

  // ────────────────────────────────────────
  // Render helpers
  // ────────────────────────────────────────

  const renderAddressSkeleton = () => (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <Card key={i} className="border-border/60">
          <CardContent className="p-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderProductSkeleton = () => (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="flex gap-4 p-4 rounded-xl border border-border/60"
        >
          <Skeleton className="size-20 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-5 w-20 ml-auto" />
            <Skeleton className="h-4 w-14 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );

  const cartLoading = !cart || !cart.items;
  const cartEmpty = cart && cart.items.length === 0;

  // ── Determine if checkout button should be disabled ──

  const isCheckoutDisabled =
    checkingOut ||
    previewLoading ||
    loadingAddresses ||
    addresses.length === 0 ||
    !selectedAddressId ||
    !paymentMethod ||
    !cart ||
    cart.items.length === 0;

  // ────────────────────────────────────────
  // Render
  // ────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
        {/* Page header with breadcrumb */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link to="/cart" className="hover:text-accent transition-colors">
              Giỏ hàng
            </Link>
            <ChevronRight className="size-4" />
            <span className="text-foreground font-medium">Thanh toán</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Thanh toán
          </h1>
        </div>

        {cartLoading ? (
          /* ── Loading state: show skeleton of the whole page ── */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Address skeleton */}
              <Card>
                <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
                <CardContent>{renderAddressSkeleton()}</CardContent>
              </Card>
              {/* Products skeleton */}
              <Card>
                <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
                <CardContent>{renderProductSkeleton()}</CardContent>
              </Card>
              {/* Payment skeleton */}
              <Card>
                <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        ) : cartEmpty ? (
          /* ── Empty cart state ── */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="size-24 rounded-full bg-secondary flex items-center justify-center mb-6">
              <ShoppingBag className="size-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Giỏ hàng của bạn đang trống</h2>
            <p className="text-muted-foreground text-center max-w-md mb-8">
              Hãy thêm sản phẩm vào giỏ hàng trước khi tiến hành thanh toán
            </p>
            <Button
              className="bg-accent hover:bg-accent/90 text-base py-6 px-8"
              asChild
            >
              <Link to="/products">Tiếp tục mua sắm</Link>
            </Button>
          </div>
        ) : (
          /* ── Main checkout layout ── */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ─── LEFT COLUMN ─── */}
            <div className="lg:col-span-2 space-y-6">
              {/* ── 1. Address Selection ── */}
              <Card className="border-border/60 shadow-sm overflow-hidden">
                <CardHeader className="pb-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MapPin className="size-5 text-primary" />
                      Địa chỉ nhận hàng
                    </CardTitle>
                    <Button variant="link" size="sm" asChild className="text-accent">
                      <Link to="/profile">Quản lý địa chỉ</Link>
                    </Button>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  {loadingAddresses ? (
                    renderAddressSkeleton()
                  ) : addressError ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <AlertCircle className="size-10 text-destructive mb-3" />
                      <p className="text-sm text-muted-foreground mb-4">{addressError}</p>
                      <Button variant="outline" size="sm" onClick={fetchAddresses}>
                        <Loader2 className="size-4 mr-2" />
                        Thử lại
                      </Button>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="size-16 rounded-full bg-secondary flex items-center justify-center mb-3">
                        <MapPin className="size-8 text-muted-foreground" />
                      </div>
                      <p className="font-semibold mb-1">Bạn chưa có địa chỉ nhận hàng</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Vui lòng thêm địa chỉ trước khi đặt hàng
                      </p>
                      <Button className="bg-accent hover:bg-accent/90" asChild>
                        <Link to="/profile">Thêm địa chỉ</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {addresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.address_id;
                        return (
                          <button
                            key={addr.address_id}
                            type="button"
                            onClick={() => setSelectedAddressId(addr.address_id)}
                            disabled={checkingOut}
                            className={`w-full text-left rounded-xl border-2 p-4 transition-all ${isSelected
                              ? "border-accent bg-accent/5 ring-1 ring-accent/20"
                              : "border-border hover:border-accent/50 hover:bg-accent/5"
                              } ${checkingOut ? "opacity-60 pointer-events-none" : "cursor-pointer"}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  {addr.is_default && (
                                    <Badge className="bg-accent text-accent-foreground text-[10px] px-2 py-0.5">
                                      <Home className="size-3 mr-1" />
                                      Mặc định
                                    </Badge>
                                  )}
                                  {isSelected && (
                                    <Badge
                                      variant="outline"
                                      className="border-accent text-accent text-[10px] px-2 py-0.5"
                                    >
                                      <CheckCircle2 className="size-3 mr-1" />
                                      Đang chọn
                                    </Badge>
                                  )}
                                </div>
                                <p className="font-semibold text-base mt-1">{addr.recipient_name}</p>
                                <p className="text-sm text-muted-foreground">{addr.phone}</p>
                                <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                                  <p>{addr.address_line}</p>
                                  <p>
                                    {addr.ward}, {addr.district}
                                  </p>
                                  <p className="font-medium text-foreground/70">{addr.province}</p>
                                </div>
                              </div>
                              {isSelected && (
                                <CheckCircle2 className="size-6 text-accent shrink-0 mt-1" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ── 2. Products To Checkout ── */}
              <Card className="border-border/60 shadow-sm overflow-hidden">
                <CardHeader className="pb-3 bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Package className="size-5 text-primary" />
                    <CardTitle className="text-base">
                      Sản phẩm đang chọn
                    </CardTitle>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {cart.items.reduce((s, i) => s + i.quantity, 0)} sản phẩm
                    </Badge>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4 p-0 sm:p-6">
                  {/* Desktop table */}
                  <div className="hidden md:block">
                    <table className="w-full">
                      <thead>
                        <tr className="text-xs text-muted-foreground uppercase border-b border-border">
                          <th className="text-left pb-3 pl-6 font-medium">Sản phẩm</th>
                          <th className="text-center pb-3 font-medium">Đơn giá</th>
                          <th className="text-center pb-3 font-medium">Số lượng</th>
                          <th className="text-right pb-3 pr-6 font-medium">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.items.map((item) => {
                          const imgSrc = item.product.thumbnail || item.product.image_url;
                          const lineTotal = item.pricing.selling_price * item.quantity;
                          return (
                            <tr
                              key={item.cart_item_id}
                              className="border-b border-border/50 last:border-b-0 hover:bg-muted/20 transition-colors"
                            >
                              <td className="py-4 pl-6">
                                <div className="flex items-center gap-4">
                                  <div className="size-16 rounded-lg border border-border overflow-hidden bg-white shrink-0">
                                    {imgSrc ? (
                                      <ImageWithFallback
                                        src={imgSrc}
                                        alt={item.product.product_name}
                                        className="size-full object-cover"
                                      />
                                    ) : (
                                      <div className="size-full flex items-center justify-center bg-secondary">
                                        <Package className="size-6 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-sm line-clamp-2">
                                      {item.product.product_name}
                                    </p>
                                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                                      {item.variant.sku && (
                                        <span>SKU: {item.variant.sku}</span>
                                      )}
                                      {item.variant.size && (
                                        <span>Size: {item.variant.size}</span>
                                      )}
                                      {item.variant.color && (
                                        <span>Màu: {item.variant.color}</span>
                                      )}
                                      {item.variant.material && (
                                        <span>Chất liệu: {item.variant.material}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="text-center py-4 text-sm">
                                {item.pricing.discount_price > 0 ? (
                                  <div className="flex flex-col items-center">
                                    <span className="text-muted-foreground line-through text-xs">
                                      {formatPrice(item.pricing.price)}
                                    </span>
                                    <span className="font-medium text-accent">
                                      {formatPrice(item.pricing.selling_price)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="font-medium">
                                    {formatPrice(item.pricing.selling_price)}
                                  </span>
                                )}
                              </td>
                              <td className="text-center py-4 text-sm">
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-xs font-medium">
                                  x{item.quantity}
                                </span>
                              </td>
                              <td className="text-right py-4 pr-6 text-sm font-semibold">
                                {formatPrice(lineTotal)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="md:hidden space-y-3 p-4">
                    {cart.items.map((item) => {
                      const imgSrc = item.product.thumbnail || item.product.image_url;
                      const lineTotal = item.pricing.selling_price * item.quantity;
                      return (
                        <div
                          key={item.cart_item_id}
                          className="flex gap-3 p-3 rounded-xl border border-border/60 hover:border-accent/30 transition-colors"
                        >
                          <div className="size-16 rounded-lg border border-border overflow-hidden bg-white shrink-0">
                            {imgSrc ? (
                              <ImageWithFallback
                                src={imgSrc}
                                alt={item.product.product_name}
                                className="size-full object-cover"
                              />
                            ) : (
                              <div className="size-full flex items-center justify-center bg-secondary">
                                <Package className="size-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-2">
                              {item.product.product_name}
                            </p>
                            <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5 text-xs text-muted-foreground">
                              {item.variant.sku && <span>SKU: {item.variant.sku}</span>}
                              {item.variant.size && <span>Size: {item.variant.size}</span>}
                              {item.variant.color && <span>{item.variant.color}</span>}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-sm font-medium text-accent">
                                {formatPrice(item.pricing.selling_price)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                x{item.quantity}
                              </span>
                            </div>
                            <p className="text-right text-sm font-semibold mt-1">
                              {formatPrice(lineTotal)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* ── 3. Coupon ── */}
              <Card className="border-border/60 shadow-sm overflow-hidden">
                <CardHeader className="pb-3 bg-muted/30">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Ticket className="size-5 text-primary" />
                    Mã giảm giá
                  </CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  <div className="flex gap-3">
                    <Input
                      ref={couponInputRef}
                      placeholder="Nhập mã giảm giá (nếu có)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      onKeyDown={handleCouponKeyDown}
                      onBlur={handleCouponBlur}
                      disabled={checkingOut}
                      className="flex-1"
                    />
                  </div>

                  {/* Coupon status feedback */}
                  <CouponStatusMessage status={couponStatus} />

                  <p className="text-xs text-muted-foreground mt-2">
                    Mã giảm giá là tùy chọn. Nhấn Enter hoặc rời khỏi ô để áp dụng.
                  </p>
                </CardContent>
              </Card>

              {/* ── 4. Payment Method ── */}
              <Card className="border-border/60 shadow-sm overflow-hidden">
                <CardHeader className="pb-3 bg-muted/30">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CreditCard className="size-5 text-primary" />
                    Phương thức thanh toán
                  </CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-3"
                    disabled={checkingOut}
                  >
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <label
                          key={method.value}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === method.value
                            ? "border-accent bg-accent/5"
                            : "border-border hover:border-accent/50"
                            } ${checkingOut ? "opacity-60 pointer-events-none" : ""}`}
                        >
                          <RadioGroupItem value={method.value} id={method.value} />
                          <Icon
                            className={`size-5 ${paymentMethod === method.value ? "text-accent" : "text-muted-foreground"
                              }`}
                          />
                          <Label
                            htmlFor={method.value}
                            className="flex-1 cursor-pointer font-medium"
                          >
                            {method.label}
                          </Label>
                          {paymentMethod === method.value && (
                            <CheckCircle2 className="size-5 text-accent" />
                          )}
                        </label>
                      );
                    })}
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* ─── RIGHT COLUMN – Order Summary ─── */}
            <div>
              <Card className="sticky top-24 border-border/60 shadow-sm">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="text-base">Hóa đơn</CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {/* Subtotal */}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tạm tính</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>

                    {/* Discount – only when coupon is applied or discount_amount > 0 */}
                    {hasCoupon && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Giảm giá</span>
                        <span className="font-medium text-success">
                          -{formatPrice(discountAmount)}
                        </span>
                      </div>
                    )}

                    {/* Shipping */}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Phí vận chuyển</span>
                      <span className="font-medium">
                        {shippingFee === 0 ? (
                          <span className="text-success">Miễn phí</span>
                        ) : (
                          formatPrice(shippingFee)
                        )}
                      </span>
                    </div>

                    {/* Coupon code display (visual reference) */}
                    {couponStatus.type === "applied" && (
                      <div className="flex justify-between text-sm text-accent">
                        <span>Mã giảm giá</span>
                        <span className="font-medium">{couponStatus.code}</span>
                      </div>
                    )}

                    {/* Product count */}
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Số lượng sản phẩm</span>
                      <span>
                        {cart.items.reduce((s, i) => s + i.quantity, 0)}
                      </span>
                    </div>

                    <Separator />

                    {/* Grand total */}
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="font-bold text-base">Tổng thanh toán</span>
                        <span className="text-xs text-muted-foreground">
                          (Đã gồm VAT)
                        </span>
                      </div>
                      <span className="text-xl font-bold text-accent">
                        {previewLoading ? (
                          <Loader2 className="size-5 animate-spin inline-block" />
                        ) : (
                          formatPrice(finalAmount)
                        )}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-6 bg-accent hover:bg-accent/90 text-base text-white py-5 rounded-xl font-semibold"
                    onClick={handleCheckout}
                    disabled={isCheckoutDisabled}
                  >
                    {checkingOut ? (
                      <>
                        <Loader2 className="size-5 mr-2 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : previewLoading ? (
                      <>
                        <Loader2 className="size-5 mr-2 animate-spin" />
                        Đang tính toán...
                      </>
                    ) : (
                      `Đặt hàng • ${formatPrice(finalAmount)}`
                    )}
                  </Button>

                  {addresses.length === 0 && !loadingAddresses && (
                    <p className="text-xs text-destructive text-center mt-2">
                      Vui lòng thêm địa chỉ nhận hàng để tiếp tục
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}