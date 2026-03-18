export enum EInvoiceStatus {
  PENDING = "PENDING", // Đang chờ tạo
  ISSUED = "ISSUED", // Đã phát hành thành công
  FAILED = "FAILED", // Phát hành thất bại
  CANCELED = "CANCELED", // Đã hủy
}
