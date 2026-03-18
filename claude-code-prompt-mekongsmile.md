# Claude Code Prompt: Migrate vetaucaotoc.net → mekongsmile.com

## Context

I have an existing Next.js project for **vetaucaotoc.net** that uses headless WordPress + WPGraphQL + Rank Math SEO via GraphQL. I want to adapt this codebase as the foundation for **mekongsmile.com** — a tour booking website in the Mekong Delta, Vietnam.

The WordPress backend at `https://mekongsmile.com/graphql` is already fully configured with:
- WPGraphQL v2.10.0
- WooGraphQL v0.21.2 (WooCommerce products)
- WPGraphQL for ACF v2.5.1
- WPGraphQL for Rank Math SEO
- Custom plugin: WooGraphQL Booking Product (registers YITH Booking `BookingProduct` type)

## What I Need You To Do

### Phase 1: Understand the existing codebase

1. Read the entire project structure of the vetaucaotoc.net Next.js codebase
2. Identify: GraphQL queries, fragments, client setup, page routes, components, types, layout structure, SEO handling, sitemap generation, and any shared utilities
3. Document what can be reused vs what needs to change

### Phase 2: Replace GraphQL layer

Replace all GraphQL queries/fragments/types with the new mekongsmile.com schema. I have a complete query package ready at `graphql/` directory (if present) or use these specifications:

**Endpoint:** `https://mekongsmile.com/graphql`

**Key differences from vetaucaotoc.net:**
- Products are `BookingProduct` type (not SimpleProduct or other). Always use inline fragment: `... on BookingProduct { }`
- ACF fields are on `shortTourInformation` (price, duration, FAQ, includes, meeting pickup, etc.)
- Taxonomy queries use `allDestination` (NOT `destinations`), `allPaTourType`, `allPaTravelStyle`
- Product taxonomy filter uses `taxonomyFilter: { filters: [{ taxonomy: DESTINATION, terms: [...] }] }`
- Posts `categoryName` filter works, but NO `taxQuery` on posts — use `destination(id:, idType: SLUG) { posts {...} }` for destination-filtered posts
- ACF Options page: `tourConstantOptions { tourConstant { whyChooseUs { headline description } } }`
- Rank Math SEO: `seo { title description focusKeywords openGraph { title description image { url } } jsonLd { raw } breadcrumbs { text url } }`
- Menus: main-menu (PRIMARY), secondary-menu (SECONDARY), top-menu (TOP_BAR_NAV)
- Cursor pagination: `first`, `after`, `pageInfo { hasNextPage endCursor }`

**Content types:**
- **Tours** (34 BookingProduct items) — main content, replaces whatever product type vetaucaotoc had
- **Blog posts** (~56 posts) — categories: News (Awards, CSR, Events, Organization), Top Destinations, Toplist, Travel Guide
- **Pages** — homepage, about-us, contact-us, blog, profile, FAQ, terms, privacy
- **Destinations** (14 terms, hierarchical) — Greater Saigon (HCM, Tay Ninh, Tien Giang), Island (Con Dao, Phu Quoc), Mekong Delta (An Giang, Ben Tre, Ca Mau, Can Tho, Dong Thap, Vinh Long)

**ACF fields on BookingProduct (shortTourInformation):**
```
priceInUsd: Float
priceInVnd: Float
duration: String (e.g. "5 hours (approx.)")
language: String
bestTimeToVisit: String
destinations: String (text, not taxonomy)
tripadvisorLink: String
highlights: String (HTML)
additionalInfo: String (HTML)
pricingTable: Float
faq: [{ question, answer }] (repeater)
includes: { included, excluded } (group, HTML)
meetingPickup: { pickupPoint, startTime, pickupDetails, linkGoogleMaps } (group)
attachment: { node: { sourceUrl, title } } (file)
```

### Phase 3: Adapt routes and pages

Map the URL structure:
- `/` — Homepage
- `/tours/` or `/shop/` — Tour listing (all products)
- `/tour/{slug}/` — Single tour detail page (product detail)
- `/destination/{slug}/` — Destination archive (tours + posts for that destination)
- `/blog/` — Blog listing
- `/blog/{slug}/` — Single blog post
- `/news/` — News category posts
- `/news/{slug}/` — Single news post
- `/about-us/` — About page
- `/contact-us/` — Contact page
- `/frequently-asked-questions-about-mekong-smile/` — FAQ page

### Phase 4: Update configuration

- Update `.env` / `.env.local`:
  ```
  NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL=https://mekongsmile.com/graphql
  NEXT_PUBLIC_SITE_URL=https://mekongsmile.com
  ```
- Update `next.config.js` — image domains: `mekongsmile.com`
- Update sitemap generation for new URL patterns
- Update metadata/SEO defaults: title="Mekong Smile", description="Signature Mekong Delta Tour"

### Phase 5: Keep but adapt

- Keep the Rank Math SEO integration pattern (should be similar)
- Keep the GraphQL client setup pattern (Apollo or fetch-based)
- Keep ISR/revalidation strategy
- Keep responsive layout structure
- Adapt design tokens/colors if needed (don't redesign, just ensure it works)

## Important Notes

- Do NOT delete the old code immediately. Create the new mekongsmile structure alongside, so I can compare.
- Prioritize getting data flowing correctly first, then fix layouts.
- All tours are `BookingProduct` — if the old code checks for `SimpleProduct`, update those checks.
- The site language is English (not Vietnamese like vetaucaotoc).
- Keep PM2 ecosystem file if it exists — I deploy with PM2 + Nginx.

## Test Queries to Verify

After setup, verify these work:

```graphql
# Tour listing
{ products(first: 3) { nodes { name slug ... on BookingProduct { shortTourInformation { priceInUsd duration } } } } }

# Single tour
{ product(id: "cai-rang-floating-market-tour", idType: SLUG) { name seo { title description } ... on BookingProduct { shortTourInformation { priceInUsd duration highlights } } } }

# Destinations tree
{ allDestination(first: 50, where: { parent: 0, hideEmpty: false }) { nodes { name slug count children(first: 20) { nodes { name slug count } } } } }

# Blog posts
{ posts(first: 3, where: { categoryName: "news" }) { nodes { title slug seo { title } } } }

# Site settings + menus
{ generalSettings { title description url } menus { nodes { name locations } } }

# Tour Constant options
{ tourConstantOptions { tourConstant { whyChooseUs { headline description } } } }
```
