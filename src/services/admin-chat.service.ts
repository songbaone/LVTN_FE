import axiosClient from "./axiosClient";
import type { AxiosRequestConfig } from "axios";

export const adminChatService = {
  getRooms: (
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      staffId?: number;
    },
    config?: AxiosRequestConfig
  ) => axiosClient.get("/admin/chat", { params, ...config }),

  getRoom: (roomId: number | string, config?: AxiosRequestConfig) =>
    axiosClient.get(`/admin/chat/${roomId}`, { ...config }),

  getMessages: (
    roomId: number | string,
    params?: { cursor?: number; limit?: number; direction?: "before" | "after" },
    config?: AxiosRequestConfig
  ) => axiosClient.get(`/admin/chat/${roomId}/messages`, { params, ...config }),

  sendMessage: (data: { message: string; message_type: string; room_id: number | string }) =>
    axiosClient.post("/admin/chat/messages", data),

  assignRoom: (roomId: number | string) =>
    axiosClient.patch(`/admin/chat/${roomId}/assign`),

  markRead: (roomId: number | string) =>
    axiosClient.patch(`/admin/chat/${roomId}/read`),

  closeRoom: (roomId: number | string) =>
    axiosClient.patch(`/admin/chat/${roomId}/close`),

  uploadAttachment: (messageId: number | string, formData: FormData) =>
    axiosClient.post(`/admin/chat/messages/${messageId}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};