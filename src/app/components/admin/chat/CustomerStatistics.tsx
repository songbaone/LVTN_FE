import { ShoppingBag, Star, Heart, DollarSign } from "lucide-react";
import type { CustomerStatistics as Stats } from "./types";

interface CustomerStatisticsProps {
  statistics: Stats;
}

export default function CustomerStatistics({ statistics }: CustomerStatisticsProps) {
  const items = [
    {
      label: "Đơn hàng",
      value: statistics.totalOrders,
      icon: ShoppingBag,
      color: "text-blue-500 bg-blue-50",
    },
    {
      label: "Đánh giá",
      value: statistics.totalReviews,
      icon: Star,
      color: "text-amber-500 bg-amber-50",
    },
    {
      label: "Yêu thích",
      value: statistics.wishlistCount,
      icon: Heart,
      color: "text-rose-500 bg-rose-50",
    },
    {
      label: "Đã chi",
      value: `${(statistics.totalSpending / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      color: "text-green-500 bg-green-50",
    },
  ];

  return (
    <div className="px-4 py-3">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
        Thống kê
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className={`p-1.5 rounded-lg ${item.color}`}>
              <item.icon className="size-3.5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">{item.value}</p>
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}