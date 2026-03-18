import { useCallback, useMemo } from "react";
import { buildApiPath } from "../build-api-path";
import { RequestConfigType } from "../common/types/request-config";
import { SortEnum } from "../common/types/sort-type";
import useFetch from "../common/use-fetch";
import wrapperFetchJsonResponse from "../common/wrapper-fetch-json-response";
import { FerryTicketApiEndpoints } from "../endpoints";
import { Booking, BookingDetail, CreateBooking } from "./types/booking";
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import HTTP_CODES_ENUM from "../common/types/http-codes";
import useQueryFetcher from "../common/use-query-fetcher";
import { CreateOrder } from "../orders/types/order";
import { CommonAPIErrors } from "../common/types/validation-errors";
import { InfinityPaginationType } from "../common/types/infinity-pagination";

export const bookingQueryKeys = createQueryKeys(["bookings"], {
  filter: (request: GetBookingsRequestWithCursor) => ({
    key: [request],
  }),
  detail: (id: Booking["id"]) => ({
    key: [id],
  }),
});

export type PostCreateBookingResponse = Booking;

export type PostCreateBookingRequest = CreateBooking;

export function usePostCreateBooking() {
  const fetch = useFetch();

  return useCallback(
    (data: PostCreateBookingRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = buildApiPath(
        FerryTicketApiEndpoints.v1.bookings.index
      );
      return fetch(requestUrl, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<PostCreateBookingResponse>);
    },
    [fetch]
  );
}

export type GetBookingByIdRequest = {
  id: Booking["id"];
};
export type GetBookingByIdResponse = Booking;

export type GetBookingDetailByIdRequest = {
  id: BookingDetail["id"];
};
export type GetBookingDetailByIdResponse = BookingDetail;

export function serverGetBookingById(
  data: GetBookingByIdRequest,
  requestConfig?: RequestConfigType
) {
  const requestUrl = buildApiPath(
    FerryTicketApiEndpoints.v1.bookings.byId(data.id)
  );

  return fetch(requestUrl, {
    method: "GET",
    cache: "no-store",
    ...requestConfig,
  }).then(wrapperFetchJsonResponse<GetBookingByIdResponse>);
}

export function useGetBookingDetailById() {
  const fetch = useFetch();
  return useCallback(
    (data: GetBookingByIdRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = buildApiPath(
        FerryTicketApiEndpoints.v1.bookings.me.byId(data.id)
      );

      return fetch(requestUrl, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<GetBookingDetailByIdResponse>);
    },
    [fetch]
  );
}

export function useGetBookingById() {
  const fetch = useFetch();
  return useCallback(
    (data: GetBookingByIdRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = buildApiPath(
        FerryTicketApiEndpoints.v1.bookings.byId(data.id)
      );

      return fetch(requestUrl, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<GetBookingByIdResponse>);
    },
    [fetch]
  );
}

export type GetBookingsRequest = {
  page: number;
  limit: number;
  filters?: filterBookingRequest;
  sort?: Array<{
    orderBy: keyof Booking;
    order: SortEnum;
  }>;
};

export type GetBookingsRequestWithCursor = {
  page?: number;
  limit?: number;
  filters?: filterBookingRequest;
  cursor?: string;
};

export type GetBookingsResponse = {
  data: Booking[];
  hasNextPage: boolean;
  next_cursor?: string;
};

export type filterBookingRequest = {
  ids?: string[];
  orderer_name?: string;
  createdAt?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  booking_statuses?: number[];
};

export function useGetBookingsByUser() {
  const fetch = useFetch();

  return useCallback(
    (data: GetBookingsRequestWithCursor, requestConfig?: RequestConfigType) => {
      const requestUrl = buildApiPath(
        FerryTicketApiEndpoints.v1.bookings.byUser
      );

      if (data.page) {
        requestUrl.searchParams.append("page", data.page.toString());
      }

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
      }).then<GetBookingsResponse>(async (res) => await res.json());
    },
    [fetch]
  );
}

export type BookingsResponse = InfinityPaginationType<Booking>;

export function useGetBookingListQueryCursor(
  request: GetBookingsRequestWithCursor,
  enableFetching: boolean = true
) {
  const getBookingList = useGetBookingsByUser();
  const { data, fetchNextPage, isFetching, isLoading, hasNextPage, refetch } =
    useInfiniteQuery<BookingsResponse>({
      queryKey: bookingQueryKeys.filter(request).key,

      queryFn: async ({ pageParam = null }) => {
        const fetchedData = await getBookingList({
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
      bookings: (data?.pages?.flatMap((page) => page.data) as Booking[]) || [], // Assuming data structure adjustment
      bookingsLoading: isLoading,
      bookingsRefetch: refetch,
      bookingsIsFetching: isFetching,
      bookingsEmpty:
        !isLoading && !data?.pages.flatMap((page) => page.data).length,
      bookingsHasNextPage: hasNextPage,
      bookingsFetchNextPage: fetchNextPage,
      bookingsTotal: data?.pages[0]?.total,
      refetchOnMount: true,
    }),
    [data?.pages, isLoading, refetch, isFetching, hasNextPage, fetchNextPage]
  );

  return memoizedValue;
}

export type PostIssueTicket = {
  id: string;
};
export function useBookingPostConfirmToIssue() {
  const fetch = useFetch();
  const queryClient = useQueryClient();

  return useCallback(
    async (data: PostIssueTicket, requestConfig?: RequestConfigType) => {
      const queryKey = createQueryKeys(["bookings", data.id]).all().key;
      const requestUrl = buildApiPath(
        FerryTicketApiEndpoints.v1.bookings.confirmToIssue(data.id)
      );

      try {
        const response = fetch(requestUrl, {
          method: "POST",
          body: JSON.stringify({}),
          ...requestConfig,
        }).then(wrapperFetchJsonResponse<CommonAPIErrors>);

        // Invalidate the specific booking query after successful confirmation
        queryClient.invalidateQueries({
          queryKey: ["bookings", data.id],
        });

        queryClient.invalidateQueries({
          queryKey: queryKey,
        });

        return response;
      } catch (error) {
        throw error;
      }
    },
    [fetch, queryClient]
  );
}

export function useGetBooking(id: string, enable: boolean = true) {
  const URL = buildApiPath(FerryTicketApiEndpoints.v1.bookings.me.byId(id));

  const queryKey = bookingQueryKeys.detail(id).key;
  const { data, isLoading, error, refetch } = useQuery({
    // eslint-disable-next-line no-restricted-syntax
    queryKey: queryKey,
    staleTime: 0, // Booking status must always be fresh for payment/issue flows
    queryFn: async () => {
      const response = await fetch(URL, {
        method: "GET",
        cache: "no-store",
      });
      if (response.status !== HTTP_CODES_ENUM.OK) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
    enabled: enable,
    refetchOnMount: true,
  });

  const memoizedValue = useMemo(
    () => ({
      booking: data as Booking,
      bookingLoading: isLoading,
      bookingError: error,
      bookingRefetch: refetch,
    }),
    [data, error, isLoading, refetch]
  );

  return memoizedValue;
}

export function useBookingConfirmIssue(id: string) {
  const URL = buildApiPath(
    FerryTicketApiEndpoints.v1.bookings.confirmToIssue(id)
  );
  const fetch = useQueryFetcher();

  // const { mutate, mutateAsync, error, isSuccess, isPending, reset } =
  //   useMutation<unknown, CommonAPIErrors>({
  //     mutationKey: createQueryKeys(["bookings", id]).all().key,
  //     mutationFn: async () => {
  //       const response = await fetch(URL, {
  //         method: "POST",
  //         body: JSON.stringify({}),
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       });

  //       const data = await response.json();

  //       if (!response.ok) {
  //         throw {
  //           status: response.status,
  //           errors: data.errors || { errorCode: response.status },
  //         } as unknown as CommonAPIErrors;
  //       }

  //       return data; // Return the parsed JSON data instead of the response object
  //     },
  //   });

  const { mutate, mutateAsync, error, isSuccess, isPending, reset } =
    useMutation({
      mutationKey: createQueryKeys(["bookings", id]).all().key,
      mutationFn: () =>
        fetch(URL, "POST", JSON.stringify({}), {
          cache: "no-store",
        }),
    });

  // Kiểm tra và gán error.message nếu error là instance của Error
  const formattedErrorMessage = error instanceof Error ? error.message : null;

  const memoizedValue = useMemo(
    () => ({
      confirmIssue: mutate,
      confirmIssueAsync: mutateAsync,
      confirmIssueError: JSON.parse(
        formattedErrorMessage as string
      ) as CommonAPIErrors,
      confirmIssueSuccess: isSuccess,
      confirmIssuePending: isPending,
      confirmIssueReset: reset,
    }),
    [formattedErrorMessage, isPending, isSuccess, mutate, mutateAsync, reset]
  );

  return memoizedValue;
}

export type PatchBookingRequest = {
  orderer_name?: string;
  phone_number?: string;
  contact_email?: string;
  phone_country_code?: string | null;
  depart_order?: CreateOrder;
  return_order?: CreateOrder;
  // round_trip?: boolean;
  // total_ticket_price?: number;
  // total_agent_price?: number;
  // total_harbor_fee?: number;
  // total_price?: number;
  // depart_order_id?: string;
  // return_order_id?: string;
  VAT_buyer_name?: string;
  VAT_company_address?: string;
  VAT_company_name?: string;
  VAT_tax_number?: string;
  VAT_email?: string;
  orderer_social_id?: string;
};

export function useBookingPatchMutation(id: string) {
  const fetch = useQueryFetcher();
  const url = buildApiPath(FerryTicketApiEndpoints.v1.bookings.patchInfo(id));

  const { mutate, mutateAsync, error, isSuccess, isPending, reset, status } =
    useMutation({
      mutationKey: createQueryKeys(["bookings", id]).all().key,
      mutationFn: (request: PatchBookingRequest) =>
        fetch(url, "PATCH", JSON.stringify(request)),
    });

  const memoizedValue = useMemo(
    () => ({
      patchBooking: mutate,
      patchBookingAsync: mutateAsync,
      patchBookingError: error,
      patchBookingSuccess: isSuccess,
      patchBookingPending: isPending,
      patchBookingReset: reset,
      patchBookingStatus: status,
    }),
    [error, isPending, isSuccess, mutate, mutateAsync, reset, status]
  );

  return memoizedValue;
}
