import { useCallback, useMemo } from "react";
import { getClientSideMeilisearchClient } from "./meilisearch-client";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { buildApiPath } from "@/services/apis/build-api-path";
import { FerryTicketApiEndpoints } from "@/services/apis/endpoints";
import { useQuery } from "@tanstack/react-query";
import { SearchDocument } from "./meilisearch.type";

export function useMeilisearchSearch() {
  return useCallback(async (query: string) => {
    const client = await getClientSideMeilisearchClient();

    const result = await client.search(query);

    return result;
  }, []);
}

const searchKeys = createQueryKeys(["search"], {
  search: (request: RequestSearchParams) => ({
    key: [request],
  }),
});

export type RequestSearchParams = {
  query: string;
  filter?: string;
};

export function useMeilisearchSearchQuery(request: RequestSearchParams) {
  const requestUrl = buildApiPath(
    `${FerryTicketApiEndpoints.search}?query=${request.query}&filter=${request.filter}`
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: searchKeys.search(request).key,
    queryFn: () => fetch(requestUrl).then((res) => res.json()),
  });

  const memoizedValue = useMemo(
    () => ({
      hits: (data as SearchDocument[]) || [],
      hitsLoading: isLoading,
      hitsError: isError,
      hitsErrorMessage: error,
    }),
    [data, isLoading, isError, error]
  );
  return memoizedValue;
}
