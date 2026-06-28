import axiosClient from "./axiosClient";

export const brandService = {
  getAll: (params?: any) => axiosClient.get("/brands", { params }),

  getById: (id: number) => axiosClient.get(`/brands/${id}`),

  create: (data: FormData) =>
    axiosClient.post("/brands", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: number, data: FormData) =>
    axiosClient.put(`/brands/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id: number) => axiosClient.delete(`/brands/${id}`),
};
