import axiosClient from "./axiosClient";

export interface CheckoutRequest {
  address_id: number;
  payment_method: string;
  coupon_code?: string;
}

export interface CheckoutResponse {
  order_id?: number;
  message?: string;
  payment?: {
    method: string;
    payment_url: string;
  };
  data: any; // Replace 'any' with the actual type of the checkout response data if known
}

// ── Order Preview Types ──

export interface OrderPreviewRequest {
  address_id: number;
  coupon_code?: string;
}

export interface OrderPreviewResponse {
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  final_amount: number;
  coupon: {
    coupon_code: string;
    discount_amount: number;
  } | null;
  data: any; // Replace 'any' with the actual type of the order preview data if known
}

// ── Services ──

export const checkoutService = {
  checkout: (data: CheckoutRequest) =>
    axiosClient.post<CheckoutResponse>("/orders/checkout", data),

  previewOrder: (data: OrderPreviewRequest) =>
    axiosClient.post<OrderPreviewResponse>("/orders/preview", data),
};
