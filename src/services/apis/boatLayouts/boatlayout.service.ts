import { useCallback, useMemo } from "react";
import { buildApiPath } from "../build-api-path";
import { RequestConfigType } from "../common/types/request-config";
import useFetch from "../common/use-fetch";
import wrapperFetchJsonResponse from "../common/wrapper-fetch-json-response";
import { FerryTicketApiEndpoints } from "../endpoints";
import { BoatLayoutItem } from "./types/boat-layout";
import { useQuery } from "@tanstack/react-query";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { Voyage } from "../voyages/types/voyage";
import useQueryFetcher from "../common/use-query-fetcher";

const boatLayoutQueryKeys = createQueryKeys(["boat-layout"], {
  lists: () => ({
    key: [],
    sub: {
      byVoyageId: (voyageId: Voyage["id"]) => ({
        key: [voyageId],
      }),
    },
  }),
});

let defaultToken: string | undefined = "";

export type BoatLayoutResponse = BoatLayoutItem;
export type SeatsOfVoyageRequest = {
  voyageId: string;
};

/**
 * Get boat layout from database. Faster but return data may not correct
 * @returns
 */
export function useGetBoatLayoutFromDatabaseOfVoyageService() {
  const fetch = useFetch();

  return useCallback(
    (data: SeatsOfVoyageRequest, requestConfig?: RequestConfigType) => {
      // const requestUrl = new URL(
      //   `/api/v1/boatLayouts/byVoyage`,
      //   window.location.origin
      // );
      const requestUrl = buildApiPath(
        FerryTicketApiEndpoints.boatLayouts.byVoyageId
      );
      requestUrl.searchParams.append("voyage_id", data.voyageId);
      return fetch(requestUrl, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<BoatLayoutResponse>);
    },
    [fetch]
  );
}

/**
 * Get boat layout from database. Faster but return data may not correct
 * @returns
 */
export async function serverGetBoatLayoutFromDatabaseOfVoyageService(
  data: SeatsOfVoyageRequest,
  requestConfig?: RequestConfigType
) {
  defaultToken = process.env.FERRY_DEFAULT_API_KEY;

  const requestUrl = buildApiPath(
    FerryTicketApiEndpoints.v1.boatLayouts.byVoyageId
  );
  requestUrl.searchParams.append("voyage_id", data.voyageId);
  return fetch(requestUrl, {
    method: "GET",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${defaultToken}`,
    },
    ...requestConfig,
  }).then(wrapperFetchJsonResponse<BoatLayoutResponse>);
}

/**
 * Get boat layout from operator. Slower but more accuracy
 * @returns
 */
export function useGetBoatLayoutFromOperatorOfVoyageService() {
  const fetch = useFetch();

  return useCallback(
    (data: SeatsOfVoyageRequest, requestConfig?: RequestConfigType) => {
      // const requestUrl = new URL(
      //   `/api/v1/boatLayouts/getAndUpdateBoatLayout`,
      //   window.location.origin
      // );
      const requestUrl = buildApiPath(
        FerryTicketApiEndpoints.boatLayouts.latestByVoyageId
      );
      requestUrl.searchParams.append("voyage_id", data.voyageId);
      return fetch(requestUrl, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<BoatLayoutResponse>);
    },
    [fetch]
  );
}

export function useGetBoatLayoutFromOperator(
  voyageId: string,
  enable: boolean = true
) {
  const fetch = useQueryFetcher();
  const requestUrl = buildApiPath(
    `${FerryTicketApiEndpoints.boatLayouts.latestByVoyageId}?voyage_id=${voyageId}`
  );

  const { data, isLoading, error } = useQuery({
    queryKey: boatLayoutQueryKeys.lists().sub.byVoyageId(voyageId).key,
    staleTime: 0, // Seat maps must always refetch — stale data causes booking failures
    queryFn: async () => {
      try {
        const response = await fetch<BoatLayoutItem>(requestUrl, "GET", null, {
          cache: "no-store",
        });

        // Backend may return empty when cron hasn't loaded layout yet (far-future dates).
        // It will fetch from operator on-demand — retry to get the loaded data.
        if (!response || !(response as BoatLayoutItem).boatLayout) {
          throw new Error(
            JSON.stringify({ errorCode: "BOAT_LAYOUT_NOT_READY" })
          );
        }

        return response;
      } catch (err) {
        const errorString = (err as Error).toString().replace("Error: ", "");
        throw JSON.parse(errorString);
      }
    },
    enabled: enable,
    retry: 3,
    retryDelay: (attempt) => Math.min(2000 * 2 ** attempt, 10000),
  });

  const memoizedValue = useMemo(() => {
    // Validate response has actual boatLayout data (API may return {} for unavailable voyages)
    const validData =
      data && (data as BoatLayoutItem).boatLayout
        ? (data as BoatLayoutItem)
        : null;

    return {
      boatLayout: validData,
      boatLayoutLoading: isLoading,
      boatLayoutError: error,
      boatLayoutEmpty: !isLoading && !validData,
    };
  }, [data, error, isLoading]);
  return memoizedValue;
}
