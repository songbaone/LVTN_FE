import { create } from "zustand";
import { chatService } from "../services/chat.service";
import type { ChatRoom, ChatMessage } from "../app/components/admin/chat/types";
import { mergeMessages } from "../helpers/chat/messageMerge";
import { mapApiMessage, createOptimisticMessage } from "../helpers/chat/messageMapper";
import { getCurrentUserId } from "../helpers/chat/getCurrentUserId";

interface ChatState {
  // Data
  room: ChatRoom | null;
  messages: ChatMessage[];
  loading: boolean;
  sending: boolean;
  error: string | null;

  // Cursor pagination
  cursor: number | null; // Oldest loaded message_id (for scrolling up)
  hasMore: boolean; // Whether older messages exist

  // Polling
  pollingInterval: ReturnType<typeof setInterval> | null;

  // Socket
  dispatchSocketMessage: (msg: ChatMessage) => void;

  // Actions
  loadOrCreateRoom: () => Promise<void>;
  fetchMessages: (params?: { cursor?: number; direction?: "before" | "after" }) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  uploadAttachment: (messageId: number | string, file: File) => Promise<void>;
  markRead: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  reset: () => void;
}

const MESSAGE_LIMIT = 20;

export const useChatStore = create<ChatState>((set, get) => ({
  room: null,
  messages: [],
  loading: false,
  sending: false,
  error: null,
  cursor: null,
  hasMore: true,
  pollingInterval: null,

  dispatchSocketMessage: (msg: ChatMessage) => {
    const { messages, room } = get();
    // Only accept messages for the current room
    if (room && String(msg.roomId) === String(room.id)) {
      set({ messages: mergeMessages(messages, [msg]) });
    }
  },

  loadOrCreateRoom: async () => {
    set({ loading: true, error: null });
    try {
      let res;
      try {
        res = await chatService.getRoom();
      } catch {
        res = await chatService.createRoom();
      }
      const roomData: ChatRoom = res.data?.data ?? res.data?.room ?? res.data;
      set({ room: roomData, loading: false, messages: [], cursor: null, hasMore: true });

      // Load initial messages (newest first)
      await get().fetchMessages();
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Không thể tải phòng chat",
      });
    }
  },

  fetchMessages: async (params) => {
    const { room, messages: existingMessages } = get();
    if (!room) return;

    try {
      const res = await chatService.getMessages({
        limit: MESSAGE_LIMIT,
        cursor: params?.cursor ?? undefined,
        direction: params?.direction ?? undefined,
      });
      const responseData = res.data?.data ?? res.data;
      const rawMessages: any[] = responseData?.messages ?? responseData ?? [];
      const serverCursor: number | null = responseData?.cursor ?? null;
      const hasMore: boolean = responseData?.hasMore ?? false;

      const messagesArray: ChatMessage[] = Array.isArray(rawMessages)
        ? rawMessages.map((msg: any) => mapApiMessage(msg, room.id))
        : [];

      // Merge with existing — never replace
      const merged = mergeMessages(existingMessages, messagesArray);

      // Update cursor to the oldest message in the store
      // When loading 'before', cursor becomes the oldest message_id for next scroll
      // When loading initial, cursor is the oldest message from the response
      const oldestMessage = merged.length > 0 ? merged[0] : null;
      const newCursor = oldestMessage ? Number(oldestMessage.id) : null;

      set({
        messages: merged,
        cursor: newCursor,
        hasMore,
      });
    } catch (err: any) {
      console.error("Failed to fetch messages:", err);
    }
  },

  loadMoreMessages: async () => {
    const { cursor, hasMore, loading } = get();
    if (!cursor || !hasMore || loading) return;

    set({ loading: true });
    await get().fetchMessages({ cursor, direction: "before" });
    set({ loading: false });
  },

  sendMessage: async (text: string) => {
    if (!text.trim() || get().sending) return;

    const payload = {
      message: text.trim(),
      message_type: "TEXT" as const,
    };

    set({ sending: true, error: null });
    try {
      // Add optimistic message immediately
      const { room, messages: existingMessages } = get();
      const currentUserId = getCurrentUserId();
      const optimistic = createOptimisticMessage(text, room?.id ?? "", currentUserId ?? undefined);
      set({ messages: mergeMessages(existingMessages, [optimistic]) });

      await chatService.sendMessage(payload);

      // After sending, fetch the latest messages from the server
      // to replace the optimistic message with the real one.
      // The optimistic ID is "opt-..." which can't be used as a cursor (NaN),
      // so we fetch without cursor to get the newest messages.
      const { room: currentRoom, messages: preFetchMessages } = get();
      if (currentRoom) {
        // Remove optimistic messages before merging with real server data
        const realMessages = preFetchMessages.filter(
          (msg) => !String(msg.id).startsWith("opt-")
        );
        const res = await chatService.getMessages({
          limit: MESSAGE_LIMIT,
        });
        const responseData = res.data?.data ?? res.data;
        const rawMessages: any[] = responseData?.messages ?? responseData ?? [];
        const messagesArray: ChatMessage[] = Array.isArray(rawMessages)
          ? rawMessages.map((msg: any) => mapApiMessage(msg, currentRoom.id))
          : [];
        const merged = mergeMessages(realMessages, messagesArray);
        // Preserve existing cursor/hasMore state
        set({ messages: merged });
      }
    } catch (err: any) {
      set({
        sending: false,
        error: err?.response?.data?.message || "Không thể gửi tin nhắn",
      });
      throw err;
    } finally {
      set({ sending: false });
    }
  },

  uploadAttachment: async (messageId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      await chatService.uploadAttachment(messageId, formData);
      // Re-fetch latest messages after attachment upload
      // We cannot use the optimistic message's ID as cursor (it's "opt-..." → NaN),
      // so we fetch without cursor to get the newest messages.
      const { room } = get();
      if (room) {
        const res = await chatService.getMessages({
          limit: MESSAGE_LIMIT,
        });
        const responseData = res.data?.data ?? res.data;
        const rawMessages: any[] = responseData?.messages ?? responseData ?? [];
        const messagesArray: ChatMessage[] = Array.isArray(rawMessages)
          ? rawMessages.map((msg: any) => mapApiMessage(msg, room.id))
          : [];
        const { messages: existingMessages } = get();
        const merged = mergeMessages(existingMessages, messagesArray);
        set({ messages: merged });
      }
    } catch (err: any) {
      set({
        error: err?.response?.data?.message || "Không thể tải file lên",
      });
      throw err;
    }
  },

  markRead: async () => {
    try {
      await chatService.markRead();
    } catch {
      // Silently fail for mark read
    }
  },

  startPolling: () => {
    const { pollingInterval } = get();
    if (pollingInterval) return;

    const interval = setInterval(async () => {
      const { room, messages: existingMessages } = get();
      if (!room) return;

      try {
        // Poll for newer messages only (direction=after)
        const newestMsg = existingMessages.length > 0 ? existingMessages[existingMessages.length - 1] : null;
        const newestCursor = newestMsg ? Number(newestMsg.id) : null;

        const res = await chatService.getMessages({
          limit: MESSAGE_LIMIT,
          cursor: newestCursor ?? undefined,
          direction: "after",
        });
        const responseData = res.data?.data ?? res.data;
        const rawMessages: any[] = responseData?.messages ?? responseData ?? [];

        const messagesArray: ChatMessage[] = Array.isArray(rawMessages)
          ? rawMessages.map((msg: any) => mapApiMessage(msg, room.id))
          : [];

        // Merge — never replace
        const merged = mergeMessages(existingMessages, messagesArray);
        if (merged.length !== existingMessages.length) {
          set({ messages: merged });
        }
      } catch {
        // Silently fail polling
      }
    }, 10000);

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
    get().stopPolling();
    set({
      room: null,
      messages: [],
      loading: false,
      sending: false,
      error: null,
      cursor: null,
      hasMore: true,
    });
  },
}));