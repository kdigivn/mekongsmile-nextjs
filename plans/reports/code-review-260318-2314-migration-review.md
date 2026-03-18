# Code Review: mekongsmile.com Migration (Ferry -> Tour Booking)

**Date:** 2026-03-18
**Reviewer:** code-reviewer agent
**Branch:** develop (vs initial commit 1fe604b)

---

## Scope

- **Files reviewed:** ~30 (services, layout, app-bar, footer, config, tour pages, blog pages, GraphQL client/types, utilities)
- **Focus:** Type safety, error handling, security (XSS), performance, dead code

---

## Overall Assessment

The migration is structurally sound. The WordPress service layer is clean and well-typed. The GraphQL client properly handles errors. The main concerns are: (1) several `dangerouslySetInnerHTML` usages without sanitization, (2) missing error handling in page-level data fetching, and (3) a `@ts-nocheck` on app-bar that disables all type checking on a 627-line client component.

---

## Critical Issues

### C1. XSS via unsanitized `dangerouslySetInnerHTML` in post/page views

**Files:**
- `src/views/post/post-detail-new/post-detail-new-view.tsx:118` -- renders `content` from `createTableOfContents()` (cheerio output) without sanitization
- `src/views/page/wp-page-content-view.tsx:83` -- same pattern
- `src/views/blog/blog-posts-grid-view.tsx:82` -- `removeSquareBracketsInExcerpt(post.excerpt)` is NOT sanitization; only removes `[...]` patterns
- `src/app/(language)/page-content.tsx:79` -- raw `post.excerpt` with zero sanitization
- `src/views/destination/destination-view.tsx:110-112` -- regex strip `/<[^>]*>/g` is easily bypassed

**Impact:** If a WordPress author/editor account is compromised, attacker can inject scripts via post content, excerpts, or page content. The `excerpt` fields are especially risky since excerpts are rendered on listing pages viewed by all visitors.

**Fix:** Wrap all CMS HTML with `sanitizeCmsHtml()` (already exists at `src/lib/cms-html-sanitizer.ts`). The tour detail view does this correctly -- apply the same pattern everywhere.

```tsx
// Instead of:
dangerouslySetInnerHTML={{ __html: content }}
// Use:
dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(content) }}
```

### C2. `seo-utils.ts` regex injection risk

**File:** `src/lib/utils/seo-utils.ts:15-23`

`wpURLtoNextURL` builds a `RegExp` from `process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL` without escaping. If this URL contains regex metacharacters (e.g., `?`, `+`), behavior is undefined.

**Impact:** Low probability in practice (env vars are controlled), but violates defense-in-depth.

**Fix:** Escape the string before passing to `RegExp`:
```ts
const escaped = cmsSite.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
```

---

## High Priority

### H1. No error handling in tours listing page

**File:** `src/app/(language)/tours/page.tsx:33-41`

`Promise.all([getTourFilterOptions(), getToursData()])` has no `.catch()` or `try/catch`. If the WordPress GraphQL endpoint is down, the entire page crashes with an unhandled error. Compare with `layout.tsx:80` which correctly uses `.catch(() => null)`.

**Fix:** Wrap in try/catch, return empty defaults on failure, or use `error.tsx` boundary.

### H2. `@ts-nocheck` on 627-line app-bar component

**File:** `src/components/app-bar.tsx:1`

The `@ts-nocheck` disables ALL type checking. The file also has `@typescript-eslint/no-explicit-any` disabled. This means any type errors introduced during migration are invisible.

**Impact:** Runtime crashes from type mismatches won't be caught during development.

**Fix:** Remove `@ts-nocheck`, fix any resulting type errors. The TODO says "rewrite for new WPGraphQL menu system" -- the component already uses the new `Menu`/`MenuItem` types, so the directive appears stale.

### H3. `news/[slug]/page.tsx` uses `getAllNews(100)` for `generateStaticParams`

**File:** `src/app/(language)/news/[slug]/page.tsx:12`

Hardcoded limit of 100 means only the first 100 news posts get static paths. If more exist, they'll be ISR'd on demand (fine), but blog equivalent uses `getAllPostSlugs()` which fetches ALL slugs. Inconsistent behavior.

**Fix:** Create `getAllNewsSlugs()` or use cursor-based pagination to fetch all.

### H4. `ApolloClient` missing generic type parameter

**File:** `graphql/client.ts:30`

```ts
let apolloClientInstance: ApolloClient | null = null;
```

Apollo Client v4 requires `ApolloClient<NormalizedCacheObject>`. Without the generic, TypeScript infers `ApolloClient<any>`, losing cache type safety.

**Fix:**
```ts
import { NormalizedCacheObject } from "@apollo/client";
let apolloClientInstance: ApolloClient<NormalizedCacheObject> | null = null;
```

---

## Medium Priority

### M1. Massive dead code in app-bar.tsx

**File:** `src/components/app-bar.tsx:97-181, 350-353, 400-447, 540-545, 556-562`

~150 lines of commented-out code from the old ferry menu system. Reduces readability, makes the file 627 lines.

**Fix:** Remove commented-out code. Git history preserves it.

### M2. `blog/page.tsx` hardcoded Vietnamese breadcrumbs

**File:** `src/app/(language)/blog/page.tsx:15-17`

```ts
const breadcrumbLinks = [
  { name: "Trang chu", href: "/" },
  { name: "Blog", href: "/blog/" },
];
```

Same in `news/page.tsx:14-17`. The site supports en/vi/zh but breadcrumbs are always Vietnamese. This is a localization gap.

### M3. `tour/[slug]/page.tsx` double-fetch in `generateMetadata` + `default export`

**File:** `src/app/(language)/tour/[slug]/page.tsx:27,41`

`getTourBySlug(params.slug)` is called twice -- once in `generateMetadata` and once in the page component. Next.js does NOT deduplicate `fetch` calls when using the standalone `fetch` helper (not the Apollo cache). Same pattern in `blog/[slug]/page.tsx` and `news/[slug]/page.tsx`.

**Impact:** Every tour/blog/news page makes 2x GraphQL requests during build + ISR.

**Fix:** Next.js 14 fetch deduplication should handle this IF the same URL + body are used. Verify by checking if `fetchGraphQL` produces identical requests. Alternatively, use React `cache()` wrapper:
```ts
import { cache } from "react";
const getCachedTour = cache((slug: string) => getTourBySlug(slug));
```

### M4. `ecosystem.config.js` only runs 1 instance

**File:** `ecosystem.config.js:12`

`instances: 1` with `exec_mode: "fork"` means no horizontal scaling. For production with PM2, consider `instances: "max"` or at least `2`.

### M5. `graphql/client.ts` -- fetchGraphQL empty query fallback

**File:** `graphql/client.ts:104`

```ts
const queryString = typeof query === "string"
  ? query
  : query.loc?.source?.body || "";
```

If `query.loc?.source?.body` is undefined (e.g., corrupted DocumentNode), an empty string is sent to the API. This will return a cryptic error. Should throw explicitly.

---

## Low Priority

### L1. `destination-view.tsx:111` uses regex HTML strip instead of sanitizer

The regex `/<[^>]*>/g` does not handle edge cases like `<img onerror=...>` inside attributes. Already covered in C1 but worth noting as a distinct anti-pattern.

### L2. `next.config.js` -- Sentry `authToken` in config file

**File:** `next.config.js:137`

`authToken: process.env.SENTRY_AUTH_TOKEN` is fine (reads from env), but confirm this is not committed to `.env` files. The `example.env` correctly shows `SENTRY_AUTH_TOKEN=` (empty).

### L3. Unused imports in app-bar

Several imports (`NavigationMenuContent`, `NavigationMenuTrigger`, etc.) may be used only in commented-out code. Hard to verify with `@ts-nocheck` active.

### L4. `@types/sanitize-html` listed in `dependencies` instead of `devDependencies`

**File:** `package.json:54`

Type packages belong in devDependencies. Minor -- affects production node_modules size slightly.

---

## Edge Cases Found by Scout

1. **Null layout data cascade:** If `getLayoutData()` fails, `primaryMenu` and `secondaryMenu` are both null, so header and footer are completely hidden. The page renders but looks broken. Consider a static fallback menu.

2. **`tours/page.tsx` filter priority:** Only one filter is applied (destination > type > style). If a user navigates with `?destination=x&style=y`, the `style` param is silently ignored. No error or indication.

3. **`createTableOfContents` + cheerio:** The function loads raw WordPress HTML into cheerio and outputs it. This is NOT sanitization -- cheerio parses and re-serializes, but does not strip scripts or event handlers.

4. **`ApolloClient` singleton in serverless:** The module-level `apolloClientInstance` persists across requests in long-lived server processes (PM2). InMemoryCache grows unbounded. In serverless (Vercel), this is fine since each invocation is fresh.

5. **`params` not awaited in Next.js 15-style pages:** `tour/[slug]/page.tsx` uses `params.slug` directly. Currently on Next.js 14.2 where this is fine, but the `tours/page.tsx:31` already uses `await searchParams` (Next 15 pattern). Mixed API usage will break on upgrade.

---

## Positive Observations

- `sanitizeCmsHtml` exists and is correctly applied in tour detail views
- `safeJsonLd` properly parse-and-reserialize to prevent JSON-LD injection
- GraphQL types are comprehensive and manually maintained with good documentation
- Service layer is clean: no `any`, consistent function signatures, proper return types
- `fetchGraphQL` has proper HTTP error checking and GraphQL error logging
- ISR config is sensible (60s for tours, 300s for detail, 3600s for blog)
- `next.config.js` has good caching headers and image optimization config
- Footer component is well-structured, server-rendered, properly typed

---

## Recommended Actions (Priority Order)

1. **[Critical]** Apply `sanitizeCmsHtml()` to ALL `dangerouslySetInnerHTML` usages (5 files)
2. **[High]** Remove `@ts-nocheck` from `app-bar.tsx`, fix type errors
3. **[High]** Add error handling to `tours/page.tsx`, `blog/page.tsx`, `news/page.tsx`
4. **[High]** Fix `ApolloClient` generic type
5. **[Medium]** Wrap `getTourBySlug`/`getPostBySlug`/`getNewsBySlug` with React `cache()` to deduplicate
6. **[Medium]** Remove ~150 lines of dead commented code from app-bar
7. **[Medium]** Internationalize breadcrumb labels in blog/news pages
8. **[Low]** Move `@types/sanitize-html` to devDependencies
9. **[Low]** Escape regex in `wpURLtoNextURL`

---

## Metrics

| Metric | Value |
|--------|-------|
| Type Coverage | ~90% (undermined by `@ts-nocheck` on app-bar) |
| Test Coverage | Not measured (no test files found for new code) |
| Linting Issues | At least 3 (eslint-disable directives) |
| `dangerouslySetInnerHTML` without sanitization | 5 instances |
| Dead code (commented lines) | ~150 lines in app-bar alone |

---

## Unresolved Questions

1. Is the `ApolloClient` instance (line 30, `graphql/client.ts`) actually used anywhere, or is `fetchGraphQL` the sole client? If unused, the entire Apollo setup + `@apollo/client` dependency could be removed, reducing bundle size.
2. Is there an `error.tsx` boundary at the `(language)` layout level to catch the unhandled fetch errors in tour/blog/news pages?
3. The `params` API style is mixed between Next 14 (direct access) and Next 15 (Promise-based `await searchParams`). Is a Next 15 upgrade planned?
