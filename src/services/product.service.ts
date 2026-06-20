import axiosClient from "./axiosClient";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const productService = {
  getAll: (params?: any) =>
    axiosClient.get("/products", { params }),

  getById: (id: number) =>
    axiosClient.get(`/products/${id}`),

  create: (data: FormData) =>
    axiosClient.post("/products", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: number, data: FormData) =>
    axiosClient.put(`/products/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id: number) =>
    axiosClient.delete(`/products/${id}`),
};