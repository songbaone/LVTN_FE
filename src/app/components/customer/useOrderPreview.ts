import { useState, useEffect, useRef, useCallback } from "react";
import { checkoutService, type OrderPreviewResponse } from "../../../services/checkout.service";
import { toast } from "sonner";

// ── Types ──

interface UseOrderPreviewParams {
  addressId: number | null;
  couponCode: string;
}

interface UseOrderPreviewReturn {
  preview: OrderPreviewResponse | null;
  previewLoading: boolean;
  applyCoupon: () => void;
  couponStatus: CouponStatus;
}

export type CouponStatus =
  | { type: "idle" }
  | { type: "applied"; code: string }
  | { type: "error"; message: string };

// ── Hook ──

export function useOrderPreview({
  addressId,
  couponCode,
}: UseOrderPreviewParams): UseOrderPreviewReturn {
  const [preview, setPreview] = useState<OrderPreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [couponStatus, setCouponStatus] = useState<CouponStatus>({ type: "idle" });

  // Keep the last successful result so we can keep showing it on error
  const lastSuccessfulRef = useRef<OrderPreviewResponse | null>(null);

  // Track the latest request to avoid stale responses
  const requestIdRef = useRef(0);

  // Debounce timer
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track if component is mounted (for Strict Mode safety)
  const mountedRef = useRef(false);

  // ── Debug: log mount and parameter changes ──

  console.log("[useOrderPreview] Hook rendered with:", { addressId, couponCode });

  // ── Core fetch function ──

  const fetchPreview = useCallback(
    async (addrId: number, coupon: string, reqId: number) => {
      console.log("[useOrderPreview] fetchPreview called", { addrId, coupon, reqId });
      console.log("[useOrderPreview] Request ID check:", { reqId, current: requestIdRef.current });

      if (!mountedRef.current) {
        console.log("[useOrderPreview] Not mounted, aborting fetch");
        return;
      }

      setPreviewLoading(true);

      try {
        const payload = {
          address_id: addrId,
          coupon_code: coupon.trim() || undefined,
        };
        console.log("[useOrderPreview] Calling API with payload:", payload);

        const res = await checkoutService.previewOrder(payload);
        console.log("Payload sent to API:", payload);
        console.log("[useOrderPreview] API call successful, response:", res);

        console.log("[useOrderPreview] API response received:", res);

        // Ignore stale responses
        if (reqId !== requestIdRef.current) {
          console.log("[useOrderPreview] Stale response ignored", { reqId, current: requestIdRef.current });
          return;
        }

        const data: OrderPreviewResponse = res.data;
        console.log("[useOrderPreview] Setting preview data:", data);
        setPreview(data.data);
        lastSuccessfulRef.current = data;

        // Update coupon status
        if (data.coupon) {
          setCouponStatus({ type: "applied", code: data.coupon.coupon_code });
        } else {
          console.log("[useOrderPreview] No coupon in response, setting idle");
          setCouponStatus({ type: "idle" });
        }
      } catch (err: any) {
        console.log("[useOrderPreview] API error:", err);

        // Ignore stale responses
        if (reqId !== requestIdRef.current) return;

        // On error, keep the last successful result
        setPreview(lastSuccessfulRef.current);

        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Không thể tính toán đơn hàng";

        // If there's a coupon code, show the error as coupon status
        if (coupon.trim()) {
          setCouponStatus({ type: "error", message: msg });
        }

        toast.error(msg);
      } finally {
        if (reqId === requestIdRef.current) {
          setPreviewLoading(false);
        }
      }
    },
    []
  );

  // ── Auto-trigger when addressId or (debounced) couponCode changes ──

  useEffect(() => {
    console.log("[useOrderPreview] useEffect triggered", {
      addressId,
      couponCode,
      mounted: mountedRef.current,
    });

    // Guard: need a valid address to call preview
    if (addressId === null) {
      console.log("[useOrderPreview] addressId is null, skipping");
      return;
    }

    // Mark as mounted on first run
    mountedRef.current = true;

    // Clear any pending debounce
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const reqId = ++requestIdRef.current;
    console.log("[useOrderPreview] Generated request ID:", reqId);

    // If couponCode is empty, fetch immediately
    // If couponCode has a value, debounce 600ms
    if (!couponCode.trim()) {
      console.log("[useOrderPreview] Empty coupon, calling fetchPreview immediately");
      fetchPreview(addressId, couponCode, reqId);
    } else {
      console.log("[useOrderPreview] Has coupon, setting debounce 600ms");
      timerRef.current = setTimeout(() => {
        console.log("[useOrderPreview] Debounce timer fired, calling fetchPreview");
        fetchPreview(addressId, couponCode, reqId);
      }, 600);
    }

    return () => {
      console.log("[useOrderPreview] Cleanup running, clearing timer");
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [addressId, couponCode, fetchPreview]);

  // ── Manual apply (Enter key / blur) ──

  const applyCoupon = useCallback(() => {
    console.log("[useOrderPreview] applyCoupon called", { addressId, couponCode });

    if (addressId === null) {
      console.log("[useOrderPreview] applyCoupon: addressId is null, skipping");
      return;
    }

    if (timerRef.current) {
      console.log("[useOrderPreview] applyCoupon: clearing pending debounce");
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const reqId = ++requestIdRef.current;
    console.log("[useOrderPreview] applyCoupon: generated request ID:", reqId);
    fetchPreview(addressId, couponCode, reqId);
  }, [addressId, couponCode, fetchPreview]);

  return { preview, previewLoading, applyCoupon, couponStatus };
}