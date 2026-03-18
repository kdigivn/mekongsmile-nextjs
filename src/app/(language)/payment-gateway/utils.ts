import { PaymentMethodEnum } from "@/services/apis/bookings/transactions/types/transaction-type-enum";

interface RedirectToPaymentPageParams {
  paymentMethod: PaymentMethodEnum;
  bookingId: string;
  currentBalance: number;
  isCheck: boolean;
  redirectBack?: string;
  customerId?: number;
  paymentAmount?: number;
}

export const redirectToPaymentPage = ({
  paymentMethod,
  bookingId,
  currentBalance,
  isCheck,
  redirectBack,
  customerId,
  paymentAmount,
}: RedirectToPaymentPageParams) => {
  let url = "";
  switch (paymentMethod) {
    case PaymentMethodEnum.DirectAtCounter:
      url = `/payment-gateway/offline/?payment_method=${paymentMethod}&booking_id=${bookingId}&balance=${currentBalance}&agreedTerms=${isCheck}&redirectBack=${redirectBack}`;
      break;
    case PaymentMethodEnum.QRCode:
    case PaymentMethodEnum.BankTransfer:
      url = `/payment-gateway/banking/?payment_method=${paymentMethod}&booking_id=${bookingId}&balance=${currentBalance}&agreedTerms=${isCheck}`;
      break;
    case PaymentMethodEnum.Onepay:
      url = `/payment-gateway/onepay/?payment_method=${paymentMethod}&booking_id=${bookingId}&balance=${currentBalance}&agreedTerms=${isCheck}&customerId=${customerId}&paymentAmount=${paymentAmount}`;
      break;
    default:
      url = `/payment-gateway/offline/?payment_method=${PaymentMethodEnum.DirectAtCounter}&booking_id=${bookingId}&balance=${currentBalance}&agreedTerms=${isCheck}&redirectBack=${redirectBack}`;
      break;
  }
  return url;
};

export interface URLQueryParams {
  payment_method?: string;
  booking_id?: string;
  agreedTerms?: string;
  customerId?: string;
  paymentAmount?: string | number;
}

export const gatewayEndpoints = {
  onepay: {
    result: "/payment-gateway/onepay/transaction-result",
  },
};

export interface URLParams {
  [key: string]: string | number | boolean | undefined;
}

export const buildURL = (url: string, params?: URLParams): URL => {
  const urlObject = new URL(url);

  if (params) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    urlObject.search = searchParams.toString();
  }

  return urlObject;
};

export const addPaymentFee = (
  amount: number,
  fixedFeePerTransaction?: number,
  feePerPercentageOfPaymentAmount?: number
) => {
  return Math.ceil(
    (fixedFeePerTransaction ?? 0) +
      (amount * (feePerPercentageOfPaymentAmount ?? 0)) / 100
  );
};
