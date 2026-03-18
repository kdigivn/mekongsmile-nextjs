import { useCallback, useMemo } from "react";
import useFetch from "../../common/use-fetch";
import { Transaction } from "./types/transaction";
import { RequestConfigType } from "../../common/types/request-config";
import { buildApiPath } from "../../build-api-path";
import { FerryTicketApiEndpoints } from "../../endpoints";
import useQueryFetcher from "../../common/use-query-fetcher";
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { TransactionOwnerTypeEnum } from "./types/transaction-type-enum";
import { InfinityPaginationType } from "../../common/types/infinity-pagination";

export type FilterTransactionRequestWithCursor = {
  cursor?: string;
  page?: number;
  limit?: number;
  filters?: RequestGetTransactionsByBookingId;
};

const transactionQueryKeys = createQueryKeys(["transaction"], {
  filter: (request: FilterTransactionRequestWithCursor) => ({
    key: [request],
  }),
});

export type GetTransactionByIdRequest = {
  id: Transaction["id"];
};

export type GetTransactionByIdResponse = Transaction;

export type GetTransactionsResponse = {
  data: Transaction[];
  hasNextPage: boolean;
  next_cursor?: string;
};

export function useGetBookingDetailById() {
  const fetch = useFetch();
  return useCallback(
    (data: GetTransactionByIdRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = buildApiPath(
        FerryTicketApiEndpoints.v1.bookings.byId(data.id)
      );

      return fetch(requestUrl, {
        method: "GET",
        ...requestConfig,
      }).then<GetTransactionByIdResponse>(async (res) => await res.json());
    },
    [fetch]
  );
}

export function useGetTransactionsByBookingId(bookingId: string) {
  const fetch = useFetch();
  return useCallback(
    (data: GetTransactionByIdRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = buildApiPath(
        FerryTicketApiEndpoints.v1.transactions.index
      );
      requestUrl.searchParams.append(
        "filters",
        JSON.stringify({ booking_id: bookingId })
      );

      return fetch(requestUrl, {
        method: "GET",
        ...requestConfig,
      }).then<GetTransactionByIdResponse>(async (res) => await res.json());
    },
    [bookingId, fetch]
  );
}

export type RequestGetTransactionsByBookingId = {
  booking_id?: string;
  customer_id?: number;
  owner_types?: TransactionOwnerTypeEnum[];
};

export const transactionsQueryKeys = createQueryKeys(["transactions"], {
  listAllRelateByLocationAndDate: (
    request: RequestGetTransactionsByBookingId
  ) => ({
    key: [request],
  }),
});

type GetTransactionByBookingIdResponse = {
  data: Transaction[];
};

export function useGetTransactionsByBookingIdQuery(
  request: RequestGetTransactionsByBookingId,
  requestConfig?: RequestConfigType
) {
  const fetch = useQueryFetcher();
  // We need to wrap the initiation in useMemo to avoid duplication in searchParams when this hook is called multiple times
  const requestUrl = useMemo(() => {
    const url = buildApiPath(FerryTicketApiEndpoints.v1.transactions.index);

    if (request.booking_id) {
      url.searchParams.append(
        "filters",
        JSON.stringify({
          booking_id: request.booking_id,
          owner_types: request.owner_types ? request.owner_types : {},
        })
      );
    }

    return url;
  }, [request.booking_id, request.owner_types]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: transactionsQueryKeys.listAllRelateByLocationAndDate(request).key,
    queryFn: () =>
      fetch<GetTransactionByBookingIdResponse>(
        requestUrl,
        "GET",
        null,
        requestConfig
      ),
  });

  const memoizedValue = useMemo(() => {
    return {
      transactions: (data?.data as Transaction[]) || [],
      transactionsLoading: isLoading,
      transactionsError: error,
      transactionsRefetch: refetch,
    };
  }, [data, error, isLoading, refetch]);

  return memoizedValue;
}

export function useGetTransactionsByUser() {
  const fetch = useFetch();

  return useCallback(
    (
      data: FilterTransactionRequestWithCursor,
      requestConfig?: RequestConfigType
    ) => {
      const requestUrl = buildApiPath(
        FerryTicketApiEndpoints.v1.transactions.me.list
      );

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
      }).then<GetTransactionsResponse>(async (res) => await res.json());
    },
    [fetch]
  );
}

export type TransactionsResponse = InfinityPaginationType<Transaction>;

export function useGetTransactionListQueryCursor(
  request: FilterTransactionRequestWithCursor,
  enableFetching: boolean = true
) {
  const getTransactionList = useGetTransactionsByUser();
  const { data, fetchNextPage, isFetching, isLoading, hasNextPage, refetch } =
    useInfiniteQuery<TransactionsResponse>({
      queryKey: transactionQueryKeys.filter(request).key,

      queryFn: async ({ pageParam = null }) => {
        const fetchedData = await getTransactionList({
          limit: request.limit || 20,
          cursor: pageParam as string | undefined,
          filters: request.filters,
        });
        return fetchedData; // Return the 'data' property of the fetched data
      },
      initialPageParam: null,
      getNextPageParam: (lastPage) =>
        lastPage.next_cursor ? lastPage.next_cursor : undefined,
      refetchOnWindowFocus: false,
      enabled: enableFetching,
      placeholderData: keepPreviousData,
    });

  const memoizedValue = useMemo(
    () => ({
      transactions:
        (data?.pages?.flatMap((page) => page.data) as Transaction[]) || [], // Assuming data structure adjustment
      transactionsLoading: isLoading,
      transactionsRefetch: refetch,
      transactionsIsFetching: isFetching,
      transactionsEmpty:
        !isLoading && !data?.pages.flatMap((page) => page.data).length,
      transactionsHasNextPage: hasNextPage,
      transactionsFetchNextPage: fetchNextPage,
      transactionsTotal: data?.pages[0]?.total,
    }),
    [data?.pages, isLoading, refetch, isFetching, hasNextPage, fetchNextPage]
  );

  return memoizedValue;
}

export function useGetTransactionsByMe() {
  const fetch = useFetch();

  return useCallback(
    (
      data: FilterTransactionRequestWithCursor,
      requestConfig?: RequestConfigType
    ) => {
      const requestUrl = buildApiPath(
        FerryTicketApiEndpoints.v1.transactions.index
      );

      if (data.limit) {
        requestUrl.searchParams.append("limit", data.limit.toString());
      }

      if (data.cursor) {
        requestUrl.searchParams.append("cursor", data.cursor);
      }

      if (data.filters) {
        requestUrl.searchParams.append("filters", JSON.stringify(data.filters));
      }

      return fetch(requestUrl, {
        method: "GET",
        ...requestConfig,
      }).then<GetTransactionsResponse>(async (res) => await res.json());
    },
    [fetch]
  );
}

export function useGetTransactionListQueryCursorWithoutFilter(
  request: FilterTransactionRequestWithCursor,
  enableFetching: boolean = true
) {
  const getTransactionList = useGetTransactionsByMe();
  const { data, fetchNextPage, isFetching, isLoading, hasNextPage, refetch } =
    useInfiniteQuery<TransactionsResponse>({
      queryKey: transactionQueryKeys.filter(request).key,

      queryFn: async ({ pageParam = null }) => {
        const fetchedData = await getTransactionList({
          limit: request.limit || 20,
          cursor: pageParam as string | undefined,
          filters: request.filters,
        });
        return fetchedData; // Return the 'data' property of the fetched data
      },
      initialPageParam: null,
      getNextPageParam: (lastPage) =>
        lastPage.next_cursor ? lastPage.next_cursor : undefined,
      refetchOnWindowFocus: false,
      enabled: enableFetching,
      placeholderData: keepPreviousData,
    });

  const memoizedValue = useMemo(
    () => ({
      transactions:
        (data?.pages?.flatMap((page) => page.data) as Transaction[]) || [], // Assuming data structure adjustment
      transactionsLoading: isLoading,
      transactionsRefetch: refetch,
      transactionsIsFetching: isFetching,
      transactionsEmpty:
        !isLoading && !data?.pages.flatMap((page) => page.data).length,
      transactionsHasNextPage: hasNextPage,
      transactionsFetchNextPage: fetchNextPage,
      transactionsTotal: data?.pages[0]?.total,
    }),
    [data?.pages, isLoading, refetch, isFetching, hasNextPage, fetchNextPage]
  );

  return memoizedValue;
}
