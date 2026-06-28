import { useState, useMemo, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { Checkbox } from "../ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  User,
  MapPin,
  ShoppingBag,
  Heart,
  Star,
  Lock,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Menu,
  X,
  Camera,
  Home,
  MapPinned,
} from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";
import SearchableSelect, { type SelectOption } from "./SearchableSelect";
import {
  getAllProvinces,
  getDistricts,
  getWards,
  findProvinceShortName,
} from "../../assets/address/addressHelpers";
import { addressService } from "../../../services/address.service";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  avatarUrl: string;
}

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

interface AddressFormData {
  recipient_name: string;
  phone: string;
  address_line: string;
  ward: string;
  district: string;
  province: string;
  is_default: boolean;
}

// ──────────────────────────────────────────────
// Sidebar navigation items
// ──────────────────────────────────────────────

const sidebarNav = [
  { label: "Thông tin cá nhân", icon: User, tab: "personal", href: null },
  { label: "Địa chỉ nhận hàng", icon: MapPin, tab: "addresses", href: null },
  { label: "Lịch sử đơn hàng", icon: ShoppingBag, tab: null, href: "/orders" },
  { label: "Danh sách yêu thích", icon: Heart, tab: null, href: "/products" },
  { label: "Đánh giá của tôi", icon: Star, tab: null, href: "/account/reviews" },
  { label: "Đổi mật khẩu", icon: Lock, tab: null, href: "/account/change-password" },
];

// ──────────────────────────────────────────────
// Pre-computed province options (loaded once from JSON)
// ──────────────────────────────────────────────

const provinceOptions: SelectOption[] = getAllProvinces().map((p) => ({
  value: p.shortName,
  label: p.fullName,
}));

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function CustomerProfile() {
  // ── Customer info state ──
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: "Nguyễn Văn An",
    email: "nguyenvanan@email.com",
    phone: "0943 808 107",
    gender: "male",
    dateOfBirth: "1990-05-15",
    avatarUrl: "",
  });

  const [infoForm, setInfoForm] = useState<CustomerInfo>({ ...customerInfo });
  const [editingInfo, setEditingInfo] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);

  // ── Address state ──
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [addressError, setAddressError] = useState<string | null>(null);

  // ── Address dialog state ──
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState<AddressFormData>({
    recipient_name: "",
    phone: "",
    address_line: "",
    ward: "",
    district: "",
    province: "",
    is_default: false,
  });

  // ── Delete confirmation state ──
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null);
  const [deletingAddress, setDeletingAddress] = useState(false);

  // ── Default address setting state ──
  const [settingDefaultId, setSettingDefaultId] = useState<number | null>(null);

  // ── Derived options (memoized to avoid re-processing large JSON) ──
  const districtOptions = useMemo<SelectOption[]>(() => {
    if (!addressForm.province) return [];
    return getDistricts(addressForm.province).map((d) => ({
      value: d.name,
      label: `${d.type} ${d.name.replace(/^(Quận|Huyện|Thị xã|Thành phố)\s*/i, "")}`,
    }));
  }, [addressForm.province]);

  const wardOptions = useMemo<SelectOption[]>(() => {
    if (!addressForm.district || !addressForm.province) return [];
    return getWards(addressForm.district, addressForm.province).map((w) => ({
      value: w.name,
      label: w.name,
    }));
  }, [addressForm.district, addressForm.province]);

  // ── UI state ──
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  // ── Info errors ──
  const [infoErrors, setInfoErrors] = useState<Record<string, string>>({});

  // ────────────────────────────────────────
  // Load addresses from API
  // ────────────────────────────────────────

  const fetchAddresses = useCallback(async () => {
    setLoadingAddresses(true);
    setAddressError(null);
    try {
      const res = await addressService.getAll();
      console.log("Fetched addresses:", res.data);
      setAddresses(res.data.data.addresses ?? res.data ?? []);
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

  // ────────────────────────────────────────
  // Customer info handlers
  // ────────────────────────────────────────

  const handleInfoChange = (field: keyof CustomerInfo, value: string) => {
    setInfoForm((prev) => ({ ...prev, [field]: value }));
    if (infoErrors[field]) {
      setInfoErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateInfo = () => {
    const errs: Record<string, string> = {};
    if (!infoForm.fullName.trim()) errs.fullName = "Họ tên không được để trống";
    if (!infoForm.email.trim()) errs.email = "Email không được để trống";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(infoForm.email))
      errs.email = "Email không hợp lệ";
    if (!infoForm.phone.trim()) errs.phone = "Số điện thoại không được để trống";
    setInfoErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveInfo = async () => {
    if (!validateInfo()) {
      toast.error("Vui lòng sửa các lỗi trước khi lưu");
      return;
    }
    setSavingInfo(true);
    await new Promise((r) => setTimeout(r, 1000));
    setCustomerInfo({ ...infoForm });
    setEditingInfo(false);
    setSavingInfo(false);
    toast.success("Thông tin đã được cập nhật!");
  };

  const handleCancelInfo = () => {
    setInfoForm({ ...customerInfo });
    setEditingInfo(false);
    setInfoErrors({});
  };

  // ────────────────────────────────────────
  // Address form helpers
  // ────────────────────────────────────────

  const handleAddressChange = (field: keyof AddressFormData, value: string | boolean) => {
    setAddressForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "province") {
        updated.district = "";
        updated.ward = "";
      }
      if (field === "district") {
        updated.ward = "";
      }
      return updated;
    });
  };

  const resetAddressForm = () => {
    setAddressForm({
      recipient_name: "",
      phone: "",
      address_line: "",
      ward: "",
      district: "",
      province: "",
      is_default: false,
    });
  };

  const openAddAddress = () => {
    setEditingAddress(null);
    resetAddressForm();
    setAddressDialogOpen(true);
  };

  const openEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({
      recipient_name: addr.recipient_name,
      phone: addr.phone,
      address_line: addr.address_line,
      ward: addr.ward,
      district: addr.district,
      province: addr.province,
      is_default: addr.is_default,
    });
    setAddressDialogOpen(true);
  };

  // ────────────────────────────────────────
  // Save address (Create / Update)
  // ────────────────────────────────────────

  const handleSaveAddress = async () => {
    // Client-side validation
    if (!addressForm.recipient_name.trim()) {
      toast.error("Vui lòng nhập tên người nhận");
      return;
    }
    if (!addressForm.phone.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }
    if (!addressForm.province) {
      toast.error("Vui lòng chọn tỉnh/thành phố");
      return;
    }
    if (!addressForm.district) {
      toast.error("Vui lòng chọn quận/huyện");
      return;
    }
    if (!addressForm.ward) {
      toast.error("Vui lòng chọn phường/xã");
      return;
    }
    if (!addressForm.address_line.trim()) {
      toast.error("Vui lòng nhập địa chỉ chi tiết");
      return;
    }

    setSaving(true);
    try {
      if (editingAddress) {
        await addressService.update(editingAddress.address_id, addressForm);
        toast.success("Địa chỉ đã được cập nhật!");
      } else {
        await addressService.create(addressForm);
        toast.success("Địa chỉ mới đã được thêm!");
      }
      setAddressDialogOpen(false);
      await fetchAddresses();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Có lỗi xảy ra, vui lòng thử lại";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ────────────────────────────────────────
  // Delete address
  // ────────────────────────────────────────

  const openDeleteDialog = (id: number) => {
    setDeletingAddressId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingAddressId === null) return;
    setDeletingAddress(true);
    try {
      await addressService.delete(deletingAddressId);
      toast.success("Đã xóa địa chỉ!");
      setDeleteDialogOpen(false);
      setDeletingAddressId(null);
      await fetchAddresses();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể xóa địa chỉ";
      toast.error(msg);
    } finally {
      setDeletingAddress(false);
    }
  };

  // ────────────────────────────────────────
  // Set default address
  // ────────────────────────────────────────

  const handleSetDefault = async (id: number) => {
    setSettingDefaultId(id);
    try {
      await addressService.setDefault(id);
      toast.success("Đã đặt làm địa chỉ mặc định!");
      await fetchAddresses();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể đặt địa chỉ mặc định";
      toast.error(msg);
    } finally {
      setSettingDefaultId(null);
    }
  };

  // ────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // ────────────────────────────────────────
  // Render skeleton cards
  // ────────────────────────────────────────

  const renderSkeletonCards = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {[1, 2].map((i) => (
        <Card key={i} className="border-border/60">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start gap-3 mb-2">
              <Skeleton className="size-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="ml-[52px] space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // ────────────────────────────────────────
  // Render
  // ────────────────────────────────────────

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* User card */}
      <div className="flex flex-col items-center text-center p-6 border-b border-border">
        <Avatar className="size-20 mb-3 border-4 border-primary/20">
          <AvatarImage src={customerInfo.avatarUrl} alt={customerInfo.fullName} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
            {getInitials(customerInfo.fullName)}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-base">{customerInfo.fullName}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{customerInfo.email}</p>
        <p className="text-sm text-muted-foreground">{customerInfo.phone}</p>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <nav className="space-y-1 px-3">
          {sidebarNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;
            const isLink = item.href !== null;

            if (isLink) {
              return (
                <Link
                  key={item.label}
                  to={item.href!}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-accent/10 hover:text-accent text-muted-foreground group"
                >
                  <Icon className="size-5 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            }

            return (
              <button
                key={item.label}
                onClick={() => {
                  setActiveTab(item.tab!);
                  setSidebarOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "hover:bg-accent/10 hover:text-accent text-muted-foreground"
                  }`}
              >
                <Icon className="size-5 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
        {/* Page header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Tài khoản của tôi</h1>
          <p className="text-muted-foreground mt-1">Quản lý thông tin và địa chỉ giao hàng</p>
        </div>

        {/* Mobile sidebar toggle */}
        <div className="flex lg:hidden mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="gap-2"
          >
            <Menu className="size-4" />
            Danh mục
          </Button>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border shadow-2xl animate-in slide-in-from-left">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="font-semibold text-sm">Menu</span>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="size-4" />
                </Button>
              </div>
              {sidebarContent}
            </div>
          </div>
        )}

        <div className="flex gap-6 lg:gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-[280px] shrink-0">
            <Card className="sticky top-24 overflow-hidden border-border/60 shadow-sm">
              <div className="max-h-[calc(100vh-8rem)] flex flex-col">
                {sidebarContent}
              </div>
            </Card>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex mb-6 bg-secondary/60 p-1 rounded-xl">
                <TabsTrigger
                  value="personal"
                  className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  <User className="size-4 mr-2" />
                  Thông tin cá nhân
                </TabsTrigger>
                <TabsTrigger
                  value="addresses"
                  className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  <MapPin className="size-4 mr-2" />
                  Địa chỉ nhận hàng
                </TabsTrigger>
              </TabsList>

              {/* ─────── TAB 1: PERSONAL INFO ─────── */}
              <TabsContent value="personal" className="mt-0 space-y-6">
                <Card className="border-border/60 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="size-5 text-primary" />
                      Thông tin cá nhân
                    </CardTitle>
                    <CardDescription>
                      {editingInfo
                        ? "Chỉnh sửa thông tin của bạn"
                        : "Xem và quản lý thông tin cá nhân"}
                    </CardDescription>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-6 space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="size-20 border-4 border-primary/10">
                          <AvatarImage src={customerInfo.avatarUrl} alt={customerInfo.fullName} />
                          <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                            {getInitials(customerInfo.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        {editingInfo && (
                          <button className="absolute -bottom-1 -right-1 size-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:bg-accent/90 transition-colors shadow-md">
                            <Camera className="size-4" />
                          </button>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">Ảnh đại diện</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          JPG, PNG. Tối đa 2MB.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Full name */}
                      <div className="md:col-span-2">
                        <Label htmlFor="fullName">
                          Họ và tên <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="fullName"
                          value={editingInfo ? infoForm.fullName : customerInfo.fullName}
                          onChange={(e) => handleInfoChange("fullName", e.target.value)}
                          disabled={!editingInfo}
                          className={infoErrors.fullName ? "border-destructive" : ""}
                        />
                        {infoErrors.fullName && (
                          <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="size-3" />
                            {infoErrors.fullName}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <Label htmlFor="email">
                          Email <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={editingInfo ? infoForm.email : customerInfo.email}
                          onChange={(e) => handleInfoChange("email", e.target.value)}
                          disabled={!editingInfo}
                          className={infoErrors.email ? "border-destructive" : ""}
                        />
                        {infoErrors.email && (
                          <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="size-3" />
                            {infoErrors.email}
                          </p>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <Label htmlFor="phone">
                          Số điện thoại <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="phone"
                          value={editingInfo ? infoForm.phone : customerInfo.phone}
                          onChange={(e) => handleInfoChange("phone", e.target.value)}
                          disabled={!editingInfo}
                          className={infoErrors.phone ? "border-destructive" : ""}
                        />
                        {infoErrors.phone && (
                          <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="size-3" />
                            {infoErrors.phone}
                          </p>
                        )}
                      </div>

                      {/* Gender */}
                      <div>
                        <Label>Giới tính</Label>
                        <div className="flex gap-4 mt-2">
                          {["male", "female", "other"].map((g) => (
                            <label
                              key={g}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${(editingInfo ? infoForm.gender : customerInfo.gender) === g
                                ? "border-accent bg-accent/5 text-accent"
                                : "border-border hover:border-accent/50"
                                } ${!editingInfo ? "opacity-70 pointer-events-none" : ""}`}
                            >
                              <input
                                type="radio"
                                name="gender"
                                value={g}
                                checked={(editingInfo ? infoForm.gender : customerInfo.gender) === g}
                                onChange={() => handleInfoChange("gender", g)}
                                disabled={!editingInfo}
                                className="sr-only"
                              />
                              <CheckCircle2
                                className={`size-4 ${(editingInfo ? infoForm.gender : customerInfo.gender) === g
                                  ? "text-accent"
                                  : "text-muted-foreground"
                                  }`}
                              />
                              {g === "male" ? "Nam" : g === "female" ? "Nữ" : "Khác"}
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Date of birth */}
                      <div>
                        <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={editingInfo ? infoForm.dateOfBirth : customerInfo.dateOfBirth}
                          onChange={(e) => handleInfoChange("dateOfBirth", e.target.value)}
                          disabled={!editingInfo}
                          max={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      {!editingInfo ? (
                        <>
                          <Button
                            className="bg-accent hover:bg-accent/90"
                            onClick={() => setEditingInfo(true)}
                          >
                            <Pencil className="size-4 mr-2" />
                            Cập nhật
                          </Button>
                          <Button variant="outline" asChild>
                            <Link to="/account/change-password">
                              <Lock className="size-4 mr-2" />
                              Đổi mật khẩu
                            </Link>
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            className="bg-accent hover:bg-accent/90"
                            onClick={handleSaveInfo}
                            disabled={savingInfo}
                          >
                            {savingInfo ? (
                              <Loader2 className="size-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle2 className="size-4 mr-2" />
                            )}
                            {savingInfo ? "Đang lưu..." : "Lưu thay đổi"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleCancelInfo}
                            disabled={savingInfo}
                          >
                            Hủy
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ─────── TAB 2: ADDRESSES ─────── */}
              <TabsContent value="addresses" className="mt-0 space-y-6">
                <Card className="border-border/60 shadow-sm">
                  <CardHeader className="pb-4 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="size-5 text-primary" />
                        Địa chỉ nhận hàng
                      </CardTitle>
                      <CardDescription>
                        Quản lý các địa chỉ giao hàng của bạn
                      </CardDescription>
                    </div>
                    <Button
                      className="bg-accent hover:bg-accent/90 shrink-0"
                      onClick={openAddAddress}
                    >
                      <Plus className="size-4 mr-2" />
                      Thêm địa chỉ
                    </Button>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-6">
                    {loadingAddresses ? (
                      renderSkeletonCards()
                    ) : addressError ? (
                      /* Error state */
                      <div className="flex flex-col items-center justify-center py-16">
                        <div className="size-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                          <AlertCircle className="size-10 text-destructive" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Không thể tải địa chỉ</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
                          {addressError}
                        </p>
                        <Button
                          variant="outline"
                          onClick={fetchAddresses}
                        >
                          <Loader2 className="size-4 mr-2" />
                          Thử lại
                        </Button>
                      </div>
                    ) : addresses.length === 0 ? (
                      /* Empty state */
                      <div className="flex flex-col items-center justify-center py-16">
                        <div className="size-20 rounded-full bg-secondary flex items-center justify-center mb-4">
                          <MapPin className="size-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Bạn chưa có địa chỉ nhận hàng</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
                          Thêm địa chỉ để quá trình đặt hàng được nhanh chóng hơn
                        </p>
                        <Button
                          className="bg-accent hover:bg-accent/90"
                          onClick={openAddAddress}
                        >
                          <Plus className="size-4 mr-2" />
                          Thêm địa chỉ đầu tiên
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {addresses?.map((addr) => (
                          <Card
                            key={addr.address_id}
                            className={`relative overflow-hidden transition-all hover:shadow-md ${addr.is_default
                              ? "border-2 border-accent ring-1 ring-accent/20"
                              : "border-border/60"
                              }`}
                          >
                            {/* Default badge */}
                            {addr.is_default && (
                              <div className="absolute top-0 right-0">
                                <div className="bg-accent text-accent-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                                  <Home className="size-3" />
                                  Mặc định
                                </div>
                              </div>
                            )}

                            <CardContent className="pt-5 pb-4">
                              <div className="flex items-start gap-3 mb-2">
                                <div
                                  className={`size-10 rounded-full flex items-center justify-center shrink-0 ${addr.is_default
                                    ? "bg-accent text-accent-foreground"
                                    : "bg-secondary text-muted-foreground"
                                    }`}
                                >
                                  <MapPinned className="size-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-base">{addr.recipient_name}</p>
                                  <p className="text-sm text-muted-foreground">{addr.phone}</p>
                                </div>
                              </div>

                              <div className="ml-[52px] space-y-0.5 text-sm">
                                <p>{addr.address_line}</p>
                                <p className="text-muted-foreground">{addr.ward}</p>
                                <p className="text-muted-foreground">{addr.district}</p>
                                <p className="text-muted-foreground font-medium">{addr.province}</p>
                              </div>

                              <Separator className="my-3" />

                              <div className="flex gap-2 flex-wrap">
                                {!addr.is_default && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 min-w-[80px]"
                                    onClick={() => handleSetDefault(addr.address_id)}
                                    disabled={settingDefaultId === addr.address_id}
                                  >
                                    {settingDefaultId === addr.address_id ? (
                                      <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                                    ) : (
                                      <Home className="size-3.5 mr-1.5" />
                                    )}
                                    Đặt làm mặc định
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={`flex-1 min-w-[80px] ${addr.is_default ? "" : ""}`}
                                  onClick={() => openEditAddress(addr)}
                                >
                                  <Pencil className="size-3.5 mr-1.5" />
                                  Chỉnh sửa
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 min-w-[80px] text-destructive hover:bg-destructive/10 border-destructive/20"
                                  onClick={() => openDeleteDialog(addr.address_id)}
                                >
                                  <Trash2 className="size-3.5 mr-1.5" />
                                  Xóa
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      {/* ─────── ADDRESS DIALOG (Add / Edit) ─────── */}
      <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="size-5 text-primary" />
              {editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
            </DialogTitle>
            <DialogDescription>
              {editingAddress
                ? "Cập nhật thông tin địa chỉ giao hàng"
                : "Thêm địa chỉ giao hàng mới vào tài khoản của bạn"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Recipient name */}
            <div>
              <Label htmlFor="recipient_name">
                Tên người nhận <span className="text-destructive">*</span>
              </Label>
              <Input
                id="recipient_name"
                value={addressForm.recipient_name}
                onChange={(e) => handleAddressChange("recipient_name", e.target.value)}
                placeholder="Nhập tên người nhận"
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">
                Số điện thoại <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                value={addressForm.phone}
                onChange={(e) => handleAddressChange("phone", e.target.value)}
                placeholder="Nhập số điện thoại"
              />
            </div>

            {/* Province */}
            <div>
              <Label htmlFor="province">
                Tỉnh / Thành phố <span className="text-destructive">*</span>
              </Label>
              <SearchableSelect
                placeholder="Chọn tỉnh/thành"
                value={addressForm.province}
                options={provinceOptions}
                onSelect={(opt) => handleAddressChange("province", opt.value)}
              />
            </div>

            {/* District */}
            <div>
              <Label htmlFor="district">
                Quận / Huyện <span className="text-destructive">*</span>
              </Label>
              <SearchableSelect
                placeholder="Chọn quận/huyện"
                value={addressForm.district}
                options={districtOptions}
                onSelect={(opt) => handleAddressChange("district", opt.value)}
                disabled={!addressForm.province}
              />
            </div>

            {/* Ward */}
            <div>
              <Label htmlFor="ward">
                Phường / Xã <span className="text-destructive">*</span>
              </Label>
              <SearchableSelect
                placeholder="Chọn phường/xã"
                value={addressForm.ward}
                options={wardOptions}
                onSelect={(opt) => handleAddressChange("ward", opt.value)}
                disabled={!addressForm.district}
              />
            </div>

            {/* Address detail */}
            <div>
              <Label htmlFor="address_line">
                Địa chỉ chi tiết <span className="text-destructive">*</span>
              </Label>
              <Input
                id="address_line"
                value={addressForm.address_line}
                onChange={(e) => handleAddressChange("address_line", e.target.value)}
                placeholder="Số nhà, tên đường, khu vực"
              />
            </div>

            {/* Default checkbox */}
            <div className="flex items-center gap-3 pt-2">
              <Checkbox
                id="is_default"
                checked={addressForm.is_default}
                onCheckedChange={(checked) =>
                  handleAddressChange("is_default", checked === true)
                }
              />
              <Label htmlFor="is_default" className="cursor-pointer font-normal text-sm">
                Đặt làm địa chỉ mặc định
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAddressDialogOpen(false)} disabled={saving}>
              Hủy
            </Button>
            <Button
              className="bg-accent hover:bg-accent/90"
              onClick={handleSaveAddress}
              disabled={saving}
            >
              {saving && <Loader2 className="size-4 mr-2 animate-spin" />}
              {saving
                ? "Đang lưu..."
                : editingAddress
                  ? "Cập nhật"
                  : "Thêm địa chỉ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─────── DELETE CONFIRMATION ─────── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-5" />
              Xóa địa chỉ
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Bạn có chắc muốn xóa địa chỉ này?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deletingAddress}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deletingAddress}
            >
              {deletingAddress && <Loader2 className="size-4 mr-2 animate-spin" />}
              {deletingAddress ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}