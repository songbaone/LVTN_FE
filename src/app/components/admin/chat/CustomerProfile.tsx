import { Mail, Phone, BadgeCheck, CalendarDays, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Badge } from "../../ui/badge";
import QuickActions from "./QuickActions";
import type { RoomCustomer, ChatRoom } from "./types";
import { format } from "date-fns";

interface CustomerProfileProps {
  customer: RoomCustomer;
  room?: ChatRoom | null;
  statistics?: Record<string, number>;
  orders?: any[];
  reviews?: any[];
  roomStatus?: string;
  onAssign?: () => void;
  onClose?: () => void;
}

export default function CustomerProfile({
  customer,
  room,
  roomStatus,
  onAssign,
  onClose,
}: CustomerProfileProps) {
  const getInitials = (name: string) => {
    const parts = name.split(" ");
    return parts.length > 1
      ? parts[parts.length - 2][0] + parts[parts.length - 1][0]
      : name.slice(0, 2);
  };

  const effectiveStatus = roomStatus ?? room?.status;

  const infoItems = [
    { icon: Mail, label: "Email", value: customer.email },
    { icon: Phone, label: "Điện thoại", value: customer.phone },
  ];

  return (
    <div className="w-[340px] flex-shrink-0 flex flex-col bg-card border-l border-border h-full">
      {/* Profile Card */}
      <div className="overflow-y-auto flex-1 scroll-smooth">
        {/* Avatar Section */}
        <div className="px-4 pt-5 pb-3 text-center">
          <div className="relative inline-block">
            <Avatar className="size-16 rounded-full ring-4 ring-primary/10 mx-auto">
              <AvatarImage src={customer.avatar} alt={customer.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                {getInitials(customer.name)}
              </AvatarFallback>
            </Avatar>
          </div>
          <h3 className="text-sm font-semibold text-foreground mt-2.5">
            {customer.name}
          </h3>
        </div>

        <div className="h-px bg-border/50 mx-4" />

        {/* Customer Info */}
        <div className="px-4 py-3 space-y-2">
          {infoItems.map((item) => {
            if (!item.value) return null;
            return (
              <div key={item.label} className="flex items-start gap-2.5">
                <div className="p-1 rounded-lg bg-muted/30 mt-0.5">
                  <item.icon className="size-3 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {item.label}
                  </p>
                  <p className="text-xs text-foreground truncate">{item.value}</p>
                </div>
              </div>
            );
          })}
          {!customer.email && !customer.phone && (
            <p className="text-xs text-muted-foreground text-center py-4">
              Chưa có thông tin khách hàng
            </p>
          )}
        </div>

        {/* Room Info */}
        {room && (
          <>
            <div className="h-px bg-border/50 mx-4" />
            <div className="px-4 py-3 space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">
                Thông tin phòng
              </p>
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-lg bg-muted/30 mt-0.5">
                  <BadgeCheck className="size-3 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Trạng thái</p>
                  <Badge variant={effectiveStatus === "open" ? "default" : "secondary"} className="text-[10px] mt-0.5">
                    {effectiveStatus === "open" ? "Đang mở" : effectiveStatus === "closed" ? "Đã đóng" : "Chờ"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-lg bg-muted/30 mt-0.5">
                  <UserRound className="size-3 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Mã khách hàng</p>
                  <p className="text-xs text-foreground truncate">#{room.customerId ?? room.id}</p>
                </div>
              </div>
              {room.assignedStaffName && (
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-lg bg-muted/30 mt-0.5">
                    <BadgeCheck className="size-3 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Nhân viên phụ trách</p>
                    <p className="text-xs text-foreground truncate">{room.assignedStaffName}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-lg bg-muted/30 mt-0.5">
                  <CalendarDays className="size-3 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ngày tạo</p>
                  <p className="text-xs text-foreground truncate">
                    {room.createdAt ? format(new Date(room.createdAt), "dd/MM/yyyy HH:mm") : "---"}
                  </p>
                </div>
              </div>
              {room.unreadCount > 0 && (
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-lg bg-muted/30 mt-0.5">
                    <BadgeCheck className="size-3 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tin nhắn chưa đọc</p>
                    <p className="text-xs text-foreground truncate">{room.unreadCount}</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Quick Actions - sticky at bottom */}
      <QuickActions roomStatus={roomStatus} onAssign={onAssign} onClose={onClose} />
    </div>
  );
}