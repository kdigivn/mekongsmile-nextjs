export enum TransactionTypeEnum {
  /**
   * Old types
   */
  // // Thanh toán đơn hàng (đặt vé) (KHÔNG SỬ DỤNG NỮA)
  // PayOrder = "PO",
  // // Rút tiền (đại lý)
  // Withdraw = "WD",
  // // Xuất vé
  // IssueTicket = "IT",
  // // Xuất vé lỗi
  // IssueTicketError = "ITE",

  // Thanh toán đơn hàng (đặt vé) có thể gồm chiều đi, về
  PayBooking = "PB",
  // Nạp tiền tài khoản
  Deposit = "DP",
  // Nạp tiền vào tài khoản đại lý
  OrganizationDeposit = "OD",
  // Giao dịch đồng bộ tài khoản của root org với số dư trên hãng
  SyncWithOperator = "SO",
  // Giao dịch trống (dành để thông báo)
  Blank = "BL",
  // Không rõ (giao dịch không xác định)
  Unknown = "UK",
  // Khách hàng vay nợ
  CustomerBorrowMoney = "CB",
  // Khách hàng trả nợ
  CustomerRepayDebt = "CR",
  // Hold money for order payment
  PayOrder = "PO",
  // Return hold money due to an error in order payment process
  RevertPayment = "CH",
  /**
   * Refund payment when customer cancel ticket
   */
  RefundPayment = "RF",
  /**
   * Reconciliation and debt clearing
   */
  DebtReconciliation = "DR",
}

export enum TransactionChangeTypeEnum {
  Increase = "INC",
  Decrease = "DEC",
}

export enum TransactionStatusEnum {
  Failed = 0,
  Succeed = 1,
  Cancelled = 2,
}

export enum PaymentMethodEnum {
  QRCode = "0",
  BankTransfer = "1",
  DirectAtCounter = "2",
  Onepay = "3",
}

export enum TransactionOwnerTypeEnum {
  Customer = "customer",
  // Company = 'company',
  Booking = "booking",
  Order = "order",
  Operator = "operator",
  Organization = "organization",
  Unknown = "unknown",
}
