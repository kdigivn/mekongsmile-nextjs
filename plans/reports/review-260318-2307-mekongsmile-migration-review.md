# Code Review: mekongsmile.com Migration

**Date:** 2026-03-18
**Scope:** GraphQL layer, WordPress service layer, page routes, view components, config, SEO
**LOC reviewed:** ~2,500 lines across 40+ files
**Focus:** New migration code (headless WordPress + WPGraphQL)

---

## Overall Assessment

Solid migration. The GraphQL layer is well-structured with proper type safety, fragment composition, and separation of concerns. Service layer is clean and thin. Page routes follow Next.js conventions correctly. No `as any` casts found. CMS HTML is sanitized before rendering. A few issues need attention before production.

---

## CRITICAL Issues (Must Fix)

### C1. XSS via unsanitized `jsonLd.raw` injection

**Files:** `src/app/(language)/blog/[slug]/page.tsx:43`, `src/app/(language)/news/[slug]/page.tsx:43`, `src/app/(language)/tour/[slug]/page.tsx:46`

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: post.seo.jsonLd.raw }}
/>
```

The `jsonLd.raw` field comes directly from Rank Math via GraphQL with **zero sanitization**. If a WordPress admin account is compromised or a plugin vulnerability allows injection, arbitrary JS executes in the user's browser. Unlike CMS HTML content (which goes through `sanitizeCmsHtml`), this raw JSON-LD is passed straight through.

**Fix:** Parse the JSON, validate it's valid JSON-LD, then re-serialize:

```tsx
{post.seo?.jsonLd?.raw && (() => {
  try {
    const parsed = JSON.parse(post.seo.jsonLd.raw);
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(parsed) }}
      />
    );
  } catch { return null; }
})()}
```

### C2. Unsanitized HTML in destination view excerpts

**File:** `src/views/destination/destination-view.tsx:110`

```tsx
dangerouslySetInnerHTML={{ __html: post.excerpt }}
```

Post excerpts from WordPress are NOT passed through `sanitizeCmsHtml()`. This is inconsistent with `tour-detail-view.tsx` which sanitizes all CMS HTML. Excerpts can contain arbitrary HTML from WordPress.

**Fix:** `dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(post.excerpt) }}`

### C3. Unsanitized content in `wp-page-content-view.tsx` and `post-detail-new-view.tsx`

**Files:** `src/views/page/wp-page-content-view.tsx:85`, `src/views/post/post-detail-new/post-detail-new-view.tsx:119`

Both render `content` from `createTableOfContents()` directly without sanitization. If `createTableOfContents` does not sanitize internally, this is the same XSS vector.

**Fix:** Verify `createTableOfContents` sanitizes output. If not, wrap with `sanitizeCmsHtml()`.

### C4. Missing `WORDPRESS_GRAPHQL_ENDPOINT` env var

**File:** `src/lib/utils/seo-utils.ts:12,32`

`wpURLtoNextURL()` and `getUriFromWpURL()` both read `process.env.WORDPRESS_GRAPHQL_ENDPOINT`, but this variable is **not defined in `example.env`**. It uses `NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL` in `graphql/client.ts` instead. When `WORDPRESS_GRAPHQL_ENDPOINT` is undefined, `cmsSite` is undefined, and the regex replacement creates `new RegExp("", "g")` which matches **every position** in the string, corrupting URLs.

**Fix:** Either:
- Add `WORDPRESS_GRAPHQL_ENDPOINT` to `example.env`, or
- Update `seo-utils.ts` to use `NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL` as fallback

---

## HIGH Priority (Should Fix)

### H1. Apollo Client singleton leak in serverless

**File:** `graphql/client.ts:30-69`

`getApolloClient()` stores a singleton in module-level `apolloClientInstance`. In serverless (Vercel) or standalone mode, this persists across requests within a single container lifecycle. The `InMemoryCache` grows unbounded, eventually causing memory pressure.

However, `getApolloClient()` is not actually imported anywhere in `src/` (confirmed by grep) — only `fetchGraphQL` is used. The Apollo Client code is dead code.

**Fix:** Remove `getApolloClient()` and Apollo imports entirely, or add a comment that it's reserved for future ApolloProvider use. This also removes the `@apollo/client` bundle size from the client.

### H2. `first: 50` on tours page loads too many items

**File:** `src/app/(language)/tours/page.tsx:36-41`

All filter branches request `first: 50`. With 34 tours total currently this is fine, but as catalog grows this becomes a performance concern. The `loadMore` button in `tour-listing-view.tsx:88` fetches via `/api/tours?first=12`, creating inconsistency.

**Fix:** Use `first: 12` consistently and rely on pagination.

### H3. `/api/tours` endpoint has no rate limiting or input validation

**File:** `src/app/api/tours/route.ts`

```tsx
const first = Number(searchParams.get("first") ?? 12);
```

No upper bound on `first`. A malicious client can request `?first=10000` to overload the WordPress GraphQL endpoint.

**Fix:** Clamp the value: `const first = Math.min(Math.max(Number(searchParams.get("first") ?? 12), 1), 100);`

### H4. `unoptimized` on all Next.js Image components

Every image across all views uses `unoptimized`, bypassing Next.js image optimization entirely. This means:
- No automatic WebP/AVIF conversion
- No responsive srcset generation
- No lazy loading optimization
- Wasted bandwidth (full-size images served)

Despite `next.config.js` having AVIF/WebP format config and `remotePatterns` for `mekongsmile.com`, none of it takes effect.

**Fix:** Remove `unoptimized` from images that use `mekongsmile.com` remote URLs. Keep `unoptimized` only for external URLs not covered by `remotePatterns`.

### H5. Duplicate GraphQL call in about-us and contact-us pages

**Files:** `src/app/(language)/about-us/page.tsx`, `src/app/(language)/contact-us/page.tsx`

Both `generateMetadata()` and the page component call `getPageBySlug()` with identical args. Next.js deduplicates `fetch()` calls within a single render, and since `fetchGraphQL` uses native `fetch()`, this should be deduplicated. However, if `revalidate` timing causes a cache miss between the two calls, the page could render with stale metadata but fresh content (or vice versa).

**Severity:** Low risk given `revalidate: 3600`, but worth noting for correctness.

### H6. `style` filter in sidebar is multi-select but server query is single

**File:** `src/views/tour/tour-filter-sidebar.tsx` vs `src/app/(language)/tours/page.tsx`

The sidebar supports multi-select travel styles (comma-separated in URL). But the tours page only passes a single `style` to `getToursByTravelStyle([style])`. Multi-select styles in the URL are ignored server-side.

**Fix:** Parse comma-separated styles and use the combined filter query when multiple filters are active.

---

## MEDIUM Priority (Nice to Have)

### M1. Hardcoded Vietnamese breadcrumb labels

**Files:** Multiple pages

`about-us/page.tsx` uses `breadcrumbLabel="Ve chung toi"`, `contact-us/page.tsx` uses `"Lien he"`, blog pages use `"Trang chu"`. These should use i18n translations, especially since the project supports English and Chinese locales.

### M2. Blog category links may 404

**File:** `src/app/(language)/blog/page.tsx:40`

```tsx
href={cat.uri ?? `/category/${cat.slug}/`}
```

There's no `/category/[slug]/` route defined. These links will 404 unless caught by the catch-all route, which only handles WP pages not categories.

### M3. Tag links will 404

**File:** `src/views/post/post-detail-new/post-detail-new-view.tsx:69`

```tsx
href={`/tag/${tag.slug}/`}
```

No `/tag/[slug]/` route exists. Dead links.

### M4. Sitemap missing news posts

**File:** `src/app/sitemap.ts`

Only blog posts are included in the `posts` sitemap. News posts (`/news/[slug]/`) are not covered by any sitemap section.

### M5. Inconsistent env var for base URL

Multiple files use different env vars:
- `sitemap.ts`: `NEXT_PUBLIC_SITE_URL || NEXT_PUBLIC_BASE_URL`
- `robots.ts`: `NEXT_PUBLIC_BASE_URL`
- `seo-utils.ts`: `NEXT_PUBLIC_BASE_URL`

Should standardize on one variable.

### M6. `ApolloClient` generic type argument missing

**File:** `graphql/client.ts:30`

```tsx
let apolloClientInstance: ApolloClient | null = null;
```

Apollo Client v4 requires `ApolloClient<NormalizedCacheObject>`. This may cause TypeScript errors depending on Apollo version. (Dead code, so low impact.)

### M7. No error boundary for GraphQL failures in layout

**File:** `src/app/layout.tsx:86`

```tsx
const layoutData = await getLayoutData().catch(() => null);
```

When WordPress is down, the site renders with no navigation and no footer (due to null checks on lines 88-96). Users see a bare page with no way to navigate. Consider a static fallback header/footer.

---

## LOW Priority (Suggestions)

### L1. `tour-filter-bar.tsx` appears unused

`TourFilterBar` is defined but never imported by `tour-listing-view.tsx` (which uses `TourFilterSidebar` instead). Dead code.

### L2. Search is client-side only

`TourListingView` does local text filtering on pre-fetched tours. If the server returns 50 tours but there are 200 total, search misses items not on the current page. Consider server-side search or note this limitation.

### L3. Missing loading/error states in `loadMore`

`tour-listing-view.tsx:87-100` — no error feedback to the user when load-more fails. `catch` only logs to console.

### L4. `useDebounce` applied redundantly

`tour-listing-view.tsx:70-81` — `handleSearch` calls both `setLocalSearch(val)` immediately AND `debouncedSetSearch(val)`. The debounced call updates the same state that was already set immediately, making the debounce ineffective.

### L5. `ecosystem.config.js` — single instance

Running `instances: 1` with `exec_mode: "fork"` doesn't leverage multi-core. Consider `instances: "max"` with `exec_mode: "cluster"` for production, or use a process per CPU.

---

## Positive Observations

1. **Zero `as any` casts** across all new code. Strong type discipline.
2. **Well-structured GraphQL fragments** — composable, documented, matching schema.
3. **Proper sanitization** via `sanitize-html` with restrictive allowlist for CMS content.
4. **ISR strategy** — appropriate revalidation intervals (60s tours, 300s destinations, 3600s static pages).
5. **Sitemap generation** with multi-segment approach, sitemap index, and URL rewrites.
6. **Clean service layer** — thin wrappers over `fetchGraphQL`, no business logic leaking into services.
7. **Security** — robots.txt blocks `/api/` and `/user/`, source maps deleted after Sentry upload.
8. **Performance config** — AVIF-first image format, 30-day cache TTL, strict CSS chunking, package import optimization.
9. **Good error handling** in GraphQL client — proper HTTP status checks, error array handling.
10. **No secrets in `example.env`** — placeholder values used correctly.

---

## Metrics

| Metric | Value |
|--------|-------|
| Type Coverage | High (strict mode, no `as any`) |
| Test Coverage | Unknown (no test files for new code) |
| Linting Issues | 3 eslint-disable comments (all for useMemo rules) |
| Dead Code | `getApolloClient()`, `TourFilterBar` |
| Security Issues | 3 XSS vectors (C1, C2, C3) |
| SEO Coverage | Sitemap missing news; category/tag links 404 |

---

## Score: 7/10

Strong foundation with good type safety and architecture. Dragged down by unsanitized `jsonLd.raw` XSS (critical), missing env var that corrupts URLs, and all images bypassing optimization. Fix the 4 critical issues and the score jumps to 8.5/10.

---

## Recommended Actions (Priority Order)

1. **Sanitize `jsonLd.raw`** — parse/re-serialize JSON in all 3 page files (C1)
2. **Sanitize destination excerpt HTML** (C2)
3. **Verify `createTableOfContents` sanitizes** or add `sanitizeCmsHtml` wrapper (C3)
4. **Fix `WORDPRESS_GRAPHQL_ENDPOINT` env var** mismatch (C4)
5. **Clamp `/api/tours` `first` parameter** (H3)
6. **Remove `unoptimized` from images** served from `mekongsmile.com` (H4)
7. **Remove dead Apollo Client code** (H1)
8. **Fix multi-select style filter** mismatch (H6)
9. **Add news to sitemap** (M4)
10. **Remove or implement category/tag routes** (M2, M3)
