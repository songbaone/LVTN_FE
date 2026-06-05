import { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import {
  Settings,
  Store,
  Image,
  LayoutGrid,
  Mail,
  Bell,
  CreditCard,
  MessageCircle,
  Bot,
  Shield,
  FileText,
  Users,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  Search,
  Upload,
  CheckCircle,
  Eye,
  EyeOff,
  ChevronRight,
  AlertTriangle,
  Info,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

type SettingSection = {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
};

const settingSections: SettingSection[] = [
  { id: "general", label: "Cài đặt Chung", icon: Settings, description: "Cài đặt cơ bản hệ thống" },
  { id: "store", label: "Thông tin Cửa hàng", icon: Store, description: "Địa chỉ, giờ hoạt động" },
  { id: "branding", label: "Logo & Thương hiệu", icon: Image, description: "Màu sắc, logo, favicon" },
  { id: "banners", label: "Quản lý Banner", icon: LayoutGrid, description: "Banner quảng cáo" },
  { id: "email", label: "Cài đặt Email", icon: Mail, description: "SMTP, mẫu email" },
  { id: "notifications", label: "Thông báo", icon: Bell, description: "Push, email, SMS" },
  { id: "payment", label: "Thanh toán", icon: CreditCard, description: "Phương thức thanh toán" },
  { id: "chat", label: "Live Chat", icon: MessageCircle, description: "Cấu hình chat trực tiếp" },
  { id: "ai", label: "AI ChatBot", icon: Bot, description: "Cấu hình AI hỗ trợ" },
  { id: "security", label: "Bảo mật", icon: Shield, description: "Mật khẩu, 2FA, phiên" },
  { id: "audit", label: "Nhật ký Kiểm toán", icon: FileText, description: "Lịch sử hoạt động" },
  { id: "roles", label: "Vai trò & Quyền", icon: Users, description: "Quản lý phân quyền" },
];

function SaveBar({ onSave, onReset }: { onSave: () => void; onReset: () => void }) {
  return (
    <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
      <Button variant="outline" className="border-border" onClick={onReset}>
        <RotateCcw className="w-4 h-4 mr-2" />Đặt lại mặc định
      </Button>
      <Button className="bg-accent text-white hover:bg-primary-500" onClick={onSave}>
        <Save className="w-4 h-4 mr-2" />Lưu thay đổi
      </Button>
    </div>
  );
}

function FormField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ─── SECTION: General Settings ───
function GeneralSettings() {
  const [form, setForm] = useState({
    siteName: "Baby Store Việt Nam",
    siteUrl: "https://babystore.vn",
    adminEmail: "admin@babystore.vn",
    language: "vi",
    timezone: "Asia/Ho_Chi_Minh",
    currency: "VND",
    currencySymbol: "₫",
    dateFormat: "DD/MM/YYYY",
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerify: true,
  });
  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold mb-1">Cài đặt Chung</h2>
        <p className="text-sm text-muted-foreground">Cấu hình thông tin cơ bản của hệ thống</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="Tên website" hint="Tên hiển thị ở tab trình duyệt và email">
          <Input value={form.siteName} onChange={(e) => set("siteName", e.target.value)} className="bg-white border-border" />
        </FormField>
        <FormField label="URL website">
          <Input value={form.siteUrl} onChange={(e) => set("siteUrl", e.target.value)} className="bg-white border-border" />
        </FormField>
        <FormField label="Email quản trị" hint="Nhận cảnh báo hệ thống">
          <Input type="email" value={form.adminEmail} onChange={(e) => set("adminEmail", e.target.value)} className="bg-white border-border" />
        </FormField>
        <FormField label="Ngôn ngữ mặc định">
          <Select value={form.language} onValueChange={(v) => set("language", v)}>
            <SelectTrigger className="bg-white border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="vi">Tiếng Việt</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Múi giờ">
          <Select value={form.timezone} onValueChange={(v) => set("timezone", v)}>
            <SelectTrigger className="bg-white border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</SelectItem>
              <SelectItem value="Asia/Bangkok">Asia/Bangkok (GMT+7)</SelectItem>
              <SelectItem value="Asia/Singapore">Asia/Singapore (GMT+8)</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Đơn vị tiền tệ">
          <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
            <SelectTrigger className="bg-white border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="VND">VND - Đồng Việt Nam</SelectItem>
              <SelectItem value="USD">USD - US Dollar</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Định dạng ngày">
          <Select value={form.dateFormat} onValueChange={(v) => set("dateFormat", v)}>
            <SelectTrigger className="bg-white border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>
      <Separator />
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Chế độ hoạt động</h3>
        {[
          { key: "maintenanceMode", label: "Chế độ bảo trì", desc: "Tạm ngừng website, chỉ admin truy cập được", danger: true },
          { key: "allowRegistration", label: "Cho phép đăng ký", desc: "Khách hàng mới có thể tạo tài khoản" },
          { key: "requireEmailVerify", label: "Yêu cầu xác thực email", desc: "Người dùng phải xác nhận email khi đăng ký" },
        ].map((item) => (
          <div key={item.key} className="flex items-start justify-between gap-4 p-4 rounded-xl border border-border bg-white">
            <div>
              <p className={`text-sm font-medium ${item.danger ? "text-red-600" : ""}`}>{item.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
            <Switch
              checked={form[item.key as keyof typeof form] as boolean}
              onCheckedChange={(v) => set(item.key, v)}
            />
          </div>
        ))}
      </div>
      <SaveBar onSave={() => toast.success("Đã lưu cài đặt chung!")} onReset={() => toast.info("Đã đặt lại mặc định")} />
    </div>
  );
}

// ─── SECTION: Store Settings ───
function StoreSettings() {
  const [form, setForm] = useState({
    storeName: "Baby Store Việt Nam",
    phone: "1800 6868",
    address: "123 Nguyễn Huệ, Quận 1",
    city: "TP. Hồ Chí Minh",
    zipCode: "700000",
    description: "Cửa hàng mẹ và bé uy tín, chất lượng cao với hơn 500+ sản phẩm cho bé từ 0-10 tuổi.",
    openTime: "08:00",
    closeTime: "22:00",
    returnPolicy: "Đổi trả trong 7 ngày kể từ ngày nhận hàng. Sản phẩm còn nguyên tem, chưa qua sử dụng.",
    shippingPolicy: "Miễn phí giao hàng cho đơn từ 500.000₫. Giao hàng 2-5 ngày làm việc.",
    freeShipThreshold: 500000,
  });
  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold mb-1">Thông tin Cửa hàng</h2>
        <p className="text-sm text-muted-foreground">Địa chỉ, giờ hoạt động và chính sách</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="Tên cửa hàng">
          <Input value={form.storeName} onChange={(e) => set("storeName", e.target.value)} className="bg-white border-border" />
        </FormField>
        <FormField label="Số điện thoại">
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="bg-white border-border" />
        </FormField>
        <FormField label="Địa chỉ" hint="Số nhà, tên đường">
          <Input value={form.address} onChange={(e) => set("address", e.target.value)} className="bg-white border-border" />
        </FormField>
        <FormField label="Thành phố">
          <Select value={form.city} onValueChange={(v) => set("city", v)}>
            <SelectTrigger className="bg-white border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Hải Phòng", "Cần Thơ"].map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Giờ mở cửa">
          <Input type="time" value={form.openTime} onChange={(e) => set("openTime", e.target.value)} className="bg-white border-border" />
        </FormField>
        <FormField label="Giờ đóng cửa">
          <Input type="time" value={form.closeTime} onChange={(e) => set("closeTime", e.target.value)} className="bg-white border-border" />
        </FormField>
        <FormField label="Ngưỡng miễn phí ship (₫)" hint="Đơn hàng đạt ngưỡng này sẽ được miễn phí giao hàng">
          <Input type="number" value={form.freeShipThreshold} onChange={(e) => set("freeShipThreshold", Number(e.target.value))} className="bg-white border-border" />
        </FormField>
      </div>
      <FormField label="Mô tả cửa hàng">
        <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} className="bg-white border-border" rows={3} />
      </FormField>
      <FormField label="Chính sách đổi trả">
        <Textarea value={form.returnPolicy} onChange={(e) => set("returnPolicy", e.target.value)} className="bg-white border-border" rows={3} />
      </FormField>
      <FormField label="Chính sách vận chuyển">
        <Textarea value={form.shippingPolicy} onChange={(e) => set("shippingPolicy", e.target.value)} className="bg-white border-border" rows={3} />
      </FormField>
      <SaveBar onSave={() => toast.success("Đã lưu thông tin cửa hàng!")} onReset={() => toast.info("Đã đặt lại")} />
    </div>
  );
}

// ─── SECTION: Branding ───
function BrandingSettings() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold mb-1">Logo & Thương hiệu</h2>
        <p className="text-sm text-muted-foreground">Quản lý hình ảnh thương hiệu và màu sắc nhận diện</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { label: "Logo chính", hint: "PNG hoặc SVG, nền trong suốt. Khuyến nghị: 300×80px", icon: "🏪" },
          { label: "Favicon", hint: "ICO hoặc PNG 32×32px", icon: "⭐" },
          { label: "Logo email", hint: "PNG, nền trắng. Khuyến nghị: 200×60px", icon: "📧" },
          { label: "Ảnh OG (Open Graph)", hint: "JPG hoặc PNG 1200×630px cho chia sẻ mạng xã hội", icon: "🌐" },
        ].map((item) => (
          <Card key={item.label} className="border-border border-dashed">
            <CardContent className="p-6">
              <p className="text-sm font-medium mb-3">{item.label}</p>
              <div className="h-28 bg-primary-50 rounded-xl flex flex-col items-center justify-center gap-2 border border-dashed border-primary-200 cursor-pointer hover:bg-primary-100 transition-colors">
                <span className="text-3xl">{item.icon}</span>
                <p className="text-xs text-muted-foreground text-center">Kéo thả hoặc nhấn để tải lên</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{item.hint}</p>
              <Button variant="outline" size="sm" className="mt-3 border-border w-full" onClick={() => toast.info("Chọn file...")}>
                <Upload className="w-4 h-4 mr-2" />Tải lên
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <Separator />
      <div>
        <h3 className="text-sm font-semibold mb-4">Màu sắc thương hiệu</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Màu chính", value: "#F8BBD0" },
            { label: "Màu nhấn", value: "#EC407A" },
            { label: "Màu nền", value: "#FFF8FA" },
            { label: "Màu văn bản", value: "#2D2D2D" },
          ].map((c) => (
            <div key={c.label} className="space-y-2">
              <Label className="text-xs text-muted-foreground">{c.label}</Label>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg border border-border flex-shrink-0" style={{ background: c.value }} />
                <Input value={c.value} className="bg-white border-border text-sm h-8 font-mono" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <SaveBar onSave={() => toast.success("Đã lưu cài đặt thương hiệu!")} onReset={() => toast.info("Đã đặt lại")} />
    </div>
  );
}

// ─── SECTION: Banner Management ───
function BannerManagement() {
  const [banners, setBanners] = useState([
    { id: 1, title: "Sale Hè 2026 - Giảm đến 50%", position: "hero", status: "active", startDate: "2026-06-01", endDate: "2026-06-30", clicks: 1284 },
    { id: 2, title: "Xe đẩy Combi - Miễn phí giao hàng", position: "sidebar", status: "active", startDate: "2026-06-01", endDate: "2026-06-15", clicks: 892 },
    { id: 3, title: "Tã bỉm Merries - Mua 3 tặng 1", position: "popup", status: "scheduled", startDate: "2026-06-10", endDate: "2026-06-20", clicks: 0 },
    { id: 4, title: "Flashsale Thứ 6 - 12:00 - 14:00", position: "hero", status: "inactive", startDate: "2026-05-31", endDate: "2026-05-31", clicks: 3421 },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newBanner, setNewBanner] = useState({ title: "", position: "hero", startDate: "", endDate: "" });

  const handleAdd = () => {
    if (!newBanner.title) { toast.error("Nhập tiêu đề banner"); return; }
    setBanners((p) => [...p, { id: Date.now(), ...newBanner, status: "scheduled", clicks: 0 }]);
    setShowAdd(false);
    setNewBanner({ title: "", position: "hero", startDate: "", endDate: "" });
    toast.success("Đã thêm banner mới!");
  };

  const handleDelete = (id: number) => {
    setBanners((p) => p.filter((b) => b.id !== id));
    toast.success("Đã xóa banner");
  };

  const statusMap: Record<string, { label: string; className: string }> = {
    active: { label: "Đang hiện", className: "bg-green-100 text-green-700" },
    scheduled: { label: "Lên lịch", className: "bg-blue-100 text-blue-700" },
    inactive: { label: "Tắt", className: "bg-gray-100 text-gray-500" },
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-1">Quản lý Banner</h2>
          <p className="text-sm text-muted-foreground">Quản lý banner quảng cáo trên website</p>
        </div>
        <Button className="bg-accent text-white hover:bg-primary-500" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-2" />Thêm Banner
        </Button>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary-50">
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Vị trí</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead className="text-right">Lượt click</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((b) => (
                <TableRow key={b.id} className="hover:bg-primary-50/40">
                  <TableCell className="font-medium text-sm">{b.title}</TableCell>
                  <TableCell>
                    <Badge className="bg-primary-100 text-accent capitalize">{b.position}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusMap[b.status].className}>{statusMap[b.status].label}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{b.startDate} → {b.endDate}</TableCell>
                  <TableCell className="text-right font-semibold">{b.clicks.toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => toast.info("Chỉnh sửa banner...")}><Edit2 className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(b.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Thêm Banner mới</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <FormField label="Tiêu đề banner">
              <Input value={newBanner.title} onChange={(e) => setNewBanner((p) => ({ ...p, title: e.target.value }))} className="bg-white border-border" placeholder="Nhập tiêu đề..." />
            </FormField>
            <FormField label="Vị trí hiển thị">
              <Select value={newBanner.position} onValueChange={(v) => setNewBanner((p) => ({ ...p, position: v }))}>
                <SelectTrigger className="bg-white border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hero">Hero (Trang chủ)</SelectItem>
                  <SelectItem value="sidebar">Sidebar</SelectItem>
                  <SelectItem value="popup">Popup</SelectItem>
                  <SelectItem value="footer">Footer</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Ngày bắt đầu">
                <Input type="date" value={newBanner.startDate} onChange={(e) => setNewBanner((p) => ({ ...p, startDate: e.target.value }))} className="bg-white border-border" />
              </FormField>
              <FormField label="Ngày kết thúc">
                <Input type="date" value={newBanner.endDate} onChange={(e) => setNewBanner((p) => ({ ...p, endDate: e.target.value }))} className="bg-white border-border" />
              </FormField>
            </div>
            <div className="h-28 bg-primary-50 rounded-xl flex flex-col items-center justify-center gap-2 border border-dashed border-primary-200 cursor-pointer hover:bg-primary-100 transition-colors">
              <Upload className="w-5 h-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Kéo thả ảnh banner vào đây</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAdd(false)}>Hủy</Button>
            <Button className="bg-accent text-white hover:bg-primary-500" onClick={handleAdd}>Thêm Banner</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── SECTION: Email Settings ───
function EmailSettings() {
  const [form, setForm] = useState({
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUser: "noreply@babystore.vn",
    smtpPass: "••••••••••••••••",
    fromName: "Baby Store Việt Nam",
    fromEmail: "noreply@babystore.vn",
    encryption: "tls",
  });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold mb-1">Cài đặt Email</h2>
        <p className="text-sm text-muted-foreground">Cấu hình máy chủ SMTP và mẫu email</p>
      </div>
      <Card className="border-border">
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Cấu hình SMTP</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="SMTP Host">
              <Input value={form.smtpHost} onChange={(e) => set("smtpHost", e.target.value)} className="bg-white border-border" />
            </FormField>
            <FormField label="SMTP Port">
              <Input value={form.smtpPort} onChange={(e) => set("smtpPort", e.target.value)} className="bg-white border-border" />
            </FormField>
            <FormField label="SMTP Username">
              <Input value={form.smtpUser} onChange={(e) => set("smtpUser", e.target.value)} className="bg-white border-border" />
            </FormField>
            <FormField label="SMTP Password">
              <Input type="password" value={form.smtpPass} onChange={(e) => set("smtpPass", e.target.value)} className="bg-white border-border" />
            </FormField>
            <FormField label="Mã hóa">
              <Select value={form.encryption} onValueChange={(v) => set("encryption", v)}>
                <SelectTrigger className="bg-white border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tls">TLS</SelectItem>
                  <SelectItem value="ssl">SSL</SelectItem>
                  <SelectItem value="none">Không</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Tên người gửi">
              <Input value={form.fromName} onChange={(e) => set("fromName", e.target.value)} className="bg-white border-border" />
            </FormField>
          </div>
          <Button variant="outline" className="border-border" onClick={() => toast.success("Đã gửi email kiểm tra!")}>
            <Mail className="w-4 h-4 mr-2" />Gửi email kiểm tra
          </Button>
        </CardContent>
      </Card>
      <Card className="border-border">
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Mẫu Email</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[
            { name: "Đặt hàng thành công", trigger: "Khi đơn hàng được tạo", active: true },
            { name: "Xác nhận thanh toán", trigger: "Khi thanh toán được xác nhận", active: true },
            { name: "Đơn hàng đang giao", trigger: "Khi chuyển sang trạng thái giao hàng", active: true },
            { name: "Đơn hàng hoàn thành", trigger: "Khi giao hàng thành công", active: true },
            { name: "Chào mừng thành viên", trigger: "Khi đăng ký tài khoản mới", active: true },
            { name: "Đặt lại mật khẩu", trigger: "Khi yêu cầu đặt lại mật khẩu", active: true },
          ].map((t) => (
            <div key={t.name} className="flex items-center justify-between p-3 rounded-lg border border-border bg-white hover:bg-primary-50/50 transition-colors">
              <div>
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.trigger}</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={t.active} />
                <Button variant="ghost" size="sm" onClick={() => toast.info("Mở trình soạn thảo email...")}><Edit2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <SaveBar onSave={() => toast.success("Đã lưu cài đặt email!")} onReset={() => toast.info("Đã đặt lại")} />
    </div>
  );
}

// ─── SECTION: Notification Settings ───
function NotificationSettings() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const notifTypes = [
    { id: "new_order", label: "Đơn hàng mới", desc: "Khi khách hàng đặt đơn hàng mới", push: true, email: true, sms: false },
    { id: "payment", label: "Thanh toán nhận được", desc: "Khi giao dịch thanh toán thành công", push: true, email: true, sms: false },
    { id: "low_stock", label: "Hàng sắp hết", desc: "Khi tồn kho dưới ngưỡng cảnh báo", push: true, email: true, sms: false },
    { id: "refund", label: "Yêu cầu hoàn tiền", desc: "Khi khách hàng gửi yêu cầu hoàn tiền", push: true, email: true, sms: true },
    { id: "review", label: "Đánh giá mới", desc: "Khi có đánh giá sản phẩm mới", push: false, email: true, sms: false },
    { id: "chat", label: "Tin nhắn mới", desc: "Khi có phiên chat từ khách hàng", push: true, email: false, sms: false },
  ];
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold mb-1">Cài đặt Thông báo</h2>
        <p className="text-sm text-muted-foreground">Quản lý kênh và loại thông báo hệ thống</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Push Notification", icon: Bell, enabled: pushEnabled, setEnabled: setPushEnabled, desc: "Thông báo trình duyệt và mobile app" },
          { label: "Email", icon: Mail, enabled: emailEnabled, setEnabled: setEmailEnabled, desc: "Gửi email theo cài đặt SMTP" },
          { label: "SMS", icon: MessageCircle, enabled: smsEnabled, setEnabled: setSmsEnabled, desc: "Tin nhắn SMS qua Twilio" },
        ].map((ch) => (
          <Card key={ch.label} className={`border-border ${ch.enabled ? "ring-1 ring-accent" : ""}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${ch.enabled ? "bg-primary-50" : "bg-muted"} flex items-center justify-center`}>
                  <ch.icon className={`w-4 h-4 ${ch.enabled ? "text-accent" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="text-sm font-medium">{ch.label}</p>
                  <p className="text-xs text-muted-foreground">{ch.desc}</p>
                </div>
              </div>
              <Switch checked={ch.enabled} onCheckedChange={ch.setEnabled} />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-border">
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Loại thông báo</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary-50">
                <TableHead>Loại thông báo</TableHead>
                <TableHead className="text-center">Push</TableHead>
                <TableHead className="text-center">Email</TableHead>
                <TableHead className="text-center">SMS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifTypes.map((t) => (
                <TableRow key={t.id} className="hover:bg-primary-50/40">
                  <TableCell>
                    <p className="text-sm font-medium">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </TableCell>
                  <TableCell className="text-center"><Switch checked={t.push} disabled={!pushEnabled} /></TableCell>
                  <TableCell className="text-center"><Switch checked={t.email} disabled={!emailEnabled} /></TableCell>
                  <TableCell className="text-center"><Switch checked={t.sms} disabled={!smsEnabled} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <SaveBar onSave={() => toast.success("Đã lưu cài đặt thông báo!")} onReset={() => toast.info("Đã đặt lại")} />
    </div>
  );
}

// ─── SECTION: Security Settings ───
function SecuritySettings() {
  const [form, setForm] = useState({
    minPasswordLength: 8,
    requireUppercase: true,
    requireNumber: true,
    requireSpecial: false,
    passwordExpiry: 90,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    twoFactorRequired: false,
    ipWhitelist: "",
  });
  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold mb-1">Cài đặt Bảo mật</h2>
        <p className="text-sm text-muted-foreground">Chính sách mật khẩu, phiên làm việc và xác thực 2 lớp</p>
      </div>
      <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-yellow-800">Thay đổi cài đặt bảo mật cẩn thận</p>
          <p className="text-xs text-yellow-700 mt-0.5">Các thay đổi này sẽ ảnh hưởng đến tất cả người dùng hệ thống. Cân nhắc kỹ trước khi lưu.</p>
        </div>
      </div>
      <Card className="border-border">
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Chính sách mật khẩu</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Độ dài tối thiểu" hint="Số ký tự tối thiểu">
              <Input type="number" min={6} max={32} value={form.minPasswordLength} onChange={(e) => set("minPasswordLength", Number(e.target.value))} className="bg-white border-border" />
            </FormField>
            <FormField label="Hết hạn sau (ngày)" hint="0 = không hết hạn">
              <Input type="number" min={0} value={form.passwordExpiry} onChange={(e) => set("passwordExpiry", Number(e.target.value))} className="bg-white border-border" />
            </FormField>
          </div>
          {[
            { key: "requireUppercase", label: "Yêu cầu chữ hoa", desc: "Ít nhất 1 ký tự viết hoa (A-Z)" },
            { key: "requireNumber", label: "Yêu cầu số", desc: "Ít nhất 1 chữ số (0-9)" },
            { key: "requireSpecial", label: "Yêu cầu ký tự đặc biệt", desc: "Ít nhất 1 ký tự !@#$%^&*()" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border border-border bg-white">
              <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
              <Switch checked={form[item.key as keyof typeof form] as boolean} onCheckedChange={(v) => set(item.key, v)} />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="border-border">
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Phiên làm việc & Đăng nhập</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Hết phiên sau (phút)">
              <Input type="number" value={form.sessionTimeout} onChange={(e) => set("sessionTimeout", Number(e.target.value))} className="bg-white border-border" />
            </FormField>
            <FormField label="Số lần đăng nhập sai tối đa">
              <Input type="number" value={form.maxLoginAttempts} onChange={(e) => set("maxLoginAttempts", Number(e.target.value))} className="bg-white border-border" />
            </FormField>
            <FormField label="Khóa tài khoản sau (phút)">
              <Input type="number" value={form.lockoutDuration} onChange={(e) => set("lockoutDuration", Number(e.target.value))} className="bg-white border-border" />
            </FormField>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-white">
            <div><p className="text-sm font-medium">Bắt buộc xác thực 2 lớp (2FA)</p><p className="text-xs text-muted-foreground">Tất cả admin phải bật 2FA để đăng nhập</p></div>
            <Switch checked={form.twoFactorRequired} onCheckedChange={(v) => set("twoFactorRequired", v)} />
          </div>
          <FormField label="Whitelist IP (một IP mỗi dòng)" hint="Để trống = cho phép tất cả IP">
            <Textarea value={form.ipWhitelist} onChange={(e) => set("ipWhitelist", e.target.value)} placeholder="192.168.1.1&#10;10.0.0.0/24" className="bg-white border-border font-mono text-sm" rows={3} />
          </FormField>
        </CardContent>
      </Card>
      <SaveBar onSave={() => toast.success("Đã lưu cài đặt bảo mật!")} onReset={() => toast.info("Đã đặt lại")} />
    </div>
  );
}

// ─── SECTION: Chat Settings ───
function ChatSettings() {
  const [form, setForm] = useState({
    liveChat: true,
    autoReply: true,
    autoReplyDelay: 3,
    autoReplyMsg: "Xin chào! Chúng tôi đã nhận tin nhắn của bạn và sẽ phản hồi trong vòng 5 phút.",
    workingHoursOnly: false,
    workStart: "08:00",
    workEnd: "22:00",
    maxQueueSize: 20,
    fileUpload: true,
    maxFileSize: 10,
  });
  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold mb-1">Cài đặt Live Chat</h2>
        <p className="text-sm text-muted-foreground">Cấu hình hệ thống chat trực tiếp với khách hàng</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { key: "liveChat", label: "Bật Live Chat", desc: "Cho phép khách hàng chat trực tiếp với nhân viên" },
          { key: "autoReply", label: "Tự động trả lời", desc: "Gửi tin nhắn chào mừng khi khách hàng bắt đầu chat" },
          { key: "workingHoursOnly", label: "Chỉ trong giờ làm việc", desc: "Tắt chat ngoài giờ làm việc" },
          { key: "fileUpload", label: "Cho phép gửi file", desc: "Khách hàng có thể gửi ảnh và file trong chat" },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-border bg-white">
            <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p></div>
            <Switch checked={form[item.key as keyof typeof form] as boolean} onCheckedChange={(v) => set(item.key, v)} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField label="Độ trễ trả lời tự động (giây)">
          <Input type="number" value={form.autoReplyDelay} onChange={(e) => set("autoReplyDelay", Number(e.target.value))} className="bg-white border-border" />
        </FormField>
        <FormField label="Hàng đợi tối đa">
          <Input type="number" value={form.maxQueueSize} onChange={(e) => set("maxQueueSize", Number(e.target.value))} className="bg-white border-border" />
        </FormField>
        <FormField label="Kích thước file tối đa (MB)">
          <Input type="number" value={form.maxFileSize} onChange={(e) => set("maxFileSize", Number(e.target.value))} className="bg-white border-border" />
        </FormField>
      </div>
      <FormField label="Nội dung tin nhắn tự động">
        <Textarea value={form.autoReplyMsg} onChange={(e) => set("autoReplyMsg", e.target.value)} className="bg-white border-border" rows={3} />
      </FormField>
      <SaveBar onSave={() => toast.success("Đã lưu cài đặt chat!")} onReset={() => toast.info("Đã đặt lại")} />
    </div>
  );
}

// ─── SECTION: AI ChatBot Settings ───
function AIChatBotSettings() {
  const [form, setForm] = useState({
    aiEnabled: true,
    model: "claude-sonnet-4-6",
    temperature: 0.7,
    maxTokens: 1024,
    systemPrompt: "Bạn là trợ lý ảo của Baby Store Việt Nam - chuyên gia tư vấn sản phẩm mẹ và bé. Hãy trả lời thân thiện, chuyên nghiệp và chính xác bằng tiếng Việt.",
    escalateToHuman: true,
    escalateKeywords: "khiếu nại, tức giận, không hài lòng, muốn gặp nhân viên",
    languageDetection: true,
    contextWindow: 10,
  });
  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold mb-1">Cài đặt AI ChatBot</h2>
        <p className="text-sm text-muted-foreground">Cấu hình model AI và hành vi chatbot</p>
      </div>
      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center"><Bot className="w-5 h-5 text-accent" /></div>
          <div><p className="text-sm font-semibold">AI ChatBot</p><p className="text-xs text-muted-foreground">Kích hoạt/tắt toàn bộ AI chatbot</p></div>
        </div>
        <Switch checked={form.aiEnabled} onCheckedChange={(v) => set("aiEnabled", v)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Model AI">
          <Select value={form.model} onValueChange={(v) => set("model", v)}>
            <SelectTrigger className="bg-white border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="claude-sonnet-4-6">Claude Sonnet 4.6</SelectItem>
              <SelectItem value="claude-haiku-4-5">Claude Haiku 4.5</SelectItem>
              <SelectItem value="claude-opus-4-7">Claude Opus 4.7</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Temperature (Sáng tạo)" hint={`Giá trị: ${form.temperature} — Thấp hơn = chính xác hơn`}>
          <Input type="range" min={0} max={1} step={0.1} value={form.temperature}
            onChange={(e) => set("temperature", Number(e.target.value))} className="w-full" />
        </FormField>
        <FormField label="Token tối đa / phản hồi">
          <Input type="number" value={form.maxTokens} onChange={(e) => set("maxTokens", Number(e.target.value))} className="bg-white border-border" />
        </FormField>
        <FormField label="Số tin nhắn ngữ cảnh" hint="Số lượng tin nhắn trước đó AI nhớ">
          <Input type="number" value={form.contextWindow} onChange={(e) => set("contextWindow", Number(e.target.value))} className="bg-white border-border" />
        </FormField>
      </div>
      <FormField label="System Prompt" hint="Hướng dẫn hành vi và nhân cách của AI">
        <Textarea value={form.systemPrompt} onChange={(e) => set("systemPrompt", e.target.value)} className="bg-white border-border font-mono text-sm" rows={4} />
      </FormField>
      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-white">
        <div><p className="text-sm font-medium">Chuyển sang nhân viên tự động</p><p className="text-xs text-muted-foreground">Khi phát hiện từ khóa nhạy cảm</p></div>
        <Switch checked={form.escalateToHuman} onCheckedChange={(v) => set("escalateToHuman", v)} />
      </div>
      {form.escalateToHuman && (
        <FormField label="Từ khóa chuyển hướng" hint="Ngăn cách bằng dấu phẩy">
          <Input value={form.escalateKeywords} onChange={(e) => set("escalateKeywords", e.target.value)} className="bg-white border-border" />
        </FormField>
      )}
      <SaveBar onSave={() => toast.success("Đã lưu cài đặt AI ChatBot!")} onReset={() => toast.info("Đã đặt lại")} />
    </div>
  );
}

// ─── SECTION: Audit Logs ───
const auditLogs = [
  { id: "AL-001", user: "Nguyễn Văn Admin", action: "Cập nhật sản phẩm", resource: "Bộ quần áo sơ sinh Joya", ip: "192.168.1.10", timestamp: "2026-06-05 10:45:12", status: "success" },
  { id: "AL-002", user: "Trần Thị Manager", action: "Duyệt hoàn tiền", resource: "REF-2026-00106", ip: "192.168.1.15", timestamp: "2026-06-05 10:32:08", status: "success" },
  { id: "AL-003", user: "Lê Văn Staff", action: "Đăng nhập thất bại", resource: "Tài khoản admin", ip: "203.113.45.67", timestamp: "2026-06-05 09:58:34", status: "failed" },
  { id: "AL-004", user: "Nguyễn Văn Admin", action: "Thay đổi cài đặt SMTP", resource: "System Settings", ip: "192.168.1.10", timestamp: "2026-06-05 09:30:22", status: "success" },
  { id: "AL-005", user: "Phạm Thị Support", action: "Xuất danh sách khách hàng", resource: "User Management", ip: "192.168.1.22", timestamp: "2026-06-05 09:15:45", status: "success" },
  { id: "AL-006", user: "Hoàng Văn Admin", action: "Xóa sản phẩm", resource: "SKU: BSS-089", ip: "192.168.1.10", timestamp: "2026-06-04 18:44:31", status: "success" },
  { id: "AL-007", user: "Unknown", action: "Đăng nhập bất thường", resource: "Admin Portal", ip: "45.33.32.156", timestamp: "2026-06-04 03:12:09", status: "blocked" },
  { id: "AL-008", user: "Trần Thị Manager", action: "Cập nhật coupon", resource: "BABY20", ip: "192.168.1.15", timestamp: "2026-06-04 16:30:00", status: "success" },
];

function AuditLogs() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const filtered = auditLogs.filter((l) => {
    const match = l.user.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase());
    const statusMatch = statusFilter === "all" || l.status === statusFilter;
    return match && statusMatch;
  });
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold mb-1">Nhật ký Kiểm toán</h2>
        <p className="text-sm text-muted-foreground">Lịch sử hoạt động và thay đổi trong hệ thống</p>
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Tìm theo người dùng, hành động..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-white border-border" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 border-border bg-white"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="success">Thành công</SelectItem>
            <SelectItem value="failed">Thất bại</SelectItem>
            <SelectItem value="blocked">Bị chặn</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="border-border" onClick={() => toast.success("Đang xuất nhật ký...")}>
          <Download className="w-4 h-4 mr-2" />Xuất
        </Button>
      </div>
      <Card className="border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary-50">
                <TableHead>Người dùng</TableHead>
                <TableHead>Hành động</TableHead>
                <TableHead>Tài nguyên</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Kết quả</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => (
                <TableRow key={log.id} className="hover:bg-primary-50/40">
                  <TableCell className="font-medium text-sm">{log.user}</TableCell>
                  <TableCell className="text-sm">{log.action}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{log.resource}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{log.ip}</TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{log.timestamp}</TableCell>
                  <TableCell>
                    {log.status === "success" && <Badge className="bg-green-100 text-green-700">Thành công</Badge>}
                    {log.status === "failed" && <Badge className="bg-red-100 text-red-700">Thất bại</Badge>}
                    {log.status === "blocked" && <Badge className="bg-orange-100 text-orange-700">Bị chặn</Badge>}
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

// ─── SECTION: Roles & Permissions ───
const roles = [
  { id: "admin", name: "Admin", description: "Toàn quyền hệ thống", users: 2, color: "bg-red-100 text-red-700" },
  { id: "manager", name: "Manager", description: "Quản lý đơn hàng, kho, báo cáo", users: 4, color: "bg-purple-100 text-purple-700" },
  { id: "staff", name: "Staff", description: "Xử lý đơn hàng và hỗ trợ khách hàng", users: 12, color: "bg-blue-100 text-blue-700" },
  { id: "support", name: "Support", description: "Chỉ trả lời chat và xem đơn hàng", users: 6, color: "bg-green-100 text-green-700" },
];

const permissionModules = [
  { module: "Sản phẩm", permissions: ["Xem", "Tạo", "Sửa", "Xóa"] },
  { module: "Đơn hàng", permissions: ["Xem", "Cập nhật trạng thái", "Xuất", "Hủy"] },
  { module: "Tồn kho", permissions: ["Xem", "Nhập hàng", "Điều chỉnh"] },
  { module: "Người dùng", permissions: ["Xem", "Tạo", "Sửa", "Khóa"] },
  { module: "Báo cáo", permissions: ["Xem", "Xuất PDF", "Xuất Excel"] },
  { module: "Cài đặt", permissions: ["Xem", "Chỉnh sửa"] },
];

const rolePermissions: Record<string, Record<string, string[]>> = {
  admin: { "Sản phẩm": ["Xem", "Tạo", "Sửa", "Xóa"], "Đơn hàng": ["Xem", "Cập nhật trạng thái", "Xuất", "Hủy"], "Tồn kho": ["Xem", "Nhập hàng", "Điều chỉnh"], "Người dùng": ["Xem", "Tạo", "Sửa", "Khóa"], "Báo cáo": ["Xem", "Xuất PDF", "Xuất Excel"], "Cài đặt": ["Xem", "Chỉnh sửa"] },
  manager: { "Sản phẩm": ["Xem", "Tạo", "Sửa"], "Đơn hàng": ["Xem", "Cập nhật trạng thái", "Xuất"], "Tồn kho": ["Xem", "Nhập hàng", "Điều chỉnh"], "Người dùng": ["Xem"], "Báo cáo": ["Xem", "Xuất PDF", "Xuất Excel"], "Cài đặt": ["Xem"] },
  staff: { "Sản phẩm": ["Xem"], "Đơn hàng": ["Xem", "Cập nhật trạng thái"], "Tồn kho": ["Xem"], "Người dùng": [], "Báo cáo": ["Xem"], "Cài đặt": [] },
  support: { "Sản phẩm": ["Xem"], "Đơn hàng": ["Xem"], "Tồn kho": [], "Người dùng": [], "Báo cáo": [], "Cài đặt": [] },
};

function RolesPermissions() {
  const [selectedRole, setSelectedRole] = useState("admin");
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold mb-1">Vai trò & Quyền hạn</h2>
        <p className="text-sm text-muted-foreground">Quản lý vai trò và phân quyền truy cập</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => setSelectedRole(role.id)}
            className={`p-4 rounded-xl border text-left transition-all ${selectedRole === role.id ? "border-accent ring-1 ring-accent bg-primary-50" : "border-border bg-white hover:bg-primary-50/50"}`}
          >
            <Badge className={role.color + " mb-2"}>{role.name}</Badge>
            <p className="text-xs text-muted-foreground">{role.description}</p>
            <p className="text-xs font-semibold mt-1">{role.users} người dùng</p>
          </button>
        ))}
      </div>
      <Card className="border-border">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Quyền hạn: {roles.find((r) => r.id === selectedRole)?.name}
          </CardTitle>
          <Button variant="outline" size="sm" className="border-border" onClick={() => toast.success("Đã lưu quyền hạn!")}>
            <Save className="w-4 h-4 mr-1" />Lưu thay đổi
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary-50">
                <TableHead>Module</TableHead>
                <TableHead>Quyền hạn được cấp</TableHead>
                <TableHead>Quyền không có</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissionModules.map((mod) => {
                const granted = rolePermissions[selectedRole]?.[mod.module] ?? [];
                const denied = mod.permissions.filter((p) => !granted.includes(p));
                return (
                  <TableRow key={mod.module} className="hover:bg-primary-50/40">
                    <TableCell className="font-medium text-sm">{mod.module}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {granted.length > 0 ? granted.map((p) => (
                          <Badge key={p} className="bg-green-100 text-green-700 text-xs">{p}</Badge>
                        )) : <span className="text-muted-foreground text-xs">Không có</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {denied.map((p) => (
                          <Badge key={p} className="bg-gray-100 text-gray-400 text-xs line-through">{p}</Badge>
                        ))}
                      </div>
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

// ─── SECTION: Payment Settings ───
function PaymentSettingsSection() {
  const [cod, setCod] = useState(true);
  const [vnpay, setVnpay] = useState(true);
  const [momo, setMomo] = useState(true);
  const [bank, setBank] = useState(true);
  const [minOrder, setMinOrder] = useState(50000);
  const [maxCodAmount, setMaxCodAmount] = useState(5000000);
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold mb-1">Cài đặt Thanh toán</h2>
        <p className="text-sm text-muted-foreground">Bật/tắt phương thức thanh toán và cấu hình</p>
      </div>
      <div className="space-y-3">
        {[
          { label: "COD (Thanh toán khi nhận hàng)", desc: "Khách hàng thanh toán khi nhận hàng", enabled: cod, setEnabled: setCod, icon: "💵" },
          { label: "VNPay", desc: "Thanh toán qua cổng VNPay - ATM/Visa/Mastercard", enabled: vnpay, setEnabled: setVnpay, icon: "🔵" },
          { label: "MoMo", desc: "Thanh toán qua ví điện tử MoMo", enabled: momo, setEnabled: setMomo, icon: "💜" },
          { label: "Chuyển khoản ngân hàng", desc: "Chuyển khoản trực tiếp vào tài khoản cửa hàng", enabled: bank, setEnabled: setBank, icon: "🏦" },
        ].map((method) => (
          <div key={method.label} className="flex items-center justify-between p-4 rounded-xl border border-border bg-white">
            <div className="flex items-center gap-3">
              <span className="text-xl">{method.icon}</span>
              <div>
                <p className="text-sm font-medium">{method.label}</p>
                <p className="text-xs text-muted-foreground">{method.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={method.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
                {method.enabled ? "Bật" : "Tắt"}
              </Badge>
              <Switch checked={method.enabled} onCheckedChange={method.setEnabled} />
            </div>
          </div>
        ))}
      </div>
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Giá trị đơn hàng tối thiểu (₫)" hint="Áp dụng cho tất cả phương thức thanh toán">
          <Input type="number" value={minOrder} onChange={(e) => setMinOrder(Number(e.target.value))} className="bg-white border-border" />
        </FormField>
        <FormField label="Giá trị tối đa thanh toán COD (₫)" hint="Đơn hàng trên mức này không thể chọn COD">
          <Input type="number" value={maxCodAmount} onChange={(e) => setMaxCodAmount(Number(e.target.value))} className="bg-white border-border" />
        </FormField>
      </div>
      <SaveBar onSave={() => toast.success("Đã lưu cài đặt thanh toán!")} onReset={() => toast.info("Đã đặt lại")} />
    </div>
  );
}

export default function SystemSettings() {
  const [activeSection, setActiveSection] = useState("general");

  const renderSection = () => {
    switch (activeSection) {
      case "general": return <GeneralSettings />;
      case "store": return <StoreSettings />;
      case "branding": return <BrandingSettings />;
      case "banners": return <BannerManagement />;
      case "email": return <EmailSettings />;
      case "notifications": return <NotificationSettings />;
      case "payment": return <PaymentSettingsSection />;
      case "chat": return <ChatSettings />;
      case "ai": return <AIChatBotSettings />;
      case "security": return <SecuritySettings />;
      case "audit": return <AuditLogs />;
      case "roles": return <RolesPermissions />;
      default: return <GeneralSettings />;
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Cài đặt Hệ thống</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Cấu hình toàn diện Baby Store Management System</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-green-700">Tất cả thay đổi đã được lưu</span>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left Navigation */}
        <div className="w-60 flex-shrink-0">
          <Card className="border-border">
            <CardContent className="p-2">
              <nav className="space-y-0.5">
                {settingSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all group ${
                      activeSection === section.id
                        ? "bg-primary text-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-primary-50 hover:text-foreground"
                    }`}
                  >
                    <section.icon className={`w-4 h-4 flex-shrink-0 ${activeSection === section.id ? "text-accent" : "group-hover:text-accent transition-colors"}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-tight">{section.label}</p>
                      <p className="text-xs text-muted-foreground truncate leading-tight mt-0.5">{section.description}</p>
                    </div>
                    {activeSection === section.id && <ChevronRight className="w-3.5 h-3.5 text-accent ml-auto flex-shrink-0" />}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <Card className="border-border">
            <CardContent className="p-6">
              {renderSection()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
