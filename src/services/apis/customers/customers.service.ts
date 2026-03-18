import { useMemo } from "react";
import { FerryTicketApiEndpoints } from "../endpoints";
import { buildApiPath } from "../build-api-path";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { Customer } from "./types/customer";
import useQueryFetcher from "../common/use-query-fetcher";

const customerQueryKeys = createQueryKeys(["customers"], {
  list: () => ({
    key: [],
  }),
  detail: (request: Customer["id"]) => ({
    key: [request],
  }),
  // Adding a key for POST operation
  create: () => ({
    key: ["create"],
    // Optionally, if you need to differentiate between different POST operations, you can add parameters and dynamic values here.
  }),
  updateProfile: (request: PatchCustomerRequest) => ({
    key: [request],
  }),
});

export type PatchCustomerRequest = {
  first_name?: string;
  last_name?: string;
  photo?: {
    id: string;
    path: string;
  };
};

export function useCustomerPatchProfileMutation() {
  const queryClient = useQueryClient();
  const fetch = useQueryFetcher();
  const url = buildApiPath(FerryTicketApiEndpoints.v1.customers.updateProfile);
  const { mutate, mutateAsync, error, isSuccess, isPending, reset } =
    useMutation({
      mutationKey: customerQueryKeys.all().key,
      mutationFn: async (request: PatchCustomerRequest) =>
        fetch(url, "PATCH", JSON.stringify(request)),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["auth", "getMe"],
        });
      },
    });

  const memoizedValue = useMemo(
    () => ({
      patchCustomer: mutate,
      patchCustomerAsync: mutateAsync,
      patchCustomerError: error,
      patchCustomerSuccess: isSuccess,
      patchCustomerPending: isPending,
      patchCustomerReset: reset,
    }),
    [error, isPending, isSuccess, mutate, mutateAsync, reset]
  );

  return memoizedValue;
}
