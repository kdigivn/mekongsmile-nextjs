/**
 * GraphQL Client for mekongsmile.com headless Next.js
 *
 * Endpoint: https://mekongsmile.com/graphql
 * Plugins: WPGraphQL v2.10.0, WooGraphQL v0.21.2, WPGraphQL for ACF v2.5.1
 *
 * Usage:
 *   import { fetchGraphQL } from "@/graphql/client";
 *   import { GET_ALL_TOURS } from "@/graphql/queries";
 *
 *   // In getStaticProps or server component
 *   const data = await fetchGraphQL(GET_ALL_TOURS, { first: 12 });
 */

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  type DocumentNode,
  type NormalizedCacheObject,
} from "@apollo/client";

// ─── Configuration ────────────────────────────────────────────────────────────

const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL ||
  "https://mekongsmile.com/graphql";

// ─── Apollo Client (for use in React components with ApolloProvider) ──────────

let apolloClientInstance: ApolloClient<NormalizedCacheObject> | null = null;

export function getApolloClient(): ApolloClient<NormalizedCacheObject> {
  if (apolloClientInstance) return apolloClientInstance;

  apolloClientInstance = new ApolloClient({
    link: new HttpLink({
      uri: GRAPHQL_ENDPOINT,
      fetchOptions: { next: { revalidate: 60 } }, // ISR: revalidate every 60s
    }),
    cache: new InMemoryCache({
      typePolicies: {
        // Handle WooGraphQL product union type
        Product: {
          keyFields: ["databaseId"],
        },
        BookingProduct: {
          keyFields: ["databaseId"],
        },
        Post: {
          keyFields: ["databaseId"],
        },
        Page: {
          keyFields: ["databaseId"],
        },
        Destination: {
          keyFields: ["databaseId"],
        },
      },
    }),
    ssrMode: typeof window === "undefined",
    defaultOptions: {
      query: {
        fetchPolicy: "no-cache", // SSG/SSR: always fetch fresh
      },
    },
  });

  return apolloClientInstance;
}

// ─── Lightweight fetch helper (no Apollo dependency, for RSC / getStaticProps) ─

interface GraphQLResponse<T = Record<string, unknown>> {
  data: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

/**
 * Standalone fetch-based GraphQL client.
 * Works in React Server Components, getStaticProps, getServerSideProps, API routes.
 *
 * @param query  - GraphQL DocumentNode or query string
 * @param variables - Query variables
 * @param options - Additional fetch options
 */
export async function fetchGraphQL<T = Record<string, unknown>>(
  query: DocumentNode | string,
  variables?: Record<string, unknown>,
  options?: {
    revalidate?: number | false; // ISR seconds, false = no cache
    headers?: Record<string, string>;
  }
): Promise<T> {
  const { revalidate = 60, headers = {} } = options || {};

  // Extract query string from DocumentNode
  const queryString =
    typeof query === "string"
      ? query
      : query.loc?.source?.body || "";

  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify({
      query: queryString,
      variables,
    }),
    next: revalidate !== false ? { revalidate } : undefined,
  });

  if (!res.ok) {
    throw new Error(
      `GraphQL fetch failed: ${res.status} ${res.statusText}`
    );
  }

  const json: GraphQLResponse<T> = await res.json();

  if (json.errors) {
    console.error("[GraphQL Errors]", JSON.stringify(json.errors, null, 2));
    throw new Error(
      `GraphQL errors: ${json.errors.map((e) => e.message).join(", ")}`
    );
  }

  return json.data;
}
