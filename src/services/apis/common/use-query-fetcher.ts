import { useCallback } from "react";
import HTTP_CODES_ENUM from "./types/http-codes";
import { RequestConfigType } from "./types/request-config";
import useFetch from "./use-fetch";
import wrapperFetchJsonResponse from "./wrapper-fetch-json-response";

/**
 * A fetcher function that return plain data from `request url` and is built for using along with `useQuery()`.
 * @returns A fetcher function that return plain data from `request url` and is built for using along with `useQuery()`.
 */
function useQueryFetcher() {
  const fetch = useFetch();

  return useCallback(
    /**
     * A fetcher function that return plain data from `request url` and is built for using along with `useQuery()`.
     *
     * This function will throw error when response data from API is invalid so if you need to handle custom errors from Backend, you should use `useFetch()` instead
     * @param requestUrl Request URL
     * @param method HTTP method
     * @param body Request body
     * @param requestConfig request configs
     * @returns response data
     */
    async <T>(
      requestUrl: string | URL,
      method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
      body?: BodyInit | null,
      requestConfig?: RequestConfigType
    ): Promise<T | undefined> => {
      const { data, status } = await fetch(requestUrl, {
        method,
        body,
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<T>);

      if (
        [
          // HTTP_CODES_ENUM.NO_CONTENT,
          HTTP_CODES_ENUM.SERVICE_UNAVAILABLE,
          HTTP_CODES_ENUM.INTERNAL_SERVER_ERROR,
        ].includes(status)
      ) {
        throw new Error("Error when fetching data");
      }

      if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
        throw new Error(JSON.stringify(data.errors));
      }

      if ((status as number) === HTTP_CODES_ENUM.FORBIDDEN) {
        throw new Error("You are not authorized to access this resource");
      }

      return data;
    },
    [fetch]
  );
}

export default useQueryFetcher;
