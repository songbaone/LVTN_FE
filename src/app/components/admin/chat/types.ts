// ============== API Response Types ==============

export interface ChatRoom {
  id: number | string;
  customerId?: number | string;
  customerName?: string;
  customerAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string; // ISO date string from API
  unreadCount: number;
  status: "open" | "closed" | "waiting";
  assignedStaffId?: number | string | null;
  assignedStaffName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatAttachment {
  attachment_id: number | string;
  file_name: string;
  file_url: string;
  mime_type: string;
}

export interface ChatMessage {
  id: number | string;
  roomId: number | string;
  /** @deprecated Use senderId comparison instead: message.senderId === currentUserId */
  senderRole?: "customer" | "admin" | "staff";
  senderId?: number | string; // Raw sender_id from API, used for ownership comparison
  senderName?: string;
  senderAvatar?: string | null;
  content: string;
  type: "text" | "image" | "file";
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  attachments?: ChatAttachment[]; // Array of attachments from API
  createdAt: string; // ISO date string from API
  seen?: boolean;
}

export interface RoomCustomer {
  id: number | string;
  name: string;
  avatar?: string;
  email?: string;
  phone?: string;
}

export interface RoomDetail {
  room: ChatRoom;
  customer: RoomCustomer;
}

// ============== Backward Compat Aliases (to be removed after migration) ==============

/** @deprecated Use ChatRoom instead */
export type Conversation = ChatRoom;
/** @deprecated Use ChatMessage instead */
export type Message = ChatMessage;
/** @deprecated Use RoomCustomer instead */
export type Customer = RoomCustomer;
/** @deprecated Use plain object with totalOrders/totalReviews/etc */
export type CustomerStatistics = Record<string, number>;
/** @deprecated */
export interface Order {
  id: string;
  code: string;
  status: string;
  amount: number;
  date: string;
}
/** @deprecated */
export interface Review {
  id: string;
  productName: string;
  productImage: string;
  rating: number;
  comment: string;
  date: string;
}