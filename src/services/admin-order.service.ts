import axiosClient from "./axiosClient";
import type {
  Order,
  OrderDetailResponse,
} from "./order.service";

// ── Dashboard Types ──

export interface DashboardData {
  total_orders: number;
  pending_orders: number;
  confirmed_orders: number;
  shipping_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  today_orders: number;
  today_revenue: number;
  this_month_orders: number;
  this_month_revenue: number;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

// ── Orders List Types ──

export interface OrdersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  payment_status?: string;
  payment_method?: string;
  date?: string;
  sort?: string;
}

export interface AdminPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AdminOrdersListResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: AdminPagination;
  };
}

// ── Update Status Types ──

export interface UpdateStatusResponse {
  success: boolean;
  message?: string;
}

// ── Service ──

export const adminOrderService = {
  getDashboard: () =>
    axiosClient.get<DashboardResponse>("/admin/orders/dashboard"),

  getOrders: (params: OrdersQueryParams = {}) =>
    axiosClient.get<AdminOrdersListResponse>("/admin/orders", { params }),

  getOrderById: (id: number | string) =>
    axiosClient.get<OrderDetailResponse>(`/admin/orders/${id}`),

  updateOrderStatus: (id: number | string, status: string) =>
    axiosClient.patch<UpdateStatusResponse>(`/admin/orders/${id}/status`, {
      status,
    }),
};