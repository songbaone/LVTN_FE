import axiosClient from "./axiosClient";

export const addressService = {
  getAll: () => axiosClient.get("/addresses"),

  getById: (id: string | number) => axiosClient.get(`/addresses/${id}`),

  create: (data: {
    recipient_name: string;
    phone: string;
    address_line: string;
    ward: string;
    district: string;
    province: string;
    is_default: boolean;
  }) => axiosClient.post("/addresses", data),

  update: (
    id: string | number,
    data: {
      recipient_name: string;
      phone: string;
      address_line: string;
      ward: string;
      district: string;
      province: string;
      is_default: boolean;
    }
  ) => axiosClient.put(`/addresses/${id}`, data),

  delete: (id: string | number) => axiosClient.delete(`/addresses/${id}`),

  setDefault: (id: string | number) =>
    axiosClient.patch(`/addresses/${id}/default`),
};