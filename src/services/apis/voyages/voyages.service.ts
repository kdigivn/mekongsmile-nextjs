import { createQueryKeys } from "@/services/react-query/query-key-factory";
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { buildApiPath } from "../build-api-path";
import { InfinityPaginationType } from "../common/types/infinity-pagination";
import { RequestConfigType } from "../common/types/request-config";
import useFetch from "../common/use-fetch";
import useQueryFetcher from "../common/use-query-fetcher";
import wrapperFetchJsonResponse from "../common/wrapper-fetch-json-response";
import { FerryTicketApiEndpoints } from "../endpoints";
import { Voyage, VoyageItem, VoyagesCount } from "./types/voyage";
import {
  AllRelateVoyageURLParams,
  VoyagesCountFilter,
  VoyagesFindAllRelateByLocationAndDateRange,
  VoyagesFindByLocationAndDate,
  VoyageURLParams,
} from "./types/voyage-queries";
import { buildURL } from "../build-url";

let defaultToken: string | undefined = "";

export const voyageQueryKeys = createQueryKeys(["voyages"], {
  listLocationAndDate: (request: VoyagesFindByLocationAndDate) => ({
    key: [request],
  }),
  listLocationAndDateRange: (
    request: VoyagesFindAllRelateByLocationAndDateRange
  ) => ({
    key: [request],
  }),
  count: (request: VoyagesCountFilter) => ({
    key: [request],
  }),
});

export type VoyageRequest = {
  id: Voyage["id"];
};

export type VoyageResponse = Voyage;

export function useGetVoyageService() {
  const fetch = useFetch();

  return useCallback(
    (data: VoyageRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = buildApiPath(
        FerryTicketApiEndpoints.voyages.byId(data.id)
      );
      return fetch(requestUrl, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<VoyageResponse>);
    },
    [fetch]
  );
}

/**
 * Server side fetch voyage data not through react query
 * @param data - VoyageRequest
 * @param requestConfig - RequestConfigType
 * @returns VoyageResponse
 */
export async function serverGetVoyageService(
  data: VoyageRequest,
  requestConfig?: RequestConfigType
) {
  defaultToken = process.env.FERRY_DEFAULT_API_KEY;
  const requestUrl = buildApiPath(
    FerryTicketApiEndpoints.v1.voyages.byId(data.id)
  );
  return fetch(requestUrl, {
    method: "GET",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${defaultToken}`,
    },
    ...requestConfig,
  }).then(wrapperFetchJsonResponse<VoyageResponse>);
}

export function useFetchVoyageData() {
  const fetch = useQueryFetcher();
  return useCallback(
    async (
      request: VoyagesFindByLocationAndDate,
      requestConfig?: RequestConfigType
    ): Promise<VoyagesResponse> => {
      const validationFilter = {
        ...(request.filter?.operator_ids
          ? { operator_ids: request.filter.operator_ids }
          : {}),
        ...(request.filter?.min_depart_time
          ? { min_depart_time: request.filter.min_depart_time }
          : {}),
        ...(request.filter?.max_depart_time
          ? { max_depart_time: request.filter.max_depart_time }
          : {}),
        ...(request.filter?.boat_name
          ? { boat_name: request.filter.boat_name }
          : {}),
      };

      const url = buildURL<VoyageURLParams>({
        baseURL: String(
          buildApiPath(
            FerryTicketApiEndpoints.voyages.findAllRelateByLocationAndDate
          )
        ),
        cursor: request.cursor,
        limit: request.limit || 20,
        filters: validationFilter,
        departure_date: request.departure_date,
        departure_id: request.departure_id,
        destination_id: request.destination_id,
      });

      const response = await fetch<VoyagesResponse>(
        url,
        "GET",
        null,
        requestConfig
      );
      if (!response) {
        throw new Error("No response from server");
      }
      return response;
    },
    [fetch]
  );
}

export type VoyagesResponse = InfinityPaginationType<VoyageItem>;

export function useVoyagesFindByLocationAndDateQueryCursor(
  request: VoyagesFindByLocationAndDate,
  enabledFetching: boolean = true,
  requestConfig?: RequestConfigType
) {
  const getVoyageList = useFetchVoyageData();
  const { data, fetchNextPage, isFetching, isLoading, hasNextPage, refetch } =
    useInfiniteQuery<VoyagesResponse>({
      queryKey: voyageQueryKeys.listLocationAndDate(request).key,

      queryFn: async ({ pageParam = null }) => {
        const fetchedData = await getVoyageList(
          {
            limit: request.limit || 20,
            cursor: pageParam as string | undefined,
            filter: request.filter,
            departure_date: request.departure_date,
            departure_id: request.departure_id,
            destination_id: request.destination_id,
          },
          requestConfig
        );
        return fetchedData; // Return the 'data' property of the fetched data
      },
      initialPageParam: null,
      getNextPageParam: (lastPage) =>
        lastPage.next_cursor ? lastPage.next_cursor : undefined,
      refetchOnWindowFocus: false,
      placeholderData: keepPreviousData,
      staleTime: 0, // Voyage/seat data must always refetch on date change
      enabled: enabledFetching,
    });

  const memoizedValue = useMemo(
    () => ({
      voyages:
        (data?.pages?.flatMap((page) => page.data) as VoyageItem[]) || [], // Assuming data structure adjustment
      voyagesLoading: isLoading,
      voyagesRefetch: refetch,
      voyagesIsFetching: isFetching,
      voyagesEmpty:
        !isLoading && !data?.pages.flatMap((page) => page.data).length,
      voyagesHasNextPage: hasNextPage,
      voyagesFetchNextPage: fetchNextPage,
      voyagesTotal: data?.pages[0]?.total,
    }),
    [data?.pages, isLoading, refetch, isFetching, hasNextPage, fetchNextPage]
  );

  return memoizedValue;
}

export function useFetchAllRelateVoyageData() {
  const fetch = useQueryFetcher();
  return useCallback(
    async (
      request: VoyagesFindAllRelateByLocationAndDateRange,
      requestConfig?: RequestConfigType
    ): Promise<VoyagesResponse> => {
      const validationFilter = {
        ...(request.filter?.operator_ids
          ? { operator_ids: request.filter.operator_ids }
          : {}),
        ...(request.filter?.min_depart_time
          ? { min_depart_time: request.filter.min_depart_time }
          : {}),
        ...(request.filter?.max_depart_time
          ? { max_depart_time: request.filter.max_depart_time }
          : {}),
        ...(request.filter?.boat_name
          ? { boat_name: request.filter.boat_name }
          : {}),
      };

      const url = buildURL<AllRelateVoyageURLParams>({
        baseURL: String(
          buildApiPath(
            FerryTicketApiEndpoints.voyages.findAllRelateByLocationAndDateRange
          )
        ),
        cursor: request.cursor,
        limit: request.limit || 20,
        filters: validationFilter,
        departure_id: request.departure_id,
        destination_id: request.destination_id,
        from: request.from,
        to: request.to,
      });

      const response = await fetch<VoyagesResponse>(
        url,
        "GET",
        null,
        requestConfig
      );
      if (!response) {
        throw new Error("No response from server");
      }
      return response;
    },
    [fetch]
  );
}

export function useVoyagesFindByLocationAndDateRangeQueryCursor(
  request: VoyagesFindAllRelateByLocationAndDateRange,
  enabledFetching: boolean = true,
  requestConfig?: RequestConfigType
) {
  const getVoyageList = useFetchAllRelateVoyageData();
  const { data, fetchNextPage, isFetching, isLoading, hasNextPage, refetch } =
    useInfiniteQuery<VoyagesResponse>({
      queryKey: voyageQueryKeys.listLocationAndDateRange(request).key,

      queryFn: async ({ pageParam = null }) => {
        const fetchedData = await getVoyageList(
          {
            limit: request.limit || 20,
            cursor: pageParam as string | undefined,
            filter: request.filter,
            departure_id: request.departure_id,
            destination_id: request.destination_id,
            from: request.from,
            to: request.to,
          },
          requestConfig
        );
        return fetchedData; // Return the 'data' property of the fetched data
      },
      initialPageParam: null,
      getNextPageParam: (lastPage) =>
        lastPage.next_cursor ? lastPage.next_cursor : undefined,
      refetchOnWindowFocus: false,
      placeholderData: keepPreviousData,
      staleTime: 0, // Voyage/seat data must always refetch on date change
      enabled: enabledFetching,
    });

  const memoizedValue = useMemo(
    () => ({
      voyages:
        (data?.pages?.flatMap((page) => page.data) as VoyageItem[]) || [], // Assuming data structure adjustment
      voyagesLoading: isLoading,
      voyagesRefetch: refetch,
      voyagesIsFetching: isFetching,
      voyagesEmpty:
        !isLoading && !data?.pages.flatMap((page) => page.data).length,
      voyagesHasNextPage: hasNextPage,
      voyagesFetchNextPage: fetchNextPage,
      voyagesTotal: data?.pages[0]?.total,
    }),
    [data?.pages, isLoading, refetch, isFetching, hasNextPage, fetchNextPage]
  );

  return memoizedValue;
}

export function useCountVoyageReactQuery(
  request: VoyagesCountFilter,
  enabledFetching: boolean = true,
  requestConfig?: RequestConfigType
) {
  const fetch = useQueryFetcher();
  const url = buildURL({
    baseURL: String(buildApiPath(FerryTicketApiEndpoints.voyageCounts.root)),
    ...request,
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: voyageQueryKeys.count(request).key,
    queryFn: async (): Promise<VoyagesCount[]> => {
      const response = await fetch<VoyagesCount[]>(
        url,
        "GET",
        null,
        requestConfig
      );
      if (!response) {
        throw new Error("No response from server");
      }
      return response || [];
    },
    enabled: enabledFetching,
  });
  const memoizedValue = useMemo(
    () => ({
      count: data || [],
      countLoading: isLoading,
      countRefetch: refetch,
    }),
    [data, isLoading, refetch]
  );

  return memoizedValue;
}
