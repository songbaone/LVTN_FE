import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Search,
  Download,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Copy,
  ArrowUpRight,
  FileText,
  Wallet,
  RotateCcw,
  Settings,
  Banknote,
  Zap,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";

interface Transaction {
  id: string;
  orderId: string;
  customer: string;
  email: string;
  amount: number;
  fee: number;
  net: number;
  method: "VNPay" | "MoMo" | "Bank Transfer" | "COD";
  status: "success" | "pending" | "failed" | "refunded";
  date: string;
  gatewayRef: string;
  gatewayResponse: Record<string, unknown>;
}

interface Refund {
  id: string;
  orderId: string;
  transactionId: string;
  customer: string;
  amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "processed";
  requestDate: string;
  processDate: string;
  note: string;
}

interface GatewayLog {
  id: string;
  gateway: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
  success: boolean;
}

const mockTransactions: Transaction[] = [
  { id: "TXN-2026-001015", orderId: "ORD-2026-001234", customer: "Nguyễn Thu Hương", email: "nguyen.huong@email.com", amount: 2420000, fee: 48400, net: 2371600, method: "VNPay", status: "success", date: "2026-06-05 10:32", gatewayRef: "VNP20260605103212345", gatewayResponse: { vnp_ResponseCode: "00", vnp_Message: "Giao dich thanh cong", vnp_Amount: "242000000", vnp_BankCode: "NCB", vnp_CardType: "ATM" } },
  { id: "TXN-2026-001014", orderId: "ORD-2026-001233", customer: "Trần Minh Anh", email: "tran.anh@email.com", amount: 1890000, fee: 37800, net: 1852200, method: "MoMo", status: "success", date: "2026-06-05 09:15", gatewayRef: "MM20260605091598765", gatewayResponse: { resultCode: 0, message: "Successful", partnerCode: "MOMO", orderId: "MM-1233" } },
  { id: "TXN-2026-001013", orderId: "ORD-2026-001232", customer: "Lê Thị Mai", email: "le.mai@email.com", amount: 450000, fee: 0, net: 450000, method: "Bank Transfer", status: "pending", date: "2026-06-05 08:45", gatewayRef: "BT20260605084511111", gatewayResponse: { status: "PENDING", accountNumber: "9999****1234", bankName: "Vietcombank" } },
  { id: "TXN-2026-001012", orderId: "ORD-2026-001231", customer: "Phạm Văn Đức", email: "pham.duc@email.com", amount: 780000, fee: 15600, net: 764400, method: "VNPay", status: "failed", date: "2026-06-04 22:10", gatewayRef: "VNP20260604221022222", gatewayResponse: { vnp_ResponseCode: "24", vnp_Message: "Giao dich bi huy", vnp_BankCode: "VCB" } },
  { id: "TXN-2026-001011", orderId: "ORD-2026-001230", customer: "Hoàng Thị Lan", email: "hoang.lan@email.com", amount: 3150000, fee: 63000, net: 3087000, method: "MoMo", status: "success", date: "2026-06-04 18:30", gatewayRef: "MM20260604183033333", gatewayResponse: { resultCode: 0, message: "Successful", partnerCode: "MOMO" } },
  { id: "TXN-2026-001010", orderId: "ORD-2026-001229", customer: "Vũ Thị Hoa", email: "vu.hoa@email.com", amount: 920000, fee: 18400, net: 901600, method: "VNPay", status: "refunded", date: "2026-06-04 15:20", gatewayRef: "VNP20260604152044444", gatewayResponse: { vnp_ResponseCode: "00", vnp_TransactionType: "02", vnp_Message: "Hoan tien thanh cong" } },
  { id: "TXN-2026-001009", orderId: "ORD-2026-001228", customer: "Đặng Văn Hùng", email: "dang.hung@email.com", amount: 2100000, fee: 42000, net: 2058000, method: "MoMo", status: "success", date: "2026-06-04 13:05", gatewayRef: "MM20260604130555555", gatewayResponse: { resultCode: 0, message: "Successful" } },
  { id: "TXN-2026-001008", orderId: "ORD-2026-001227", customer: "Bùi Thị Thu", email: "bui.thu@email.com", amount: 560000, fee: 0, net: 560000, method: "Bank Transfer", status: "success", date: "2026-06-04 11:40", gatewayRef: "BT20260604114066666", gatewayResponse: { status: "CONFIRMED", accountNumber: "8888****5678" } },
  { id: "TXN-2026-001007", orderId: "ORD-2026-001226", customer: "Ngô Văn Long", email: "ngo.long@email.com", amount: 1230000, fee: 24600, net: 1205400, method: "VNPay", status: "failed", date: "2026-06-04 10:22", gatewayRef: "VNP20260604102277777", gatewayResponse: { vnp_ResponseCode: "51", vnp_Message: "Tai khoan khong du so du", vnp_BankCode: "TCB" } },
  { id: "TXN-2026-001006", orderId: "ORD-2026-001225", customer: "Đinh Thị Yến", email: "dinh.yen@email.com", amount: 870000, fee: 0, net: 870000, method: "COD", status: "success", date: "2026-06-04 09:55", gatewayRef: "COD20260604095588888", gatewayResponse: {} },
  { id: "TXN-2026-001005", orderId: "ORD-2026-001224", customer: "Lý Thị Xuân", email: "ly.xuan@email.com", amount: 4500000, fee: 90000, net: 4410000, method: "MoMo", status: "success", date: "2026-06-03 20:15", gatewayRef: "MM20260603201599999", gatewayResponse: { resultCode: 0, message: "Successful" } },
  { id: "TXN-2026-001004", orderId: "ORD-2026-001223", customer: "Cao Thị Phương", email: "cao.phuong@email.com", amount: 2890000, fee: 0, net: 2890000, method: "Bank Transfer", status: "success", date: "2026-06-03 16:40", gatewayRef: "BT20260603164000000", gatewayResponse: { status: "CONFIRMED" } },
  { id: "TXN-2026-001003", orderId: "ORD-2026-001222", customer: "Dương Văn Khoa", email: "duong.khoa@email.com", amount: 740000, fee: 14800, net: 725200, method: "VNPay", status: "success", date: "2026-06-03 14:30", gatewayRef: "VNP20260603143011111", gatewayResponse: { vnp_ResponseCode: "00", vnp_Message: "Giao dich thanh cong", vnp_BankCode: "MB" } },
  { id: "TXN-2026-001002", orderId: "ORD-2026-001221", customer: "Nguyễn Thị Ngọc", email: "nguyen.ngoc@email.com", amount: 3300000, fee: 66000, net: 3234000, method: "VNPay", status: "success", date: "2026-06-03 11:20", gatewayRef: "VNP20260603112022222", gatewayResponse: { vnp_ResponseCode: "00", vnp_BankCode: "ACB" } },
  { id: "TXN-2026-001001", orderId: "ORD-2026-001220", customer: "Trần Thanh Tùng", email: "tran.tung@email.com", amount: 1670000, fee: 33400, net: 1636600, method: "MoMo", status: "pending", date: "2026-06-03 09:00", gatewayRef: "MM20260603090033333", gatewayResponse: { resultCode: 1000, message: "Processing" } },
];

const mockRefunds: Refund[] = [
  { id: "REF-2026-00107", orderId: "ORD-2026-001229", transactionId: "TXN-2026-001010", customer: "Vũ Thị Hoa", amount: 920000, reason: "Sản phẩm bị lỗi, không hoạt động đúng chức năng", status: "processed", requestDate: "2026-06-04 16:00", processDate: "2026-06-05 10:00", note: "Đã hoàn tiền về tài khoản VNPay của khách." },
  { id: "REF-2026-00106", orderId: "ORD-2026-001231", transactionId: "TXN-2026-001012", customer: "Phạm Văn Đức", amount: 780000, reason: "Giao hàng nhầm sản phẩm", status: "pending", requestDate: "2026-06-05 07:30", processDate: "", note: "" },
  { id: "REF-2026-00105", orderId: "ORD-2026-001215", transactionId: "TXN-2026-000998", customer: "Lê Văn Tuấn", amount: 1200000, reason: "Không nhận được hàng sau 10 ngày", status: "rejected", requestDate: "2026-06-02 14:20", processDate: "2026-06-03 09:00", note: "Gói hàng đã được giao, ảnh chụp tại địa chỉ khách." },
  { id: "REF-2026-00104", orderId: "ORD-2026-001210", transactionId: "TXN-2026-000990", customer: "Nguyễn Thị Lan", amount: 560000, reason: "Hàng bị hỏng trong quá trình vận chuyển", status: "approved", requestDate: "2026-06-01 11:00", processDate: "2026-06-02 14:00", note: "Đã xác nhận hàng hỏng qua ảnh chụp của khách." },
  { id: "REF-2026-00103", orderId: "ORD-2026-001205", transactionId: "TXN-2026-000985", customer: "Trần Thanh Tùng", amount: 430000, reason: "Sản phẩm không đúng mô tả trên website", status: "pending", requestDate: "2026-06-01 09:15", processDate: "", note: "" },
  { id: "REF-2026-00102", orderId: "ORD-2026-001200", transactionId: "TXN-2026-000980", customer: "Hoàng Thị Hà", amount: 890000, reason: "Giao hàng quá muộn, đã không còn nhu cầu", status: "approved", requestDate: "2026-05-30 15:30", processDate: "2026-05-31 10:00", note: "Chấp nhận yêu cầu hoàn tiền do lỗi giao hàng." },
  { id: "REF-2026-00101", orderId: "ORD-2026-001195", transactionId: "TXN-2026-000975", customer: "Đặng Minh Trí", amount: 650000, reason: "Đặt nhầm sản phẩm, muốn đổi", status: "processed", requestDate: "2026-05-29 12:00", processDate: "2026-05-30 09:00", note: "Đã hoàn tiền và hướng dẫn đặt lại." },
];

const mockGatewayLogs: GatewayLog[] = [
  { id: "LOG-001", gateway: "VNPay", endpoint: "/paymentv2/vpcpay.html", method: "POST", statusCode: 200, responseTime: 342, timestamp: "2026-06-05 10:32:15", success: true },
  { id: "LOG-002", gateway: "MoMo", endpoint: "/v2/gateway/api/create", method: "POST", statusCode: 200, responseTime: 218, timestamp: "2026-06-05 09:15:42", success: true },
  { id: "LOG-003", gateway: "Bank Transfer", endpoint: "/webhook/confirm", method: "GET", statusCode: 200, responseTime: 95, timestamp: "2026-06-05 08:45:11", success: true },
  { id: "LOG-004", gateway: "VNPay", endpoint: "/paymentv2/vpcpay.html", method: "POST", statusCode: 200, responseTime: 1240, timestamp: "2026-06-04 22:10:33", success: false },
  { id: "LOG-005", gateway: "MoMo", endpoint: "/v2/gateway/api/create", method: "POST", statusCode: 200, responseTime: 287, timestamp: "2026-06-04 18:30:05", success: true },
  { id: "LOG-006", gateway: "VNPay", endpoint: "/paymentv2/Transaction/queryDR", method: "POST", statusCode: 200, responseTime: 156, timestamp: "2026-06-04 15:20:48", success: true },
  { id: "LOG-007", gateway: "MoMo", endpoint: "/v2/gateway/api/create", method: "POST", statusCode: 504, responseTime: 30000, timestamp: "2026-06-04 13:05:22", success: false },
];

const revenueByMethodData = [
  { month: "Thg 1", VNPay: 45200000, MoMo: 28100000, "Bank Transfer": 12400000, COD: 8300000 },
  { month: "Thg 2", VNPay: 52300000, MoMo: 31400000, "Bank Transfer": 15200000, COD: 6100000 },
  { month: "Thg 3", VNPay: 48700000, MoMo: 35600000, "Bank Transfer": 11800000, COD: 7400000 },
  { month: "Thg 4", VNPay: 61200000, MoMo: 38900000, "Bank Transfer": 16500000, COD: 5200000 },
  { month: "Thg 5", VNPay: 58400000, MoMo: 41200000, "Bank Transfer": 14700000, COD: 6800000 },
  { month: "Thg 6", VNPay: 68100000, MoMo: 42300000, "Bank Transfer": 18900000, COD: 4900000 },
];

const successRateData = [
  { day: "T2", VNPay: 94.2, MoMo: 97.8, "Bank Transfer": 99.1 },
  { day: "T3", VNPay: 96.5, MoMo: 98.2, "Bank Transfer": 100 },
  { day: "T4", VNPay: 92.3, MoMo: 96.9, "Bank Transfer": 98.7 },
  { day: "T5", VNPay: 98.1, MoMo: 99.0, "Bank Transfer": 100 },
  { day: "T6", VNPay: 95.7, MoMo: 97.5, "Bank Transfer": 99.3 },
  { day: "T7", VNPay: 91.4, MoMo: 95.8, "Bank Transfer": 98.1 },
  { day: "CN", VNPay: 97.2, MoMo: 98.6, "Bank Transfer": 100 },
];

const failedReasonsData = [
  { reason: "Không đủ số dư", count: 35 },
  { reason: "Thẻ hết hạn", count: 22 },
  { reason: "Timeout mạng", count: 18 },
  { reason: "Lỗi cổng thanh toán", count: 15 },
  { reason: "Sai thông tin xác thực", count: 8 },
  { reason: "Giao dịch bị từ chối", count: 6 },
];

const methodDistributionData = [
  { name: "VNPay", value: 48, color: "#EC407A" },
  { name: "MoMo", value: 30, color: "#AB47BC" },
  { name: "Bank Transfer", value: 15, color: "#42A5F5" },
  { name: "COD", value: 7, color: "#66BB6A" },
];

const formatCurrency = (amount: number) => amount.toLocaleString("vi-VN") + " ₫";

function TransactionStatusBadge({ status }: { status: Transaction["status"] }) {
  const map = {
    success: { label: "Thành công", className: "bg-green-100 text-green-700" },
    pending: { label: "Đang xử lý", className: "bg-yellow-100 text-yellow-700" },
    failed: { label: "Thất bại", className: "bg-red-100 text-red-700" },
    refunded: { label: "Đã hoàn tiền", className: "bg-blue-100 text-blue-700" },
  };
  const { label, className } = map[status];
  return <Badge className={className}>{label}</Badge>;
}

function RefundStatusBadge({ status }: { status: Refund["status"] }) {
  const map = {
    pending: { label: "Chờ duyệt", className: "bg-yellow-100 text-yellow-700" },
    approved: { label: "Đã duyệt", className: "bg-blue-100 text-blue-700" },
    rejected: { label: "Từ chối", className: "bg-red-100 text-red-700" },
    processed: { label: "Đã hoàn tiền", className: "bg-green-100 text-green-700" },
  };
  const { label, className } = map[status];
  return <Badge className={className}>{label}</Badge>;
}

function MethodBadge({ method }: { method: Transaction["method"] }) {
  const map: Record<string, string> = {
    VNPay: "bg-blue-100 text-blue-700",
    MoMo: "bg-pink-100 text-pink-700",
    "Bank Transfer": "bg-purple-100 text-purple-700",
    COD: "bg-gray-100 text-gray-700",
  };
  return <Badge className={map[method]}>{method}</Badge>;
}

export default function PaymentManagement() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [txSearch, setTxSearch] = useState("");
  const [txStatusFilter, setTxStatusFilter] = useState("all");
  const [txMethodFilter, setTxMethodFilter] = useState("all");
  const [refundSearch, setRefundSearch] = useState("");
  const [refundStatusFilter, setRefundStatusFilter] = useState("all");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [selectedLog, setSelectedLog] = useState<GatewayLog | null>(null);
  const [currentTxPage, setCurrentTxPage] = useState(1);
  const [currentRefundPage, setCurrentRefundPage] = useState(1);
  const [refunds, setRefunds] = useState<Refund[]>(mockRefunds);
  const itemsPerPage = 8;

  const [vnpayEnabled, setVnpayEnabled] = useState(true);
  const [momoEnabled, setMomoEnabled] = useState(true);
  const [bankEnabled, setBankEnabled] = useState(true);
  const [vnpayForm, setVnpayForm] = useState({
    merchantId: "BABYSTORE_VNP",
    secretKey: "••••••••••••••••••••",
    apiUrl: "https://sandbox.vnpayment.vn",
    returnUrl: "https://babystore.vn/payment/vnpay/return",
    sandbox: true,
  });
  const [momoForm, setMomoForm] = useState({
    partnerCode: "BABYSTORE_MM",
    accessKey: "F8BtyIqraeChWvkN",
    secretKey: "••••••••••••••••••••",
    apiUrl: "https://test-payment.momo.vn",
    returnUrl: "https://babystore.vn/payment/momo/return",
  });
  const [bankForm, setBankForm] = useState({
    bankName: "Vietcombank",
    accountNumber: "0123456789",
    accountName: "CONG TY BABY STORE",
    branch: "Hà Nội",
  });

  const filteredTx = mockTransactions.filter((tx) => {
    const matchSearch =
      tx.id.toLowerCase().includes(txSearch.toLowerCase()) ||
      tx.orderId.toLowerCase().includes(txSearch.toLowerCase()) ||
      tx.customer.toLowerCase().includes(txSearch.toLowerCase());
    const matchStatus = txStatusFilter === "all" || tx.status === txStatusFilter;
    const matchMethod = txMethodFilter === "all" || tx.method === txMethodFilter;
    return matchSearch && matchStatus && matchMethod;
  });

  const filteredRefunds = refunds.filter((r) => {
    const matchSearch =
      r.id.toLowerCase().includes(refundSearch.toLowerCase()) ||
      r.orderId.toLowerCase().includes(refundSearch.toLowerCase()) ||
      r.customer.toLowerCase().includes(refundSearch.toLowerCase());
    const matchStatus = refundStatusFilter === "all" || r.status === refundStatusFilter;
    return matchSearch && matchStatus;
  });

  const txPages = Math.ceil(filteredTx.length / itemsPerPage);
  const pagedTx = filteredTx.slice((currentTxPage - 1) * itemsPerPage, currentTxPage * itemsPerPage);
  const refundPages = Math.ceil(filteredRefunds.length / itemsPerPage);
  const pagedRefunds = filteredRefunds.slice((currentRefundPage - 1) * itemsPerPage, currentRefundPage * itemsPerPage);

  const totalRevenue = mockTransactions.filter((t) => t.status === "success").reduce((s, t) => s + t.net, 0);
  const totalTx = mockTransactions.length;
  const successCount = mockTransactions.filter((t) => t.status === "success").length;
  const successRate = Math.round((successCount / totalTx) * 100);
  const pendingRefunds = refunds.filter((r) => r.status === "pending").length;

  const handleRefundAction = (id: string, action: "approved" | "rejected" | "processed") => {
    setRefunds((prev) => prev.map((r) => r.id === id ? { ...r, status: action, processDate: new Date().toLocaleString("vi-VN") } : r));
    const labels: Record<string, string> = { approved: "Đã duyệt", rejected: "Đã từ chối", processed: "Đã hoàn tiền" };
    toast.success(`${labels[action]} yêu cầu hoàn tiền`);
    setSelectedRefund(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Quản lý Thanh toán</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Theo dõi giao dịch, hoàn tiền và cổng thanh toán</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-border" onClick={() => toast.success("Đang xuất báo cáo...")}>
            <Download className="w-4 h-4 mr-2" />Xuất báo cáo
          </Button>
          <Button className="bg-accent text-white hover:bg-primary-500" onClick={() => setActiveTab("gateway")}>
            <Settings className="w-4 h-4 mr-2" />Cài đặt cổng
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-primary-50 border border-border">
          <TabsTrigger value="dashboard">Tổng quan</TabsTrigger>
          <TabsTrigger value="transactions">Giao dịch</TabsTrigger>
          <TabsTrigger value="refunds" className="relative">
            Hoàn tiền
            {pendingRefunds > 0 && (
              <span className="ml-1.5 bg-accent text-white text-xs rounded-full w-4 h-4 inline-flex items-center justify-center">{pendingRefunds}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics">Phân tích</TabsTrigger>
          <TabsTrigger value="gateway">Cổng thanh toán</TabsTrigger>
        </TabsList>

        {/* DASHBOARD */}
        <TabsContent value="dashboard" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Doanh thu ròng", value: formatCurrency(totalRevenue), sub: "+12.4% so với tháng trước", icon: DollarSign, iconBg: "bg-primary-50", iconColor: "text-accent", subColor: "text-green-600" },
              { label: "Tổng giao dịch", value: totalTx.toLocaleString(), sub: "+8.7% so với tháng trước", icon: CreditCard, iconBg: "bg-primary-50", iconColor: "text-accent", subColor: "text-green-600" },
              { label: "Tỷ lệ thành công", value: `${successRate}%`, sub: `${successCount}/${totalTx} giao dịch`, icon: TrendingUp, iconBg: "bg-green-50", iconColor: "text-green-600", subColor: "text-green-600" },
              { label: "Chờ hoàn tiền", value: String(pendingRefunds), sub: "Cần xử lý ngay", icon: RotateCcw, iconBg: "bg-yellow-50", iconColor: "text-yellow-600", subColor: "text-yellow-600" },
            ].map((kpi) => (
              <Card key={kpi.label} className="border-border">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{kpi.label}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
                      <div className={`flex items-center gap-1 mt-2 text-xs ${kpi.subColor}`}>
                        <ArrowUpRight className="w-3 h-3" /><span>{kpi.sub}</span>
                      </div>
                    </div>
                    <div className={`w-10 h-10 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                      <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-border lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Doanh thu theo phương thức thanh toán (6 tháng)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={revenueByMethodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F8BBD0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                    <Area type="monotone" dataKey="VNPay" stackId="1" stroke="#EC407A" fill="#FCE4EC" />
                    <Area type="monotone" dataKey="MoMo" stackId="1" stroke="#AB47BC" fill="#F3E5F5" />
                    <Area type="monotone" dataKey="Bank Transfer" stackId="1" stroke="#42A5F5" fill="#E3F2FD" />
                    <Area type="monotone" dataKey="COD" stackId="1" stroke="#66BB6A" fill="#E8F5E9" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Phân bổ phương thức</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie data={methodDistributionData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value">
                      {methodDistributionData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {methodDistributionData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">Giao dịch gần đây</CardTitle>
              <Button variant="ghost" size="sm" className="text-accent" onClick={() => setActiveTab("transactions")}>Xem tất cả</Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary-50">
                    <TableHead>ID Giao dịch</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Phương thức</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thời gian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTransactions.slice(0, 5).map((tx) => (
                    <TableRow key={tx.id} className="cursor-pointer hover:bg-primary-50/50" onClick={() => setSelectedTx(tx)}>
                      <TableCell className="font-mono text-xs text-accent">{tx.id}</TableCell>
                      <TableCell className="font-medium text-sm">{tx.customer}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(tx.amount)}</TableCell>
                      <TableCell><MethodBadge method={tx.method} /></TableCell>
                      <TableCell><TransactionStatusBadge status={tx.status} /></TableCell>
                      <TableCell className="text-muted-foreground text-sm">{tx.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TRANSACTIONS */}
        <TabsContent value="transactions" className="space-y-4 mt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Tìm theo ID, đơn hàng, khách hàng..." value={txSearch}
                onChange={(e) => { setTxSearch(e.target.value); setCurrentTxPage(1); }}
                className="pl-9 bg-white border-border" />
            </div>
            <Select value={txStatusFilter} onValueChange={(v) => { setTxStatusFilter(v); setCurrentTxPage(1); }}>
              <SelectTrigger className="w-44 border-border bg-white"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="success">Thành công</SelectItem>
                <SelectItem value="pending">Đang xử lý</SelectItem>
                <SelectItem value="failed">Thất bại</SelectItem>
                <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
              </SelectContent>
            </Select>
            <Select value={txMethodFilter} onValueChange={(v) => { setTxMethodFilter(v); setCurrentTxPage(1); }}>
              <SelectTrigger className="w-44 border-border bg-white"><SelectValue placeholder="Phương thức" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phương thức</SelectItem>
                <SelectItem value="VNPay">VNPay</SelectItem>
                <SelectItem value="MoMo">MoMo</SelectItem>
                <SelectItem value="Bank Transfer">Chuyển khoản</SelectItem>
                <SelectItem value="COD">COD</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-border" onClick={() => toast.success("Đang xuất Excel...")}>
              <Download className="w-4 h-4 mr-2" />Xuất Excel
            </Button>
          </div>

          <Card className="border-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary-50">
                    <TableHead>ID Giao dịch</TableHead>
                    <TableHead>Đơn hàng</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead className="text-right">Số tiền</TableHead>
                    <TableHead className="text-right">Phí</TableHead>
                    <TableHead>Phương thức</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead className="text-center">Chi tiết</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedTx.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                        <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        Không tìm thấy giao dịch nào
                      </TableCell>
                    </TableRow>
                  ) : pagedTx.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-primary-50/40">
                      <TableCell className="font-mono text-xs text-accent">{tx.id}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{tx.orderId}</TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{tx.customer}</div>
                        <div className="text-xs text-muted-foreground">{tx.email}</div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(tx.amount)}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">{formatCurrency(tx.fee)}</TableCell>
                      <TableCell><MethodBadge method={tx.method} /></TableCell>
                      <TableCell><TransactionStatusBadge status={tx.status} /></TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{tx.date}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedTx(tx)}><Eye className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {txPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{filteredTx.length} giao dịch · Trang {currentTxPage}/{txPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={currentTxPage === 1} onClick={() => setCurrentTxPage((p) => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                <Button variant="outline" size="sm" disabled={currentTxPage === txPages} onClick={() => setCurrentTxPage((p) => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* REFUNDS */}
        <TabsContent value="refunds" className="space-y-4 mt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Tìm theo ID hoàn tiền, đơn hàng, khách hàng..." value={refundSearch}
                onChange={(e) => { setRefundSearch(e.target.value); setCurrentRefundPage(1); }}
                className="pl-9 bg-white border-border" />
            </div>
            <Select value={refundStatusFilter} onValueChange={(v) => { setRefundStatusFilter(v); setCurrentRefundPage(1); }}>
              <SelectTrigger className="w-44 border-border bg-white"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="rejected">Từ chối</SelectItem>
                <SelectItem value="processed">Đã hoàn tiền</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-border" onClick={() => toast.success("Đang xuất...")}>
              <Download className="w-4 h-4 mr-2" />Xuất Excel
            </Button>
          </div>

          <Card className="border-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary-50">
                    <TableHead>ID Hoàn tiền</TableHead>
                    <TableHead>Đơn hàng</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead className="text-right">Số tiền</TableHead>
                    <TableHead>Lý do</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày yêu cầu</TableHead>
                    <TableHead className="text-center">Chi tiết</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedRefunds.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        <RotateCcw className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        Không có yêu cầu hoàn tiền nào
                      </TableCell>
                    </TableRow>
                  ) : pagedRefunds.map((r) => (
                    <TableRow key={r.id} className="hover:bg-primary-50/40">
                      <TableCell className="font-mono text-xs text-accent">{r.id}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.orderId}</TableCell>
                      <TableCell className="font-medium text-sm">{r.customer}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(r.amount)}</TableCell>
                      <TableCell className="text-sm max-w-[180px] truncate text-muted-foreground">{r.reason}</TableCell>
                      <TableCell><RefundStatusBadge status={r.status} /></TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{r.requestDate}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedRefund(r)}><Eye className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {refundPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{filteredRefunds.length} yêu cầu · Trang {currentRefundPage}/{refundPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={currentRefundPage === 1} onClick={() => setCurrentRefundPage((p) => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                <Button variant="outline" size="sm" disabled={currentRefundPage === refundPages} onClick={() => setCurrentRefundPage((p) => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ANALYTICS */}
        <TabsContent value="analytics" className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex gap-2 flex-wrap">
              {["7 ngày", "30 ngày", "3 tháng", "6 tháng"].map((p) => (
                <Button key={p} variant="outline" size="sm" className="border-border text-sm">{p}</Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => toast.success("Đang xuất PDF...")}><FileText className="w-4 h-4 mr-1" />PDF</Button>
              <Button variant="outline" size="sm" onClick={() => toast.success("Đang xuất Excel...")}><Download className="w-4 h-4 mr-1" />Excel</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Tỷ lệ thành công theo cổng thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={successRateData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F8BBD0" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis domain={[85, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Legend />
                    <Line type="monotone" dataKey="VNPay" stroke="#EC407A" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="MoMo" stroke="#AB47BC" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Bank Transfer" stroke="#42A5F5" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Phân tích giao dịch thất bại</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={failedReasonsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#F8BBD0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="reason" type="category" tick={{ fontSize: 11 }} width={135} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#EC407A" radius={[0, 4, 4, 0]} name="Số lượng" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Doanh thu 6 tháng theo phương thức</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={revenueByMethodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F8BBD0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                    <Bar dataKey="VNPay" fill="#EC407A" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="MoMo" fill="#AB47BC" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="Bank Transfer" fill="#42A5F5" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="COD" fill="#66BB6A" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Hiệu suất cổng thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                {[
                  { name: "VNPay", rate: 95.2, avgTime: 342, color: "#EC407A" },
                  { name: "MoMo", rate: 97.8, avgTime: 218, color: "#AB47BC" },
                  { name: "Bank Transfer", rate: 99.4, avgTime: 95, color: "#42A5F5" },
                  { name: "COD", rate: 100, avgTime: 0, color: "#66BB6A" },
                ].map((gw) => (
                  <div key={gw.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{gw.name}</span>
                      <span className="text-muted-foreground">{gw.rate}% · {gw.avgTime > 0 ? `${gw.avgTime}ms avg` : "N/A"}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${gw.rate}%`, background: gw.color }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* GATEWAY CONFIG */}
        <TabsContent value="gateway" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* VNPay */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center"><Zap className="w-4 h-4 text-blue-600" /></div>
                    <CardTitle className="text-base">VNPay</CardTitle>
                  </div>
                  <Switch checked={vnpayEnabled} onCheckedChange={setVnpayEnabled} />
                </div>
                <Badge className={vnpayEnabled ? "bg-green-100 text-green-700 w-fit" : "bg-gray-100 text-gray-500 w-fit"}>
                  {vnpayEnabled ? "Đang hoạt động" : "Tắt"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Merchant ID", key: "merchantId", type: "text" },
                  { label: "Secret Key", key: "secretKey", type: "password" },
                  { label: "API URL", key: "apiUrl", type: "text" },
                  { label: "Return URL", key: "returnUrl", type: "text" },
                ].map((f) => (
                  <div key={f.key} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{f.label}</Label>
                    <Input type={f.type} value={vnpayForm[f.key as keyof typeof vnpayForm] as string}
                      onChange={(e) => setVnpayForm((p) => ({ ...p, [f.key]: e.target.value }))}
                      className="bg-white border-border text-sm h-8" />
                  </div>
                ))}
                <div className="flex items-center justify-between pt-1">
                  <Label className="text-xs text-muted-foreground">Chế độ Sandbox</Label>
                  <Switch checked={vnpayForm.sandbox} onCheckedChange={(v) => setVnpayForm((p) => ({ ...p, sandbox: v }))} />
                </div>
                <Button className="w-full bg-accent text-white hover:bg-primary-500 mt-2" onClick={() => toast.success("Đã lưu cấu hình VNPay!")}>Lưu cấu hình</Button>
              </CardContent>
            </Card>

            {/* MoMo */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center"><Wallet className="w-4 h-4 text-pink-600" /></div>
                    <CardTitle className="text-base">MoMo</CardTitle>
                  </div>
                  <Switch checked={momoEnabled} onCheckedChange={setMomoEnabled} />
                </div>
                <Badge className={momoEnabled ? "bg-green-100 text-green-700 w-fit" : "bg-gray-100 text-gray-500 w-fit"}>
                  {momoEnabled ? "Đang hoạt động" : "Tắt"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Partner Code", key: "partnerCode", type: "text" },
                  { label: "Access Key", key: "accessKey", type: "text" },
                  { label: "Secret Key", key: "secretKey", type: "password" },
                  { label: "API URL", key: "apiUrl", type: "text" },
                  { label: "Return URL", key: "returnUrl", type: "text" },
                ].map((f) => (
                  <div key={f.key} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{f.label}</Label>
                    <Input type={f.type} value={momoForm[f.key as keyof typeof momoForm]}
                      onChange={(e) => setMomoForm((p) => ({ ...p, [f.key]: e.target.value }))}
                      className="bg-white border-border text-sm h-8" />
                  </div>
                ))}
                <Button className="w-full bg-accent text-white hover:bg-primary-500 mt-2" onClick={() => toast.success("Đã lưu cấu hình MoMo!")}>Lưu cấu hình</Button>
              </CardContent>
            </Card>

            {/* Bank Transfer */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center"><Banknote className="w-4 h-4 text-purple-600" /></div>
                    <CardTitle className="text-base">Chuyển khoản</CardTitle>
                  </div>
                  <Switch checked={bankEnabled} onCheckedChange={setBankEnabled} />
                </div>
                <Badge className={bankEnabled ? "bg-green-100 text-green-700 w-fit" : "bg-gray-100 text-gray-500 w-fit"}>
                  {bankEnabled ? "Đang hoạt động" : "Tắt"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Ngân hàng</Label>
                  <Select value={bankForm.bankName} onValueChange={(v) => setBankForm((p) => ({ ...p, bankName: v }))}>
                    <SelectTrigger className="border-border bg-white text-sm h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Vietcombank", "Techcombank", "VPBank", "MBBank", "ACB", "BIDV"].map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {[
                  { label: "Số tài khoản", key: "accountNumber" },
                  { label: "Tên tài khoản", key: "accountName" },
                  { label: "Chi nhánh", key: "branch" },
                ].map((f) => (
                  <div key={f.key} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{f.label}</Label>
                    <Input value={bankForm[f.key as keyof typeof bankForm]}
                      onChange={(e) => setBankForm((p) => ({ ...p, [f.key]: e.target.value }))}
                      className="bg-white border-border text-sm h-8" />
                  </div>
                ))}
                <Button className="w-full bg-accent text-white hover:bg-primary-500 mt-2" onClick={() => toast.success("Đã lưu cấu hình Chuyển khoản!")}>Lưu cấu hình</Button>
              </CardContent>
            </Card>
          </div>

          {/* Payment Logs */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">Payment Logs</CardTitle>
              <Button variant="outline" size="sm" className="border-border" onClick={() => toast.info("Đang làm mới logs...")}>
                <RefreshCw className="w-4 h-4 mr-1" />Làm mới
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary-50">
                    <TableHead>Cổng</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Kết quả</TableHead>
                    <TableHead className="text-center">Chi tiết</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockGatewayLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-primary-50/40">
                      <TableCell className="font-medium text-sm">{log.gateway}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{log.endpoint}</TableCell>
                      <TableCell><Badge className="bg-blue-100 text-blue-700 text-xs">{log.method}</Badge></TableCell>
                      <TableCell>
                        <Badge className={log.statusCode === 200 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>{log.statusCode}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className={log.responseTime > 1000 ? "text-red-600 font-medium" : "text-muted-foreground"}>{log.responseTime.toLocaleString()}ms</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{log.timestamp}</TableCell>
                      <TableCell>
                        {log.success
                          ? <div className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle className="w-3.5 h-3.5" />Thành công</div>
                          : <div className="flex items-center gap-1 text-red-600 text-sm"><XCircle className="w-3.5 h-3.5" />Lỗi</div>}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}><Eye className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction Detail Dialog */}
      <Dialog open={!!selectedTx} onOpenChange={(open) => { if (!open) setSelectedTx(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-accent" />Chi tiết Giao dịch
            </DialogTitle>
          </DialogHeader>
          {selectedTx && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Mã giao dịch</p>
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm font-semibold text-accent">{selectedTx.id}</code>
                    <button onClick={() => { navigator.clipboard.writeText(selectedTx.id); toast.success("Đã sao chép!"); }} className="text-muted-foreground hover:text-accent transition-colors">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <TransactionStatusBadge status={selectedTx.status} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <div><p className="text-xs text-muted-foreground">Khách hàng</p><p className="font-medium">{selectedTx.customer}</p><p className="text-xs text-muted-foreground">{selectedTx.email}</p></div>
                  <div><p className="text-xs text-muted-foreground">Đơn hàng</p><p className="font-medium text-accent">{selectedTx.orderId}</p></div>
                  <div><p className="text-xs text-muted-foreground">Phương thức</p><MethodBadge method={selectedTx.method} /></div>
                </div>
                <div className="space-y-3">
                  <div><p className="text-xs text-muted-foreground">Số tiền</p><p className="text-xl font-bold">{formatCurrency(selectedTx.amount)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Phí cổng</p><p className="font-medium text-red-500">- {formatCurrency(selectedTx.fee)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Số tiền ròng</p><p className="font-semibold text-green-600">{formatCurrency(selectedTx.net)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Thời gian</p><p className="font-medium">{selectedTx.date}</p></div>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-semibold mb-3">Timeline giao dịch</p>
                <div className="space-y-3">
                  {[
                    { icon: Clock, label: "Khởi tạo giao dịch", color: "text-blue-500", bg: "bg-blue-50" },
                    { icon: Activity, label: "Gửi đến cổng thanh toán", color: "text-yellow-500", bg: "bg-yellow-50" },
                    {
                      icon: selectedTx.status === "success" ? CheckCircle : selectedTx.status === "failed" ? XCircle : Clock,
                      label: selectedTx.status === "success" ? "Thanh toán thành công" : selectedTx.status === "failed" ? "Giao dịch thất bại" : "Đang xử lý",
                      color: selectedTx.status === "success" ? "text-green-500" : selectedTx.status === "failed" ? "text-red-500" : "text-yellow-500",
                      bg: selectedTx.status === "success" ? "bg-green-50" : selectedTx.status === "failed" ? "bg-red-50" : "bg-yellow-50",
                    },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${step.bg} flex items-center justify-center flex-shrink-0`}>
                        <step.icon className={`w-4 h-4 ${step.color}`} />
                      </div>
                      <div><p className="text-sm font-medium">{step.label}</p><p className="text-xs text-muted-foreground">{selectedTx.date}</p></div>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">Gateway Response</p>
                  <code className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">{selectedTx.gatewayRef}</code>
                </div>
                <pre className="bg-gray-900 text-green-400 rounded-xl p-4 text-xs overflow-x-auto font-mono leading-relaxed">
                  {JSON.stringify(selectedTx.gatewayResponse, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Detail Dialog */}
      <Dialog open={!!selectedRefund} onOpenChange={(open) => { if (!open) setSelectedRefund(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-accent" />Chi tiết Hoàn tiền
            </DialogTitle>
          </DialogHeader>
          {selectedRefund && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl">
                <div>
                  <p className="text-xs text-muted-foreground">Mã hoàn tiền</p>
                  <code className="font-mono text-sm font-semibold text-accent">{selectedRefund.id}</code>
                </div>
                <RefundStatusBadge status={selectedRefund.status} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Khách hàng</p><p className="font-medium">{selectedRefund.customer}</p></div>
                <div><p className="text-xs text-muted-foreground">Số tiền hoàn</p><p className="text-lg font-bold">{formatCurrency(selectedRefund.amount)}</p></div>
                <div><p className="text-xs text-muted-foreground">Đơn hàng</p><p className="text-accent">{selectedRefund.orderId}</p></div>
                <div><p className="text-xs text-muted-foreground">Giao dịch gốc</p><p className="text-accent text-xs">{selectedRefund.transactionId}</p></div>
                <div><p className="text-xs text-muted-foreground">Ngày yêu cầu</p><p>{selectedRefund.requestDate}</p></div>
                {selectedRefund.processDate && <div><p className="text-xs text-muted-foreground">Ngày xử lý</p><p>{selectedRefund.processDate}</p></div>}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Lý do hoàn tiền</p>
                <p className="text-sm bg-muted rounded-lg p-3">{selectedRefund.reason}</p>
              </div>
              {selectedRefund.note && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ghi chú xử lý</p>
                  <p className="text-sm bg-muted rounded-lg p-3">{selectedRefund.note}</p>
                </div>
              )}
              {selectedRefund.status === "pending" && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-xs text-muted-foreground">Ghi chú phê duyệt</Label>
                    <Textarea placeholder="Nhập ghi chú (không bắt buộc)..." className="mt-1 border-border bg-white text-sm" rows={2} />
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-green-600 text-white hover:bg-green-700" onClick={() => handleRefundAction(selectedRefund.id, "approved")}>
                      <CheckCircle className="w-4 h-4 mr-1" />Duyệt
                    </Button>
                    <Button variant="outline" className="flex-1 border-red-300 text-red-600 hover:bg-red-50" onClick={() => handleRefundAction(selectedRefund.id, "rejected")}>
                      <XCircle className="w-4 h-4 mr-1" />Từ chối
                    </Button>
                  </div>
                </>
              )}
              {selectedRefund.status === "approved" && (
                <>
                  <Separator />
                  <Button className="w-full bg-accent text-white hover:bg-primary-500" onClick={() => handleRefundAction(selectedRefund.id, "processed")}>
                    <RotateCcw className="w-4 h-4 mr-2" />Xác nhận đã hoàn tiền
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Gateway Log Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => { if (!open) setSelectedLog(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" />Chi tiết Gateway Log
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Cổng</p><p className="font-medium">{selectedLog.gateway}</p></div>
                <div><p className="text-xs text-muted-foreground">Status Code</p>
                  <Badge className={selectedLog.statusCode === 200 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>{selectedLog.statusCode}</Badge>
                </div>
                <div><p className="text-xs text-muted-foreground">Thời gian xử lý</p>
                  <p className={selectedLog.responseTime > 1000 ? "text-red-600 font-semibold" : "font-medium"}>{selectedLog.responseTime.toLocaleString()}ms</p>
                </div>
                <div><p className="text-xs text-muted-foreground">Timestamp</p><p>{selectedLog.timestamp}</p></div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Endpoint</p>
                <code className="text-xs bg-muted px-3 py-2 rounded-lg block font-mono">{selectedLog.method} {selectedLog.endpoint}</code>
              </div>
              <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${selectedLog.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {selectedLog.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {selectedLog.success ? "Giao tiếp với cổng thanh toán thành công" : "Giao tiếp với cổng thanh toán thất bại — kiểm tra timeout hoặc cấu hình."}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
