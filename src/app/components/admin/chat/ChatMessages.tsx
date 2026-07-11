import { useEffect, useRef, useCallback } from "react";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";
import MessageBubble from "./MessageBubble";
import type { ChatMessage } from "./types";
import { getCurrentUserId } from "../../../../helpers/chat/getCurrentUserId";
import { useAdminChatStore } from "../../../../stores/adminChatStore";

interface ChatMessagesProps {
  messages: ChatMessage[];
}

function DateSeparator({ date }: { date: Date }) {
  const getLabel = () => {
    if (isToday(date)) return "Hôm nay";
    if (isYesterday(date)) return "Hôm qua";
    return format(date, "dd/MM/yyyy");
  };

  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-border/50" />
      <span className="text-[11px] font-medium text-muted-foreground flex-shrink-0 px-2">
        {getLabel()}
      </span>
      <div className="flex-1 h-px bg-border/50" />
    </div>
  );
}

const SCROLL_THRESHOLD = 100; // px from bottom to consider "near bottom"
const SCROLL_TOP_THRESHOLD = 150; // px from top to trigger loading older messages

export default function ChatMessages({ messages }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(messages.length);
  const prevLastMessageIdRef = useRef<string | null>(null);
  const isNearBottomRef = useRef(true);
  const prevScrollHeightRef = useRef(0);
  const isPrependingRef = useRef(false);

  // Get current user ID once for all MessageBubble children
  const currentUserId = getCurrentUserId();

  // Store actions for loading more messages
  const loadMoreMessages = useAdminChatStore((s) => s.loadMoreMessages);
  const messagesHasMore = useAdminChatStore((s) => s.messagesHasMore);
  const messagesLoading = useAdminChatStore((s) => s.messagesLoading);

  // Check if user is near the bottom before scroll
  const checkIfNearBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return true;
    const { scrollTop, scrollHeight, clientHeight } = el;
    return scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD;
  }, []);

  // Update isNearBottomRef on user scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      isNearBottomRef.current = checkIfNearBottom();

      // Infinite scroll: detect when user scrolls near the top
      if (el.scrollTop < SCROLL_TOP_THRESHOLD && messagesHasMore && !messagesLoading) {
        // Mark that we're about to prepend, so we can maintain scroll position
        isPrependingRef.current = true;
        prevScrollHeightRef.current = el.scrollHeight;
        loadMoreMessages();
      }
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [checkIfNearBottom, loadMoreMessages, messagesHasMore, messagesLoading]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const currentMessageCount = messages.length;
    const lastMessage = messages[currentMessageCount - 1];
    const lastMessageId = lastMessage ? String(lastMessage.id) : null;
    const prevCount = prevMessageCountRef.current;
    const prevLastId = prevLastMessageIdRef.current;

    // If we prepended messages (older messages loaded), maintain scroll position
    if (isPrependingRef.current && currentMessageCount > prevCount) {
      const newScrollHeight = el.scrollHeight;
      const heightDiff = newScrollHeight - prevScrollHeightRef.current;
      el.scrollTop = heightDiff; // Keep the visual position stable
      isPrependingRef.current = false;
      prevMessageCountRef.current = currentMessageCount;
      prevLastMessageIdRef.current = lastMessageId;
      return;
    }

    // Determine if we should auto-scroll:
    const isNewMessage = currentMessageCount > prevCount && lastMessageId !== prevLastId;
    const shouldScroll =
      isNearBottomRef.current || // Already near bottom
      (prevCount === 0 && currentMessageCount > 0) || // Initial load
      (isNewMessage && prevCount > 0); // New message appended

    if (shouldScroll) {
      requestAnimationFrame(() => {
        el!.scrollTop = el!.scrollHeight;
      });
    }

    prevMessageCountRef.current = currentMessageCount;
    prevLastMessageIdRef.current = lastMessageId;
  }, [messages]);

  // Group messages by date - parse ISO date strings from API
  const groupedMessages: { date: Date; messages: ChatMessage[] }[] = [];
  let currentGroup: { date: Date; messages: ChatMessage[] } | null = null;

  messages.forEach((msg) => {
    const msgDate = new Date(msg.createdAt);
    if (!currentGroup || !isSameDay(msgDate, currentGroup.date)) {
      currentGroup = { date: msgDate, messages: [] };
      groupedMessages.push(currentGroup);
    }
    currentGroup.messages.push(msg);
  });

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-5 py-4 scroll-smooth"
      style={{ scrollBehavior: "smooth" }}
    >
      {/* Loading indicator for older messages */}
      {messagesLoading && messages.length > 0 && (
        <div className="flex justify-center py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="size-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Đang tải tin nhắn cũ hơn...
          </div>
        </div>
      )}

      {groupedMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <p className="text-sm text-muted-foreground">Chưa có tin nhắn nào</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Hãy gửi tin nhắn đầu tiên</p>
        </div>
      ) : (
        groupedMessages.map((group, gi) => (
          <div key={gi}>
            <DateSeparator date={group.date} />
            <div className="space-y-0.5">
              {group.messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          </div>
        ))
      )}
      {/* Bottom padding for scroll anchoring */}
      <div className="h-2" />
    </div>
  );
}