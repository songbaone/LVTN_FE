import { RefreshCw } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { cn } from "../../ui/utils";
import type { ChatRoom } from "./types";

interface ChatHeaderProps {
  conversation: ChatRoom | null;
  onAssign?: () => void;
  onClose?: () => void;
}

export default function ChatHeader({ conversation, onAssign, onClose }: ChatHeaderProps) {
  if (!conversation) return null;

  const getInitials = (name?: string) => {
    if (!name) return "??";
    const parts = name.split(" ");
    return parts.length > 1
      ? parts[parts.length - 2][0] + parts[parts.length - 1][0]
      : name.slice(0, 2);
  };

  const formatLastActive = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 5) return "Hoạt động gần đây";
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return `${Math.floor(hours / 24)} ngày trước`;
  };

  const isOpen = conversation.status === "open";

  return (
    <div className="flex-shrink-0 bg-card border-b border-border">
      <div className="flex items-center justify-between px-5 py-3">
        {/* Left: Avatar + Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <Avatar className="size-10 rounded-full ring-2 ring-offset-1 ring-white">
              <AvatarImage src={conversation.customerAvatar} alt={conversation.customerName} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                {getInitials(conversation.customerName)}
              </AvatarFallback>
            </Avatar>
            <span
              className={cn(
                "absolute bottom-0 right-0 size-2.5 border-2 border-white rounded-full",
                isOpen ? "bg-green-500" : "bg-gray-400"
              )}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground truncate">
                {conversation.customerName || `Khách #${conversation.customerId}`}
              </h3>
              {conversation.assignedStaffName && (
                <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold rounded-sm leading-none">
                  {conversation.assignedStaffName}
                </span>
              )}
              {conversation.status === "closed" && (
                <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-bold rounded-sm leading-none">
                  Đã đóng
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isOpen
                ? "Đang hoạt động"
                : conversation.status === "closed"
                ? "Đã kết thúc"
                : formatLastActive(conversation.lastMessageTime)}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {!conversation.assignedStaffName && isOpen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAssign}
              className="h-8 text-xs rounded-lg text-muted-foreground hover:text-foreground"
            >
              Nhận phòng
            </Button>
          )}
          {isOpen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 text-xs rounded-lg text-muted-foreground hover:text-destructive"
            >
              Đóng
            </Button>
          )}
          <div className="w-px h-6 bg-border mx-1" />
          <Button variant="ghost" size="icon" className="size-8 rounded-lg text-muted-foreground hover:text-foreground">
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
