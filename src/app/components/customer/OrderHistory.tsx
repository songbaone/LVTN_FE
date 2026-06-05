import { Link } from "react-router";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export default function OrderHistory() {
  const orders = [
    { id: "ORD-001", date: "2026-06-01", total: 2320000, status: "Delivered", items: 3 },
    { id: "ORD-002", date: "2026-05-28", total: 1450000, status: "Shipping", items: 2 },
    { id: "ORD-003", date: "2026-05-20", total: 890000, status: "Processing", items: 1 }
  ];

  const statusColors: Record<string, string> = {
    "Delivered": "bg-success",
    "Shipping": "bg-info",
    "Processing": "bg-warning"
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Order History</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-lg mb-1">Order {order.id}</p>
                  <p className="text-sm text-muted-foreground">Placed on {order.date} • {order.items} items</p>
                  <p className="text-lg font-bold text-accent mt-2">{order.total.toLocaleString()} ₫</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <Badge className={statusColors[order.status]}>{order.status}</Badge>
                  <Button variant="outline" asChild><Link to={`/orders/${order.id}`}>View Details</Link></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
