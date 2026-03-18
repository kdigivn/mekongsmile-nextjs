export enum BookingPaymentStatusEnum {
  // Chưa thanh toán
  NotPaid = 1,
  // Thanh toán chưa đủ tiền
  PayNotEnough = 3,
  // Đã thanh toán, chờ NCMK đặt vé
  Paid = 4,
  // Đã thanh toán (công nợ), đã thanh toán cho đơn hàng nhưng khách đang nợ tiền
  PaidWithDebt = 5,
  // Đã hoàn tiền
  Refunded = 18,
}
