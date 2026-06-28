import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Loader2, CheckCircle2, XCircle, Package, ShoppingBag, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { paymentService } from "../../../services/payment.service";
import { useCartStore } from "../../../helpers/cartStore";

// ── Types ──

interface VNPayParams {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo: string;
  vnp_CardType: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
  [key: string]: string;
}

type PaymentResultStatus = "loading" | "success" | "failure";

// ── VNPay Parameter Parser ──

function parseVNPayParams(searchParams: URLSearchParams): VNPayParams | null {
  const requiredParams = [
    "vnp_Amount",
    "vnp_ResponseCode",
    "vnp_TransactionStatus",
    "vnp_TxnRef",
  ];

  for (const key of requiredParams) {
    if (!searchParams.has(key)) return null;
  }

  const params: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith("vnp_")) {
      params[key] = value;
    }
  }

  return params as VNPayParams;
}

function formatVNPayDate(dateStr: string): string {
  if (!dateStr || dateStr.length < 14) return dateStr;
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  const hour = dateStr.substring(8, 10);
  const min = dateStr.substring(10, 12);
  const sec = dateStr.substring(12, 14);
  return `${day}/${month}/${year} ${hour}:${min}:${sec}`;
}

function formatAmountVND(amountStr: string): string {
  const amount = parseInt(amountStr, 10);
  if (isNaN(amount)) return "0 ₫";
  return (amount / 100).toLocaleString("vi-VN") + " ₫";
}

// ── Component ──

export default function PaymentResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { fetchCart } = useCartStore();

  const [status, setStatus] = useState<PaymentResultStatus>("loading");
  const [params, setParams] = useState<VNPayParams | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Guard against duplicate confirmation requests (React StrictMode)
  const apiCalledRef = useRef(false);

  useEffect(() => {
    const parsed = parseVNPayParams(searchParams);

    if (!parsed) {
      setErrorMessage("Không tìm thấy thông tin thanh toán VNPay");
      setStatus("failure");
      return;
    }

    setParams(parsed);
    confirmPayment(parsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmPayment = async (vnpParams: VNPayParams) => {
    if (apiCalledRef.current) return;
    apiCalledRef.current = true;

    try {
      // Send ALL VNPay parameters to the backend for validation
      const res = await paymentService.confirmVNPay(vnpParams);
      const body = res.data;

      if (body && body.success !== false) {
        // Backend confirmed payment — refresh cart state
        await fetchCart();
        setStatus("success");
      } else {
        // Backend returned a failure status
        const msg = body?.message || "Thanh toán không thành công";
        setErrorMessage(msg);
        setStatus("failure");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Xác nhận thanh toán thất bại";
      toast.error(msg);
      setErrorMessage(msg);
      setStatus("failure");
    }
  };

  // ── Render ──

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="size-12 animate-spin text-accent mx-auto" />
          <p className="text-lg font-medium text-muted-foreground">
            Đang xác nhận thanh toán...
          </p>
        </div>
      </div>
    );
  }

  if (status === "success" && params) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4 py-6 lg:py-8 max-w-2xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/checkout" className="hover:text-accent transition-colors">
              Thanh toán
            </Link>
            <ChevronRight className="size-4" />
            <span className="text-foreground font-medium">Kết quả thanh toán</span>
          </div>

          <Card className="border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-success/10 pb-3 text-center">
              <CheckCircle2 className="size-16 text-success mx-auto mb-2" />
              <CardTitle className="text-2xl font-bold text-success">
                ✅ Thanh toán thành công
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-muted-foreground">Mã đơn hàng</div>
                <div className="font-medium text-right">{params.vnp_TxnRef}</div>

                <div className="text-muted-foreground">Mã giao dịch</div>
                <div className="font-medium text-right">{params.vnp_TransactionNo}</div>

                <div className="text-muted-foreground">Ngân hàng</div>
                <div className="font-medium text-right">{params.vnp_BankCode}</div>

                <div className="text-muted-foreground">Thời gian thanh toán</div>
                <div className="font-medium text-right">
                  {formatVNPayDate(params.vnp_PayDate)}
                </div>

                <div className="text-muted-foreground">Số tiền</div>
                <div className="font-medium text-right text-lg text-accent">
                  {formatAmountVND(params.vnp_Amount)}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  className="flex-1 bg-accent hover:bg-accent/90 text-white"
                  onClick={() => navigate(`/orders`)}
                >
                  <Package className="size-4 mr-2" />
                  Xem đơn hàng
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/products")}
                >
                  <ShoppingBag className="size-4 mr-2" />
                  Tiếp tục mua sắm
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (status === "failure") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4 py-6 lg:py-8 max-w-2xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/checkout" className="hover:text-accent transition-colors">
              Thanh toán
            </Link>
            <ChevronRight className="size-4" />
            <span className="text-foreground font-medium">Kết quả thanh toán</span>
          </div>

          <Card className="border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-destructive/10 pb-3 text-center">
              <XCircle className="size-16 text-destructive mx-auto mb-2" />
              <CardTitle className="text-2xl font-bold text-destructive">
                ❌ Thanh toán thất bại
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {errorMessage && (
                <p className="text-sm text-destructive text-center">{errorMessage}</p>
              )}

              {params && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-muted-foreground">Mã đơn hàng</div>
                  <div className="font-medium text-right">{params.vnp_TxnRef}</div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  className="flex-1 bg-accent hover:bg-accent/90 text-white"
                  onClick={() => navigate("/checkout")}
                >
                  Quay lại Checkout
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/")}
                >
                  Trang chủ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}