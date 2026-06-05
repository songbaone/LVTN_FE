import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  ShoppingBag,
  Heart,
  MapPin,
  Star,
  Package,
  User,
  Settings,
  Bell,
  TrendingUp,
  Gift,
  CreditCard
} from "lucide-react";

export default function AccountCenter() {
  const customerData = {
    name: "Nguyễn Thu Hương",
    email: "nguyen.huong@email.com",
    phone: "+84 912 345 678",
    memberSince: "Jan 2025",
    membershipTier: "Gold",
    loyaltyPoints: 2450,
    nextTierPoints: 3000,
    stats: {
      totalOrders: 24,
      completedOrders: 20,
      wishlistItems: 12,
      savedAddresses: 3,
      pendingReviews: 2,
      totalReviews: 8,
      totalSpent: 15750000
    }
  };

  const recentOrders = [
    { id: "ORD-1234", date: "2026-06-02", total: 1250000, status: "Delivered", items: 3 },
    { id: "ORD-1235", date: "2026-06-01", total: 890000, status: "Shipping", items: 2 },
    { id: "ORD-1236", date: "2026-05-28", total: 450000, status: "Processing", items: 1 }
  ];

  const quickActions = [
    { name: "Track Orders", icon: Package, href: "/orders", color: "text-accent", bg: "bg-accent/10" },
    { name: "My Wishlist", icon: Heart, href: "/wishlist", color: "text-primary", bg: "bg-primary/10" },
    { name: "Addresses", icon: MapPin, href: "/account/addresses", color: "text-info", bg: "bg-info/10" },
    { name: "My Reviews", icon: Star, href: "/account/reviews", color: "text-warning", bg: "bg-warning/10" },
    { name: "Edit Profile", icon: User, href: "/account/personal", color: "text-success", bg: "bg-success/10" },
    { name: "Settings", icon: Settings, href: "/account/settings", color: "text-muted-foreground", bg: "bg-secondary" }
  ];

  const notifications = [
    { type: "promotion", icon: Gift, message: "Flash Sale: Up to 50% OFF on Baby Clothing", time: "10 min ago", unread: true },
    { type: "order", icon: Package, message: "Your order ORD-1234 has been delivered", time: "2 hours ago", unread: true },
    { type: "system", icon: Bell, message: "New products added to your wishlist category", time: "1 day ago", unread: false }
  ];

  const statusColors: Record<string, string> = {
    "Delivered": "bg-success",
    "Shipping": "bg-info",
    "Processing": "bg-warning",
    "Cancelled": "bg-destructive"
  };

  const progressToNextTier = (customerData.loyaltyPoints / customerData.nextTierPoints) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Account Center</h1>
        <p className="text-muted-foreground">Manage your profile, orders, and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Profile Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center mb-6">
                <Avatar className="size-24 mb-4 border-4 border-primary">
                  <AvatarImage src="" alt="Customer" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    NH
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold mb-1">{customerData.name}</h2>
                <p className="text-sm text-muted-foreground mb-2">{customerData.email}</p>
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-warning">
                    {customerData.membershipTier} Member
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {customerData.loyaltyPoints} pts
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Member since {customerData.memberSince}
                </p>
              </div>

              {/* Loyalty Progress */}
              <div className="mb-6 p-4 rounded-lg bg-secondary">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Next Tier Progress</span>
                  <TrendingUp className="size-4 text-accent" />
                </div>
                <Progress value={progressToNextTier} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">
                  {customerData.nextTierPoints - customerData.loyaltyPoints} points to Platinum
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="text-center p-3 rounded-lg bg-secondary">
                  <ShoppingBag className="size-5 mx-auto mb-2 text-accent" />
                  <p className="text-lg font-bold">{customerData.stats.totalOrders}</p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary">
                  <Heart className="size-5 mx-auto mb-2 text-primary" />
                  <p className="text-lg font-bold">{customerData.stats.wishlistItems}</p>
                  <p className="text-xs text-muted-foreground">Wishlist</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary">
                  <MapPin className="size-5 mx-auto mb-2 text-info" />
                  <p className="text-lg font-bold">{customerData.stats.savedAddresses}</p>
                  <p className="text-xs text-muted-foreground">Addresses</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary">
                  <Star className="size-5 mx-auto mb-2 text-warning" />
                  <p className="text-lg font-bold">{customerData.stats.totalReviews}</p>
                  <p className="text-xs text-muted-foreground">Reviews</p>
                </div>
              </div>

              {/* Lifetime Value */}
              <div className="p-4 rounded-lg border border-accent/20 bg-accent/5 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="size-5 text-accent" />
                  <span className="text-sm font-medium">Lifetime Value</span>
                </div>
                <p className="text-2xl font-bold text-accent">
                  {customerData.stats.totalSpent.toLocaleString()} ₫
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Across {customerData.stats.completedOrders} completed orders
                </p>
              </div>

              <Link to="/account/personal">
                <Button variant="outline" className="w-full">
                  <User className="size-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {quickActions.map((action) => (
                  <Link key={action.name} to={action.href}>
                    <div className={`flex flex-col items-center p-6 rounded-lg border-2 border-border hover:border-primary transition-all cursor-pointer ${action.bg}`}>
                      <action.icon className={`size-8 mb-3 ${action.color}`} />
                      <span className="text-sm font-medium text-center">{action.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Button variant="link" className="text-accent" asChild>
                <Link to="/orders">View All Orders</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-lg bg-secondary flex items-center justify-center">
                        <Package className="size-6 text-accent" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">{order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.date} • {order.items} items
                        </p>
                        <p className="text-sm font-medium text-accent mt-1">
                          {order.total.toLocaleString()} ₫
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={statusColors[order.status]}>{order.status}</Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/orders/${order.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="size-5 text-warning" />
                  Pending Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-muted-foreground text-sm mb-4">
                    You have {customerData.stats.pendingReviews} products waiting for your review
                  </p>
                  <Button className="w-full bg-accent hover:bg-accent/90" asChild>
                    <Link to="/account/reviews?filter=pending">
                      Write Reviews
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="size-5 text-info" />
                  Notifications
                  <Badge className="bg-destructive ml-auto">{notifications.filter(n => n.unread).length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notification, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg flex items-start gap-3 ${
                        notification.unread ? "bg-accent/10 border border-accent/20" : "bg-secondary"
                      }`}
                    >
                      <notification.icon className="size-4 mt-0.5 flex-shrink-0 text-accent" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" size="sm" asChild>
                    <Link to="/account/notifications">View All Notifications</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
