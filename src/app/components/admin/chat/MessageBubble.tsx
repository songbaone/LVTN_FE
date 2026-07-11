import { useMemo } from "react";
import { Check, CheckCheck } from "lucide-react";
import { cn } from "../../ui/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import type { ChatMessage } from "./types";
import AttachmentRenderer from "./AttachmentRenderer";

interface MessageBubbleProps {
  message: ChatMessage;
  showSender?: boolean;
  /**
   * The current user's user_id.
   * Ownership is determined by: message.senderId === currentUserId
   * If true → render RIGHT (justify-end, outgoing style)
   * If false → render LEFT (justify-start, incoming style)
   */
  currentUserId?: number | string | null;
}

export default function MessageBubble({ message, showSender = true, currentUserId }: MessageBubbleProps) {
  // Ownership is determined purely by senderId comparison
  // This is the ONLY correct way to determine alignment
  const isOwn = useMemo(() => {
    if (currentUserId == null || message.senderId == null) return false;
    return String(message.senderId) === String(currentUserId);
  }, [message.senderId, currentUserId]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    const parts = name.split(" ");
    return parts.length > 1
      ? parts[parts.length - 2][0] + parts[parts.length - 1][0]
      : name.slice(0, 2).toUpperCase();
  };

  console.log("aaaaa: ", {
    currentUserId,
    senderId: message.senderId,
    isOwn,
    content: message.content,
  });
  return (
    <div
      className={cn(
        "flex mb-3 gap-2",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      {/* Sender Avatar - only shown on the left for other people's messages */}
      {!isOwn && (
        <div className="flex-shrink-0 self-end">
          <Avatar className="size-8 rounded-full">
            <AvatarImage src={message.senderAvatar ?? undefined} alt={message.senderName} />
            <AvatarFallback className="bg-pink-100 text-pink-600 text-[10px] font-medium">
              {getInitials(message.senderName)}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      <div className={cn("max-w-[75%] min-w-[60px] flex flex-col")}>
        {/* Sender Name - for other people's messages */}
        {!isOwn && showSender && message.senderName && (
          <span className="text-[11px] text-muted-foreground mb-0.5 ml-1">
            {message.senderName}
          </span>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            "px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words",
            isOwn
              ? "bg-pink-500 text-white rounded-2xl rounded-br-md"
              : "bg-muted text-gray-900 rounded-2xl rounded-bl-md border border-border/30"
          )}
        >
          {/* Text content */}
          {message.content && <p className="mb-2 last:mb-0">{message.content}</p>}

          {/* Attachments (images + files) */}
          {message.attachments && message.attachments.length > 0 && (
            <div className={cn(message.content ? "mt-2" : "")}>
              <AttachmentRenderer attachments={message.attachments} isMine={isOwn} />
            </div>
          )}
        </div>

        {/* Time + Seen */}
        <div
          className={cn(
            "flex items-center gap-1 mt-0.5 px-1",
            isOwn ? "justify-end" : "justify-start"
          )}
        >
          <span className="text-[10px] text-muted-foreground">
            {formatTime(message.createdAt)}
          </span>
          {isOwn && (
            message.seen ? (
              <CheckCheck className="size-3 text-blue-400" />
            ) : (
              <Check className="size-3 text-muted-foreground/50" />
            )
          )}
        </div>
      </div>
    </div>
  );
}