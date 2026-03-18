import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { useMutation } from "@tanstack/react-query";
import { buildApiPath } from "../build-api-path";
import { FerryTicketApiEndpoints } from "../endpoints";
import useQueryFetcher from "../common/use-query-fetcher";
import { CommonAPIErrors } from "../common/types/validation-errors";
import { useMemo } from "react";
import { Voucher } from "./type/voucher";
import { CreateOrder } from "../orders/types/order";

const voucherQueryKeys = createQueryKeys(["voucher"], {
  applyVoucher: (voucherCode: string) => ({
    key: [voucherCode],
  }),
  getVoucherByCode: (voucherCode: string) => ({
    key: [voucherCode],
  }),
});

export type ApplyVoucherRequest = {
  voucher_code: string;
  order_payload: CreateOrder;
};

export type ApplyVoucherResponse = {
  isApplicable: boolean;
  voucher?: Voucher;
};

export function useApplyVoucherQuery(voucherCode: string) {
  const fetch = useQueryFetcher();

  const URL = buildApiPath(FerryTicketApiEndpoints.vouchers.apply);

  const { mutate, mutateAsync, error, isSuccess, isPending, reset } =
    useMutation<ApplyVoucherResponse, Error, ApplyVoucherRequest>({
      mutationKey: voucherQueryKeys.applyVoucher(voucherCode).key,
      mutationFn: async (payload: ApplyVoucherRequest) => {
        const response = await fetch<ApplyVoucherResponse>(
          URL,
          "POST",
          JSON.stringify(payload),
          {
            cache: "no-store",
          }
        );
        if (!response) {
          throw new Error("No response from server");
        }
        return response;
      },
    });
  // Kiểm tra và gán error.message nếu error là instance của Error
  const formattedErrorMessage = error instanceof Error ? error.message : null;
  const memoizedValue = useMemo(
    () => ({
      applyVoucher: mutate,
      applyVoucherAsync: mutateAsync,
      applyVoucherError: JSON.parse(
        formattedErrorMessage as string
      ) as CommonAPIErrors,
      applyVoucherSuccess: isSuccess,
      applyVoucherPending: isPending,
      applyVoucherReset: reset,
    }),
    [formattedErrorMessage, isPending, isSuccess, mutate, mutateAsync, reset]
  );

  return memoizedValue;
}
