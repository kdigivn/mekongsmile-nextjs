import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { useQuery } from "@tanstack/react-query";
import { buildApiPath } from "../build-api-path";
import { FerryTicketApiEndpoints } from "../endpoints";
import useQueryFetcher from "../common/use-query-fetcher";
import { NotifiedPost } from "@/services/infrastructure/wordpress/types/post";
import { useMemo } from "react";

const notificationQueryKeys = createQueryKeys(["notifications"], {
  list: () => ({
    key: [],
  }),
});

export function useGetNotificationsQuery() {
  const url = buildApiPath(FerryTicketApiEndpoints.cms.notifiedPost);
  const fetch = useQueryFetcher();
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: notificationQueryKeys.list().key,
    queryFn: () => fetch<NotifiedPost[]>(url, "GET"),
  });

  const memoizedValue = useMemo(
    () => ({
      notifications: data || [],
      notificationsError: error,
      notificationsLoading: isLoading,
      refetchNotifications: refetch,
    }),
    [data, error, isLoading, refetch]
  );

  return memoizedValue;
}
