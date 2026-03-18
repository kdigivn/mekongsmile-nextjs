# Mekong Smile — GraphQL Query Package for Next.js 14

## Endpoint

```
https://mekongsmile.com/graphql
```

## Stack

| Plugin | Version | Purpose |
|--------|---------|---------|
| WPGraphQL | 2.10.0 | Core GraphQL API |
| WooGraphQL | 0.21.2 | WooCommerce product/taxonomy support |
| WPGraphQL for ACF | 2.5.1 | ACF field exposure |
| WooGraphQL Booking Product | 1.0.0 | Custom plugin — registers YITH Booking `BookingProduct` type |

## Directory Structure

```
graphql/
├── index.ts                    # Main entry — re-exports everything
├── client.ts                   # Apollo Client + fetch helper
├── types.ts                    # TypeScript interfaces
├── fragments/
│   ├── index.ts
│   ├── media.ts                # MediaItem, FeaturedImage, GalleryImages
│   ├── taxonomy.ts             # Destination, TourType, TravelStyle, Category, ProductTag
│   ├── tour.ts                 # TourCard, TourDetail, ShortTourInformation (ACF)
│   ├── post.ts                 # PostCard, PostDetail
│   ├── page.ts                 # Page fields
│   └── menu.ts                 # MenuItem, Menu (3-level nesting)
└── queries/
    ├── index.ts
    ├── tours/
    │   ├── index.ts
    │   ├── getAllTours.ts       # GET_ALL_TOURS, GET_ALL_TOUR_SLUGS
    │   ├── getTourBySlug.ts    # GET_TOUR_BY_SLUG
    │   └── getToursByTaxonomy.ts  # By destination, travel style, tour type, tag, combined
    ├── blog/
    │   ├── index.ts
    │   ├── getAllBlogPosts.ts   # GET_ALL_BLOG_POSTS, GET_ALL_POST_SLUGS, categories
    │   ├── getPostBySlug.ts    # GET_POST_BY_SLUG
    │   └── getNews.ts          # GET_ALL_NEWS, GET_NEWS_BY_SUBCATEGORY, GET_NEWS_BY_SLUG
    ├── taxonomies/
    │   ├── index.ts
    │   ├── getAllDestinations.ts  # Hierarchical tree, flat list, single destination
    │   └── getTourTypes.ts     # Tour types, travel styles, product tags, filter options
    └── site/
        ├── index.ts
        ├── getSiteSettings.ts  # GET_SITE_SETTINGS, GET_LAYOUT_DATA
        ├── getMenus.ts         # GET_ALL_MENUS, GET_MENU_BY_LOCATION
        └── getPages.ts         # GET_ALL_PAGES, GET_PAGE_BY_SLUG
```

## Quick Start

### 1. Install dependencies

```bash
npm install @apollo/client graphql
```

### 2. Environment variable

```env
NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL=https://mekongsmile.com/graphql
```

### 3. Usage in Next.js App Router (Server Components)

```tsx
// app/tours/page.tsx
import { fetchGraphQL } from "@/graphql/client";
import { GET_ALL_TOURS } from "@/graphql/queries";
import type { GetAllToursResponse } from "@/graphql/types";

export default async function ToursPage() {
  const data = await fetchGraphQL<GetAllToursResponse>(
    GET_ALL_TOURS,
    { first: 12 }
  );

  return (
    <div>
      {data.products.nodes.map((tour) => (
        <TourCard key={tour.databaseId} tour={tour} />
      ))}
    </div>
  );
}
```

### 4. Usage in getStaticProps (Pages Router)

```tsx
// pages/tours/[slug].tsx
import { getApolloClient } from "@/graphql/client";
import { GET_TOUR_BY_SLUG, GET_ALL_TOUR_SLUGS } from "@/graphql/queries";

export async function getStaticPaths() {
  const client = getApolloClient();
  const { data } = await client.query({ query: GET_ALL_TOUR_SLUGS });
  return {
    paths: data.products.nodes.map((p: any) => ({ params: { slug: p.slug } })),
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }: any) {
  const client = getApolloClient();
  const { data } = await client.query({
    query: GET_TOUR_BY_SLUG,
    variables: { slug: params.slug },
  });
  return { props: { tour: data.product }, revalidate: 60 };
}
```

## Query Reference

### Tours (34 BookingProduct items)

| Export | Variables | Description |
|--------|-----------|-------------|
| `GET_ALL_TOURS` | `first`, `after` | Paginated tour listing |
| `GET_ALL_TOUR_SLUGS` | — | Slugs for `getStaticPaths` |
| `GET_TOUR_BY_SLUG` | `slug` | Full tour detail with ACF |
| `GET_TOURS_BY_DESTINATION` | `destinationSlug[]`, `first`, `after` | Filter by destination |
| `GET_TOURS_BY_TRAVEL_STYLE` | `travelStyleSlug[]`, `first`, `after` | Filter by style |
| `GET_TOURS_BY_TOUR_TYPE` | `tourTypeSlug[]`, `first`, `after` | Filter by type |
| `GET_TOURS_BY_TAG` | `tagSlug[]`, `first`, `after` | Filter by tag |
| `GET_TOURS_BY_COMBINED_FILTERS` | `destinationSlug[]`, `travelStyleSlug[]` | Multi-filter AND |

### Blog & News (~56 posts)

| Export | Variables | Description |
|--------|-----------|-------------|
| `GET_ALL_BLOG_POSTS` | `first`, `after`, `categoryName` | All posts, optional category filter |
| `GET_ALL_POST_SLUGS` | — | For `getStaticPaths` |
| `GET_ALL_POST_CATEGORIES` | — | Category tree |
| `GET_POST_BY_SLUG` | `slug` | Single post detail |
| `GET_ALL_NEWS` | `first`, `after` | News category + children |
| `GET_NEWS_BY_SUBCATEGORY` | `subcategory`, `first`, `after` | Awards, CSR, Events, Organization |
| `GET_NEWS_BY_SLUG` | `slug` | Single news detail (alias of GET_POST_BY_SLUG) |

### Taxonomies

| Export | Variables | Description |
|--------|-----------|-------------|
| `GET_ALL_DESTINATIONS` | `hideEmpty` | Hierarchical tree (parent → children) |
| `GET_ALL_DESTINATIONS_FLAT` | `hideEmpty` | Flat list with parentDatabaseId |
| `GET_DESTINATION_BY_SLUG` | `slug`, `firstProducts`, `firstPosts` | Destination + its products & posts |
| `GET_ALL_TOUR_TYPES` | — | Group Tour, Private Tour |
| `GET_ALL_TRAVEL_STYLES` | — | 5 travel styles |
| `GET_ALL_PRODUCT_TAGS` | — | 8 product tags |
| `GET_TOUR_FILTER_OPTIONS` | — | All taxonomies in one query (for filter UI) |

### Site-wide

| Export | Variables | Description |
|--------|-----------|-------------|
| `GET_SITE_SETTINGS` | — | Title, description, URL |
| `GET_LAYOUT_DATA` | — | Settings + all menus (single query for layout) |
| `GET_ALL_MENUS` | — | All 3 menus with nested items |
| `GET_MENU_BY_LOCATION` | `location` | PRIMARY, SECONDARY, TOP_BAR_NAV |
| `GET_ALL_PAGES` | — | All pages with template info |
| `GET_PAGE_BY_SLUG` | `slug` | Single page content |
| `GET_ALL_PAGE_SLUGS` | — | For `getStaticPaths` |

## Important Notes & Known Limitations

### 1. Product Type: BookingProduct

All 34 tours are YITH Booking products (WooCommerce type `booking`). They appear as `BookingProduct` in GraphQL thanks to the custom `woographql-booking-product` plugin. Always use inline fragments:

```graphql
... on BookingProduct {
  shortTourInformation { ... }
}
```

### 2. Duplicate Type Warning

The debug output shows `BookingProduct` duplicate type warnings. This is because the BookingProduct registration code exists in both:
- `wp-content/plugins/woographql-booking-product/woographql-booking-product.php` (plugin)
- `functions.php` lines ~2312-2337 (duplicate)

**Action needed:** Remove the duplicate code from `functions.php`. It's harmless but generates warnings.

### 3. ACF Options Page (Tour Constant) — NOT AVAILABLE

The `TourConstant` ACF Options page (containing `whyChooseUs`) is registered in the schema but **cannot be queried** via the root query. Options pages need additional configuration.

**Fix options (Claude Max prompt below):**
> "In WordPress mekongsmile.com, the ACF Options page 'Tour Constant' (field group with Show in GraphQL enabled, type name TourConstant) is not queryable via WPGraphQL root query. Write a PHP snippet for functions.php that registers a custom root query field `tourConstant` using `register_graphql_field` on RootQuery that returns the ACF options page fields. The field group has a sub-field group 'whyChooseUs' with 'headline' and 'description' text fields."

### 4. SEO Fields (Rank Math) — NOT AVAILABLE

Rank Math PRO is active but `wp-graphql-rank-math` plugin is not installed. SEO meta (title, description, og:image, schema markup) is not exposed in GraphQL.

**Fix (Claude Max prompt):**
> "Install the wp-graphql-rank-math plugin on mekongsmile.com (WP Admin → Plugins → Add New → search 'WPGraphQL for Rank Math SEO'). After activation, all Post, Product, Page types will have a `seo` field in GraphQL with title, description, focusKeywords, openGraph, jsonLd, breadcrumbs, etc."

### 5. Destination Taxonomy Naming

The destination taxonomy uses `allDestination` (singular) as the root query field name — NOT `destinations`. This is WPGraphQL's automatic naming for custom taxonomies. Single destination query is `destination(id:, idType:)`.

### 6. Posts Don't Support taxQuery

Posts have `categoryName`, `categoryIn`, `tag`, `tagIn` filters but **no** `taxQuery` or `taxonomyFilter` like Products. To get posts by destination, use the reverse query:

```graphql
destination(id: "can-tho", idType: SLUG) {
  posts(first: 10) { nodes { title slug } }
}
```

### 7. Pagination

All list queries use WPGraphQL cursor-based pagination:
- `first: N` — items per page
- `after: "cursor"` — next page cursor from `pageInfo.endCursor`
- `pageInfo.hasNextPage` — check if more pages exist

### 8. GraphQL Code Generator (Optional)

For auto-generated types, add `codegen.ts`:

```ts
import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "https://mekongsmile.com/graphql",
  documents: ["graphql/**/*.ts"],
  generates: {
    "graphql/generated/": {
      preset: "client",
      config: {
        documentMode: "string",
      },
    },
  },
};

export default config;
```

```bash
npm install -D @graphql-codegen/cli @graphql-codegen/client-preset
npx graphql-codegen
```
