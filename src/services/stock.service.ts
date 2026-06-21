import axiosClient from "./axiosClient";

export const stockService = {
  getDashboard: () =>
    axiosClient.get("/stocks/dashboard"),

  getStocks: (params?: {
    search?: string;
    category_id?: number;
    brand_id?: number;
    page?: number;
    limit?: number;
  }) =>
    axiosClient.get("/stocks", { params }),

  getProductStock: (productId: string) =>
    axiosClient.get(`/stocks/${productId}`),

  getLowStock: (params?: {
    search?: string;
    page?: number;
    pageSize?: number;
  }) =>
    axiosClient.get("/stocks/low-stock", { params }),

  getOutOfStock: (params?: {
    search?: string;
    page?: number;
    pageSize?: number;
  }) =>
    axiosClient.get("/stocks/out-of-stock", { params }),

  importStock: (data: {
    product_id: number;
    variants: Array<{ variant_id: number; quantity: number }>;
  }) =>
    axiosClient.post("/stocks/import", data),

  adjustStock: (data: {
    variant_id: number;
    stock_quantity: number;
    note?: string;
  }) =>
    axiosClient.post("/stocks/adjust", data),

  downloadTemplate: () =>
    axiosClient.get("/stocks/export-template", {
      responseType: "blob",
    }),

  previewImport: (formData: FormData) =>
    axiosClient.post("/stocks/preview-import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  importExcel: (formData: FormData) =>
    axiosClient.post("/stocks/import-excel", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  exportReport: () =>
    axiosClient.get("/stocks/export-report", {
      responseType: "blob",
    }),
};