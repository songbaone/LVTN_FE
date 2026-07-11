import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "../../ui/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import type { ChatRoom } from "./types";

interface ConversationCardProps {
  conversation: ChatRoom;
  isSelected: boolean;
  onClick: () => void;
}

export default function ConversationCard({ conversation, isSelected, onClick }: ConversationCardProps) {
  const getInitials = (name?: string) => {
    if (!name) return "??";
    const parts = name.split(" ");
    return parts.length > 1
      ? parts[parts.length - 2][0] + parts[parts.length - 1][0]
      : name.slice(0, 2);
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) {
      return format(date, "HH:mm");
    }
    if (days === 1) {
      return "Hôm qua";
    }
    if (days < 7) {
      return format(date, "EEEE", { locale: vi });
    }
    return format(date, "dd/MM/yyyy");
  };

  const isOpen = conversation.status === "open";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 px-3 py-3 transition-all duration-200 text-left border-l-2",
        isSelected
          ? "bg-primary/5 border-l-primary"
          : "border-l-transparent hover:bg-muted/30 hover:border-l-muted-foreground/20"
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Avatar className="size-11 rounded-full ring-2 ring-offset-1 ring-white">
          <AvatarImage src={conversation.customerAvatar} alt={conversation.customerName} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
            {getInitials(conversation.customerName)}
          </AvatarFallback>
        </Avatar>
        {isOpen && (
          <span className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-white rounded-full" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={cn(
                "text-sm truncate",
                conversation.unreadCount > 0 ? "font-semibold text-foreground" : "font-medium text-foreground"
              )}
            >
              {conversation.customerName || `Khách #${conversation.customerId}`}
            </span>
            {conversation.status === "closed" && (
              <span className="flex-shrink-0 inline-flex items-center px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-bold rounded-sm leading-none">
                Đã đóng
              </span>
            )}
            {conversation.assignedStaffName && (
              <span className="flex-shrink-0 inline-flex items-center px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold rounded-sm leading-none">
                {conversation.assignedStaffName}
              </span>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground flex-shrink-0">
            {formatTime(conversation.lastMessageTime)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-1 mt-0.5">
          <p
            className={cn(
              "text-xs truncate flex-1",
              conversation.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"
            )}
          >
            {conversation.lastMessage || "Chưa có tin nhắn"}
          </p>

          <div className="flex items-center gap-1 flex-shrink-0">
            {conversation.unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full">
                {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}