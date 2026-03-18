export enum OrderStatusEnum {
  // Nháp
  Draft = 0,
  // Đã gửi yêu cầu đặt vé, chờ thanh toán
  Requested = 2,
  // Đã thanh toán, chờ NCMK đặt vé
  WaitForIssue = 4,
  // Lỗi khi xuất vé
  ExportError = 6,
  // Chưa thanh toán do quá hạn thanh toán hoặc tàu đã chạy..
  Expired = 8,
  // Đã đặt vé
  Booked = 10,
  // Yêu cầu hủy đơn
  CancelRequest = 12, //
  // Đã hủy đơn
  Cancelled = 14, //
  // Đã hủy do tàu không khởi hành
  // CancelledBecauseBoatNotDepart = 16,
  // // Đã hoàn tiền
  // Refunded = 18,
  // // Bắt buộc hủy đơn
  // ForcedCancelled = 20,
}
