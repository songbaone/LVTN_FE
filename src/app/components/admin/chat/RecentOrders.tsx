import { Package, ExternalLink } from "lucide-react";
import type { Order } from "./types";

interface RecentOrdersProps {
  orders: Order[];
}

const statusColors: Record<string, string> = {
  "Đã giao": "text-green-600 bg-green-50",
  "Đang giao": "text-blue-600 bg-blue-50",
  "Đã xác nhận": "text-amber-600 bg-amber-50",
  "Chờ xử lý": "text-gray-600 bg-gray-50",
  "Đã hủy": "text-red-600 bg-red-50",
};

export default function RecentOrders({ orders }: RecentOrdersProps) {
  if (orders.length === 0) return null;

  return (
    <div className="px-4 py-3">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
        Đơn hàng gần đây
      </h4>
      <div className="space-y-1.5">
        {orders.slice(0, 5).map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-white/50">
                <Package className="size-3.5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {order.code}
                </p>
                <p className="text-[10px] text-muted-foreground">{order.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`inline-flex items-center px-1.5 py-0.5 text-[9px] font-medium rounded ${
                  statusColors[order.status] || "text-gray-600 bg-gray-50"
                }`}
              >
                {order.status}
              </span>
              <span className="text-xs font-semibold text-foreground">
                {(order.amount / 1000).toFixed(0)}k
              </span>
              <ExternalLink className="size-3 text-muted-foreground/0 group-hover:text-muted-foreground transition-all" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}