import { GraphQLResponse } from "./graphql.type";

export type GraphQLFetcherOptions = {
  cacheRevalidateTime: number;
  maxRetries?: number;
  timeoutMs?: number;
};

// 30s timeout per attempt (up from undici default ~10s)
const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_MAX_RETRIES = 3;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.name === "AbortError" ||
    error.message.includes("fetch failed") ||
    error.message.includes("ECONNRESET") ||
    error.message.includes("ETIMEDOUT") ||
    error.message.includes("ConnectTimeout") ||
    error.message.includes("UND_ERR_CONNECT_TIMEOUT")
  );
}

/**
 * Function to execute a GraphQL query.
 * Retries up to maxRetries times on network errors with exponential backoff.
 */
export async function graphqlFetcher<T>(
  query: string,
  variables?: { [key: string]: unknown },
  options?: GraphQLFetcherOptions
): Promise<GraphQLResponse<T>> {
  // Validate the WordPress GraphQL URL.
  const graphqlUrl = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (!graphqlUrl) {
    throw new Error(
      "GraphQL Fetch Errors: Missing WordPress GraphQL URL environment variable!"
    );
  }

  // Prepare headers.
  const headers: { [key: string]: string } = {
    "Content-Type": "application/json",
  };

  // Merge default options and incoming options
  const mergedOptions = {
    cacheRevalidateTime: 3600,
    maxRetries: DEFAULT_MAX_RETRIES,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    ...options,
  };

  const { cacheRevalidateTime, maxRetries, timeoutMs } = mergedOptions;

  const body = JSON.stringify({ query, variables });
  const fetchOptions = {
    method: "POST" as const,
    headers,
    body,
    next: {
      tags: ["graphql"],
      revalidate: cacheRevalidateTime,
    },
  };

  let lastError: Error = new Error("Unknown fetch error");

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Exponential backoff before retry attempts: 1s, 2s, 4s
      if (attempt > 0) {
        await sleep(1000 * Math.pow(2, attempt - 1));
      }

      // New AbortController per attempt (cannot reuse an aborted controller)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      let response: Response;
      try {
        response = await fetch(graphqlUrl, {
          ...fetchOptions,
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      // If the response status is not 200, throw an error.
      if (!response.ok) {
        throw new Error("Response Status:" + response.statusText);
      }

      // Read the response as JSON.
      const data = await response.json();

      // Throw an error if there was a GraphQL error.
      if (data.errors) {
        throw new Error(JSON.stringify(data.errors));
      }

      // Finally, return the data.
      return data;
    } catch (error) {
      lastError = error as Error;

      // Only retry on transient network errors, not on GraphQL/HTTP errors
      if (!isNetworkError(error) || attempt === maxRetries) {
        throw lastError;
      }
    }
  }

  throw lastError;
}
