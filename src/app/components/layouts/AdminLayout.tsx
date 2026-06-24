import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  Tag,
  Ticket,
  MessageSquare,
  CreditCard,
  BarChart3,
  Settings,
  FileSpreadsheet,
  Bell,
  Search,
  LogOut,
  Baby,
  Menu,
  X,
  History,
  ChevronDown,
  Layers,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { useState } from "react";
import { cn } from "../ui/utils";

import Swal from "sweetalert2";
export default function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(
    location.pathname.startsWith("/admin/product"),
  );

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    {
      name: "Sản phẩm",
      icon: Package,
      children: [
        { name: "Product List", href: "/admin/products", icon: Package },
        { name: "Product Variants", href: "/admin/product-variants", icon: Layers },
      ],
    },
    { name: "Đơn hàng", href: "/admin/orders", icon: ShoppingCart },
    { name: "Tồn kho", href: "/admin/inventory", icon: FileSpreadsheet },
    { name: "Lịch sử tồn kho", href: "/admin/inventory/history", icon: History },
    { name: "Người dùng", href: "/admin/users", icon: Users },
    { name: "Danh mục sản phẩm", href: "/admin/categories", icon: FolderTree },
    { name: "Thương hiệu", href: "/admin/brands", icon: Tag },
    { name: "Khuyến mãi", href: "/admin/coupons", icon: Ticket },
    { name: "Đánh giá", href: "/admin/reviews", icon: MessageSquare },
    { name: "Thanh toán", href: "/admin/payments", icon: CreditCard },
    { name: "Báo cáo", href: "/admin/reports", icon: BarChart3 },
    { name: "Cài đặt", href: "/admin/settings", icon: Settings },
  ];
  const navigate = useNavigate();
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Đăng xuất?",
      text: "Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      localStorage.removeItem("AccessToken");
      localStorage.removeItem("AccessTokenAdmin");
      localStorage.removeItem("User");

      await Swal.fire({
        icon: "success",
        title: "Đăng xuất thành công",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/admin-login", { replace: true });
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-card border-r border-border transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20",
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {sidebarOpen && (
            <Link
              to="/admin"
              className="flex items-center gap-2 text-xl font-bold text-primary"
            >
              <Baby className="size-7" />
              <span>Admin Portal</span>
            </Link>
          )}
          {!sidebarOpen && (
            <Link to="/admin" className="mx-auto">
              <Baby className="size-7 text-primary" />
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navigation.map((item) => {
            if ("children" in item) {
              const isParentActive = item.children.some(
                (child) =>
                  location.pathname === child.href ||
                  (child.href !== "/admin" &&
                    location.pathname.startsWith(child.href)),
              );
              return (
                <div key={item.name}>
                  <button
                    onClick={() => setProductsOpen(!productsOpen)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full text-left",
                      isParentActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-secondary",
                    )}
                  >
                    <item.icon className="size-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1">{item.name}</span>
                        <ChevronDown
                          className={cn(
                            "size-4 transition-transform",
                            productsOpen && "rotate-180",
                          )}
                        />
                      </>
                    )}
                  </button>
                  {sidebarOpen && productsOpen && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children.map((child) => {
                        const isChildActive =
                          location.pathname === child.href ||
                          (child.href !== "/admin" &&
                            location.pathname.startsWith(child.href));
                        return (
                          <Link
                            key={child.name}
                            to={child.href}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                              isChildActive
                                ? "bg-accent text-accent-foreground font-medium"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                            )}
                          >
                            <child.icon className="size-4 flex-shrink-0" />
                            <span>{child.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive =
              location.pathname === item.href ||
              (item.href !== "/admin" &&
                location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary",
                )}
              >
                <item.icon className="size-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Back to Store */}
        <div className="p-4 border-t border-border">
          <Link to="/">
            <Button
              variant="outline"
              className="w-full"
              size={sidebarOpen ? "default" : "icon"}
            >
              {sidebarOpen ? "Trở về cửa hàng" : "←"}
            </Button>
          </Link>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            className="w-64 h-full bg-card border-r border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <Link
                to="/admin"
                className="flex items-center gap-2 text-xl font-bold text-primary"
              >
                <Baby className="size-7" />
                <span>Admin Portal</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="size-5" />
              </Button>
            </div>
            <nav className="p-4 space-y-1">
              {navigation.map((item) => {
                if ("children" in item) {
                  return (
                    <div key={item.name}>
                      <div
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-foreground",
                        )}
                      >
                        <item.icon className="size-5 flex-shrink-0" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="ml-6 mt-1 space-y-1">
                        {item.children.map((child) => {
                          const isChildActive =
                            location.pathname === child.href ||
                            (child.href !== "/admin" &&
                              location.pathname.startsWith(child.href));
                          return (
                            <Link
                              key={child.name}
                              to={child.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                                isChildActive
                                  ? "bg-accent text-accent-foreground font-medium"
                                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                              )}
                            >
                              <child.icon className="size-4 flex-shrink-0" />
                              <span>{child.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                const isActive =
                  location.pathname === item.href ||
                  (item.href !== "/admin" &&
                    location.pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-secondary",
                    )}
                  >
                    <item.icon className="size-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-card border-b border-border px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="size-5" />
              </Button>
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm thông tin..."
                  className="pl-10 w-80 bg-secondary"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="size-5" />
                <Badge className="absolute -top-1 -right-1 size-4 flex items-center justify-center p-0 bg-destructive text-[10px]">
                  5
                </Badge>
              </Button>

              <div className="flex items-center gap-3 pl-3 border-l border-border">
                <Avatar className="size-9">
                  <AvatarImage src="" alt="Admin" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    AD
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <div className="text-sm font-medium">Admin User</div>
                  <div className="text-xs text-muted-foreground">
                    admin@babystore.com
                  </div>
                </div>
              </div>

              <Button
                onClick={() => handleLogout()}
                variant="ghost"
                size="icon"
                title="Đăng xuất"
              >
                <LogOut className="size-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
