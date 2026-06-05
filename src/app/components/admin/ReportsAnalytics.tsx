import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
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
  BarChart3,
  TrendingUp,
  Users,
  ShoppingBag,
  Package,
  Tag,
  Star,
  MessageCircle,
  Bot,
  Download,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingCart,
  RefreshCw,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
} from "recharts";

const formatCurrency = (v: number) => v.toLocaleString("vi-VN") + " ₫";

const COLORS = ["#EC407A", "#AB47BC", "#42A5F5", "#66BB6A", "#FFA726", "#26C6DA"];

const DATE_RANGES = ["Hôm nay", "7 ngày", "30 ngày", "3 tháng", "6 tháng", "Năm nay"];

// ─── Chart Data ───
const monthlyRevenue = [
  { month: "Thg 1", revenue: 89200000, orders: 312, profit: 22300000 },
  { month: "Thg 2", revenue: 102400000, orders: 358, profit: 25600000 },
  { month: "Thg 3", revenue: 97800000, orders: 341, profit: 24450000 },
  { month: "Thg 4", revenue: 128600000, orders: 449, profit: 32150000 },
  { month: "Thg 5", revenue: 121300000, orders: 423, profit: 30325000 },
  { month: "Thg 6", revenue: 143200000, orders: 501, profit: 35800000 },
];

const orderStatusData = [
  { name: "Đã giao", value: 1284, color: "#66BB6A" },
  { name: "Đang vận chuyển", value: 312, color: "#42A5F5" },
  { name: "Đang xử lý", value: 198, color: "#FFA726" },
  { name: "Đã hủy", value: 87, color: "#EF5350" },
];

const topProducts = [
  { name: "Bộ quần áo sơ sinh Joya", sku: "BSS-001", revenue: 18400000, sold: 92, stock: 45, rating: 4.8 },
  { name: "Xe đẩy Combi Melonade", sku: "XD-002", revenue: 31200000, sold: 24, stock: 12, rating: 4.9 },
  { name: "Bình sữa Pigeon Wide", sku: "BS-003", revenue: 12600000, sold: 158, stock: 203, rating: 4.7 },
  { name: "Ghế ngồi ăn Graco Slim", sku: "GNA-004", revenue: 22400000, sold: 56, stock: 28, rating: 4.6 },
  { name: "Tã dán Merries size NB", sku: "TD-005", revenue: 9800000, sold: 245, stock: 512, rating: 4.5 },
  { name: "Máy tiệt trùng Philips Avent", sku: "MT-006", revenue: 27600000, sold: 46, stock: 31, rating: 4.8 },
];

const customerAcquisition = [
  { month: "Thg 1", new: 145, returning: 289, total: 434 },
  { month: "Thg 2", new: 178, returning: 312, total: 490 },
  { month: "Thg 3", new: 162, returning: 298, total: 460 },
  { month: "Thg 4", new: 214, returning: 358, total: 572 },
  { month: "Thg 5", new: 196, returning: 342, total: 538 },
  { month: "Thg 6", new: 231, returning: 389, total: 620 },
];

const inventoryByCategory = [
  { category: "Quần áo", items: 245, value: 87400000, lowStock: 12 },
  { category: "Xe đẩy", items: 38, value: 112600000, lowStock: 3 },
  { category: "Bình sữa", items: 156, value: 23400000, lowStock: 8 },
  { category: "Đồ chơi", items: 312, value: 45200000, lowStock: 5 },
  { category: "Tã bỉm", items: 892, value: 34800000, lowStock: 0 },
  { category: "Chăm sóc da", items: 124, value: 18600000, lowStock: 4 },
];

const couponUsageData = [
  { month: "Thg 1", used: 142, revenue: 14200000, discount: 2840000 },
  { month: "Thg 2", used: 167, revenue: 18400000, discount: 3120000 },
  { month: "Thg 3", used: 134, revenue: 13900000, discount: 2460000 },
  { month: "Thg 4", used: 198, revenue: 23600000, discount: 4180000 },
  { month: "Thg 5", used: 178, revenue: 20800000, discount: 3640000 },
  { month: "Thg 6", used: 212, revenue: 26400000, discount: 4920000 },
];

const reviewRatingDist = [
  { rating: "5 sao", count: 1284, pct: 58 },
  { rating: "4 sao", count: 621, pct: 28 },
  { rating: "3 sao", count: 178, pct: 8 },
  { rating: "2 sao", count: 66, pct: 3 },
  { rating: "1 sao", count: 44, pct: 2 },
];

const chatData = [
  { day: "T2", sessions: 142, resolved: 128, avgTime: 3.2 },
  { day: "T3", sessions: 168, resolved: 155, avgTime: 2.9 },
  { day: "T4", sessions: 134, resolved: 121, avgTime: 3.5 },
  { day: "T5", sessions: 198, resolved: 182, avgTime: 2.8 },
  { day: "T6", sessions: 221, resolved: 205, avgTime: 3.1 },
  { day: "T7", sessions: 189, resolved: 173, avgTime: 3.4 },
  { day: "CN", sessions: 112, resolved: 102, avgTime: 2.7 },
];

const aiIntents = [
  { intent: "Tra cứu đơn hàng", count: 842, pct: 28 },
  { intent: "Hỏi về sản phẩm", count: 621, pct: 21 },
  { intent: "Chính sách đổi trả", count: 453, pct: 15 },
  { intent: "Hỗ trợ thanh toán", count: 398, pct: 13 },
  { intent: "Khuyến mãi/Coupon", count: 312, pct: 10 },
  { intent: "Khác", count: 392, pct: 13 },
];

const aiPerformance = [
  { metric: "Độ chính xác", value: 94.2 },
  { metric: "Nhận dạng intent", value: 91.8 },
  { metric: "Hài lòng người dùng", value: 88.5 },
  { metric: "Phản hồi đúng ngữ cảnh", value: 92.1 },
  { metric: "Tốc độ phản hồi", value: 98.4 },
  { metric: "Tỷ lệ chuyển nhân viên", value: 78.6 },
];

type Section = {
  id: string;
  label: string;
  icon: React.ElementType;
};

const sections: Section[] = [
  { id: "executive", label: "Tổng quan Điều hành", icon: BarChart3 },
  { id: "revenue", label: "Phân tích Doanh thu", icon: DollarSign },
  { id: "orders", label: "Phân tích Đơn hàng", icon: ShoppingCart },
  { id: "inventory", label: "Phân tích Tồn kho", icon: Package },
  { id: "products", label: "Phân tích Sản phẩm", icon: ShoppingBag },
  { id: "customers", label: "Phân tích Khách hàng", icon: Users },
  { id: "coupons", label: "Phân tích Coupon", icon: Tag },
  { id: "reviews", label: "Phân tích Đánh giá", icon: Star },
  { id: "chat", label: "Phân tích Chat", icon: MessageCircle },
  { id: "ai", label: "Phân tích AI", icon: Bot },
];

function KpiCard({ label, value, sub, subUp, icon: Icon, iconBg, iconColor }: {
  label: string; value: string; sub: string; subUp?: boolean; icon: React.ElementType; iconBg: string; iconColor: string;
}) {
  return (
    <Card className="border-border">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
            <div className={`flex items-center gap-1 mt-2 text-xs ${subUp === false ? "text-red-500" : "text-green-600"}`}>
              {subUp === false ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
              <span>{sub}</span>
            </div>
          </div>
          <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionHeader({ title, onExport }: { title: string; onExport?: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="flex gap-2">
        <Select defaultValue="30">
          <SelectTrigger className="w-36 border-border bg-white text-sm h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            {DATE_RANGES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="border-border" onClick={() => { toast.success("Đang xuất PDF..."); onExport?.(); }}>
          <FileText className="w-4 h-4 mr-1" />PDF
        </Button>
        <Button variant="outline" size="sm" className="border-border" onClick={() => { toast.success("Đang xuất Excel..."); onExport?.(); }}>
          <Download className="w-4 h-4 mr-1" />Excel
        </Button>
      </div>
    </div>
  );
}

// ─── SECTION COMPONENTS ───

function ExecutiveDashboard() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Tổng quan Điều hành" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Tổng doanh thu" value="682.5M ₫" sub="+14.2% so với tháng trước" icon={DollarSign} iconBg="bg-primary-50" iconColor="text-accent" />
        <KpiCard label="Tổng đơn hàng" value="2,384" sub="+9.8% so với tháng trước" icon={ShoppingCart} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <KpiCard label="Khách hàng mới" value="1,126" sub="+18.3% so với tháng trước" icon={Users} iconBg="bg-purple-50" iconColor="text-purple-600" />
        <KpiCard label="Giá trị đơn TB" value="286.300 ₫" sub="+4.1% so với tháng trước" icon={TrendingUp} iconBg="bg-green-50" iconColor="text-green-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Doanh thu & Đơn hàng 6 tháng</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F8BBD0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="rev" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} tick={{ fontSize: 11 }} />
                <YAxis yAxisId="ord" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number, name: string) => name === "revenue" ? formatCurrency(v) : v} />
                <Legend />
                <Area yAxisId="rev" type="monotone" dataKey="revenue" stroke="#EC407A" fill="#FCE4EC" name="Doanh thu" />
                <Line yAxisId="ord" type="monotone" dataKey="orders" stroke="#42A5F5" strokeWidth={2} name="Đơn hàng" dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Phân bổ trạng thái đơn hàng</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={orderStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, pct }) => `${name} ${pct || ""}`}>
                  {orderStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {orderStatusData.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-sm">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-muted-foreground truncate">{s.name}</span>
                  <span className="font-medium ml-auto">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="border-border">
        <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Bảng tóm tắt hiệu suất kinh doanh</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary-50">
                <TableHead>Tháng</TableHead>
                <TableHead className="text-right">Doanh thu</TableHead>
                <TableHead className="text-right">Lợi nhuận</TableHead>
                <TableHead className="text-right">Đơn hàng</TableHead>
                <TableHead className="text-right">Biên LN</TableHead>
                <TableHead className="text-right">Tăng trưởng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyRevenue.map((row, i) => {
                const prev = monthlyRevenue[i - 1];
                const growth = prev ? (((row.revenue - prev.revenue) / prev.revenue) * 100).toFixed(1) : null;
                const isUp = growth ? parseFloat(growth) >= 0 : true;
                return (
                  <TableRow key={row.month} className="hover:bg-primary-50/40">
                    <TableCell className="font-medium">{row.month}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.revenue)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(row.profit)}</TableCell>
                    <TableCell className="text-right">{row.orders.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{((row.profit / row.revenue) * 100).toFixed(1)}%</TableCell>
                    <TableCell className="text-right">
                      {growth ? (
                        <span className={`flex items-center justify-end gap-1 text-sm ${isUp ? "text-green-600" : "text-red-500"}`}>
                          {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {Math.abs(parseFloat(growth))}%
                        </span>
                      ) : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function RevenueAnalytics() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Phân tích Doanh thu" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Doanh thu tháng này" value="143.2M ₫" sub="+18.0% so tháng trước" icon={DollarSign} iconBg="bg-primary-50" iconColor="text-accent" />
        <KpiCard label="Doanh thu hôm nay" value="4.8M ₫" sub="+7.3% so hôm qua" icon={TrendingUp} iconBg="bg-green-50" iconColor="text-green-600" />
        <KpiCard label="Lợi nhuận gộp" value="35.8M ₫" sub="Biên LN 25%" icon={Activity} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <KpiCard label="Doanh thu trung bình/ngày" value="4.77M ₫" sub="+12.6% so tháng trước" icon={BarChart3} iconBg="bg-purple-50" iconColor="text-purple-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-border lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Xu hướng doanh thu & lợi nhuận</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F8BBD0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#EC407A" fill="#FCE4EC" name="Doanh thu" />
                <Area type="monotone" dataKey="profit" stroke="#66BB6A" fill="#E8F5E9" name="Lợi nhuận" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Doanh thu theo phương thức TT</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={[
                  { name: "VNPay", value: 48, color: "#EC407A" },
                  { name: "MoMo", value: 30, color: "#AB47BC" },
                  { name: "Chuyển khoản", value: 15, color: "#42A5F5" },
                  { name: "COD", value: 7, color: "#66BB6A" },
                ]} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value">
                  {[0,1,2,3].map((i) => <Cell key={i} fill={["#EC407A","#AB47BC","#42A5F5","#66BB6A"][i]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OrderAnalytics() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Phân tích Đơn hàng" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Tổng đơn hàng" value="501" sub="+18.5% so tháng trước" icon={ShoppingCart} iconBg="bg-primary-50" iconColor="text-accent" />
        <KpiCard label="Đơn hoàn thành" value="1,284" sub="Tỷ lệ 84.2%" icon={CheckCircle} iconBg="bg-green-50" iconColor="text-green-600" />
        <KpiCard label="Đơn hủy" value="87" sub="-2.1% so tháng trước" subUp={false} icon={AlertTriangle} iconBg="bg-red-50" iconColor="text-red-500" />
        <KpiCard label="Thời gian xử lý TB" value="1.4 ngày" sub="-8.2% cải thiện" icon={Clock} iconBg="bg-blue-50" iconColor="text-blue-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Đơn hàng theo tháng</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F8BBD0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="orders" fill="#EC407A" radius={[4, 4, 0, 0]} name="Đơn hàng" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Phân bổ trạng thái</CardTitle></CardHeader>
          <CardContent className="space-y-3 pt-2">
            {orderStatusData.map((s) => (
              <div key={s.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                    <span>{s.name}</span>
                  </div>
                  <span className="font-medium">{s.value} đơn</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(s.value / 1881) * 100}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InventoryAnalytics() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Phân tích Tồn kho" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Tổng SKU" value="1,767" sub="Đang quản lý" icon={Package} iconBg="bg-primary-50" iconColor="text-accent" />
        <KpiCard label="Giá trị tồn kho" value="322M ₫" sub="+5.4% so tháng trước" icon={DollarSign} iconBg="bg-green-50" iconColor="text-green-600" />
        <KpiCard label="Hàng sắp hết" value="32 SKU" sub="Cần nhập hàng" icon={AlertTriangle} iconBg="bg-yellow-50" iconColor="text-yellow-600" />
        <KpiCard label="Vòng quay hàng" value="4.2x" sub="Trong 30 ngày" icon={RefreshCw} iconBg="bg-blue-50" iconColor="text-blue-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Tồn kho theo danh mục</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={inventoryByCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F8BBD0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip formatter={(v: number, name: string) => name === "value" ? formatCurrency(v) : v} />
                <Bar dataKey="items" fill="#EC407A" radius={[0, 4, 4, 0]} name="Số lượng" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Giá trị tồn kho theo danh mục</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary-50">
                  <TableHead>Danh mục</TableHead>
                  <TableHead className="text-right">Số lượng</TableHead>
                  <TableHead className="text-right">Giá trị</TableHead>
                  <TableHead className="text-right">Sắp hết</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryByCategory.map((row) => (
                  <TableRow key={row.category} className="hover:bg-primary-50/40">
                    <TableCell className="font-medium text-sm">{row.category}</TableCell>
                    <TableCell className="text-right text-sm">{row.items}</TableCell>
                    <TableCell className="text-right text-sm">{formatCurrency(row.value)}</TableCell>
                    <TableCell className="text-right">
                      {row.lowStock > 0 ? (
                        <Badge className="bg-yellow-100 text-yellow-700">{row.lowStock} SKU</Badge>
                      ) : <Badge className="bg-green-100 text-green-700">Ổn</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProductAnalytics() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Phân tích Sản phẩm" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Tổng sản phẩm" value="248" sub="Đang kinh doanh" icon={ShoppingBag} iconBg="bg-primary-50" iconColor="text-accent" />
        <KpiCard label="Sản phẩm bán chạy" value="36" sub="Trên 100 đơn/tháng" icon={TrendingUp} iconBg="bg-green-50" iconColor="text-green-600" />
        <KpiCard label="Tỷ lệ chuyển đổi" value="3.8%" sub="+0.4% so tháng trước" icon={Activity} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <KpiCard label="Đánh giá TB" value="4.6 ★" sub="2,193 đánh giá" icon={Star} iconBg="bg-yellow-50" iconColor="text-yellow-600" />
      </div>
      <Card className="border-border">
        <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Top 6 Sản phẩm bán chạy</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary-50">
                <TableHead>STT</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Doanh thu</TableHead>
                <TableHead className="text-right">Đã bán</TableHead>
                <TableHead className="text-right">Tồn kho</TableHead>
                <TableHead className="text-right">Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((p, i) => (
                <TableRow key={p.sku} className="hover:bg-primary-50/40">
                  <TableCell>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? "bg-accent text-white" : "bg-muted text-muted-foreground"}`}>{i + 1}</span>
                  </TableCell>
                  <TableCell className="font-medium text-sm">{p.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{p.sku}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(p.revenue)}</TableCell>
                  <TableCell className="text-right">{p.sold}</TableCell>
                  <TableCell className="text-right">
                    <span className={p.stock < 20 ? "text-red-600 font-semibold" : "text-muted-foreground"}>{p.stock}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="flex items-center justify-end gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />{p.rating}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function CustomerAnalytics() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Phân tích Khách hàng" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Tổng khách hàng" value="8,421" sub="+18.3% so tháng trước" icon={Users} iconBg="bg-primary-50" iconColor="text-accent" />
        <KpiCard label="Khách hàng mới" value="231" sub="Trong tháng này" icon={ArrowUpRight} iconBg="bg-green-50" iconColor="text-green-600" />
        <KpiCard label="Tỷ lệ giữ chân" value="62.8%" sub="+3.1% so tháng trước" icon={TrendingUp} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <KpiCard label="Giá trị LTV TB" value="1.84M ₫" sub="+8.7% so tháng trước" icon={DollarSign} iconBg="bg-purple-50" iconColor="text-purple-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Khách hàng mới vs Quay lại</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={customerAcquisition}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F8BBD0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="new" fill="#EC407A" radius={[2, 2, 0, 0]} name="Khách mới" />
                <Bar dataKey="returning" fill="#AB47BC" radius={[2, 2, 0, 0]} name="Quay lại" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Phân bổ khách hàng theo khu vực</CardTitle></CardHeader>
          <CardContent className="space-y-3 pt-4">
            {[
              { region: "Hà Nội", count: 2840, pct: 34 },
              { region: "TP. Hồ Chí Minh", count: 2521, pct: 30 },
              { region: "Đà Nẵng", count: 924, pct: 11 },
              { region: "Hải Phòng", count: 672, pct: 8 },
              { region: "Tỉnh thành khác", count: 1464, pct: 17 },
            ].map((r) => (
              <div key={r.region} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{r.region}</span>
                  <span className="text-muted-foreground">{r.count.toLocaleString()} · {r.pct}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CouponAnalytics() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Phân tích Coupon" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Tổng coupon đã dùng" value="212" sub="+19.1% so tháng trước" icon={Tag} iconBg="bg-primary-50" iconColor="text-accent" />
        <KpiCard label="Giá trị giảm giá" value="4.92M ₫" sub="Trong tháng này" icon={DollarSign} iconBg="bg-yellow-50" iconColor="text-yellow-600" />
        <KpiCard label="Tỷ lệ chuyển đổi" value="8.4%" sub="+1.2% so tháng trước" icon={TrendingUp} iconBg="bg-green-50" iconColor="text-green-600" />
        <KpiCard label="Doanh thu từ coupon" value="26.4M ₫" sub="+27.3% so tháng trước" icon={ShoppingCart} iconBg="bg-blue-50" iconColor="text-blue-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Sử dụng coupon 6 tháng</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={couponUsageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F8BBD0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="used" stroke="#EC407A" strokeWidth={2} name="Số lần dùng" dot={{ r: 3 }} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#66BB6A" strokeWidth={2} name="Doanh thu" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Top coupon hiệu quả nhất</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary-50">
                  <TableHead>Mã coupon</TableHead>
                  <TableHead className="text-right">Số lần dùng</TableHead>
                  <TableHead className="text-right">Doanh thu</TableHead>
                  <TableHead>Loại</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { code: "BABY20", used: 89, revenue: 11200000, type: "20%" },
                  { code: "NEWMOM50K", used: 67, revenue: 8900000, type: "50K ₫" },
                  { code: "SUMMER15", used: 54, revenue: 7300000, type: "15%" },
                  { code: "FLASH30", used: 42, revenue: 6100000, type: "30%" },
                  { code: "FREESHIP", used: 38, revenue: 4200000, type: "Giao hàng" },
                ].map((c) => (
                  <TableRow key={c.code} className="hover:bg-primary-50/40">
                    <TableCell><code className="font-mono text-sm text-accent">{c.code}</code></TableCell>
                    <TableCell className="text-right">{c.used}</TableCell>
                    <TableCell className="text-right">{formatCurrency(c.revenue)}</TableCell>
                    <TableCell><Badge className="bg-primary-100 text-accent">{c.type}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ReviewAnalytics() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Phân tích Đánh giá" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Tổng đánh giá" value="2,193" sub="+12.4% so tháng trước" icon={Star} iconBg="bg-yellow-50" iconColor="text-yellow-600" />
        <KpiCard label="Điểm đánh giá TB" value="4.6 ★" sub="Trên 5 sao" icon={TrendingUp} iconBg="bg-primary-50" iconColor="text-accent" />
        <KpiCard label="Tỷ lệ 5 sao" value="58%" sub="+3.2% so tháng trước" icon={CheckCircle} iconBg="bg-green-50" iconColor="text-green-600" />
        <KpiCard label="Chờ duyệt" value="24" sub="Cần kiểm duyệt" icon={Clock} iconBg="bg-blue-50" iconColor="text-blue-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Phân bổ số sao</CardTitle></CardHeader>
          <CardContent className="space-y-3 pt-4">
            {reviewRatingDist.map((r) => (
              <div key={r.rating} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{r.rating}</span>
                  </div>
                  <span className="text-muted-foreground">{r.count.toLocaleString()} ({r.pct}%)</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-yellow-400" style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Đánh giá theo tháng</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={[
                { month: "Thg 1", reviews: 312, avg: 4.5 },
                { month: "Thg 2", reviews: 378, avg: 4.6 },
                { month: "Thg 3", reviews: 341, avg: 4.4 },
                { month: "Thg 4", reviews: 421, avg: 4.7 },
                { month: "Thg 5", reviews: 398, avg: 4.6 },
                { month: "Thg 6", reviews: 343, avg: 4.6 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F8BBD0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="reviews" fill="#FFA726" radius={[4, 4, 0, 0]} name="Số đánh giá" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ChatAnalytics() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Phân tích Chat" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Phiên chat tuần này" value="1,164" sub="+22.4% so tuần trước" icon={MessageCircle} iconBg="bg-primary-50" iconColor="text-accent" />
        <KpiCard label="Tỷ lệ giải quyết" value="91.3%" sub="+2.1% cải thiện" icon={CheckCircle} iconBg="bg-green-50" iconColor="text-green-600" />
        <KpiCard label="Thời gian xử lý TB" value="3.1 phút" sub="-0.4 phút cải thiện" icon={Clock} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <KpiCard label="Hài lòng khách hàng" value="4.3/5" sub="+0.2 so tuần trước" icon={Star} iconBg="bg-yellow-50" iconColor="text-yellow-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Phiên chat & Tỷ lệ giải quyết trong tuần</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chatData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F8BBD0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="sessions" fill="#EC407A" radius={[2, 2, 0, 0]} name="Tổng phiên" />
                <Bar dataKey="resolved" fill="#66BB6A" radius={[2, 2, 0, 0]} name="Đã giải quyết" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Thời gian phản hồi TB (phút)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chatData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F8BBD0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis domain={[2, 4]} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}p`} />
                <Tooltip formatter={(v: number) => `${v} phút`} />
                <Line type="monotone" dataKey="avgTime" stroke="#AB47BC" strokeWidth={2} dot={{ r: 4, fill: "#AB47BC" }} name="Thời gian TB" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AIAnalytics() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Phân tích AI ChatBot" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Phiên AI tuần này" value="4,821" sub="+31.2% so tuần trước" icon={Bot} iconBg="bg-primary-50" iconColor="text-accent" />
        <KpiCard label="Độ chính xác AI" value="94.2%" sub="+1.8% cải thiện" icon={CheckCircle} iconBg="bg-green-50" iconColor="text-green-600" />
        <KpiCard label="Tự động giải quyết" value="78.6%" sub="Không cần nhân viên" icon={Activity} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <KpiCard label="Intent nhận dạng được" value="12 loại" sub="6 loại mới tháng này" icon={TrendingUp} iconBg="bg-purple-50" iconColor="text-purple-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Phân bổ Intent người dùng</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={aiIntents} cx="50%" cy="50%" outerRadius={90} dataKey="count" nameKey="intent">
                  {aiIntents.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number, name: string) => [v, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Hiệu suất AI theo tiêu chí</CardTitle></CardHeader>
          <CardContent className="space-y-3 pt-2">
            {aiPerformance.map((p) => (
              <div key={p.metric} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{p.metric}</span>
                  <span className="font-semibold">{p.value}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${p.value}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card className="border-border">
        <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Top Intent theo lượng yêu cầu</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary-50">
                <TableHead>STT</TableHead>
                <TableHead>Intent</TableHead>
                <TableHead className="text-right">Số lượng</TableHead>
                <TableHead className="text-right">Tỷ lệ</TableHead>
                <TableHead>Mức độ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aiIntents.map((intent, i) => (
                <TableRow key={intent.intent} className="hover:bg-primary-50/40">
                  <TableCell className="font-medium">{i + 1}</TableCell>
                  <TableCell className="font-medium text-sm">{intent.intent}</TableCell>
                  <TableCell className="text-right">{intent.count.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{intent.pct}%</TableCell>
                  <TableCell>
                    <Badge className={i < 2 ? "bg-red-100 text-red-700" : i < 4 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}>
                      {i < 2 ? "Cao" : i < 4 ? "Trung bình" : "Thấp"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReportsAnalytics() {
  const [activeSection, setActiveSection] = useState("executive");

  const renderSection = () => {
    switch (activeSection) {
      case "executive": return <ExecutiveDashboard />;
      case "revenue": return <RevenueAnalytics />;
      case "orders": return <OrderAnalytics />;
      case "inventory": return <InventoryAnalytics />;
      case "products": return <ProductAnalytics />;
      case "customers": return <CustomerAnalytics />;
      case "coupons": return <CouponAnalytics />;
      case "reviews": return <ReviewAnalytics />;
      case "chat": return <ChatAnalytics />;
      case "ai": return <AIAnalytics />;
      default: return <ExecutiveDashboard />;
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Báo cáo & Phân tích</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Trung tâm phân tích toàn diện Baby Store</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-border" onClick={() => toast.success("Đang lên lịch báo cáo...")}>
            <Clock className="w-4 h-4 mr-2" />Lên lịch
          </Button>
          <Button className="bg-accent text-white hover:bg-primary-500" onClick={() => toast.success("Đang xuất toàn bộ báo cáo...")}>
            <Download className="w-4 h-4 mr-2" />Xuất tất cả
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left Navigation */}
        <div className="w-56 flex-shrink-0">
          <Card className="border-border">
            <CardContent className="p-2">
              <nav className="space-y-0.5">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all ${
                      activeSection === section.id
                        ? "bg-primary text-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-primary-50 hover:text-foreground"
                    }`}
                  >
                    <section.icon className={`w-4 h-4 flex-shrink-0 ${activeSection === section.id ? "text-accent" : ""}`} />
                    <span className="leading-tight">{section.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
