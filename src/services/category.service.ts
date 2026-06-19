import axiosClient from "./axiosClient";

export const categoryService = {
  getTree: () =>
    axiosClient.get("/categories/tree"),

  getAll: (params?: any) =>
    axiosClient.get("/categories", { params }),

  create: (data: FormData | any) => {
    const config = data instanceof FormData
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : {};
    return axiosClient.post("/categories", data, config);
  },

  update: (id: number, data: FormData | any) => {
    const config = data instanceof FormData
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : {};
    return axiosClient.put(`/categories/${id}`, data, config);
  },

  getStatistics: () =>
    axiosClient.get("/categories/statistics"),

  delete: (id: number) =>
    axiosClient.delete(`/categories/${id}`),
};