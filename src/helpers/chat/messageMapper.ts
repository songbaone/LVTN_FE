import type { ChatMessage, ChatAttachment } from "../../app/components/admin/chat/types";

/**
 * Unified message mapper.
 *
 * Maps raw API/WebSocket payloads to ChatMessage.
 *
 * This is the SINGLE source of truth for message mapping.
 * Do NOT create duplicate mapMessage functions elsewhere.
 */

/**
 * Map attachment array from raw payload.
 */
function mapAttachments(raw: any): ChatAttachment[] | undefined {
  const rawAttachments = raw.attachments ?? raw.attachment ?? [];
  if (!Array.isArray(rawAttachments) || rawAttachments.length === 0) return undefined;
  return rawAttachments.map((att: any) => ({
    attachment_id: att.attachment_id ?? att.id,
    file_name: att.file_name ?? att.name ?? "",
    file_url: att.file_url ?? att.url ?? "",
    mime_type: att.mime_type ?? att.type ?? "",
  }));
}

/**
 * Map a raw API message to ChatMessage.
 *
 * Expected API shape:
 * {
 *   message_id: number,
 *   room_id: number,
 *   sender_id: number,
 *   sender: { user_id, full_name, avatar },
 *   message: string,
 *   message_type: "TEXT" | "IMAGE" | "FILE",
 *   created_at: string (ISO),
 *   is_read: boolean,
 *   attachments: []
 * }
 */
export function mapApiMessage(raw: any, roomId: string | number): ChatMessage {
  const senderObj = raw.sender ?? {};
  const atts = mapAttachments(raw);

  return {
    id: raw.message_id ?? raw.id,
    roomId: String(raw.room_id ?? raw.roomId ?? roomId),
    senderId: raw.sender_id ?? senderObj.user_id ?? raw.senderId,
    senderName: raw.sender_name ?? senderObj.full_name ?? raw.senderName,
    senderAvatar: senderObj.avatar ?? null,
    content: raw.message ?? raw.content ?? "",
    type: ((raw.message_type ?? raw.type ?? "text") as string).toLowerCase() as ChatMessage["type"],
    attachmentUrl: atts?.[0]?.file_url ?? null,
    attachmentName: atts?.[0]?.file_name ?? null,
    attachmentSize: raw.attachment_size ?? raw.attachmentSize ?? null,
    attachments: atts,
    createdAt: raw.created_at ?? raw.createdAt,
    seen: raw.is_read ?? raw.seen ?? false,
  };
}

/**
 * Map a raw Socket.IO event payload to ChatMessage.
 *
 * Socket payload has the same shape as the API response,
 * so it delegates to mapApiMessage.
 */
export function mapSocketMessage(raw: any, roomId: string | number): ChatMessage {
  const message = raw?.message ?? raw;
  return mapApiMessage(message, roomId);
}

/**
 * Create an optimistic message for immediate UI rendering.
 *
 * The optimistic ID is prefixed with "opt-" so it can be recognized
 * and replaced by the real server message after the API call succeeds.
 */
export function createOptimisticMessage(
  text: string,
  roomId: string | number,
  senderId: string | number | undefined,
): ChatMessage {
  return {
    id: `opt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    roomId: String(roomId),
    senderId,
    content: text.trim(),
    type: "text",
    createdAt: new Date().toISOString(),
    seen: false,
  };
}

/**
 * Check if a message ID is an optimistic (temporary) ID.
 */
export function isOptimisticId(id: string | number): boolean {
  return String(id).startsWith("opt-");
}