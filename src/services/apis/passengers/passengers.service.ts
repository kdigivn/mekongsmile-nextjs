import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { RequestConfigType } from "../common/types/request-config";
import { buildApiPath } from "../build-api-path";
import useQueryFetcher from "../common/use-query-fetcher";
import { FerryTicketApiEndpoints } from "../endpoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  Passenger,
  PatchBatchUpdatePassengerRequest,
  PostBatchCreatePassengerRequest,
} from "./types/passenger";

const passengerQueryKeys = createQueryKeys(["passengers"], {
  fromOperator: (request: GetPassengersByOperatorAndSocialIdRequest) => ({
    key: [request],
  }),
  getPassengers: () => ({
    key: [],
  }),
  batchCreate: (request: PostBatchCreatePassengerRequest) => ({
    key: [request],
  }),
  batchUpdate: (request: PatchBatchUpdatePassengerRequest) => ({
    key: [request],
  }),
});

export type GetPassengersByOperatorAndSocialIdRequest = {
  operator_id: string;
  social_id: string;
};

export function useGetPassengersQuery(requestConfig?: RequestConfigType) {
  const fetch = useQueryFetcher();
  const requestUrl = buildApiPath(
    FerryTicketApiEndpoints.v1.passengers.me.index
  );

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: passengerQueryKeys.getPassengers().key,
    queryFn: () =>
      fetch<{ data: Passenger[] }>(requestUrl, "GET", null, requestConfig),
  });

  const memoizedValue = useMemo(
    () => ({
      passengers: data ? data.data : [],
      passengersLoading: isLoading,
      passengersError: error,
      passengersRefetch: refetch,
    }),
    [data, error, isLoading, refetch]
  );

  return memoizedValue;
}

export function usePostBatchPassengersMutation(
  request: PostBatchCreatePassengerRequest
) {
  const fetch = useQueryFetcher();
  const url = buildApiPath(
    FerryTicketApiEndpoints.v1.passengers.me.batchCreate
  );
  const { mutate, error, isSuccess, isPending, reset } = useMutation({
    mutationKey: passengerQueryKeys.batchCreate(request).key,
    mutationFn: () => {
      return fetch<Passenger[]>(url, "POST", JSON.stringify(request));
    },
  });

  const memoizedValue = useMemo(
    () => ({
      postBatchPassengers: mutate,
      postBatchPassengersError: error,
      postBatchPassengersSuccess: isSuccess,
      postBatchPassengersPending: isPending,
      postBatchPassengersReset: reset,
    }),
    [error, isPending, isSuccess, mutate, reset]
  );

  return memoizedValue;
}

export function usePatchBatchPassengersMutation(
  request: PatchBatchUpdatePassengerRequest
) {
  const fetch = useQueryFetcher();
  const url = buildApiPath(
    FerryTicketApiEndpoints.v1.passengers.me.batchUpdate
  );
  const { mutate, error, isSuccess, isPending, reset } = useMutation({
    mutationKey: passengerQueryKeys.batchUpdate(request).key,
    mutationFn: () => {
      return fetch<Passenger[]>(url, "PATCH", JSON.stringify(request));
    },
  });

  const memoizedValue = useMemo(
    () => ({
      patchBatchPassengers: mutate,
      patchBatchPassengersError: error,
      patchBatchPassengersSuccess: isSuccess,
      patchBatchPassengersPending: isPending,
      patchBatchPassengersReset: reset,
    }),
    [error, isPending, isSuccess, mutate, reset]
  );

  return memoizedValue;
}
