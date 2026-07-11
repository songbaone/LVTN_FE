import { create } from "zustand";
import { adminChatService } from "../services/admin-chat.service";
import type { ChatRoom, ChatMessage, RoomCustomer } from "../app/components/admin/chat/types";
import { mergeMessages } from "../helpers/chat/messageMerge";
import { mapApiMessage, createOptimisticMessage } from "../helpers/chat/messageMapper";
import { getCurrentUserId } from "../helpers/chat/getCurrentUserId";

interface AdminChatState {
  // Room list
  rooms: ChatRoom[];
  roomsLoading: boolean;
  roomsError: string | null;
  roomsPage: number;
  roomsTotalPages: number;
  roomsSearch: string;
  roomsStatusFilter: string;

  // Selected room
  selectedRoomId: number | string | null;
  selectedRoom: ChatRoom | null;
  selectedCustomer: RoomCustomer | null;
  roomLoading: boolean;
  roomError: string | null;

  // Messages — cursor-based
  messages: ChatMessage[];
  messagesLoading: boolean;
  messagesCursor: number | null; // Oldest loaded message_id (for scrolling up)
  messagesHasMore: boolean;

  // Sending
  sending: boolean;

  // Polling
  pollingInterval: ReturnType<typeof setInterval> | null;

  // Abort controllers
  abortControllers: Map<string, AbortController>;

  // Socket
  dispatchSocketMessage: (msg: ChatMessage) => void;
  dispatchNewRoom: (room: ChatRoom) => void;
  dispatchRoomUpdated: (roomId: string | number, updates: Partial<ChatRoom>) => void;

  // Actions
  fetchRooms: (params?: { page?: number; search?: string; status?: string; staffId?: number }) => Promise<void>;
  selectRoom: (roomId: number | string) => Promise<void>;
  fetchMessages: (params?: { cursor?: number; direction?: "before" | "after" }) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  uploadAttachment: (messageId: number | string, file: File) => Promise<void>;
  assignRoom: (roomId: number | string) => Promise<void>;
  markRead: (roomId: number | string) => Promise<void>;
  closeRoom: (roomId: number | string) => Promise<void>;
  setRoomsSearch: (search: string) => void;
  setRoomsStatusFilter: (status: string) => void;
  startPolling: () => void;
  stopPolling: () => void;
  reset: () => void;
}

const MESSAGE_LIMIT = 20;

function normalizeId(id: unknown): string {
  return String(id);
}

function mapRoom(raw: any): ChatRoom {
  return {
    id: normalizeId(raw.id ?? raw.room_id),
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

export const useAdminChatStore = create<AdminChatState>((set, get) => ({
  rooms: [],
  roomsLoading: false,
  roomsError: null,
  roomsPage: 1,
  roomsTotalPages: 1,
  roomsSearch: "",
  roomsStatusFilter: "all",

  selectedRoomId: null,
  selectedRoom: null,
  selectedCustomer: null,
  roomLoading: false,
  roomError: null,

  messages: [],
  messagesLoading: false,
  messagesCursor: null,
  messagesHasMore: true,

  sending: false,

  pollingInterval: null,

  abortControllers: new Map(),

  dispatchSocketMessage: (msg: ChatMessage) => {
    const { messages, selectedRoomId } = get();
    // Only accept messages for the currently selected room
    if (selectedRoomId && String(msg.roomId) === String(selectedRoomId)) {
      set({ messages: mergeMessages(messages, [msg]) });
    }
  },

  dispatchNewRoom: (room: ChatRoom) => {
    const { rooms } = get();
    const exists = rooms.some((r) => String(r.id) === String(room.id));
    if (exists) return;
    set({ rooms: [room, ...rooms] });
  },

  dispatchRoomUpdated: (roomId: string | number, updates: Partial<ChatRoom>) => {
    const { rooms } = get();
    const normalizedId = String(roomId);
    const index = rooms.findIndex((r) => String(r.id) === normalizedId);
    if (index === -1) return;
    const updatedRooms = [...rooms];
    updatedRooms[index] = { ...updatedRooms[index], ...updates };
    const [moved] = updatedRooms.splice(index, 1);
    updatedRooms.unshift(moved);
    set({ rooms: updatedRooms });
    const { selectedRoomId } = get();
    if (selectedRoomId && String(selectedRoomId) === normalizedId) {
      set({ selectedRoom: { ...get().selectedRoom!, ...updates } as ChatRoom });
    }
  },

  fetchRooms: async (params) => {
    const prevCtrl = get().abortControllers.get("fetchRooms");
    if (prevCtrl) prevCtrl.abort();

    const controller = new AbortController();
    get().abortControllers.set("fetchRooms", controller);

    set({ roomsLoading: true, roomsError: null });
    try {
      const queryParams: any = { ...params };
      const { roomsSearch, roomsStatusFilter, roomsPage } = get();
      if (!params) {
        if (roomsSearch) queryParams.search = roomsSearch;
        if (roomsStatusFilter && roomsStatusFilter !== "all") queryParams.status = roomsStatusFilter;
        queryParams.page = roomsPage;
      }
      const res = await adminChatService.getRooms(queryParams, { signal: controller.signal });
      const apiData = res.data?.data;
      const rawRooms: any[] = apiData?.rooms ?? apiData ?? [];
      const mappedRooms: ChatRoom[] = Array.isArray(rawRooms) ? rawRooms.map(mapRoom) : [];
      set({
        rooms: mappedRooms,
        roomsLoading: false,
        roomsTotalPages: apiData?.totalPages ?? 1,
      });
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
      set({
        roomsLoading: false,
        roomsError: err?.response?.data?.message || "Không thể tải danh sách phòng",
      });
    } finally {
      get().abortControllers.delete("fetchRooms");
    }
  },

  selectRoom: async (roomId) => {
    const normalizedId = normalizeId(roomId);

    // Skip if already selected
    if (get().selectedRoomId === normalizedId) return;

    const room = get().rooms.find((r) => normalizeId(r.id) === normalizedId);

    const customer: RoomCustomer | null = room
      ? {
          id: room.customerId ?? room.id,
          name: room.customerName ?? `Khách #${room.customerId}`,
          avatar: room.customerAvatar,
        }
      : null;

    // Clear messages when switching rooms — reset cursor state
    set({
      selectedRoomId: normalizedId,
      selectedRoom: room ?? null,
      selectedCustomer: customer,
      roomLoading: false,
      roomError: null,
      messages: [],
      messagesCursor: null,
      messagesHasMore: true,
    });

    // Load initial messages for this room (newest first)
    await get().fetchMessages();
  },

  fetchMessages: async (params) => {
    const { selectedRoomId, messages: existingMessages } = get();
    if (!selectedRoomId) return;

    const prevCtrl = get().abortControllers.get("fetchMessages");
    if (prevCtrl) prevCtrl.abort();

    const controller = new AbortController();
    get().abortControllers.set("fetchMessages", controller);

    set({ messagesLoading: true });

    try {
      const res = await adminChatService.getMessages(
        selectedRoomId,
        {
          limit: MESSAGE_LIMIT,
          cursor: params?.cursor ?? undefined,
          direction: params?.direction ?? undefined,
        },
        { signal: controller.signal }
      );
      const responseData = res.data?.data;
      const rawMessages: any[] = responseData?.messages ?? responseData ?? [];
      const serverCursor: number | null = responseData?.cursor ?? null;
      const hasMore: boolean = responseData?.hasMore ?? false;

      const messagesArray: ChatMessage[] = Array.isArray(rawMessages)
        ? rawMessages.map((msg: any) => mapApiMessage(msg, selectedRoomId))
        : [];

      // Merge with existing — never replace
      const merged = mergeMessages(existingMessages, messagesArray);

      // Update cursor to the oldest message in the store
      const oldestMessage = merged.length > 0 ? merged[0] : null;
      const newCursor = oldestMessage ? Number(oldestMessage.id) : null;

      set({
        messages: merged,
        messagesCursor: newCursor,
        messagesHasMore: hasMore,
        messagesLoading: false,
      });
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
      console.error("Failed to fetch admin messages:", err);
      set({ messagesLoading: false });
    } finally {
      get().abortControllers.delete("fetchMessages");
    }
  },

  loadMoreMessages: async () => {
    const { messagesCursor, messagesHasMore, messagesLoading } = get();
    if (!messagesCursor || !messagesHasMore || messagesLoading) return;

    await get().fetchMessages({ cursor: messagesCursor, direction: "before" });
  },

  sendMessage: async (text: string) => {
    const { selectedRoomId, sending } = get();
    if (!selectedRoomId || !text.trim() || sending) return;

    const payload = {
      message: text.trim(),
      message_type: "TEXT" as const,
      room_id: selectedRoomId,
    };

    set({ sending: true });
    try {
      // Add optimistic message immediately
      const { messages: existingMessages } = get();
      const currentUserId = getCurrentUserId();
      const optimistic = createOptimisticMessage(text, selectedRoomId, currentUserId ?? undefined);
      set({ messages: mergeMessages(existingMessages, [optimistic]) });

      await adminChatService.sendMessage(payload);

      // After sending, fetch only newer messages to get the server-confirmed version
      const { messages: currentMessages } = get();
      const newestMsg = currentMessages.length > 0 ? currentMessages[currentMessages.length - 1] : null;
      const newestCursor = newestMsg ? Number(newestMsg.id) : null;
      if (newestCursor) {
        const res = await adminChatService.getMessages(
          selectedRoomId,
          { limit: MESSAGE_LIMIT, cursor: newestCursor, direction: "after" }
        );
        const responseData = res.data?.data;
        const rawMessages: any[] = responseData?.messages ?? responseData ?? [];
        const messagesArray: ChatMessage[] = Array.isArray(rawMessages)
          ? rawMessages.map((msg: any) => mapApiMessage(msg, selectedRoomId))
          : [];
        const merged = mergeMessages(currentMessages, messagesArray);
        set({ messages: merged, messagesHasMore: true });
      }
    } catch (err: any) {
      throw err;
    } finally {
      set({ sending: false });
    }
  },

  uploadAttachment: async (messageId: number | string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      await adminChatService.uploadAttachment(messageId, formData);

      // Re-fetch latest messages after attachment upload
      const { selectedRoomId } = get();
      if (selectedRoomId) {
        const res = await adminChatService.getMessages(selectedRoomId, {
          limit: MESSAGE_LIMIT,
        });
        const responseData = res.data?.data;
        const rawMessages: any[] = responseData?.messages ?? responseData ?? [];
        const messagesArray: ChatMessage[] = Array.isArray(rawMessages)
          ? rawMessages.map((msg: any) => mapApiMessage(msg, selectedRoomId))
          : [];
        const { messages: existingMessages } = get();
        const merged = mergeMessages(existingMessages, messagesArray);
        set({ messages: merged });
      }
    } catch (err: any) {
      throw err;
    }
  },

  assignRoom: async (roomId) => {
    try {
      await adminChatService.assignRoom(roomId);
      await get().fetchRooms();
      if (get().selectedRoomId === normalizeId(roomId)) {
        await get().selectRoom(roomId);
      }
    } catch (err: any) {
      throw err;
    }
  },

  markRead: async (roomId) => {
    try {
      await adminChatService.markRead(roomId);
    } catch {
      // Silently fail
    }
  },

  closeRoom: async (roomId) => {
    try {
      await adminChatService.closeRoom(roomId);
      await get().fetchRooms();
      if (get().selectedRoomId === normalizeId(roomId)) {
        await get().selectRoom(roomId);
      }
    } catch (err: any) {
      throw err;
    }
  },

  setRoomsSearch: (search) => {
    set({ roomsSearch: search, roomsPage: 1 });
    get().fetchRooms({ search, status: get().roomsStatusFilter !== "all" ? get().roomsStatusFilter : undefined });
  },

  setRoomsStatusFilter: (status) => {
    set({ roomsStatusFilter: status, roomsPage: 1 });
    get().fetchRooms({ status: status !== "all" ? status : undefined, search: get().roomsSearch });
  },

  startPolling: () => {
    const { pollingInterval } = get();
    if (pollingInterval) return;

    const interval = setInterval(async () => {
      const { selectedRoomId, messages: existingMessages } = get();

      if (selectedRoomId) {
        try {
          // Poll for newer messages only (direction=after)
          const newestMsg = existingMessages.length > 0 ? existingMessages[existingMessages.length - 1] : null;
          const newestCursor = newestMsg ? Number(newestMsg.id) : null;

          const res = await adminChatService.getMessages(
            selectedRoomId,
            {
              limit: MESSAGE_LIMIT,
              cursor: newestCursor ?? undefined,
              direction: "after",
            }
          );
          const responseData = res.data?.data;
          const rawMessages: any[] = responseData?.messages ?? responseData ?? [];

          const messagesArray: ChatMessage[] = Array.isArray(rawMessages)
            ? rawMessages.map((msg: any) => mapApiMessage(msg, selectedRoomId))
            : [];

          // Merge — never replace
          const merged = mergeMessages(existingMessages, messagesArray);
          if (merged.length !== existingMessages.length) {
            set({ messages: merged });
          }
        } catch {
          // Silently fail on poll errors
        }
      }
    }, 30000);

    set({ pollingInterval: interval });
  },

  stopPolling: () => {
    const { pollingInterval } = get();
    if (pollingInterval) {
      clearInterval(pollingInterval);
      set({ pollingInterval: null });
    }
  },

  reset: () => {
    const controllers = get().abortControllers;
    controllers.forEach((ctrl) => ctrl.abort());
    controllers.clear();

    get().stopPolling();
    set({
      rooms: [],
      roomsLoading: false,
      roomsError: null,
      roomsPage: 1,
      roomsTotalPages: 1,
      roomsSearch: "",
      roomsStatusFilter: "all",
      selectedRoomId: null,
      selectedRoom: null,
      selectedCustomer: null,
      roomLoading: false,
      roomError: null,
      messages: [],
      messagesLoading: false,
      messagesCursor: null,
      messagesHasMore: true,
      sending: false,
    });
  },
}));