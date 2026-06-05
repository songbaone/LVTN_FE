import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Bell,
  Gift,
  Package,
  Settings as SettingsIcon,
  Trash2,
  Check,
  CheckCheck,
  AlertCircle,
  Tag,
  Megaphone,
  Info
} from "lucide-react";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: "promotion" | "order" | "system" | "info";
  icon: any;
  iconColor: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  actionLabel?: string;
  actionHref?: string;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "promotion",
      icon: Gift,
      iconColor: "text-accent",
      title: "Flash Sale Alert!",
      message: "Up to 50% OFF on Baby Clothing. Don't miss out on amazing deals ending tonight at midnight!",
      time: "10 min ago",
      unread: true,
      actionLabel: "Shop Now",
      actionHref: "/products?category=clothing"
    },
    {
      id: "2",
      type: "order",
      icon: Package,
      iconColor: "text-success",
      title: "Order Delivered",
      message: "Your order ORD-1234 has been successfully delivered. Thank you for shopping with us!",
      time: "2 hours ago",
      unread: true,
      actionLabel: "View Order",
      actionHref: "/orders/ORD-1234"
    },
    {
      id: "3",
      type: "promotion",
      icon: Tag,
      iconColor: "text-accent",
      title: "Special Coupon Just For You",
      message: "Use code WELCOME2026 for 100,000₫ off on your next purchase over 500,000₫",
      time: "5 hours ago",
      unread: true,
      actionLabel: "Use Coupon"
    },
    {
      id: "4",
      type: "order",
      icon: Package,
      iconColor: "text-info",
      title: "Order Shipped",
      message: "Your order ORD-1235 is on its way! Track your package with code TRK123456.",
      time: "1 day ago",
      unread: false,
      actionLabel: "Track Package",
      actionHref: "/orders/ORD-1235"
    },
    {
      id: "5",
      type: "system",
      icon: Bell,
      iconColor: "text-warning",
      title: "Wishlist Price Drop",
      message: "Baby Monitor Premium from your wishlist is now 15% off! Limited time offer.",
      time: "1 day ago",
      unread: false,
      actionLabel: "View Product"
    },
    {
      id: "6",
      type: "info",
      icon: Info,
      iconColor: "text-info",
      title: "New Products Added",
      message: "Check out our latest collection of organic baby clothing and eco-friendly toys!",
      time: "2 days ago",
      unread: false,
      actionLabel: "Browse Collection"
    },
    {
      id: "7",
      type: "promotion",
      icon: Megaphone,
      iconColor: "text-accent",
      title: "Member Exclusive Sale",
      message: "Gold Members get early access to our Summer Sale starting June 10th!",
      time: "3 days ago",
      unread: false
    },
    {
      id: "8",
      type: "order",
      icon: Package,
      iconColor: "text-success",
      title: "Order Confirmed",
      message: "Your order ORD-1236 has been confirmed and is being prepared for shipment.",
      time: "4 days ago",
      unread: false,
      actionLabel: "View Order",
      actionHref: "/orders/ORD-1236"
    },
    {
      id: "9",
      type: "system",
      icon: AlertCircle,
      iconColor: "text-warning",
      title: "Review Reminder",
      message: "You have 2 products waiting for your review. Share your experience with other parents!",
      time: "5 days ago",
      unread: false,
      actionLabel: "Write Reviews",
      actionHref: "/account/reviews"
    },
    {
      id: "10",
      type: "info",
      icon: Info,
      iconColor: "text-info",
      title: "Account Security",
      message: "We recommend changing your password every 3 months to keep your account secure.",
      time: "1 week ago",
      unread: false,
      actionLabel: "Change Password",
      actionHref: "/account/change-password"
    }
  ]);

  const [activeTab, setActiveTab] = useState("all");

  const getFilteredNotifications = (filter: string) => {
    if (filter === "all") return notifications;
    return notifications.filter(notif => notif.type === filter);
  };

  const filteredNotifications = getFilteredNotifications(activeTab);
  const unreadCount = notifications.filter(n => n.unread).length;
  const unreadByType = {
    all: unreadCount,
    promotion: notifications.filter(n => n.unread && n.type === "promotion").length,
    order: notifications.filter(n => n.unread && n.type === "order").length,
    system: notifications.filter(n => n.unread && n.type === "system").length,
    info: notifications.filter(n => n.unread && n.type === "info").length
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, unread: false } : notif
      )
    );
    toast.success("Marked as read");
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, unread: false }))
    );
    toast.success("All notifications marked as read");
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast.success("Notification deleted");
  };

  const handleClearAll = () => {
    const filter = activeTab;
    if (filter === "all") {
      setNotifications([]);
    } else {
      setNotifications(prev => prev.filter(notif => notif.type !== filter));
    }
    toast.success("Notifications cleared");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <Badge className="bg-destructive">{unreadCount} new</Badge>
            )}
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck className="size-4 mr-2" />
                Mark All Read
              </Button>
            )}
            {filteredNotifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-4 mr-2" />
                Clear {activeTab === "all" ? "All" : "These"}
              </Button>
            )}
          </div>
        </div>
        <p className="text-muted-foreground">Stay updated with your orders, promotions, and more</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="all" className="relative">
            All
            {unreadByType.all > 0 && (
              <Badge className="ml-2 bg-accent text-xs px-1.5 py-0">{unreadByType.all}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="promotion" className="relative">
            Promos
            {unreadByType.promotion > 0 && (
              <Badge className="ml-2 bg-accent text-xs px-1.5 py-0">{unreadByType.promotion}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="order" className="relative">
            Orders
            {unreadByType.order > 0 && (
              <Badge className="ml-2 bg-accent text-xs px-1.5 py-0">{unreadByType.order}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="system" className="relative">
            System
            {unreadByType.system > 0 && (
              <Badge className="ml-2 bg-accent text-xs px-1.5 py-0">{unreadByType.system}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="info" className="relative">
            Info
            {unreadByType.info > 0 && (
              <Badge className="ml-2 bg-accent text-xs px-1.5 py-0">{unreadByType.info}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {["all", "promotion", "order", "system", "info"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            {getFilteredNotifications(tab).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="size-20 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <Bell className="size-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No notifications</h3>
                  <p className="text-muted-foreground text-center">
                    {tab === "all"
                      ? "You're all caught up!"
                      : `No ${tab} notifications at the moment`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {getFilteredNotifications(tab).map((notification) => {
                  const Icon = notification.icon;
                  return (
                    <Card
                      key={notification.id}
                      className={`group hover:shadow-md transition-all ${
                        notification.unread
                          ? "border-l-4 border-l-accent bg-accent/5"
                          : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className={`size-12 rounded-full ${notification.unread ? "bg-accent/20" : "bg-secondary"} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`size-6 ${notification.iconColor}`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className={`font-semibold ${notification.unread ? "text-foreground" : "text-muted-foreground"}`}>
                                {notification.title}
                              </h3>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {notification.time}
                              </span>
                            </div>

                            <p className={`text-sm mb-3 ${notification.unread ? "text-foreground" : "text-muted-foreground"}`}>
                              {notification.message}
                            </p>

                            <div className="flex items-center gap-2 flex-wrap">
                              {notification.actionLabel && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-accent hover:bg-accent hover:text-accent-foreground"
                                >
                                  {notification.actionLabel}
                                </Button>
                              )}

                              {notification.unread && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <Check className="size-3 mr-1" />
                                  Mark as read
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(notification.id)}
                                className="text-muted-foreground hover:text-destructive ml-auto"
                              >
                                <Trash2 className="size-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>

                          {/* Unread indicator */}
                          {notification.unread && (
                            <div className="size-2 rounded-full bg-accent flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Notification Settings */}
      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-secondary flex items-center justify-center">
                <SettingsIcon className="size-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Notification Preferences</h3>
                <p className="text-sm text-muted-foreground">
                  Manage which notifications you want to receive
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <SettingsIcon className="size-4 mr-2" />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
