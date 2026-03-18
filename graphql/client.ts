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
} from "@apollo/client";

// ─── Configuration ────────────────────────────────────────────────────────────

const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL ||
  "https://mekongsmile.com/graphql";

// ─── Apollo Client (for use in React components with ApolloProvider) ──────────

let apolloClientInstance: ApolloClient | null = null;

export function getApolloClient(): ApolloClient {
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

// ─── Fragment deduplication ──────────────────────────────────────────────────

/** Remove duplicate GraphQL fragment definitions from a query string */
function deduplicateFragments(query: string): string {
  const seen = new Set<string>();
  const lines = query.split("\n");
  const result: string[] = [];
  let skipping = false;
  let depth = 0;

  for (const line of lines) {
    const fragmentMatch = line.match(/^\s*fragment\s+(\w+)\s+on\s+/);
    if (fragmentMatch) {
      const name = fragmentMatch[1];
      if (seen.has(name)) {
        skipping = true;
        depth = 0;
      } else {
        seen.add(name);
      }
    }

    if (skipping) {
      depth += (line.match(/\{/g) || []).length;
      depth -= (line.match(/\}/g) || []).length;
      if (depth <= 0 && line.includes("}")) {
        skipping = false;
      }
      continue;
    }

    result.push(line);
  }

  return result.join("\n");
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

  // Extract query string from DocumentNode and deduplicate fragments
  const rawQuery =
    typeof query === "string"
      ? query
      : query.loc?.source?.body || "";

  // Deduplicate fragment definitions (gql interpolation can include the same fragment multiple times)
  const queryString = deduplicateFragments(rawQuery);

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

  let json: GraphQLResponse<T>;
  try {
    json = await res.json();
  } catch (parseError) {
    const text = await res.clone().text().catch(() => "");
    console.error(
      `[GraphQL] JSON parse failed (${text.length} bytes):`,
      parseError
    );
    throw new Error(
      `GraphQL response is not valid JSON (${text.length} bytes)`
    );
  }

  if (json.errors) {
    console.error("[GraphQL Errors]", JSON.stringify(json.errors, null, 2));
    throw new Error(
      `GraphQL errors: ${json.errors.map((e) => e.message).join(", ")}`
    );
  }

  return json.data;
}
