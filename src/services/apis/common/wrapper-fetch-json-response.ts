import { FetchJsonResponse } from "./types/fetch-json-response";
import HTTP_CODES_ENUM from "./types/http-codes";

async function wrapperFetchJsonResponse<T>(
  response: Response
): Promise<FetchJsonResponse<T>> {
  try {
    const status = response.status as FetchJsonResponse<T>["status"];
    const contentType = response.headers.get("Content-Type");

    // 204 No Content has no body/content-type by design — preserve original status
    if (status === HTTP_CODES_ENUM.NO_CONTENT) {
      return { status, data: undefined };
    }

    // When No content type or non-JSON response (e.g. HTML error page) => do not parse body
    // OK/CREATED always have JSON content-type, so this branch only handles error statuses
    if (!contentType || !contentType.includes("application/json")) {
      return {
        status,
        data: undefined,
      } as FetchJsonResponse<T>;
    }

    return {
      status,
      data: [
        HTTP_CODES_ENUM.NO_CONTENT,
        HTTP_CODES_ENUM.SERVICE_UNAVAILABLE,
        HTTP_CODES_ENUM.INTERNAL_SERVER_ERROR,
      ].includes(status)
        ? undefined
        : await response.json(),
    };
  } catch (error) {
    throw error;
  }
}

export default wrapperFetchJsonResponse;
