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

  toggleStatus: (variantId: number, status: boolean) => {
    const payload = { status: status ? 1 : 0 };
    console.log("TOGGLE VARIANT STATUS CALLED", { variantId, status, payload });
    return axiosClient.put(`/variants/${variantId}`, payload);
  },

  softDelete: (variantId: number) =>
    axiosClient.delete(`/variants/soft-delete/${variantId}`),

  delete: (variantId: number) =>
    axiosClient.delete(`/variants/${variantId}`),
};