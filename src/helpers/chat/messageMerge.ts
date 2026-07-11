import type { ChatMessage } from "../../app/components/admin/chat/types";

/**
 * Sort comparator: createdAt ASC (oldest → newest).
 * For equal timestamps, use message_id ASC as tiebreaker.
 */
function byCreatedAt(a: ChatMessage, b: ChatMessage): number {
  const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  if (diff !== 0) return diff;
  // Tiebreaker: if both have numeric IDs, sort by ID ASC
  const aId = typeof a.id === "number" ? a.id : Number(a.id);
  const bId = typeof b.id === "number" ? b.id : Number(b.id);
  if (!isNaN(aId) && !isNaN(bId)) return aId - bId;
  return 0;
}

/**
 * Merge incoming messages into the existing message list.
 *
 * Strategy:
 *   - Deduplicate using message `id`
 *   - Newer messages from the API overwrite existing ones with the same id
 *   - Result is always sorted by `createdAt ASC` (oldest → newest)
 *   - The newest message is always at the bottom
 *
 * This is the ONLY function that should modify the message array.
 * Every code path (fetch, poll, socket, optimistic) must go through this.
 *
 * @param existing - Current messages in the store
 * @param incoming - New messages from API/Socket/Optimistic
 * @returns Merged, deduplicated, sorted array
 */
export function mergeMessages(
  existing: ChatMessage[],
  incoming: ChatMessage[]
): ChatMessage[] {
  if (incoming.length === 0) return existing;
  if (existing.length === 0) return [...incoming].sort(byCreatedAt);

  const map = new Map<string, ChatMessage>();

  // Add existing messages first
  for (const msg of existing) {
    map.set(String(msg.id), msg);
  }

  // Add (or overwrite) with incoming messages
  for (const msg of incoming) {
    map.set(String(msg.id), msg);
  }

  return Array.from(map.values()).sort(byCreatedAt);
}

/**
 * Append a single message to the existing list.
 * Convenience wrapper around mergeMessages.
 */
export function appendMessage(
  existing: ChatMessage[],
  message: ChatMessage
): ChatMessage[] {
  return mergeMessages(existing, [message]);
}