import { Star } from "lucide-react";
import type { Review } from "./types";

interface RecentReviewsProps {
  reviews: Review[];
}

export default function RecentReviews({ reviews }: RecentReviewsProps) {
  if (reviews.length === 0) return null;

  return (
    <div className="px-4 py-3">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
        Đánh giá gần đây
      </h4>
      <div className="space-y-2">
        {reviews.slice(0, 3).map((review) => (
          <div
            key={review.id}
            className="p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start gap-2.5">
              <div className="size-8 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                <img
                  src={review.productImage}
                  alt={review.productName}
                  className="size-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {review.productName}
                </p>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-2.5 ${
                        i < review.rating
                          ? "text-amber-400 fill-amber-400"
                          : "text-muted-foreground/20"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                  "{review.comment}"
                </p>
                <p className="text-[9px] text-muted-foreground/60 mt-0.5">
                  {review.date}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}