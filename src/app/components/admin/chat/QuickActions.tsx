import { Ban } from "lucide-react";
import { Button } from "../../ui/button";

interface QuickActionsProps {
  onAssign?: () => void;
  onClose?: () => void;
  roomStatus?: string;
}

export default function QuickActions({ onAssign, onClose, roomStatus }: QuickActionsProps) {
  const isOpen = roomStatus === "open";

  return (
    <div className="px-4 py-3 border-t border-border">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
        Thao tác nhanh
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {isOpen && onAssign && (
          <Button
            variant="default"
            size="sm"
            className="h-7 text-[11px] gap-1.5 rounded-lg px-2.5"
            onClick={onAssign}
          >
            Nhận phòng
          </Button>
        )}
        {isOpen && onClose && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-[11px] gap-1.5 rounded-lg px-2.5"
            onClick={onClose}
          >
            <Ban className="size-3" />
            Đóng
          </Button>
        )}
      </div>
    </div>
  );
}
