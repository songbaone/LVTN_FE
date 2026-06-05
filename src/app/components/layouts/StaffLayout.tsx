import { Outlet, Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  MessageCircle,
  Baby,
  Bell,
  LogOut
} from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { cn } from "../ui/utils";

export default function StaffLayout() {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/staff", icon: LayoutDashboard },
    { name: "Order Processing", href: "/staff/orders", icon: ShoppingCart },
    { name: "Inventory", href: "/staff/inventory", icon: Package },
    { name: "Customer Support", href: "/staff/support", icon: MessageCircle },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <Link to="/staff" className="flex items-center gap-2 text-xl font-bold text-primary">
            <Baby className="size-7" />
            <span>Staff Portal</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== "/staff" && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary"
                )}
              >
                <item.icon className="size-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Back to Store */}
        <div className="p-4 border-t border-border">
          <Link to="/">
            <Button variant="outline" className="w-full">Back to Store</Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Staff Portal</h1>
              <p className="text-sm text-muted-foreground">Manage operations and customer support</p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="size-5" />
                <Badge className="absolute -top-1 -right-1 size-4 flex items-center justify-center p-0 bg-destructive text-[10px]">
                  3
                </Badge>
              </Button>

              <div className="flex items-center gap-3 pl-3 border-l border-border">
                <Avatar className="size-9">
                  <AvatarImage src="" alt="Staff" />
                  <AvatarFallback className="bg-primary text-primary-foreground">ST</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium">Staff Member</div>
                  <div className="text-xs text-muted-foreground">staff@babystore.com</div>
                </div>
              </div>

              <Button variant="ghost" size="icon">
                <LogOut className="size-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
