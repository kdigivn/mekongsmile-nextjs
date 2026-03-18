import { useCallback, useMemo } from "react";
import { buildApiPath } from "../build-api-path";
import { RequestConfigType } from "../common/types/request-config";
import { SortEnum } from "../common/types/sort-type";
import useFetch from "../common/use-fetch";
import wrapperFetchJsonResponse from "../common/wrapper-fetch-json-response";
import { FerryTicketApiEndpoints } from "../endpoints";
import { Route } from "./types/route";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import useQueryFetcher from "../common/use-query-fetcher";
import { useQuery } from "@tanstack/react-query";

const routeQueryKeys = createQueryKeys(["routes"], {
  list: (request: RoutesRequest) => ({
    key: [request],
  }),
  detail: (id: Route["id"]) => ({
    key: [id],
  }),
});

// Get route's list
/**
 * Get cached voyage data from database. After using this hook, you should call `useGetVoyageFindAllRelateByLocationAndDateThenUpdate` to get latest voyage data
 * @returns
 */
export function useGetRoutesQuery(
  request: RoutesRequest,
  requestConfig?: RequestConfigType
) {
  const fetch = useQueryFetcher();
  const requestUrl = buildApiPath(FerryTicketApiEndpoints.v1.routes.index);
  if (request?.sort) {
    requestUrl.searchParams.append("sort", JSON.stringify(request.sort));
  }

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: routeQueryKeys.list(request).key,
    queryFn: () => fetch<Route[]>(requestUrl, "GET", null, requestConfig),
    staleTime: 5 * 60 * 1000, // 5 min — routes change seasonally
  });

  const memoizedValue = useMemo(
    () => ({
      routes: data ?? [],
      routesLoading: isLoading,
      routesError: error,
      voyagesRefetch: refetch,
    }),
    [data, error, isLoading, refetch]
  );

  return memoizedValue;
}

export type RoutesRequest = {
  limit?: number;
  // page: number;
  // filters?: {
  //   roles?: Role[];
  // };
  sort?: Array<{
    orderBy: keyof Route;
    order: SortEnum;
  }>;
};

export type RoutesResponse = {
  data: Route[];
};

export function useGetRoutesService() {
  const fetch = useFetch();

  return useCallback(
    (data?: RoutesRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = buildApiPath(FerryTicketApiEndpoints.v1.routes.index);
      // requestUrl.searchParams.append("page", data.page.toString());
      // requestUrl.searchParams.append("limit", data.limit.toString());
      // if (data.filters) {
      //   requestUrl.searchParams.append("filters", JSON.stringify(data.filters));
      // }
      if (data?.sort) {
        requestUrl.searchParams.append("sort", JSON.stringify(data.sort));
      }

      if (data?.limit) {
        requestUrl.searchParams.append("limit", data.limit.toString());
      } else {
        requestUrl.searchParams.append("limit", "100");
      }

      return fetch(requestUrl, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<RoutesResponse>);
    },
    [fetch]
  );
}

export function serverGetRoutesService() {
  return (data?: RoutesRequest, requestConfig?: RequestConfigType) => {
    const defaultRequestConfig: RequestConfigType = {
      next: {
        tags: ["server", "routes", "list"],
        revalidate: 3600 * 12, // cache 12 hrs
      },
    };

    requestConfig = {
      ...defaultRequestConfig,
      ...requestConfig,
    };

    const requestUrl = buildApiPath(FerryTicketApiEndpoints.v1.routes.index);
    // requestUrl.searchParams.append("page", data.page.toString());
    // requestUrl.searchParams.append("limit", data.limit.toString());
    // if (data.filters) {
    //   requestUrl.searchParams.append("filters", JSON.stringify(data.filters));
    // }
    // if (data?.sort) {
    //   requestUrl.searchParams.append("sort", JSON.stringify(data.sort));
    // }

    if (data?.limit) {
      requestUrl.searchParams.append("limit", data.limit.toString());
    } else {
      requestUrl.searchParams.append("limit", "100");
    }

    return fetch(requestUrl, {
      method: "GET",
      ...requestConfig,
    }).then(wrapperFetchJsonResponse<RoutesResponse>);
  };
}

export type GetRouteByIdRequest = {
  id: Route["id"];
};

export type GetRouteByIdResponse = Route;

export function serverGetRouteByIdService(
  data: GetRouteByIdRequest,
  requestConfig?: RequestConfigType
) {
  const requestUrl = buildApiPath(
    FerryTicketApiEndpoints.v1.routes.byId(data.id)
  );

  return fetch(requestUrl, {
    method: "GET",
    ...requestConfig,
  }).then(wrapperFetchJsonResponse<GetRouteByIdResponse>);
}

export function useGetRouteById(routeId: Route["id"]) {
  const fetch = useQueryFetcher();
  const requestUrl = buildApiPath(
    FerryTicketApiEndpoints.v1.routes.byId(routeId)
  );
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: routeQueryKeys.detail(routeId).key,
    queryFn: () => fetch<Route>(requestUrl, "GET", null),
    staleTime: 5 * 60 * 1000, // 5 min — reference data, changes rarely
  });

  const memoizedValue = useMemo(
    () => ({
      route: data,
      routesLoading: isLoading,
      routesError: error,
      voyagesRefetch: refetch,
    }),
    [data, error, isLoading, refetch]
  );

  return memoizedValue;
}
