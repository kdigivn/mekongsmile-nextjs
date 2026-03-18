import { useCallback, useMemo } from "react";
import { PaymentSetting } from "../organizations/types/organization-setting";
import { TransactionTypeEnum } from "../bookings/transactions/types/transaction-type-enum";
import { buildApiPath } from "../build-api-path";
import { FerryTicketApiEndpoints } from "../endpoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import useQueryFetcher from "../common/use-query-fetcher";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import useFetch from "../common/use-fetch";
import wrapperFetchJsonResponse from "../common/wrapper-fetch-json-response";
import { deepLinkAppResponse } from "./types/deeplink-app";
import HTTP_CODES_ENUM from "../common/types/http-codes";

const paymentQueryKeys = createQueryKeys(["payments"], {
  generate: () => ({
    key: ["generate"],
  }),
  create: () => ({
    key: ["create"],
  }),
  getDeepLinkApps: () => ({
    key: ["getDeepLinkApps"],
  }),
});

/**
 * Create a VietQR URL
 * @returns URL to get VietQR QR
 */
export function useGenerateVietQRUrl() {
  return useCallback(
    (
      bank: string,
      accountNumber: string,
      template: "compact2" | "compact" | "qr_only" | "print",
      amount?: number,
      description?: string,
      accountName?: string
    ) => {
      if (accountNumber.length > 19) {
        throw new Error("Account number length excess 19 characters");
      }
      if (amount) {
        if (amount < 1000) {
          throw new Error("Minimum amount is 1000");
        }
        if (amount.toString().length > 13) {
          throw new Error("Maximum amount is 13 characters");
        }
      }
      if (description && description.length > 50) {
        throw new Error("Maximum length of description is 50 characters");
      }

      const requestUrl = new URL(
        `https://img.vietqr.io/image/${bank}-${accountNumber}-${template}.png`
      );

      if (amount) {
        requestUrl.searchParams.append("amount", amount.toString());
      }
      if (description) {
        requestUrl.searchParams.append("addInfo", description);
      }
      if (accountName) {
        requestUrl.searchParams.append("accountName", accountName);
      }

      return requestUrl.toString();
    },

    []
  );
}

/**
 * Get payment QR code URL
 * @param amount transaction amount
 * @param transactionMessage transactin message
 * @returns URL of payment QR code
 */
export const useGetPaymentQRUrl = (paymentInfo?: PaymentSetting) => {
  const getVietQrUrl = useGenerateVietQRUrl();

  return useCallback(
    (amount: number, transactionMessage?: string) =>
      getVietQrUrl(
        paymentInfo?.bank_name ?? "Vietcombank",
        paymentInfo?.bank_account_number ?? "1043706565",
        "compact",
        amount !== 0 ? Math.round(amount || 0) : undefined,
        transactionMessage
      ),
    [getVietQrUrl, paymentInfo?.bank_account_number, paymentInfo?.bank_name]
  );
};

export type GeneratePaymentUrl = {
  type: TransactionTypeEnum;
  id: string;
  paymentAmount: number;
  returnUrl: string;
};

export function useGeneratePaymentUrlMutation() {
  const fetch = useQueryFetcher();
  const url = buildApiPath(FerryTicketApiEndpoints.v1.payments.onepay);
  const { mutate, mutateAsync, error, isSuccess, isPending, reset } =
    useMutation({
      mutationKey: paymentQueryKeys.generate().key,
      mutationFn: (request: GeneratePaymentUrl) => {
        return fetch(url, "POST", JSON.stringify(request));
      },
    });

  const memoizedValue = useMemo(
    () => ({
      postPayment: mutate,
      postPaymentAsync: mutateAsync,
      postPaymentError: error,
      postPaymentSuccess: isSuccess,
      postPaymentPending: isPending,
      postPaymentReset: reset,
    }),
    [error, isPending, isSuccess, mutate, mutateAsync, reset]
  );

  return memoizedValue;
}

export type OnepayCheckRequest = {
  searchParams: string;
};

export type OnepayCheckResponse = {
  valid: boolean;
};

export function useCheckOnepayService() {
  const fetchBase = useFetch();

  return useCallback(
    (data: OnepayCheckRequest) => {
      const requestUrl = buildApiPath(
        FerryTicketApiEndpoints.v1.payments.verify
      );

      const urlSearchParams = new URLSearchParams(data.searchParams);

      // Remove unwanted params
      urlSearchParams.delete("payment_method");
      urlSearchParams.delete("booking_id");
      urlSearchParams.delete("agreedTerms");
      urlSearchParams.delete("customerId");
      urlSearchParams.delete("paymentAmount");
      requestUrl.search = urlSearchParams.toString();

      return fetchBase(requestUrl, {
        method: "GET",
      }).then(wrapperFetchJsonResponse<OnepayCheckResponse>);
    },
    [fetchBase]
  );
}

export type PostSMSBankingTransactionMessageRequest = {
  type: string;
  id: string;
};

export type TransactionMessageResponse = {
  transactionMessage: string;
  paymentCode: string;
  expiresAt: number;
};
export function useTransactionMessagePostMutation() {
  const fetch = useQueryFetcher();
  const url = buildApiPath(
    FerryTicketApiEndpoints.v1.payments.postSMSBankingTransactionMessage
  );

  const { mutate, mutateAsync, error, isSuccess, isPending, reset } =
    useMutation({
      // Adjusted to use the `create` key for the mutation
      mutationKey: paymentQueryKeys.create().key,
      mutationFn: (request: PostSMSBankingTransactionMessageRequest) => {
        return fetch(url, "POST", JSON.stringify(request));
      },
    });

  const memoizedValue = useMemo(
    () => ({
      postTransactionMessage: mutate,
      postTransactionMessageAsync: mutateAsync,
      postTransactionMessageError: error,
      postTransactionMessageSuccess: isSuccess,
      postTransactionMessagePending: isPending,
      postTransactionMessageReset: reset,
    }),
    [error, isPending, isSuccess, mutate, mutateAsync, reset]
  );

  return memoizedValue;
}

export function useGetDeepLinkApps(
  os: "ios" | "android",
  enable: boolean = true
) {
  const fetchBase = useFetch();

  const { data, error, isSuccess, isPending, isLoading, refetch } = useQuery({
    queryKey: paymentQueryKeys.getDeepLinkApps().key,
    queryFn: async () => {
      const requestUrl =
        os === "ios"
          ? FerryTicketApiEndpoints["third-party"].vietQR.getDeepLinkApps.ios
          : FerryTicketApiEndpoints["third-party"].vietQR.getDeepLinkApps
              .android;
      const response = await fetchBase(requestUrl, {
        method: "GET",
      }).then(wrapperFetchJsonResponse<deepLinkAppResponse>);
      if (response.status !== HTTP_CODES_ENUM.OK) {
        // 1 step: try to get from server json file
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/static/payment-bank-app/${os}-bank-apps.json`
        );
        if (res.status !== HTTP_CODES_ENUM.OK) {
          throw new Error("Failed to get deep link apps");
        }
        const data = await res.json();
        return data;
      }
      return response.data;
    },
    enabled: enable,
  });

  const memoizedValue = useMemo(
    () => ({
      deepLinkApps: data,
      deepLinkAppsError: error,
      deepLinkAppsSuccess: isSuccess,
      deepLinkAppsPending: isPending,
      deepLinkAppsLoading: isLoading,
      deepLinkAppsRefetch: refetch,
    }),
    [data, error, isPending, isSuccess, isLoading, refetch]
  );

  return memoizedValue;
}
