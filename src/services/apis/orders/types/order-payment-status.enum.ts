export enum OrderPaymentStatusEnum {
  // Chưa thanh toán
  NotPaid = 1,
  // Thanh toán chưa đủ tiền
  PayNotEnough = 3,
  // Đã thanh toán, chờ NCMK đặt vé
  Paid = 4,
  // Đã hoàn tiền
  Refunded = 18,
  // Đơn đã hủy
  Cancelled = 30,
}
