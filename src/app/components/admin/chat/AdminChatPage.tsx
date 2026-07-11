import { useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import ConversationSidebar from "./ConversationSidebar";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import MessageInput, { MessageInputHandle } from "./MessageInput";
import CustomerProfile from "./CustomerProfile";
import EmptyConversation from "./EmptyConversation";
import { useAdminChatStore } from "../../../../stores/adminChatStore";
import { useSocket } from "../../../../hooks/useSocket";
import { useImageAttachment } from "../../../../hooks/useImageAttachment";
import { Skeleton } from "../../ui/skeleton";
import { mapSocketMessage } from "../../../../helpers/chat/messageMapper";
import type { ChatMessage, ChatRoom } from "./types";

/**
 * Map raw socket payload to ChatRoom for admin chat.
 */
function mapSocketRoom(raw: any): ChatRoom {
  return {
    id: raw.id ?? raw.room_id,
    customerId: raw.customerId ?? raw.customer_id,
    customerName: raw.customerName ?? raw.customer_name ?? raw.name,
    customerAvatar: raw.customerAvatar ?? raw.customer_avatar ?? raw.avatar,
    lastMessage: raw.lastMessage ?? raw.last_message,
    lastMessageTime: raw.lastMessageTime ?? raw.last_message_time ?? raw.updatedAt ?? raw.updated_at,
    unreadCount: raw.unreadCount ?? raw.unread_count ?? 0,
    status: raw.status ?? "open",
    assignedStaffId: raw.assignedStaffId ?? raw.assigned_staff_id ?? null,
    assignedStaffName: raw.assignedStaffName ?? raw.assigned_staff_name ?? null,
    createdAt: raw.createdAt ?? raw.created_at,
    updatedAt: raw.updatedAt ?? raw.updated_at,
  };
}

export default function AdminChatPage() {
  const messageInputRef = useRef<MessageInputHandle>(null);
  const imageAttachment = useImageAttachment();
  const {
    rooms,
    roomsLoading,
    selectedRoomId,
    selectedRoom,
    selectedCustomer,
    roomLoading,
    messages,
    sending,
    fetchRooms,
    selectRoom,
    sendMessage,
    uploadAttachment,
    assignRoom,
    closeRoom,
    markRead,
    startPolling,
    stopPolling,
    dispatchSocketMessage,
    dispatchNewRoom,
    dispatchRoomUpdated,
  } = useAdminChatStore();

  // Initial load - only run once on mount
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    fetchRooms();
    startPolling();

    return () => {
      stopPolling();
    };
  }, []);

  // Mark room as read when selected
  useEffect(() => {
    if (selectedRoomId) {
      markRead(selectedRoomId);
    }
  }, [selectedRoomId]);

  const handleSend = useCallback(
    async (text: string) => {
      const { selectedImage } = imageAttachment;
      let sentOk = false;

      try {
        // 1. Send text if present
        if (text.trim()) {
          await sendMessage(text.trim());
          sentOk = true;
        }

        // 2. Upload image if selected
        if (selectedImage) {
          imageAttachment.setUploading(true);

          // If no text was sent, send a placeholder message first (same as Customer Chat)
          if (!text.trim()) {
            await sendMessage(`📷 ${selectedImage.name}`);
            sentOk = true;
          }

          // Get the last message to attach the image to
          const { messages: updatedMessages } = useAdminChatStore.getState();
          const lastMsg = updatedMessages[updatedMessages.length - 1];
          if (lastMsg) {
            await uploadAttachment(lastMsg.id, selectedImage);
          }
        }

        // 3. Clear everything on success
        messageInputRef.current?.reset();
        imageAttachment.clearImage();
      } catch (err: any) {
        if (!sentOk) {
          // If text send failed, keep the text for retry
          // (image is already selected, so it stays)
        }
        toast.error(err?.response?.data?.message || "Không thể gửi tin nhắn");
      } finally {
        imageAttachment.setUploading(false);
      }
    },
    [sendMessage, uploadAttachment, imageAttachment]
  );

  const handleAssign = useCallback(async () => {
    if (!selectedRoomId) return;
    try {
      await assignRoom(selectedRoomId);
      toast.success("Đã nhận phòng");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể nhận phòng");
    }
  }, [selectedRoomId, assignRoom]);

  const handleClose = useCallback(async () => {
    if (!selectedRoomId) return;
    try {
      await closeRoom(selectedRoomId);
      toast.success("Đã đóng phòng");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể đóng phòng");
    }
  }, [selectedRoomId, closeRoom]);

  const isRoomClosed = selectedRoom?.status === "closed";

  // Socket.IO integration
  const handleSocketMessage = useCallback(
    (data: any) => {
      console.log("data super in admin chatbox: ", data);
      // Use the shared mapper
      const msg = mapSocketMessage(data, data.room_id ?? data.roomId);
      dispatchSocketMessage(msg);
      // Update room preview
      const roomId = data.room_id ?? data.roomId;
      if (roomId) {
        dispatchRoomUpdated(roomId, {
          lastMessage: data.message ?? data.content,
          lastMessageTime: data.created_at ?? data.createdAt,
        });
      }
    },
    [dispatchSocketMessage, dispatchRoomUpdated]
  );

  const handleRoomCreated = useCallback(
    (data: any) => {
      const room = mapSocketRoom(data);
      dispatchNewRoom(room);
    },
    [dispatchNewRoom]
  );

  const handleRoomAssigned = useCallback(
    (data: any) => {
      const roomId = data.room_id ?? data.roomId ?? data.id;
      if (roomId) {
        dispatchRoomUpdated(roomId, {
          assignedStaffId: data.assigned_staff_id ?? data.assignedStaffId,
          assignedStaffName: data.assigned_staff_name ?? data.assignedStaffName,
          status: data.status ?? "open",
        });
      }
    },
    [dispatchRoomUpdated]
  );

  const handleRoomClosed = useCallback(
    (data: any) => {
      const roomId = data.room_id ?? data.roomId ?? data.id;
      if (roomId) {
        dispatchRoomUpdated(roomId, { status: "closed" });
      }
    },
    [dispatchRoomUpdated]
  );

  useSocket({
    role: "admin",
    roomId: selectedRoomId,
    onNewMessage: handleSocketMessage,
    onRoomCreated: handleRoomCreated,
    onRoomAssigned: handleRoomAssigned,
    onRoomClosed: handleRoomClosed,
  });

  return (
    <div className="flex h-full w-full bg-background -m-4 lg:-m-6">
      {/* Left Sidebar - Conversation List */}
      <ConversationSidebar
        conversations={rooms}
        selectedId={selectedRoomId as string | null}
        onSelect={(id) => selectRoom(id)}
        loading={roomsLoading}
      />

      {/* Center - Chat Panel */}
      <div className="flex-1 flex flex-col min-w-0 bg-card">
        {roomLoading ? (
          <div className="flex-1 flex flex-col p-5 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="flex-1 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : selectedRoom && selectedCustomer ? (
          <>
            <ChatHeader
              conversation={selectedRoom}
              onAssign={handleAssign}
              onClose={handleClose}
            />
            <ChatMessages messages={messages} />
            {isRoomClosed ? (
              <div className="flex-shrink-0 px-5 py-4 bg-muted/30 border-t border-border text-center">
                <p className="text-sm text-muted-foreground">Cuộc trò chuyện đã kết thúc</p>
              </div>
            ) : (
              <MessageInput ref={messageInputRef} onSend={handleSend} disabled={sending} imageAttachment={imageAttachment} />
            )}
          </>
        ) : (
          <EmptyConversation />
        )}
      </div>

      {/* Right Sidebar - Customer Profile */}
      {selectedRoom && selectedCustomer ? (
        <CustomerProfile
          customer={selectedCustomer}
          room={selectedRoom}
          statistics={{}}
          orders={[]}
          reviews={[]}
          roomStatus={selectedRoom.status}
          onAssign={handleAssign}
          onClose={handleClose}
        />
      ) : (
        <div className="w-[340px] flex-shrink-0 bg-card border-l border-border hidden xl:flex items-center justify-center">
          <p className="text-sm text-muted-foreground/50">Chọn khách hàng để xem thông tin</p>
        </div>
      )}
    </div>
  );
}