import HTTP_CODES_ENUM from "./types/http-codes";
import { RequestConfigType } from "./types/request-config";
import wrapperFetchJsonResponse from "./wrapper-fetch-json-response";

/**
 * A fetcher function that return plain data from `request url` and is built for using along with `useQuery()` in `server component`.
 * @returns A fetcher function that return plain data from `request url` and is built for using along with `useQuery()`.
 */
function serverQueryFetcher() {
  return (
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

      return data;
    }
  );
}

export default serverQueryFetcher;
