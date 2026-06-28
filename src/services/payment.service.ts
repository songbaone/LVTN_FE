import axiosClient from "./axiosClient";

export type VNPayParams = Record<string, string>;

export interface VNPayConfirmResponse {
  success: boolean;
  message: string;
}

export const paymentService = {
  confirmVNPay: (vnpParams: VNPayParams) =>
    axiosClient.post<VNPayConfirmResponse>("/payments/vnpay/confirm", vnpParams),
};
