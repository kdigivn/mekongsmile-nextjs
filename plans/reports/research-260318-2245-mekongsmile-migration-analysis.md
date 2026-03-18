# Research Report: vetaucaotoc.net → mekongsmile.com Migration Analysis

**Date:** 2026-03-18
**Scope:** Codebase audit, architecture gap analysis, migration strategy for Next.js 14 ferry booking → tour booking site

## Executive Summary

The existing codebase is a **mature** Next.js 14 App Router ferry ticket booking system (743 files in `src/`) with dual data sources: REST API backend (ferry operations) and headless WordPress via WPGraphQL (blog/CMS content). The target is **mekongsmile.com** — a Mekong Delta tour booking site powered entirely by headless WordPress + WooCommerce + WPGraphQL.

**Key finding:** A ready-to-use `graphql/` package already exists at project root with all queries, fragments, types, and Apollo Client setup for mekongsmile.com. The migration is primarily about **replacing the existing service/view/route layers** while keeping reusable infrastructure (UI components, hooks, i18n, build config).

**Migration complexity: MEDIUM-HIGH.** ~60% of existing code is ferry-specific (voyages, tickets, seat selection, payments, boat layouts) and must be removed/replaced. ~25% is reusable (UI components, hooks, utilities, WordPress CMS layer). ~15% needs adaptation (routes, SEO, sitemap, layout, config).

---

## Research Methodology

- **Sources:** Codebase analysis (743 src files), GraphQL package inspection, package.json audit, WebSearch (3 queries)
- **Key search terms:** Next.js 14 headless WordPress WPGraphQL, WooGraphQL BookingProduct ACF, REST to GraphQL migration SEO sitemap

---

## Key Findings

### 1. Existing Codebase Architecture

**Data layer (dual-source):**
- `src/services/apis/` — REST API services for ferry operations (voyages, tickets, bookings, payments, passengers, routes, operators, invoices, vouchers, boat layouts, customers, companies, orders)
- `src/services/infrastructure/wordpress/` — WPGraphQL queries for CMS content (posts, pages, menus, products, categories, terms, comments, ratings, logos, env settings, blocks)
- `src/services/graphql/` — existing GraphQL service directory (likely the old WP GraphQL client)

**App Router structure:**
- `src/app/(language)/` — i18n route group with ferry-specific pages (schedules, ticket-detail, booking/[id], payment-gateway/*, user/bookings, transactions)
- `src/app/(language)/[...slug]/page.tsx` — catch-all for WordPress pages/posts
- `src/app/api/` — API routes (proxy, search, voyage counts, baocao/reports)

**View layer:**
- `src/views/homepage/` — homepage sections (operators, posts, coop)
- `src/views/post/` — blog post views (detail, sidebar, pagination, comments, ratings, contact form)
- `src/views/product/` — product views (product detail)
- `src/views/schedule/` — voyage schedule (ferry-specific)
- `src/views/list/`, `src/views/list-with-table/` — listing views
- `src/views/blog/` — blog views

**UI components (REUSABLE):**
- `src/components/ui/` — shadcn/ui components (dialog, accordion, tabs, card, slider, popover, sheet, scroll-area, label, tooltip, calendar, command, avatar, drawer, navigation-menu, sonner, pagination)
- `src/components/` — app-level components (auth initializer, theme provider, confirm dialog, search, footer, mobile nav)

**Shared utilities (REUSABLE):**
- `src/hooks/` — use-boolean, use-keyboard, use-recaptcha, use-debounce, use-copy-to-clipboard, use-check-screen-type, use-highlight-active-heading, use-media-query, useWindowDimensions
- `src/lib/utils/` — cn, date-utils, format-utils, string-utils, browser-utils, seo-utils, ui-utils, booking-utils
- `src/lib/` — cms-html-sanitizer, clickBaitUtil, countries, provinces

### 2. New GraphQL Package (Ready)

The `graphql/` directory at project root is **complete and production-ready:**

| Module | Contents |
|--------|----------|
| `client.ts` | Apollo Client + `fetchGraphQL()` helper, ISR 60s, SSR mode |
| `types.ts` | 30+ TypeScript interfaces (TourCard, TourDetail, PostCard, PostDetail, PageData, Menu, Destination, ShortTourInformation, SeoData, etc.) |
| `fragments/` | 7 fragment files (tour, post, page, taxonomy, media, menu, seo) |
| `queries/tours/` | getAllTours, getTourBySlug, getToursByTaxonomy (5 filter variants) |
| `queries/blog/` | getAllBlogPosts, getPostBySlug, getNews (3 news variants) |
| `queries/taxonomies/` | getAllDestinations (hierarchical + flat), getTourTypes, getTravelStyles, getProductTags, getTourFilterOptions |
| `queries/site/` | getSiteSettings, getLayoutData, getMenus, getPages |

**Known limitations documented in `graphql/README.md`:**
1. ACF Options Page (Tour Constant / whyChooseUs) — NOT queryable yet, needs PHP fix
2. Rank Math SEO — plugin `wp-graphql-rank-math` not installed on WP backend
3. `BookingProduct` duplicate type warning (harmless, needs cleanup in functions.php)

### 3. What Can Be Reused vs What Must Change

#### REUSE (keep as-is)
- All `src/components/ui/` shadcn components
- All `src/hooks/`
- `src/lib/utils/cn.ts`, `date-utils.ts`, `format-utils.ts`, `string-utils.ts`, `browser-utils.ts`
- `src/lib/cms-html-sanitizer.ts`
- `src/services/i18n/` (i18next setup, locale files — adapt content)
- `src/services/react-query/` (QueryProvider)
- `src/components/theme-provider.tsx`
- `tailwind.config.ts`, `postcss.config.js`, `tsconfig.json`
- `src/middleware.ts` (i18n middleware — keep, adapt)
- Sentry integration (`sentry.*.config.ts`, `instrumentation.ts`)
- Husky, ESLint, Prettier configs

#### REMOVE (ferry-specific, no equivalent in tour site)
- `src/services/apis/voyages/`, `tickets/`, `bookings/`, `passengers/`, `payments/`, `boat-layouts/`, `routes/`, `operators/`, `orders/`, `invoices/`, `voucher/`, `cancel-ticket-request/`, `ticket-price-additions/`, `tax-record/`, `excel/`, `permate/`
- `src/app/(language)/schedules/`, `ticket-detail/`, `booking/`, `payment-gateway/`, `transactions/`
- `src/views/schedule/`
- `src/app/api/voyageCounts/`, `baocao/`
- `src/services/apis/companies/`, `customers/`, `organizations/` (ferry multi-tenant)
- `src/services/infrastructure/meilisearch/` (no search requirement stated)
- `src/services/infrastructure/permate/`

#### REPLACE (existing WP layer → new GraphQL package)
- `src/services/infrastructure/wordpress/queries/*` → `graphql/queries/*`
- `src/services/infrastructure/wordpress/types/*` → `graphql/types.ts`
- `src/services/infrastructure/wordpress/enums/*` → adapt or inline
- `src/app/sitemap.ts` → rewrite using new GraphQL queries
- `src/app/layout.tsx` → simplify (remove ferry providers: auth, org, leave-page, social-auth)
- `src/app/(language)/page.tsx` → homepage with tour listing
- `src/app/(language)/[...slug]/page.tsx` → adapt for new URL structure

#### ADAPT (keep structure, change data source)
- `src/views/post/` → reuse for blog, change data fetching to new GraphQL
- `src/views/product/` → adapt for tour detail pages
- `src/views/homepage/` → adapt sections for tour site
- `src/components/footer/`, search, app-bar → adapt for mekongsmile menus/branding

### 4. Architecture: Apollo Client vs Native Fetch

**Current setup in `graphql/client.ts` provides BOTH:**
- `getApolloClient()` — full Apollo Client with InMemoryCache, type policies for BookingProduct/Post/Page/Destination
- `fetchGraphQL<T>()` — lightweight fetch wrapper for RSC / getStaticProps

**Recommendation:** Use `fetchGraphQL()` for all Server Components (simpler, no client cache needed for SSG/ISR). Reserve Apollo Client only if client-side caching/mutations needed later (e.g., booking forms).

**Industry consensus (2025):**
- For RSC-heavy apps: native fetch or lightweight wrappers preferred over Apollo
- Apollo adds ~45KB to client bundle; unnecessary if most data fetching is server-side
- `fetchGraphQL()` with `next: { revalidate: 60 }` integrates natively with Next.js caching

### 5. SEO & Metadata Strategy

**Current:** Uses WordPress SEO data via existing WP query layer, `seo-utils.ts` in lib.

**New approach:**
- Rank Math SEO plugin needs installation on WP backend first (documented in graphql/README.md)
- Once installed: `seo` field available on all Post/Product/Page types
- Use `generateMetadata()` in each route to fetch SEO data from GraphQL
- JSON-LD structured data from `seo.jsonLd.raw` — inject via `<script type="application/ld+json">`
- OpenGraph images from `seo.openGraph.image.url`

**Sitemap strategy:**
- Current `src/app/sitemap.ts` uses `generateSitemaps()` with ID-based splitting (posts, pages, products, categories, terms)
- Pattern is solid — rewrite data fetching to use `GET_ALL_TOUR_SLUGS`, `GET_ALL_POST_SLUGS`, `GET_ALL_PAGE_SLUGS`, `GET_ALL_DESTINATIONS`
- URL pattern changes: `/product/{slug}/` → `/tour/{slug}/`

### 6. URL Routing Plan

| Route | Source | Data Query |
|-------|--------|-----------|
| `/` | Homepage | GET_LAYOUT_DATA + featured tours + latest posts |
| `/tours/` | Tour listing | GET_ALL_TOURS (paginated) + GET_TOUR_FILTER_OPTIONS |
| `/tour/[slug]/` | Tour detail | GET_TOUR_BY_SLUG |
| `/destination/[slug]/` | Destination archive | GET_DESTINATION_BY_SLUG (tours + posts) |
| `/blog/` | Blog listing | GET_ALL_BLOG_POSTS |
| `/blog/[slug]/` | Blog post detail | GET_POST_BY_SLUG |
| `/news/` | News listing | GET_ALL_NEWS |
| `/news/[slug]/` | News detail | GET_NEWS_BY_SLUG |
| `/about-us/` | Static page | GET_PAGE_BY_SLUG |
| `/contact-us/` | Static page | GET_PAGE_BY_SLUG |
| `/[...slug]/` | Catch-all WP pages | GET_PAGE_BY_SLUG |

### 7. Configuration Changes Required

**`next.config.js`:**
- Replace all `remotePatterns` hostnames with `mekongsmile.com`
- Update Sentry project from `frontend-vetaucaotoc` to mekongsmile equivalent
- Update redirects (remove ferry-specific `/product` → `/diem-den/con-dao/`)
- Keep: standalone output, trailingSlash, AVIF/WebP, cache headers, bundle analyzer

**`.env.local`:**
- Add: `NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL=https://mekongsmile.com/graphql`
- Add: `NEXT_PUBLIC_SITE_URL=https://mekongsmile.com`
- Keep: `NEXT_PUBLIC_BASE_URL`, Sentry vars
- Remove: `API_SERVER_URL`, `API_SERVER_PREFIX` (no REST API backend)
- Adapt: i18n config (English primary, possibly remove Vietnamese or keep both)

**`package.json`:**
- Add: `@apollo/client`, `graphql`
- Remove (after migration): ferry-specific deps if any are exclusive (most are general-purpose)
- Update name from `@vetaucaotoc/frontend` to `@mekongsmile/frontend`

---

## Comparative Analysis: Migration Approaches

| Approach | Pros | Cons | Recommendation |
|----------|------|------|----------------|
| **A) Incremental replacement** (replace service layer file-by-file) | Low risk, can test progressively | Slower, dual systems coexist | **Recommended** |
| **B) Clean rewrite** (new app from scratch, copy reusable parts) | Clean architecture | Loses tested infrastructure, slower | Not recommended |
| **C) Branch-and-gut** (remove ferry code, add tour code) | Fast, clean result | Breaking changes all at once | Good for final cleanup |

**Recommended:** Start with **A** (incremental) for the data/service layer, then **C** (gut) to remove dead ferry code once tour features work.

---

## Implementation Recommendations

### Phase Ordering

1. **Config & deps** — env vars, next.config.js, package.json, install @apollo/client + graphql
2. **GraphQL integration** — wire `graphql/` package into app, verify queries work against live endpoint
3. **Layout & navigation** — new root layout, menus from WPGraphQL, simplified providers
4. **Core pages** — homepage, tour listing, tour detail, destination archive
5. **Blog pages** — blog listing, post detail, news pages
6. **Static pages** — about-us, contact-us, FAQ, catch-all
7. **SEO & sitemap** — generateMetadata on all routes, rewrite sitemap.ts
8. **Cleanup** — remove all ferry-specific code, services, views, routes
9. **Polish** — design tokens, branding, responsive fixes, performance audit

### Common Pitfalls to Avoid

1. **Don't use Apollo Client in RSC** — use `fetchGraphQL()` instead; Apollo's cache is client-side only
2. **Always use `... on BookingProduct {}` inline fragment** — all 34 tours are BookingProduct type, NOT SimpleProduct
3. **`allDestination` (singular)** — NOT `destinations` — WPGraphQL auto-naming quirk
4. **Posts don't support `taxQuery`** — use reverse query `destination(id:) { posts {} }` for destination-filtered posts
5. **SEO fields won't work yet** — `wp-graphql-rank-math` plugin must be installed on WP backend first
6. **ACF Options page not queryable** — needs PHP fix in functions.php before `tourConstantOptions` works
7. **Image domains** — must add `mekongsmile.com` to `next.config.js` remotePatterns before images load

### Code Example: Tour Listing Page (RSC)

```tsx
// src/app/(language)/tours/page.tsx
import { fetchGraphQL } from "@/graphql/client";
import { GET_ALL_TOURS } from "@/graphql/queries";
import type { GetAllToursResponse } from "@/graphql/types";

export default async function ToursPage() {
  const data = await fetchGraphQL<GetAllToursResponse>(
    GET_ALL_TOURS,
    { first: 12 }
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {data.products.nodes.map((tour) => (
        <TourCard key={tour.databaseId} tour={tour} />
      ))}
    </div>
  );
}
```

---

## Resources & References

### Official Documentation
- [WPGraphQL](https://www.wpgraphql.com/)
- [WPGraphQL for ACF](https://acf.wpgraphql.com/)
- [WooGraphQL](https://woographql.com/)
- [Next.js App Router](https://nextjs.org/docs/app)

### Guides
- [Headless WordPress with Next.js & WPGraphQL (2025)](https://www.wpfixit.com/headless-wordpress-wpgraphql-nextjs-guide-2025/)
- [Sitemaps in Headless WordPress with WPGraphQL and Next.js App Router](https://wpengine.com/builders/sitemaps-in-headless-wordpress-with-wpgraphql-and-next-js-app-router/)
- [Rank Math SEO with Next.js and WordPress](https://www.eugeneskom.com/blog/optimizing-next-js-portfolio-with-wordpress-implementing-rank-math-seo-and-acf)
- [Apollo Client Integration for Next.js](https://www.npmjs.com/package/@apollo/client-integration-nextjs)
- [gregrickaby/nextjs-wordpress (reference repo)](https://github.com/gregrickaby/nextjs-wordpress)
- [Vercel: WordPress with Vercel guide](https://vercel.com/guides/wordpress-with-vercel)

---

## Unresolved Questions

1. **Rank Math SEO plugin** — Is it installed on the WP backend yet? Blocks SEO metadata in GraphQL until resolved.
2. **ACF Options Page fix** — Has the PHP snippet for `tourConstant` root query been added to functions.php?
3. **i18n scope** — Is mekongsmile English-only or bilingual (en/vi)? Current codebase has full vi/en i18n.
4. **Auth** — Does mekongsmile need user authentication? Current codebase has JWT + Google/Facebook OAuth for ferry bookings.
5. **Booking/payment flow** — The prompt mentions "tour booking" but no payment gateway specifics. Is this view-only (lead gen) or transactional?
6. **Blog comments/ratings** — Current codebase has WP comment/rating system. Keep for mekongsmile?
7. **Meilisearch** — Current codebase has full-text search integration. Needed for tour search?
8. **PM2 ecosystem file** — Prompt mentions PM2 deployment but no ecosystem.config.js found in repo. Needs creation?
9. **Design/branding** — Any design mockups or brand guidelines for mekongsmile.com?
