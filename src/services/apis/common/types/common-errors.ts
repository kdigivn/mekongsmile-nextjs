/**
 * Order errors
 * Code format: 1102xx
 */
export enum OperatorOrderErrors {
  /**
   * The payload of order invalid
   */
  PayloadInvalid = 110201,

  /**
   * Cannot create order as some seats from payload are not available
   */
  CreateOrderFailedDueToUnavailableSeats = 110205,

  /**
   * NCMK does not have enough money in balance to place order
   */
  OperatorBalanceNotEnough = 110210,

  UnknownErrorWhenCreateOrder = 110290,
  UnknownErrorWhenExportTicket = 110291,

  ModifyTicketFailedDueToTicketNotFound = 110292,

  OperatorIsDisabled = 150101,
  /**
   * Cannot create order due to duplicate social ID in order's tickets
   */
  DuplicateSocialId = 110215,
  DuplicateSocialIdOperator = 110216,
  InvalidTicketTypeId = 150107,
  InvalidSeatType = 150108,
  NoPriceMatched = 150109,
}

export enum BookingUnknownErrors {
  /**
   * Unknown error.
   */
  Unknown = 120000,
}

export enum BookingValidationErrors {
  /**
   * This booking has already trigger issuing ticket process & should not trigger another one.
   */
  AlreadyProcessingIssueTicket = 120100,
  /**
   * Customer balance is not enough.
   */
  CustomerBalanceNotEnough = 120101,
  /**
   * Invalid input.
   */
  InvalidInput = 120105,
  /**
   * Invalid status.
   */
  InvalidStatus = 120110,
  /**
   * No customer attached.
   */
  NoCustomerAttached = 120115,
  /**
   * Organization balance is not enough.
   */
  OrganizationBalanceNotEnough = 120120,
}

export enum BoatLayoutValidationErrors {
  OperatorIsDisabled = 110301,
  /**
   * Validation errors. Code format: 1501xx
   */
}

export enum OrderValidationErrors {
  /**
   * For generic input validation error
   */
  DuplicateSocialId = 150105,
  LimitVoucherPerCustomer = 150133,
}

export enum OrderIssueTicketErrors {
  UnavailableSeats = 150201,
}
