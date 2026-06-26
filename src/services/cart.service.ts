import axiosClient from "./axiosClient";

export interface CreateCartRequest {
  variant_id: number;
  quantity: number;
}
export interface UpdateCartRequest {
  quantity: number;
}

export const cartService = {
  getCart: () => axiosClient.get("/cart"),

  createCart: (data: CreateCartRequest) =>
    axiosClient.post("/cart/items", data),

  updateCart: (cart_item_id: number, data: UpdateCartRequest) =>
    axiosClient.put(`/cart/items/${cart_item_id}`, data),

  deleteCart: (cart_item_id: number) =>
    axiosClient.delete(`cart/items/${cart_item_id}`),
};
