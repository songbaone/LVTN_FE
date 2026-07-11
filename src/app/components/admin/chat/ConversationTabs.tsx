import { cn } from "../../ui/utils";

export type ConversationFilter = "all" | "unread" | "online" | "vip";

interface ConversationTabsProps {
  active: ConversationFilter;
  onChange: (filter: ConversationFilter) => void;
  counts: Record<ConversationFilter, number>;
}

const tabs: { key: ConversationFilter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "unread", label: "Chưa đọc" },
  { key: "online", label: "Online" },
  { key: "vip", label: "VIP" },
];

export default function ConversationTabs({ active, onChange, counts }: ConversationTabsProps) {
  return (
    <div className="px-3 pb-1">
      <div className="flex gap-0.5 bg-muted/40 rounded-lg p-0.5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
              active === tab.key
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-white/50"
            )}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span
                className={cn(
                  "inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-semibold rounded-full",
                  active === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted-foreground/10 text-muted-foreground"
                )}
              >
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}