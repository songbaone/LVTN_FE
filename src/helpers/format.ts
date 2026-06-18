import moment from "moment";
import "moment/locale/vi";

moment.locale("vi");

/**
 * Format ngày giờ: 18/06/2026 15:30
 */
export const formatDateTime = (
  date: string | Date,
  format = "DD/MM/YYYY HH:mm",
) => {
  return moment(date).format(format);
};

/**
 * Format ngày: 18/06/2026
 */
export const formatDate = (date: string | Date) => {
  return moment(date).format("DD/MM/YYYY");
};

/**
 * Format giờ: 15:30
 */
export const formatTime = (date: string | Date) => {
  return moment(date).format("HH:mm");
};

/**
 * Hiển thị dạng tương đối
 * VD: 2 giờ trước, 3 ngày trước
 */
export const formatFromNow = (date: string | Date) => {
  return moment(date).fromNow();
};
