import { MessageSquareText } from "lucide-react";

export default function EmptyConversation() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background/50 px-8 text-center">
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="size-28 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <div className="size-20 rounded-xl bg-white/80 flex items-center justify-center shadow-sm">
            <MessageSquareText className="size-10 text-primary/60" />
          </div>
        </div>
        {/* Decorative dots */}
        <div className="absolute -top-2 -right-2 size-3 rounded-full bg-primary/20" />
        <div className="absolute -bottom-1 -left-1 size-2 rounded-full bg-primary/10" />
      </div>

      {/* Heading */}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Chọn một cuộc trò chuyện
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">
        Chọn khách hàng từ danh sách bên trái để bắt đầu hỗ trợ.
      </p>

      {/* Decorative line */}
      <div className="mt-8 flex items-center gap-2 text-muted-foreground/30">
        <div className="w-12 h-px bg-border" />
        <MessageSquareText className="size-3" />
        <div className="w-12 h-px bg-border" />
      </div>
    </div>
  );
}