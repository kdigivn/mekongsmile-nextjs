# Phase 2: GraphQL Integration & Service Layer

## Context Links
- [Plan Overview](./plan.md)
- [GraphQL Package README](/Users/khoilq/Documents/DeveloperZone/mekongsmile/graphql/README.md)
- [GraphQL Client](/Users/khoilq/Documents/DeveloperZone/mekongsmile/graphql/client.ts)
- [GraphQL Types](/Users/khoilq/Documents/DeveloperZone/mekongsmile/graphql/types.ts)

## Overview
- **Priority:** P1
- **Status:** completed
- **Effort:** 4h
- **Description:** Wire the ready-to-use `graphql/` package into the app via `@/graphql` path alias. Create a thin service layer that wraps `fetchGraphQL()` calls for each data domain (tours, posts, pages, taxonomies, site settings).

## Key Insights
- `graphql/` directory already has complete queries, fragments, types, and client
- Need to add `@/graphql` path alias in `tsconfig.json` (currently only `@/` maps to `src/`)
- Old WP service layer at `src/services/infrastructure/wordpress/` uses REST-style GraphQL calls with different types -- will be fully replaced
- `fetchGraphQL()` returns `json.data` directly -- response types in `graphql/types.ts` map to the `data` shape

## Requirements

### Functional
- All GraphQL queries from `graphql/` are importable via `@/graphql`
- Service functions return typed data for: tours, posts, pages, destinations, menus, site settings, options page
- Error handling with graceful fallbacks (null/empty array)

### Non-Functional
- No Apollo Client runtime in Server Components
- ISR revalidation configurable per query (default 60s)

## Architecture

```
graphql/                          # Already exists, production-ready
  client.ts                       # fetchGraphQL() + getApolloClient()
  types.ts                        # All TS interfaces
  queries/{tours,blog,taxonomies,site}/
  fragments/{tour,post,page,taxonomy,media,menu,seo}

src/services/wordpress/           # NEW thin service layer
  tour-service.ts                 # getAllTours, getTourBySlug, getTourSlugs
  post-service.ts                 # getAllBlogPosts, getPostBySlug, getNews
  page-service.ts                 # getPageBySlug, getAllPageSlugs
  taxonomy-service.ts             # getAllDestinations, getTourFilterOptions
  site-service.ts                 # getLayoutData, getSiteSettings, getMenus
  options-service.ts              # getTourConstant (ACF Options Page)
```

## Related Code Files

### Keep (read-only reference)
- `graphql/client.ts` -- fetchGraphQL, already complete
- `graphql/types.ts` -- all response types
- `graphql/queries/**` -- all queries
- `graphql/fragments/**` -- all fragments

### Create
- `src/services/wordpress/tour-service.ts`
- `src/services/wordpress/post-service.ts`
- `src/services/wordpress/page-service.ts`
- `src/services/wordpress/taxonomy-service.ts`
- `src/services/wordpress/site-service.ts`
- `src/services/wordpress/options-service.ts`
- `src/services/wordpress/index.ts` (barrel export)

### Modify
- `tsconfig.json` -- add `@/graphql` path alias pointing to `graphql/`

### Remove (Phase 11)
- `src/services/infrastructure/wordpress/` -- old WP query layer (defer removal to cleanup phase to avoid breaking imports during migration)

## Implementation Steps

### 1. Add path alias in `tsconfig.json`
```json
"paths": {
  "@/*": ["./src/*"],
  "@/graphql/*": ["./graphql/*"],
  "@/graphql": ["./graphql"]
}
```

### 2. Verify GraphQL connectivity
Create a quick test script or use `npm run dev` + a temp page to verify:
```ts
import { fetchGraphQL } from "@/graphql";
import { GET_ALL_TOURS } from "@/graphql/queries";
const data = await fetchGraphQL(GET_ALL_TOURS, { first: 1 });
console.log(data); // Should return 1 tour
```

### 3. Create service layer

Each service file follows this pattern:
```ts
// src/services/wordpress/tour-service.ts
import { fetchGraphQL } from "@/graphql";
import { GET_ALL_TOURS, GET_TOUR_BY_SLUG, GET_ALL_TOUR_SLUGS } from "@/graphql/queries";
import type { GetAllToursResponse, GetTourBySlugResponse, TourCard, TourDetail } from "@/graphql/types";

export async function getAllTours(first = 12, after?: string) {
  const data = await fetchGraphQL<GetAllToursResponse>(GET_ALL_TOURS, { first, after });
  return data.products;
}

export async function getTourBySlug(slug: string) {
  const data = await fetchGraphQL<GetTourBySlugResponse>(GET_TOUR_BY_SLUG, { slug });
  return data.product;
}

export async function getAllTourSlugs() {
  const data = await fetchGraphQL<{ products: { nodes: { slug: string }[] } }>(GET_ALL_TOUR_SLUGS);
  return data.products.nodes;
}
```

Similar pattern for post-service, page-service, taxonomy-service, site-service.

### 4. Create barrel export
```ts
// src/services/wordpress/index.ts
export * from "./tour-service";
export * from "./post-service";
export * from "./page-service";
export * from "./taxonomy-service";
export * from "./site-service";
export * from "./options-service";
```

## Todo List
- [x] Add `@/graphql` path alias to `tsconfig.json`
- [x] Verify `fetchGraphQL(GET_ALL_TOURS)` works against live endpoint
- [x] Create `src/services/wordpress/tour-service.ts`
- [x] Create `src/services/wordpress/post-service.ts`
- [x] Create `src/services/wordpress/page-service.ts`
- [x] Create `src/services/wordpress/taxonomy-service.ts`
- [x] Create `src/services/wordpress/site-service.ts`
- [x] Create `src/services/wordpress/options-service.ts`
- [x] Create `src/services/wordpress/index.ts`
- [x] TypeScript compiles cleanly (`npm run ts`)

## Success Criteria
- All service functions return correct typed data from mekongsmile.com/graphql
- `npm run ts` passes with no errors
- Each query returns expected shape (test with at least 1 call each)

## Risk Assessment
- **GraphQL endpoint down** -- fetchGraphQL throws; services should catch and return null/[]
- **Schema mismatch** -- types in `graphql/types.ts` may drift from live schema; validate against introspection if errors occur

## Next Steps
-> Phase 3: Layout & Navigation
