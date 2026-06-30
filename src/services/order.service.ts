import axiosClient from "./axiosClient";

// ── Types ──

export interface OrderItem {
  order_detail_id: number;
  product_id: number;
  product_name: string;
  sku: string;
  color: string;
  size: string;
  material: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  thumbnail?: string;
}

export interface OrderAddress {
  receiver_name?: string;
  receiver_phone?: string;
  province: string;
  district: string;
  ward: string;
  address_line: string;
  detail_address: string;
}

export interface OrderCoupon {
  coupon_code: string;
  coupon_name: string;
  discount_value: number;
}

export interface Order {
  order_id: number;
  order_code: string;
  status: string;
  order_status: string;
  customer_name?: string;
  payment_method: string;
  payment_status: string;
  total_amount: number;
  discount_amount: number;
  shipping_fee: number;
  final_amount: number;
  note: string | null;
  created_at: string;
  address?: OrderAddress;
  coupon?: OrderCoupon | null;
  order_details?: OrderItem[];
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface OrdersListResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: PaginationMeta;
  };
}

export interface OrderDetailResponse {
  success: boolean;
  data: {
    order: Order;
    address: OrderAddress;
    coupon: OrderCoupon | null;
    order_details: OrderItem[];
  };
}

// ── Service ──

export const orderService = {
  getOrders: (page = 1) =>
    axiosClient.get<OrdersListResponse>(`/orders?page=${page}`),

  getAdminOrders: (page = 1) =>
    axiosClient.get<OrdersListResponse>(`/admin/orders?page=${page}`),

  getOrderById: (orderId: number | string) =>
    axiosClient.get<OrderDetailResponse>(`/orders/${orderId}`),

  cancelOrder: (orderId: number | string) =>
    axiosClient.patch(`/orders/${orderId}/cancel`),
};
