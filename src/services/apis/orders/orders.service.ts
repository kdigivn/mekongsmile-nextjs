import { useCallback, useMemo } from "react";
import { buildApiPath } from "../build-api-path";
import { RequestConfigType } from "../common/types/request-config";
import useFetch from "../common/use-fetch";
import wrapperFetchJsonResponse from "../common/wrapper-fetch-json-response";
import { FerryTicketApiEndpoints } from "../endpoints";
import { CreateOrder, Order } from "./types/order";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import useQueryFetcher from "../common/use-query-fetcher";
import { bookingQueryKeys } from "../bookings/bookings.service";

export type PostCreateOrderResponse = Order;
export type PostCreateOrderRequest = CreateOrder;

export function usePostCreateOrder() {
  const fetch = useFetch();

  return useCallback(
    (data: PostCreateOrderRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = buildApiPath(FerryTicketApiEndpoints.v1.orders.index);
      return fetch(requestUrl, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<PostCreateOrderResponse>);
    },
    [fetch]
  );
}

export type GetOrderByIdRequest = {
  id: Order["id"];
};
export type GetOrderByIdResponse = Order;

export function serverGetOrderById(
  data: GetOrderByIdRequest,
  requestConfig?: RequestConfigType
) {
  const requestUrl = buildApiPath(
    FerryTicketApiEndpoints.v1.orders.byId(data.id)
  );

  return fetch(requestUrl, {
    method: "GET",
    cache: "no-store",
    ...requestConfig,
  }).then(wrapperFetchJsonResponse<GetOrderByIdResponse>);
}

export function useGetOrderById() {
  const fetch = useFetch();
  return useCallback(
    (data: GetOrderByIdRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = buildApiPath(
        FerryTicketApiEndpoints.v1.orders.byId(data.id)
      );

      return fetch(requestUrl, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<GetOrderByIdResponse>);
    },
    [fetch]
  );
}

export type UpdatePassengerInfoRequest = {
  seat_name: string;
  name?: string;
  social_id?: string;
};

export function useUpdatePassengerInfoMutation(
  id: Order["id"],
  bookingId?: string
) {
  const fetch = useQueryFetcher();
  const queryClient = useQueryClient();
  const url = buildApiPath(
    FerryTicketApiEndpoints.v1.orders.updatePassengerInfo(id)
  );

  const { mutate, mutateAsync, error, isSuccess, isPending, reset, status } =
    useMutation({
      mutationKey: createQueryKeys(["orders", id]).all().key,
      mutationFn: async (request: UpdatePassengerInfoRequest) =>
        fetch(url, "PATCH", JSON.stringify(request)),
      onSuccess: () => {
        // Invalidate booking query if bookingId is provided
        if (bookingId) {
          queryClient.invalidateQueries({
            queryKey: bookingQueryKeys.detail(bookingId).key,
          });
        }
      },
    });

  const memoizedValue = useMemo(
    () => ({
      updatePassengerInfo: mutate,
      updatePassengerInfoAsync: mutateAsync,
      updatePassengerInfoError: error,
      updatePassengerInfoSuccess: isSuccess,
      updatePassengerInfoPending: isPending,
      updatePassengerInfoReset: reset,
      updatePassengerInfoStatus: status,
    }),
    [error, isPending, isSuccess, mutate, mutateAsync, reset, status]
  );

  return memoizedValue;
}
