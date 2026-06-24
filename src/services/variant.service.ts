import axiosClient from "./axiosClient";

export const variantService = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    product_id?: number;
    search?: string;
  }) => axiosClient.get("/variants", { params }),

  getByProductId: (productId: number) =>
    axiosClient.get(`/products/${productId}/variants`),

  getById: (variantId: number) =>
    axiosClient.get(`/variants/${variantId}`),

  create: (productId: number, data: Record<string, unknown>) =>
    axiosClient.post(`/products/${productId}/variants`, data),

  update: (variantId: number, data: Record<string, unknown>) =>
    axiosClient.put(`/variants/${variantId}`, data),

  softDelete: (variantId: number) =>
    axiosClient.post(`/variants/soft-delete/${variantId}`),

  delete: (variantId: number) =>
    axiosClient.delete(`/variants/${variantId}`),
};