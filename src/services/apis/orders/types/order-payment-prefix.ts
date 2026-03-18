export enum OrderPaymentPrefix {
  /**
   * Used for user when making booking.
   *
   * Syntax: `PM bookingID`
   *
   * @example PM 1234xx
   */
  booking = "PB",
  /**
   * Used for partner when deposit fund into their account.
   *
   * Syntax: `DM userID`
   *
   * @example DM abcxyz
   */
  deposit = "DM",
  /**
   * Issue ticket
   */
  issueTicket = "IT",

  // Nạp tiền tài khoản customer
  CustomerDeposit = "DP",
}
