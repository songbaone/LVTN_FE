import { useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  User,
  MapPin,
  CreditCard,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  MessageSquare,
  ArrowLeft,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminOrderDetail() {
  const [orderStatus, setOrderStatus] = useState("confirmed");

  const order = {
    id: "ORD-2026-001234",
    date: "2026-06-04 10:30",
    customer: {
      name: "Nguyễn Thu Hương",
      email: "nguyen.huong@email.com",
      phone: "+84 912 345 678",
      customerId: "CUST-123",
    },
    shipping: {
      receiverName: "Nguyễn Thu Hương",
      phone: "+84 912 345 678",
      address: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, Hồ Chí Minh",
    },
    payment: {
      method: "VNPay",
      status: "Paid",
      transactionId: "TXN123456789",
      paidAt: "2026-06-04 10:32",
    },
    coupon: {
      code: "SUMMER2026",
      discount: 100000,
    },
    items: [
      {
        id: 1,
        name: "Organic Cotton Onesie Set",
        sku: "BC-OCS-001",
        quantity: 2,
        price: 450000,
        total: 900000,
        image: "🧸",
      },
      {
        id: 2,
        name: "Baby Monitor Premium",
        sku: "SM-BMP-002",
        quantity: 1,
        price: 1250000,
        total: 1250000,
        image: "📹",
      },
      {
        id: 3,
        name: "Feeding Set",
        sku: "SF-SFS-003",
        quantity: 1,
        price: 320000,
        total: 320000,
        image: "🍽️",
      },
    ],
    subtotal: 2470000,
    shippingCost: 50000,
    discount: 100000,
    total: 2420000,
    notes:
      "Please deliver before 5 PM. Leave package with building security if not home.",
  };

  const timeline = [
    {
      status: "Pending",
      date: "2026-06-04 10:30",
      completed: true,
      icon: Clock,
      note: "Order placed and payment initiated",
    },
    {
      status: "Confirmed",
      date: "2026-06-04 11:00",
      completed: true,
      icon: CheckCircle,
      note: "Payment confirmed, order verified",
    },
    {
      status: "Shipping",
      date: "2026-06-05 09:15",
      completed: false,
      icon: Truck,
      note: "Package shipped with tracking: TRK123456",
    },
    {
      status: "Delivered",
      date: "",
      completed: false,
      icon: Package,
      note: "Awaiting delivery confirmation",
    },
  ];

  const handleStatusUpdate = (newStatus: string) => {
    setOrderStatus(newStatus);
    toast.success(`Order status updated to ${newStatus}`);
  };

  const handlePrintInvoice = () => {
    toast.success("Invoice is being prepared for printing");
  };

  const handleSendEmail = () => {
    toast.success("Email notification sent to customer");
  };

  const statusColors: Record<string, string> = {
    Pending: "bg-warning text-warning-foreground",
    Confirmed: "bg-info text-info-foreground",
    Shipping: "bg-primary text-primary-foreground",
    Delivered: "bg-success text-success-foreground",
    Cancelled: "bg-destructive text-destructive-foreground",
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Link to="/admin/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Order {order.id}</h1>
            <p className="text-muted-foreground">Created on {order.date}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSendEmail}>
              <Mail className="size-4 mr-2" />
              Send Email
            </Button>
            <Button variant="outline" onClick={handlePrintInvoice}>
              <Printer className="size-4 mr-2" />
              Print Invoice
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {timeline.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.status}
                      className="flex gap-4 pb-8 last:pb-0 relative"
                    >
                      <div className="relative">
                        <div
                          className={`size-12 rounded-full flex items-center justify-center border-4 border-background ${
                            step.completed
                              ? "bg-success text-success-foreground"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          <Icon className="size-6" />
                        </div>
                        {index < timeline.length - 1 && (
                          <div
                            className={`absolute left-1/2 top-12 w-0.5 h-8 -translate-x-1/2 ${
                              step.completed ? "bg-success" : "bg-border"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 pt-2">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-semibold text-lg">{step.status}</p>
                          {step.completed && (
                            <Badge className="bg-success">Completed</Badge>
                          )}
                        </div>
                        {step.date && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {step.date}
                          </p>
                        )}
                        <p className="text-sm">{step.note}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="size-12 rounded-lg bg-secondary flex items-center justify-center text-2xl flex-shrink-0">
                              {item.image}
                            </div>
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.sku}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.price.toLocaleString()} ₫
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.total.toLocaleString()} ₫
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Separator className="my-6" />

              <div className="space-y-3 max-w-sm ml-auto">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span className="font-medium text-foreground">
                    {order.subtotal.toLocaleString()} ₫
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping:</span>
                  <span className="font-medium text-foreground">
                    {order.shipping.toLocaleString()} ₫
                  </span>
                </div>
                <div className="flex justify-between text-success">
                  <span>Discount ({order.coupon.code}):</span>
                  <span className="font-medium">
                    -{order.discount.toLocaleString()} ₫
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-accent">
                    {order.total.toLocaleString()} ₫
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="size-5" />
                  Customer Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-secondary">
                  <p className="text-muted-foreground">{order.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Right Column (1/3) */}
        <div className="space-y-6">
          {/* Order Status Management */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={orderStatus} onValueChange={handleStatusUpdate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shipping">Shipping</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <div className="space-y-2">
                <Button className="w-full bg-success hover:bg-success/90">
                  <CheckCircle className="size-4 mr-2" />
                  Confirm Order
                </Button>
                <Button className="w-full" variant="outline">
                  <Truck className="size-4 mr-2" />
                  Mark as Shipped
                </Button>
                <Button className="w-full" variant="outline">
                  <Package className="size-4 mr-2" />
                  Mark as Delivered
                </Button>
                <Button className="w-full" variant="destructive">
                  <XCircle className="size-4 mr-2" />
                  Cancel Order
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="size-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    NH
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{order.customer.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ID: {order.customer.customerId}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="text-sm">{order.customer.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Phone
                  </p>
                  <p className="text-sm">{order.customer.phone}</p>
                </div>
              </div>
              <Separator />
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to={`/admin/users/${order.customer.customerId}`}>
                  View Customer Profile
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Receiver
                </p>
                <p className="text-sm font-semibold">
                  {order.shipping.receiverName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Phone
                </p>
                <p className="text-sm">{order.shipping.phone}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Delivery Address
                </p>
                <p className="text-sm leading-relaxed">
                  {order.shipping.address}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="size-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Method:
                </span>
                <Badge className="bg-info">{order.payment.method}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Status:
                </span>
                <Badge className="bg-success">{order.payment.status}</Badge>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Transaction ID
                </p>
                <p className="text-xs font-mono mt-1 p-2 bg-secondary rounded">
                  {order.payment.transactionId}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Paid At
                </p>
                <p className="text-sm">{order.payment.paidAt}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
