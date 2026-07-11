import axiosClient from "./axiosClient";

export const chatService = {
  createRoom: () => axiosClient.post("/chat/room"),

  getRoom: () => axiosClient.get("/chat/room"),

  getMessages: (params?: { cursor?: number; limit?: number; direction?: "before" | "after" }) =>
    axiosClient.get("/chat/room/messages", { params }),

  sendMessage: (data: { message: string; message_type: string }) =>
    axiosClient.post("/chat/messages", data),

  uploadAttachment: (messageId: number | string, formData: FormData) =>
    axiosClient.post(`/chat/messages/${messageId}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  markRead: () => axiosClient.patch("/chat/room/read"),
};