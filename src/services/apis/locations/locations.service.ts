import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { buildApiPath } from "../build-api-path";
import { RequestConfigType } from "../common/types/request-config";
import wrapperFetchJsonResponse from "../common/wrapper-fetch-json-response";
import { FerryTicketApiEndpoints } from "../endpoints";
import { Location } from "./types/location";
import { useQuery } from "@tanstack/react-query";
import useQueryFetcher from "../common/use-query-fetcher";
import { useMemo } from "react";

const locationsQueryKeys = createQueryKeys(["locations"], {
  list: () => ({
    key: [],
  }),
});

export function serverGetLocationList(requestConfig?: RequestConfigType) {
  const requestUrl = buildApiPath(FerryTicketApiEndpoints.v1.locations.index);
  return fetch(requestUrl, {
    method: "GET",
    ...requestConfig,
  }).then(wrapperFetchJsonResponse<Location[]>);
}

export const useGetLocations = () => {
  const sort = [{ orderBy: "location_name", order: "asc" }];
  const fetch = useQueryFetcher();
  const requestUrl = buildApiPath(FerryTicketApiEndpoints.v1.locations.index);

  requestUrl.searchParams.append("sort", JSON.stringify(sort));

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: locationsQueryKeys.list().key,
    queryFn: () => fetch<Location[]>(requestUrl, "GET", null),
    staleTime: 5 * 60 * 1000, // 5 min — locations change infrequently
  });

  const memoizedValue = useMemo(
    () => ({
      locations: ((data as Location[]) || []).filter((l) => !l.disable),
      locationsLoading: isLoading,
      locationsError: error,
      locationsRefetch: refetch,
      locationsValidating: isFetching,
      locationsEmpty: !isLoading && !data?.length,
    }),
    [data, error, isLoading, isFetching, refetch]
  );
  return memoizedValue;
};
