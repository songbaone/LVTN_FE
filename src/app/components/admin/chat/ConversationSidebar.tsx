import { useState, useMemo, useEffect } from "react";
import { MessageSquareText } from "lucide-react";
import ConversationSearch from "./ConversationSearch";
import ConversationTabs, { ConversationFilter } from "./ConversationTabs";
import ConversationCard from "./ConversationCard";
import type { ChatRoom } from "./types";
import { Skeleton } from "../../ui/skeleton";

interface ConversationSidebarProps {
  conversations: ChatRoom[];
  selectedId: string | null;
  onSelect: (id: number | string) => void;
  loading?: boolean;
}

export default function ConversationSidebar({
  conversations,
  selectedId,
  onSelect,
  loading,
}: ConversationSidebarProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ConversationFilter>("all");

  // Compute counts based on available data
  const counts = useMemo(() => ({
    all: conversations.length,
    unread: conversations.filter((c) => c.unreadCount > 0).length,
    // Use status for "open" conversations as "online" equivalent
    online: conversations.filter((c) => c.status === "open").length,
    vip: 0, // VIP info not available from API
  }), [conversations]);

  const filtered = useMemo(() => {
    let list = conversations;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          (c.customerName || "").toLowerCase().includes(q) ||
          (c.lastMessage || "").toLowerCase().includes(q)
      );
    }

    switch (filter) {
      case "unread":
        list = list.filter((c) => c.unreadCount > 0);
        break;
      case "online":
        list = list.filter((c) => c.status === "open");
        break;
      case "vip":
        // No VIP concept in API, fallback to all
        break;
    }

    // Sort by last message time (ISO string → Date comparison)
    return [...list].sort((a, b) => {
      const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
      const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
      return timeB - timeA;
    });
  }, [conversations, search, filter]);

  return (
    <div className="w-[320px] flex-shrink-0 flex flex-col bg-card border-r border-border h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <MessageSquareText className="size-4 text-primary" />
          </div>
          <h2 className="text-base font-semibold text-foreground">Khách hàng</h2>
        </div>
        <ConversationSearch value={search} onChange={setSearch} />
        <ConversationTabs active={filter} onChange={setFilter} counts={counts} />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        {loading ? (
          <div className="p-3 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3 px-3 py-3">
                <Skeleton className="size-11 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <MessageSquareText className="size-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">Không tìm thấy khách hàng</p>
          </div>
        ) : (
          <div className="pb-2">
            {filtered.map((conv) => (
              <ConversationCard
                key={conv.id}
                conversation={conv}
                isSelected={selectedId === conv.id}
                onClick={() => onSelect(String(conv.id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}