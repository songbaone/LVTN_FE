import axiosClient from "./axiosClient";

export interface CreateCartRequest {
  variant_id: number;
  quantity: number;
}

export const cartService = {
  getCart: () => axiosClient.get("/cart"),

  createCart: (data: CreateCartRequest) =>
    axiosClient.post("/cart/items", data),
};
