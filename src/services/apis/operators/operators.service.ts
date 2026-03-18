import { useCallback, useMemo } from "react";
import { RequestConfigType } from "../common/types/request-config";
import useFetch from "../common/use-fetch";
import wrapperFetchJsonResponse from "../common/wrapper-fetch-json-response";
import { Operator } from "./types/operator";
import { OperatorNationality } from "./types/operator-nationality";
import { buildApiPath } from "../build-api-path";
import { FerryTicketApiEndpoints } from "../endpoints";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import useQueryFetcher from "../common/use-query-fetcher";
import { useQuery } from "@tanstack/react-query";

const routeQueryKeys = createQueryKeys(["operators"], {
  list: (request: OperatorsRequest) => ({
    key: [request],
  }),
});

// Get operator's list
/**
 * Get cached operators data from database. After using this hook, you should call `useGetOperatorsQuery` to get operators' list data
 * @returns
 */
export function useGetOperatorsQuery(
  request: OperatorsRequest,
  requestConfig?: RequestConfigType
) {
  const fetch = useQueryFetcher();
  const requestUrl = buildApiPath(FerryTicketApiEndpoints.v1.operators.index);
  if (request?.sort) {
    requestUrl.searchParams.append("sort", JSON.stringify(request.sort));
  }

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: routeQueryKeys.list(request).key,
    queryFn: () => fetch<Operator[]>(requestUrl, "GET", null, requestConfig),
    staleTime: 5 * 60 * 1000, // 5 min — operators change infrequently
  });

  const memoizedValue = useMemo(
    () => ({
      operators: data,
      operatorsLoading: isLoading,
      operatorsError: error,
      operatorsRefetch: refetch,
    }),
    [data, error, isLoading, refetch]
  );

  return memoizedValue;
}

export type OperatorsRequest = {
  sort?: string;
};

export type GetOperatorNationalityRequest = {
  id: Operator["id"];
};

export type GetOperatorNationalityResponse = OperatorNationality[];

export function useGetOperatorNationality() {
  const fetch = useFetch();

  return useCallback(
    (
      data: GetOperatorNationalityRequest,
      requestConfig?: RequestConfigType
    ) => {
      const requestUrl = buildApiPath(
        FerryTicketApiEndpoints.v1.operators.nationals(data.id)
      );
      return fetch(requestUrl, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<GetOperatorNationalityResponse>);
    },
    [fetch]
  );
}

export function serverGetOperatorNationality(
  data: GetOperatorNationalityRequest,
  requestConfig?: RequestConfigType
) {
  const requestUrl = buildApiPath(
    FerryTicketApiEndpoints.v1.operators.nationals(data.id)
  );
  return fetch(requestUrl, {
    method: "GET",
    ...requestConfig,
  }).then(wrapperFetchJsonResponse<GetOperatorNationalityResponse>);
}

type OperatorListQueryParams = {
  filters?: {
    is_enabled?: boolean;
    [key: string]: string | number | boolean | undefined;
  };
};
export function serverGetOperatorList(
  query?: OperatorListQueryParams,
  requestConfig?: RequestConfigType
) {
  const defaultRequestConfig: RequestConfigType = {
    next: {
      tags: ["server", "operator", "list"],
      revalidate: 3600 * 12, // cache 12 hrs
    },
  };

  requestConfig = {
    ...defaultRequestConfig,
    ...requestConfig,
  };

  const requestUrl = buildApiPath(
    `${FerryTicketApiEndpoints.v1.operators.index}`
  );

  requestUrl.searchParams.append(
    "filters",
    JSON.stringify({ ...query?.filters })
  );

  return fetch(requestUrl, {
    method: "GET",
    ...requestConfig,
  }).then(wrapperFetchJsonResponse<Operator[]>);
}
