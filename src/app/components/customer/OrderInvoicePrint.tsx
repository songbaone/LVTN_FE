import { type Order, type OrderAddress, type OrderCoupon, type OrderItem } from "../../../services/order.service";
import { formatDateTime } from "../../../helpers/format";
import logo from "../../assets/image/logo.jpg";

// ── Format Price ──

function formatPrice(price?: number): string {
  return (price ?? 0).toLocaleString("vi-VN") + " ₫";
}

// ── Payment method mapping ──

const paymentMethodLabels: Record<string, string> = {
  cod: "Thanh toán khi nhận hàng (COD)",
  transfer: "Chuyển khoản ngân hàng",
  vnpay: "VNPay",
  momo: "Ví MoMo",
  zalopay: "ZaloPay",
};

function getPaymentMethodLabel(method: string): string {
  return paymentMethodLabels[method.toLowerCase()] || method;
}

// ── Status labels ──

const statusLabels: Record<string, string> = {
  Pending: "Chờ xác nhận",
  Confirmed: "Đã xác nhận",
  Shipping: "Đang vận chuyển",
  Delivered: "Đã giao hàng",
  Cancelled: "Đã hủy",
};

const paymentStatusLabels: Record<string, string> = {
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán",
  refunded: "Đã hoàn tiền",
  failed: "Thanh toán thất bại",
};

// ── Props ──

interface OrderInvoicePrintProps {
  order: Order;
  address: OrderAddress | null;
  coupon: OrderCoupon | null;
  orderDetails: OrderItem[];
  isAdmin?: boolean;
}

export default function OrderInvoicePrint({
  order,
  address,
  coupon,
  orderDetails,
  isAdmin = false,
}: OrderInvoicePrintProps) {
  const printDate = formatDateTime(new Date().toISOString());

  return (
    <div className="invoice-print-container">
      <div className="invoice-page">
        {/* ── Header ── */}
        <div className="invoice-header">
          <div className="invoice-header-left">
            <img src={logo} alt="BabyStore" className="invoice-logo" />
          </div>
          <div className="invoice-header-center">
            <h1 className="invoice-store-name">BabyStore</h1>
            <h2 className="invoice-title">HÓA ĐƠN BÁN HÀNG</h2>
          </div>
          <div className="invoice-header-right">
            <p className="invoice-field">
              <span className="invoice-label">Mã đơn:</span>
              <span className="invoice-value">{order.order_code}</span>
            </p>
            <p className="invoice-field">
              <span className="invoice-label">Ngày đặt:</span>
              <span className="invoice-value">
                {formatDateTime(order.created_at)}
              </span>
            </p>
          </div>
        </div>

        <div className="invoice-divider" />

        {/* ── Store & Customer Info ── */}
        <div className="invoice-info-grid">
          <div className="invoice-info-block">
            <h3 className="invoice-section-title">Cửa hàng</h3>
            <p className="invoice-text-bold">BabyStore</p>
            <p className="invoice-text">
              98 Trưng Trắc, Khóm 01, Vĩnh Châu, Cần Thơ, Việt Nam
            </p>
            <p className="invoice-text">Điện thoại: 1900 1234 56</p>
            <p className="invoice-text">Email: info@babystore.vn</p>
            <p className="invoice-text">Website: www.babystore.vn</p>
          </div>
          <div className="invoice-info-block">
            <h3 className="invoice-section-title">Khách hàng</h3>
            {address ? (
              <>
                <p className="invoice-text-bold">{address.receiver_name}</p>
                <p className="invoice-text">Điện thoại: {address.receiver_phone}</p>
                <p className="invoice-text">
                  Địa chỉ: {address.address_line}, {address.ward},{" "}
                  {address.district}, {address.province}
                </p>
                {address.detail_address && (
                  <p className="invoice-text">
                    Chi tiết: {address.detail_address}
                  </p>
                )}
              </>
            ) : (
              <p className="invoice-text">Không có thông tin</p>
            )}
          </div>
        </div>

        {/* ── Order Info Row ── */}
        <div className="invoice-order-info">
          <p className="invoice-field">
            <span className="invoice-label">Mã đơn hàng:</span>
            <span className="invoice-value">{order.order_code}</span>
          </p>
          <p className="invoice-field">
            <span className="invoice-label">Phương thức thanh toán:</span>
            <span className="invoice-value">
              {getPaymentMethodLabel(order.payment_method)}
            </span>
          </p>
          <p className="invoice-field">
            <span className="invoice-label">Trạng thái thanh toán:</span>
            <span className="invoice-value">
              {paymentStatusLabels[order.payment_status?.toLowerCase()] ??
                order.payment_status}
            </span>
          </p>
          <p className="invoice-field">
            <span className="invoice-label">Trạng thái đơn hàng:</span>
            <span className="invoice-value">
              {statusLabels[order.order_status] ?? order.order_status}
            </span>
          </p>
        </div>

        <div className="invoice-divider" />

        {/* ── Product Table ── */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th className="text-center" style={{ width: "40px" }}>
                #
              </th>
              <th>Sản phẩm</th>
              <th>SKU</th>
              <th>Phiên bản</th>
              <th className="text-center">SL</th>
              <th className="text-right">Đơn giá</th>
              <th className="text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {orderDetails.map((item, index) => {
              const variants = [
                item.color && `Màu: ${item.color}`,
                item.size && `Size: ${item.size}`,
                item.material && `Chất liệu: ${item.material}`,
              ]
                .filter(Boolean)
                .join(" / ");

              return (
                <tr key={item.order_detail_id}>
                  <td className="text-center">{index + 1}</td>
                  <td className="invoice-product-name">
                    {item.product_name}
                  </td>
                  <td>{item.sku}</td>
                  <td>{variants || "—"}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-right">
                    {formatPrice(item.unit_price)}
                  </td>
                  <td className="text-right">
                    {formatPrice(item.subtotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="invoice-divider" />

        {/* ── Order Summary ── */}
        <div className="invoice-summary">
          <div className="invoice-summary-row">
            <span>Tạm tính</span>
            <span>{formatPrice(order.total_amount)}</span>
          </div>
          <div className="invoice-summary-row">
            <span>Phí vận chuyển</span>
            <span>
              {order.shipping_fee === 0
                ? "Miễn phí"
                : formatPrice(order.shipping_fee)}
            </span>
          </div>
          {order.discount_amount > 0 && (
            <div className="invoice-summary-row invoice-discount">
              <span>Giảm giá</span>
              <span>-{formatPrice(order.discount_amount)}</span>
            </div>
          )}
          <div className="invoice-divider" />
          <div className="invoice-summary-row invoice-total">
            <span>Thành tiền</span>
            <span>{formatPrice(order.final_amount)}</span>
          </div>
        </div>

        {/* ── Coupon Info ── */}
        {coupon && (
          <div className="invoice-coupon">
            <p>
              <strong>Mã giảm giá:</strong> {coupon.coupon_code} —{" "}
              {coupon.coupon_name} (Giảm{" "}
              {formatPrice(coupon.discount_value)})
            </p>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="invoice-footer">
          <p className="invoice-thankyou">
            Cảm ơn quý khách đã mua hàng tại BabyStore.
          </p>
          {isAdmin && (
            <p className="invoice-printed-by">
              Người in: Quản trị viên
            </p>
          )}
          <p className="invoice-print-date">
            Ngày in: {printDate}
          </p>
        </div>
      </div>

      {/* ── Print Styles ── */}
      <style>{`
        /* ── Print-Only Container ── */
        .invoice-print-container {
          display: none;
        }

        @media print {
          /* Hide everything on the page except the invoice */
          body * {
            visibility: hidden !important;
          }

          .invoice-print-container,
          .invoice-print-container * {
            visibility: visible !important;
          }

          .invoice-print-container {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          /* ── Page Setup ── */
          @page {
            size: A4 portrait;
            margin: 15mm 20mm;
          }

          /* ── Invoice Page ── */
          .invoice-page {
            font-family: 'Times New Roman', Times, serif;
            color: #000;
            background: #fff;
            padding: 0;
            max-width: 100%;
          }

          .invoice-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
          }

          .invoice-header-left {
            flex-shrink: 0;
          }

          .invoice-logo {
            width: 70px;
            height: 70px;
            object-fit: contain;
          }

          .invoice-header-center {
            text-align: center;
            flex: 1;
          }

          .invoice-store-name {
            font-size: 22px;
            font-weight: bold;
            margin: 0 0 4px 0;
            text-transform: uppercase;
            color: #2563eb;
          }

          .invoice-title {
            font-size: 18px;
            font-weight: bold;
            margin: 0;
            letter-spacing: 2px;
            color: #000;
          }

          .invoice-header-right {
            text-align: right;
            flex-shrink: 0;
          }

          .invoice-field {
            margin: 2px 0;
            font-size: 12px;
          }

          .invoice-label {
            font-weight: bold;
            margin-right: 4px;
          }

          .invoice-value {
            font-weight: normal;
          }

          .invoice-divider {
            border-top: 1px solid #000;
            margin: 10px 0;
          }

          .invoice-info-grid {
            display: flex;
            gap: 40px;
            margin-bottom: 12px;
          }

          .invoice-info-block {
            flex: 1;
          }

          .invoice-section-title {
            font-size: 14px;
            font-weight: bold;
            margin: 0 0 6px 0;
            text-transform: uppercase;
            border-bottom: 1px solid #ccc;
            padding-bottom: 4px;
          }

          .invoice-text {
            font-size: 12px;
            margin: 2px 0;
            line-height: 1.5;
          }

          .invoice-text-bold {
            font-size: 13px;
            font-weight: bold;
            margin: 2px 0;
            line-height: 1.5;
          }

          .invoice-order-info {
            display: flex;
            flex-wrap: wrap;
            gap: 8px 24px;
            margin-bottom: 8px;
          }

          .invoice-order-info .invoice-field {
            flex: 0 0 auto;
          }

          /* ── Table ── */
          .invoice-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-bottom: 12px;
          }

          .invoice-table th {
            background: #f0f0f0;
            border: 1px solid #000;
            padding: 6px 4px;
            font-weight: bold;
            text-align: left;
          }

          .invoice-table td {
            border: 1px solid #000;
            padding: 5px 4px;
            vertical-align: top;
          }

          .text-center {
            text-align: center !important;
          }

          .text-right {
            text-align: right !important;
          }

          .invoice-product-name {
            font-weight: 500;
          }

          /* ── Summary ── */
          .invoice-summary {
            width: 320px;
            margin-left: auto;
            margin-bottom: 12px;
          }

          .invoice-summary-row {
            display: flex;
            justify-content: space-between;
            padding: 3px 0;
            font-size: 13px;
          }

          .invoice-discount {
            color: #16a34a;
          }

          .invoice-total {
            font-size: 16px;
            font-weight: bold;
          }

          /* ── Coupon ── */
          .invoice-coupon {
            font-size: 12px;
            margin-bottom: 10px;
            padding: 6px 10px;
            border: 1px dashed #2563eb;
            background: #f8faff;
          }

          /* ── Footer ── */
          .invoice-footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #ccc;
          }

          .invoice-thankyou {
            font-size: 14px;
            font-style: italic;
            margin: 0 0 4px 0;
          }

          .invoice-printed-by {
            font-size: 12px;
            color: #444;
            margin: 2px 0;
          }

          .invoice-print-date {
            font-size: 11px;
            color: #666;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}