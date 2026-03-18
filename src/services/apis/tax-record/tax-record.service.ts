import { createQueryKeys } from "@/services/react-query/query-key-factory";
import useQueryFetcher from "../common/use-query-fetcher";
import { RequestConfigType } from "../common/types/request-config";
import { useQuery } from "@tanstack/react-query";
import { TaxRecord } from "./tax-record";
import { useMemo } from "react";

export const taxRecordQueryKeys = createQueryKeys(["tax-record"], {
  detail: (taxId?: string) => ({
    key: [taxId],
  }),
});

export type RequestGetTaxRecordById = {
  taxId?: string;
};

/**
 * Fetches a tax record by its ID.
 * @returns Tax record data, loading state, error state, and refetch function.
 *
 */
export function useGetTaxRecordQuery(
  request: RequestGetTaxRecordById,
  requestConfig?: RequestConfigType,
  isEnable?: boolean
) {
  const fetch = useQueryFetcher();
  // We need to wrap the initiation in useMemo to avoid duplication in searchParams when this hook is called multiple times
  const requestUrl = `https://n8n.nucuoimekong.com/webhook/business?taxid=${request.taxId}`;
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: taxRecordQueryKeys.detail(request.taxId).key,
    queryFn: async () =>
      fetch<TaxRecord>(requestUrl, "GET", null, requestConfig),
    enabled: isEnable,
  });

  const memoizedValue = useMemo(
    () => ({
      taxRecord: data,
      taxRecordLoading: isLoading,
      taxRecordError: error,
      taxRecordRefetch: refetch,
    }),
    [data, error, isLoading, refetch]
  );

  return memoizedValue;
}
