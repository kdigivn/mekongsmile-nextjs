/* eslint-disable @arthurgeron/react-usememo/require-usememo */

import { createQueryKeys } from "@/services/react-query/query-key-factory";
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { buildApiPath } from "../build-api-path";
import { FerryTicketApiEndpoints } from "../endpoints";
import { RequestConfigType } from "../common/types/request-config";
import wrapperFetchJsonResponse from "../common/wrapper-fetch-json-response";
import {
  CancelTicketRequest,
  FilterCancelTicketRequest,
  FilterCancelTicketRequestItem,
  RecallCancelTicketRequestPayload,
} from "./types/cancel-ticket-request";
import useFetch from "../common/use-fetch";
import { InfinityPaginationType } from "../common/types/infinity-pagination";
import { useCallback, useMemo } from "react";
import useQueryFetcher from "../common/use-query-fetcher";
import { bookingQueryKeys } from "../bookings/bookings.service";

const cancel_ticket_request_query_keys = createQueryKeys(
  ["cancel_ticket_request"],
  {
    createCancelTicketRequest: () => ({
      key: ["create-cancel-ticket-request"],
    }),
    findAllCancelTicketRequestByUser: (request: FilterCancelTicketRequest) => ({
      key: [request],
    }),
    recallCancelTicketRequest: (id: CancelTicketRequest["id"]) => ({
      key: ["recall-cancel-ticket-request", id],
    }),
  }
);
export type PostCancelTicketRequest = {
  order_id: string;
  cancel_ticket_by_positions: string[];
  cancel_reason: string;
};
export function useCancelTicketPostMutation() {
  const fetch = useFetch();
  const queryClient = useQueryClient();

  const url = buildApiPath(
    FerryTicketApiEndpoints.v1.cancelTicketRequest.index
  );

  const { mutate, mutateAsync, error, isSuccess, isPending, reset } =
    useMutation({
      // Adjusted to use the `create` key for the mutation
      mutationKey:
        cancel_ticket_request_query_keys.createCancelTicketRequest().key,
      mutationFn: (
        request: PostCancelTicketRequest,
        requestConfig?: RequestConfigType
      ) =>
        fetch(url, {
          method: "POST",
          body: JSON.stringify(request),
          ...requestConfig,
        }).then(wrapperFetchJsonResponse<CancelTicketRequest>),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: bookingQueryKeys.filter({}).key,
        });
      },
      onError: (error) => {
        console.log("error: ", error);
      },
    });

  const memoizedValue = {
    postCancelTicket: mutate,
    postCancelTicketAsync: mutateAsync,
    postCancelTicketError: error,
    postCancelTicketSuccess: isSuccess,
    postCancelTicketPending: isPending,
    postCancelTicketReset: reset,
  };

  return memoizedValue;
}

export type GetCancelTicketRequestResponse = {
  data: CancelTicketRequest[];
  hasNextPage: boolean;
  next_cursor?: string;
};

export type GetCancelTicketRequestWithCursor = {
  page?: number;
  limit?: number;
  filters?: FilterCancelTicketRequestItem;
  cursor?: string;
};

export function useFindAllCancelTicketRequestByUser() {
  const fetch = useFetch();

  return useCallback(
    async (
      data: GetCancelTicketRequestWithCursor,
      requestConfig?: RequestConfigType
    ) => {
      const requestUrl = buildApiPath(
        FerryTicketApiEndpoints.v1.cancelTicketRequest.findAllByUser
      );

      if (data.page) {
        requestUrl.searchParams.append("page", data.page.toString());
      }

      if (data.limit) {
        requestUrl.searchParams.append("limit", data.limit.toString());
      }

      if (data.filters) {
        requestUrl.searchParams.append("filters", JSON.stringify(data.filters));
      }

      if (data.cursor) {
        requestUrl.searchParams.append("cursor", data.cursor);
      }

      return fetch(requestUrl, {
        method: "GET",
        ...requestConfig,
      }).then<GetCancelTicketRequestResponse>(async (res) => await res.json());
    },
    [fetch]
  );
}

/**
 * Fetches a paginated list of cancel ticket requests using infinite scrolling.
 *
 * @param request - The filter and pagination parameters for the query.
 * @param enableFetching - A flag to enable or disable automatic fetching of data.
 * @returns An object containing the cancel ticket requests, loading states, and utility functions for pagination and refetching.
 */
export function useGetCancelTicketRequestListQueryCursor(
  request: GetCancelTicketRequestWithCursor,
  enableFetching: boolean = false
) {
  const getCancelTicketRequestList = useFindAllCancelTicketRequestByUser();

  const {
    data,
    fetchNextPage,
    isFetching,
    isLoading,
    hasNextPage,
    refetch,
    error,
  } = useInfiniteQuery<InfinityPaginationType<CancelTicketRequest>>({
    queryKey:
      cancel_ticket_request_query_keys.findAllCancelTicketRequestByUser(request)
        .key,
    queryFn: async ({ pageParam = null }) => {
      const fetchedData = await getCancelTicketRequestList({
        limit: request.limit,
        cursor: pageParam as unknown as string | undefined,
        filters: request.filters,
      });

      return fetchedData;
    },
    getNextPageParam: (lastPage) =>
      lastPage.next_cursor ? lastPage.next_cursor : undefined,
    initialPageParam: null,
    refetchOnWindowFocus: false,
    enabled: enableFetching,
    placeholderData: keepPreviousData,
  });

  const response = useMemo(
    () => ({
      cancelTicketRequestsData: data?.pages.flatMap((page) => page.data) || [],
      cancelTicketRequestsLoading: isLoading,
      cancelTicketRequestsIsFetching: isFetching,
      cancelTicketRequestsHasNextPage: hasNextPage,
      cancelTicketRequestsFetchNextPage: fetchNextPage,
      cancelTicketRequestsRefetch: refetch,
      cancelTicketRequestsError: error,
      cancelTicketRequestsTotal: data?.pages[0].total || 0,
    }),
    [
      data?.pages,
      error,
      fetchNextPage,
      hasNextPage,
      isFetching,
      isLoading,
      refetch,
    ]
  );

  return response;
}

/**
 * Custom hook to handle the recall of a cancel ticket request.
 *
 * This hook provides a mutation function to send a PATCH request to recall a specific cancel ticket request.
 * It uses the `useMutation` hook from React Query to manage the mutation state and provide utility functions.
 *
 * @param id - The unique identifier of the cancel ticket request to be recalled.
 * @returns An object containing:
 *   - `recallCancelTicketRequest`: A function to trigger the recall mutation.
 *   - `recallCancelTicketRequestAsync`: An async function to trigger the recall mutation.
 *   - `recallCancelTicketRequestError`: Any error encountered during the mutation.
 *   - `recallCancelTicketRequestSuccess`: A boolean indicating if the mutation was successful.
 *   - `recallCancelTicketRequestPending`: A boolean indicating if the mutation is in progress.
 *   - `recallCancelTicketRequestReset`: A function to reset the mutation state.
 *   - `recallCancelTicketRequestStatus`: The current status of the mutation.
 */
export function useCancelTicketRequestRecallMutation(
  id: CancelTicketRequest["id"]
) {
  const fetch = useQueryFetcher();
  const queryClient = useQueryClient();

  const url = buildApiPath(
    FerryTicketApiEndpoints.v1.cancelTicketRequest.recall(id)
  );

  const { mutate, mutateAsync, error, isSuccess, isPending, reset, status } =
    useMutation({
      mutationKey:
        cancel_ticket_request_query_keys.recallCancelTicketRequest(id).key,
      mutationFn: (request: RecallCancelTicketRequestPayload) =>
        fetch(url, "PATCH", JSON.stringify(request)),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey:
            cancel_ticket_request_query_keys.findAllCancelTicketRequestByUser(
              {}
            ).key,
        });
      },
    });

  const memoizedValue = useMemo(
    () => ({
      recallCancelTicketRequest: mutate,
      recallCancelTicketRequestAsync: mutateAsync,
      recallCancelTicketRequestError: error,
      recallCancelTicketRequestSuccess: isSuccess,
      recallCancelTicketRequestPending: isPending,
      recallCancelTicketRequestReset: reset,
      recallCancelTicketRequestStatus: status,
    }),
    [error, isPending, isSuccess, mutate, mutateAsync, reset, status]
  );

  return memoizedValue;
}
