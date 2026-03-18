import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { RequestConfigType } from "../common/types/request-config";
import useQueryFetcher from "../common/use-query-fetcher";
import { buildApiPath } from "../build-api-path";
import { FerryTicketApiEndpoints } from "../endpoints";
import { useQuery } from "@tanstack/react-query";
import { Organization } from "./types/organization";
import { useMemo } from "react";

const organizationQueryKeys = createQueryKeys(["organization"], {
  getCurrentOrganization: () => ({
    key: [],
  }),
});

// Get route's list
/**
 * Get cached voyage data from database. After using this hook, you should call `useGetVoyageFindAllRelateByLocationAndDateThenUpdate` to get latest voyage data
 * @returns
 */
export function useGetCurrentOrganizationQuery(
  requestConfig?: RequestConfigType
) {
  const fetch = useQueryFetcher();
  const requestUrl = buildApiPath(FerryTicketApiEndpoints.organization.me);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: organizationQueryKeys.getCurrentOrganization().key,
    queryFn: () => fetch<Organization>(requestUrl, "GET", null, requestConfig),
  });

  const memoizedValue = useMemo(
    () => ({
      organization: data,
      organizationLoading: isLoading,
      organizationError: error,
      organizationRefetch: refetch,
    }),
    [data, error, isLoading, refetch]
  );

  return memoizedValue;
}
