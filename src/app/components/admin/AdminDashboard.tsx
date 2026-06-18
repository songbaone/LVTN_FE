import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export default function AdminDashboard() {
  const kpis = [
    {
      title: "Tổng doanh thu",
      value: "₫45,230,000",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-accent",
    },
    {
      title: "Tổng đơn hàng",
      value: "1,234",
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCart,
      color: "text-info",
    },
    {
      title: "Số lượng sản phẩm",
      value: "856",
      change: "+5.1%",
      trend: "up",
      icon: Package,
      color: "text-warning",
    },
    {
      title: "Số lượng khách hàng",
      value: "3,421",
      change: "-2.3%",
      trend: "down",
      icon: Users,
      color: "text-success",
    },
  ];

  const revenueData = [
    { month: "Jan", revenue: 32000000 },
    { month: "Feb", revenue: 35000000 },
    { month: "Mar", revenue: 38000000 },
    { month: "Apr", revenue: 41000000 },
    { month: "May", revenue: 43000000 },
    { month: "Jun", revenue: 45230000 },
  ];

  const orderData = [
    { day: "Mon", orders: 120 },
    { day: "Tue", orders: 145 },
    { day: "Wed", orders: 132 },
    { day: "Thu", orders: 156 },
    { day: "Fri", orders: 189 },
    { day: "Sat", orders: 203 },
    { day: "Sun", orders: 178 },
  ];

  const lowStockProducts = [
    {
      id: 1,
      name: "Organic Cotton Onesie Set",
      sku: "BC-OCS-001",
      stock: 5,
      threshold: 10,
    },
    {
      id: 2,
      name: "Baby Monitor Premium",
      sku: "SM-BMP-002",
      stock: 3,
      threshold: 8,
    },
    {
      id: 3,
      name: "Silicone Feeding Set",
      sku: "SF-SFS-003",
      stock: 2,
      threshold: 15,
    },
    {
      id: 4,
      name: "Soft Plush Toy Bear",
      sku: "CT-SPT-004",
      stock: 7,
      threshold: 20,
    },
  ];

  const recentOrders = [
    {
      id: "ORD-1234",
      customer: "Nguyễn Thu Hương",
      amount: 1250000,
      status: "Processing",
      date: "2026-06-04 10:30",
    },
    {
      id: "ORD-1235",
      customer: "Trần Minh Anh",
      amount: 450000,
      status: "Shipping",
      date: "2026-06-04 09:15",
    },
    {
      id: "ORD-1236",
      customer: "Lê Thanh Mai",
      amount: 890000,
      status: "Delivered",
      date: "2026-06-03 16:45",
    },
    {
      id: "ORD-1237",
      customer: "Phạm Văn Nam",
      amount: 2100000,
      status: "Processing",
      date: "2026-06-03 14:20",
    },
  ];

  const statusColors: Record<string, string> = {
    Processing: "bg-warning",
    Shipping: "bg-info",
    Delivered: "bg-success",
    Cancelled: "bg-destructive",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Chào mừng bạn đã quay trở lại! Đây là những gì diễn ra hôm nay.
          </p>
        </div>
        <Button className="bg-accent hover:bg-accent/90">Tải báo cáo</Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-secondary ${kpi.color}`}>
                  <kpi.icon className="size-6" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${kpi.trend === "up" ? "text-success" : "text-destructive"}`}
                >
                  {kpi.trend === "up" ? (
                    <TrendingUp className="size-4" />
                  ) : (
                    <TrendingDown className="size-4" />
                  )}
                  <span>{kpi.change}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {kpi.title}
                </p>
                <p className="text-2xl font-bold">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu trong 6 tháng gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue",
                  color: "hsl(var(--accent))",
                },
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-accent)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Orders This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                orders: {
                  label: "Orders",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="orders" fill="var(--color-primary)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-warning" />
              Low Stock Alerts
            </CardTitle>
            <Button variant="link" className="text-accent">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {product.sku}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="secondary"
                        className="bg-destructive/10 text-destructive"
                      >
                        {product.stock} left
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="link" className="text-accent">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.amount.toLocaleString()} ₫</TableCell>
                    <TableCell>
                      <Badge className={statusColors[order.status]}>
                        {order.status}
                      </Badge>
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
