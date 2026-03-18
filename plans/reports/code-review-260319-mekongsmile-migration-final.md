# Code Review: mekongsmile.com Migration (Final)

**Date:** 2026-03-19
**Reviewer:** code-reviewer
**Scope:** 533 files changed, 1301 insertions, 65083 deletions
**Base:** `1fe604be` (initial commit) -> working tree (uncommitted)

---

## Overall Assessment

The migration from vetaucaotoc.net (ferry booking) to mekongsmile.com (tour booking) is **structurally sound**. The GraphQL service layer is clean and well-organized. Layout, SEO, and i18n foundations are solid. However, there are several issues ranging from critical to medium that need attention before production deployment.

---

## Critical Issues

### C1. Unsanitized `dangerouslySetInnerHTML` in page-content.tsx

**File:** `src/app/(language)/page-content.tsx:79`

```tsx
dangerouslySetInnerHTML={{ __html: post.excerpt }}
```

This renders WordPress post excerpts without sanitization. Every other CMS HTML usage in the codebase correctly uses `sanitizeCmsHtml()`. This is an XSS vector if any post excerpt contains injected script tags.

**Fix:** Change to `{{ __html: sanitizeCmsHtml(post.excerpt) }}` and import `sanitizeCmsHtml`.

---

### C2. Apollo Client v4 Missing Type Parameter

**File:** `graphql/client.ts:30,32`

```ts
let apolloClientInstance: ApolloClient | null = null;
export function getApolloClient(): ApolloClient {
```

Apollo Client v4 (`^4.1.6` in package.json) requires `ApolloClient<NormalizedCacheObject>`. Without it, TypeScript will error. The file also has `@ts-nocheck` disabled but the types are incomplete.

**Fix:** Import `NormalizedCacheObject` from `@apollo/client` and use `ApolloClient<NormalizedCacheObject>` throughout. Or since `getApolloClient()` is not actually used anywhere (all data fetching goes through `fetchGraphQL`), consider removing the Apollo singleton entirely to reduce bundle size.

---

### C3. `@ts-nocheck` on app-bar.tsx (567 lines)

**File:** `src/components/app-bar.tsx:1`

```ts
// @ts-nocheck — TODO: rewrite app-bar for new WPGraphQL menu system
```

This suppresses ALL TypeScript errors in the most critical UI component (renders on every page). Combined with `@typescript-eslint/no-explicit-any`, this file has zero type safety. Any runtime shape mismatch in `MenuItem` types will crash silently or render broken UI.

**Impact:** High risk for runtime errors on every page.
**Recommendation:** Remove `@ts-nocheck` and fix the type errors. Most of the file is already correctly typed; the commented-out code blocks are causing the issues.

---

## High Priority

### H1. Tour Filter Only Applies One Filter at a Time

**File:** `src/app/(language)/tours/page.tsx:35-41`

```ts
destination
  ? getToursByDestination([destination], 50, after)
  : type
    ? getToursByTourType([type], 50, after)
    : style
      ? getToursByTravelStyle([style], 50, after)
      : getAllTours(50, after)
```

If a user selects both a destination AND a tour type, only the destination filter applies. The `getToursByCombinedFilters` function exists in `tour-service.ts` but is never used. This is a functional bug users will notice.

**Fix:** Use `getToursByCombinedFilters` when multiple filters are active, or chain filters server-side.

---

### H2. "Load More" Ignores Active Filters

**File:** `src/views/tour/tour-listing-view.tsx:85-87`

```ts
const res = await fetch(
  `/api/tours?after=${encodeURIComponent(pageInfo.endCursor)}&first=12`
);
```

The load-more button fetches `/api/tours` without passing any active filter params (destination, type, style). After clicking "Load More", the user gets unfiltered tours appended to their filtered results.

**Fix:** Pass `activeFilters` to the API call, or create a more complete `/api/tours` route that accepts filter params.

---

### H3. `robots.ts` Uses Different Base URL Than `sitemap.ts`

**File:** `src/app/robots.ts:3` vs `src/app/sitemap.ts:10`

- `robots.ts`: `process.env.NEXT_PUBLIC_BASE_URL` (default: `https://mekongsmile.com`)
- `sitemap.ts`: `process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL`

`example.env` shows `NEXT_PUBLIC_BASE_URL=http://localhost:3001` and `NEXT_PUBLIC_SITE_URL=https://mekongsmile.com`. In production, if `NEXT_PUBLIC_SITE_URL` is set but `NEXT_PUBLIC_BASE_URL` still points to localhost, `robots.ts` will output `Sitemap: http://localhost:3001/sitemap.xml`.

**Fix:** Use `NEXT_PUBLIC_SITE_URL` as the primary in `robots.ts`, matching `sitemap.ts`.

---

### H4. `wpURLtoNextURL` Creates Empty-String Regex When Env Vars Missing

**File:** `src/lib/utils/seo-utils.ts:16`

```ts
new RegExp(cmsSite ?? "", "g")
```

If `NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL` is unset, `cmsSite` is `undefined`, and `new RegExp("", "g")` matches every position in the string, causing `str.replace(...)` to prepend `siteUrl` at every character boundary, corrupting the output.

**Fix:** Early return if `cmsSite` is falsy: `if (!cmsSite || !siteUrl) return str;`

---

## Medium Priority

### M1. Massive Commented-Out Code in app-bar.tsx

**File:** `src/components/app-bar.tsx:97-181, 350-353, 400-447, 540-545, 556-562`

Over 100 lines of commented-out code from the old menu system. Harms readability and maintainability. Dead code should live in git history, not in the source file.

---

### M2. Dynamic Tailwind Classes Won't Work

**File:** `src/components/app-bar.tsx:215,228`

```tsx
`ml-${level * 2}`
```

Tailwind CSS purges classes at build time. Dynamic class names like `ml-2`, `ml-4`, `ml-6` must appear as complete strings in the source for the CSS to be generated. This will render without any margin.

**Fix:** Use a lookup map: `const indent = { 0: 'ml-0', 1: 'ml-2', 2: 'ml-4', 3: 'ml-6' }` or use inline `style={{ marginLeft: level * 0.5 + 'rem' }}`.

---

### M3. Apollo Client Singleton Leaks on Server (SSR)

**File:** `graphql/client.ts:30-68`

The module-level `apolloClientInstance` persists across requests in a Node.js server process. In production (`output: "standalone"`), this means:
- The in-memory cache grows unbounded across requests
- User A's cached data could leak to User B

Since `fetchGraphQL` (the actual data fetcher) doesn't use Apollo at all, this singleton is unused baggage. Remove it or ensure it's only used client-side.

---

### M4. `sitemap.ts` Fetches ALL Blog Posts (Hardcoded 200 Limit)

**File:** `src/app/sitemap.ts:39`

```ts
const { nodes: posts } = await getAllBlogPosts(200);
```

Hardcoded limit of 200 posts. If the blog grows beyond 200, older posts won't appear in the sitemap. No pagination/cursor handling.

**Fix:** Implement cursor-based pagination to fetch all posts, or increase the limit with a comment explaining the assumption.

---

### M5. Search Debounce Triggers Navigation on Mount

**File:** `src/views/tour/tour-search-input.tsx:11-19`

```tsx
useEffect(() => {
  const timer = setTimeout(() => {
    // ... router.push on every keystroke after 300ms
  }, 300);
  return () => clearTimeout(timer);
}, [query]);
```

On initial mount, if `query` has a value from URL params, this fires `router.push` unnecessarily (navigating to the same URL). Also, `router` and `searchParams` are missing from the deps array (suppressed by eslint-disable).

---

### M6. Hardcoded Strings in Filter UI (i18n)

**File:** `src/views/tour/tour-filter-bar.tsx:58,63,73`

```tsx
<option value="">All Destinations</option>
<option value="">All Tour Types</option>
<option value="">All Travel Styles</option>
```

And `src/views/tour/tour-listing-view.tsx:157,161,175`:
```tsx
"No tours found"
"Load More Tours"
```

These strings are hardcoded in English despite the project supporting 3 languages (en, vi, zh). They should use `useTranslation()`.

---

### M7. `@types/sanitize-html` Listed in Dependencies Instead of devDependencies

**File:** `package.json:54`

```json
"@types/sanitize-html": "^2.16.1"
```

Type packages should be in `devDependencies`. Minor but affects production image size with `output: "standalone"`.

---

### M8. Ferry Color Reference in tailwind.config.ts

**File:** `tailwind.config.ts:240`

```
// Ferry Seat colors
```

Leftover ferry comment. Check if the associated color values are still used; if not, remove the entire block.

---

## Low Priority

### L1. Hardcoded Hotline Number in app-bar.tsx

**File:** `src/components/app-bar.tsx:465`

```tsx
<LinkBase href="tel:0924299898" className="w-full">
  Hotline: 0924299898
</LinkBase>
```

Should come from `siteSettings` or a config constant, not hardcoded.

---

### L2. `NodeList` Component Defined Inside Footer Render

**File:** `src/components/footer/footer.tsx:19-50`

`NodeList` is redefined on every render of `Footer`. Extract to a standalone component or memoize.

---

### L3. `ecosystem.config.js` Single Instance

**File:** `ecosystem.config.js:12`

```js
instances: 1,
exec_mode: "fork",
```

For production, consider `instances: "max"` with `exec_mode: "cluster"` to use all CPU cores, or at least 2 instances for zero-downtime restarts.

---

## Edge Cases Found by Scout

1. **Filter + Load More mismatch**: Applying filters then loading more appends unfiltered results (H2 above)
2. **Empty regex on missing env var**: `wpURLtoNextURL` corrupts all strings when GraphQL URL is unset (H4 above)
3. **Sitemap post count cap**: Blog sitemap silently drops posts beyond 200 (M4 above)
4. **Destination children in sitemap**: `destinations.flatMap` assumes `d.children?.nodes` always exists; if a destination has no children property, this works safely due to `|| []` fallback -- good.
5. **`getTourBySlug` returns null but `tour.destination?.nodes?.length` in detail view**: If `nodes` is undefined, `.length` throws. Should be `tour.destination?.nodes?.length ?? 0 > 0` or use optional chaining more carefully at `tour-detail-view.tsx:98`.

---

## Positive Observations

1. **Clean service layer**: The `src/services/wordpress/` barrel pattern is excellent. Clean separation of concerns, proper typing, consistent async patterns.
2. **Proper HTML sanitization**: `sanitize-html` with a carefully configured allowlist. Almost all `dangerouslySetInnerHTML` uses are sanitized (one exception noted above).
3. **JSON-LD safety**: `safeJsonLd()` parse-then-reserialize is the correct approach to prevent XSS in structured data.
4. **ISR configuration**: Appropriate revalidation intervals (60s for tours listing, 300s for detail, 3600s for blog).
5. **Sentry integration**: Proper source map upload with deletion, component annotation enabled.
6. **Image optimization**: AVIF-first with 30-day cache TTL and proper remote patterns.
7. **Next.js standalone output**: Correctly configured for containerized deployment.
8. **SEO redirects**: Old `/product/` and `/shop/` URLs properly 301-redirect to new paths.

---

## Recommended Actions (Priority Order)

1. **[Critical]** Sanitize `post.excerpt` in `page-content.tsx:79`
2. **[Critical]** Fix Apollo Client type parameter or remove unused singleton
3. **[Critical]** Remove `@ts-nocheck` from `app-bar.tsx`, fix underlying type issues
4. **[High]** Fix combined filter logic in `tours/page.tsx` to use `getToursByCombinedFilters`
5. **[High]** Pass active filters to load-more API call
6. **[High]** Fix `robots.ts` base URL to match `sitemap.ts`
7. **[High]** Add guard in `wpURLtoNextURL` for empty env vars
8. **[Medium]** Remove all commented-out code from `app-bar.tsx`
9. **[Medium]** Fix dynamic Tailwind classes in mobile menu indentation
10. **[Medium]** Internationalize hardcoded UI strings in filter/listing views

---

## Metrics

- **Type Coverage:** Reduced (app-bar.tsx has `@ts-nocheck`; graphql/client.ts has missing generics)
- **Sanitization Coverage:** 13/14 `dangerouslySetInnerHTML` usages sanitized (92.8%)
- **Dead Code:** ~100 lines commented-out code in app-bar, 1 ferry reference in tailwind config
- **i18n Coverage:** Core pages translated, but tour filter/listing UI strings hardcoded in English

---

## Unresolved Questions

1. Is the Apollo Client singleton (`getApolloClient`) used by any client component not in the review scope? If not, it should be removed entirely to save bundle size.
2. Does the `/api/tours` route need authentication or rate limiting before production?
3. The `blog/[slug]/page.tsx:12` `generateStaticParams` does not have try-catch unlike `tour/[slug]/page.tsx:18`. Is this intentional? A GraphQL failure during build would crash the entire build.
4. Are the cookie-banner scripts (`silktide-consent-manager.min.js`) present in the `/public/static/cookie-banner/` directory?
