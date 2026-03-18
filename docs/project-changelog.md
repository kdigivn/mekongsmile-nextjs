# Project Changelog

> Significant changes, fixes, and improvements. Newest first.

**Last Updated:** 2026-03-10

---

## 2026-03-10 — XSS Security Fix & Edge Case Resolutions

- **Security:** Extended CMS HTML sanitization to post content, page content, and comments — applied `sanitizeCmsHtml()` to `src/views/post/comments-section.tsx` (comment.content), `src/views/post/detail-post-section.tsx` (post.content), and `src/app/(language)/default-page.tsx` (page.content); now covers all 4 CMS content render points
- **Security (initial):** Implemented HTML sanitization for WordPress CMS content via `src/lib/cms-html-sanitizer.ts` — prevents XSS attacks when rendering CMS HTML via `dangerouslySetInnerHTML`; uses `sanitize-html` library with CMS-safe tag allowlist
- **Calendar bugfix:** Removed `calendarKey` anti-pattern from `tablist-voyage-table-section.tsx` — prevented unintended full calendar remount on tab revisit; added `CalendarErrorBoundary` for dynamic import failures
- **Calendar state sync:** Fixed `ferry-big-calendar.tsx` — `navDate` scope bug (const in else block → let) and operator state sync (`handleSetRequestQueryVoyages` instead of direct setter)
- **Product detail:** Wrapped CMS content with `sanitizeCmsHtml()` before `dangerouslySetInnerHTML` in `detail-product-section.tsx`
- **CLS stabilization:** Added `minHeight: 500px` wrapper in `list-with-table-view.tsx` for layout shift prevention
- **Homepage bugfix:** Added missing error return (`return []`) in `getRoutes()` error branch; added ISR `revalidate = 300`
- **reCAPTCHA UX:** Improved error messaging in `forgot-password/page-content.tsx` and `comments-section.tsx` — mentions ad blocker as potential cause
- **INP optimization:** Added `scheduler.yield()` utility in `src/lib/scheduler-yield.ts` (Chrome 115+) with `setTimeout(0)` fallback for main thread yielding
- **Search performance:** Added `useDeferredValue()` in `search.tsx` for INP improvement
- **Chat widget:** Configured with `requestIdleCallback` + 5s delay in `app/layout.tsx` — non-blocking
- **Image responsiveness:** Added `sizes` attribute for responsive images in `sign-in/sign-up.tsx`
- **Utils refactoring:** Monolithic `src/lib/utils.ts` (600+ lines) split into 8 focused modules: `cn.ts`, `format-utils.ts`, `date-utils.ts`, `seo-utils.ts`, `string-utils.ts`, `booking-utils.ts`, `browser-utils.ts`, `ui-utils.ts`

---

## 2026-03 — Mobile & UX Improvements

- **Footer responsive layout**: Menu columns display side-by-side on mobile; flex layout improvements
- **Location filtering**: Disabled locations now filtered from `useGetLocations` API response
- **Bottom nav fix**: Applied flex layout styles to bottom nav button element
- **Accessibility**: Resolved contrast, ARIA, and console error issues for PageSpeed compliance
- **Clickbait detection**: Use `CLICKBAIT_SUFFIX` constant for generated voyage IDs
- CI/CD deploy pipeline attempted (GitHub Actions + PM2 zero-downtime) — reverted pending further work

---

## 2026-02-26 — Performance Regression Fixes Phase 7 (feat/improve-performance)

7-phase performance regression fix cycle addressing critical regressions introduced in phases 1-3.

### Phase 1: BFF Auth Crash Fix (C1, H1, H5)
**Added `data ?? null` guards to `Response.json()` across 14 BFF routes to prevent `TypeError: Body is unusable`.**
- Root cause: passing `undefined` to `Response.json()` crashes the route handler
- Fix: Added `?? null` to all `Response.json(data)` calls in auth routes:
  - `src/app/api/auth/login/email/route.ts`, `checkInOrg/route.ts`, `confirm/route.ts`, `otp/resend/route.ts`
  - `src/app/api/auth/register/route.ts`, `withEmailOTP/route.ts`
  - `src/app/api/auth/refresh/route.ts` — also fixed `data?.token` + `data?.tokenExpires` optional chaining
  - 6 additional routes in auth flow
- Fixed `wrapperFetchJsonResponse()` to preserve original HTTP status instead of hardcoding `SERVICE_UNAVAILABLE` on error

### Phase 2: Layout CMS Resilience (C2, C3)
**Added `isValidMenus()` and `isValidLogo()` type guard functions to validate CMS data before rendering.**
- Root cause: CMS can return empty arrays `[]` instead of expected object shapes, causing null-reference crashes in navbar/footer
- Fix: `src/app/layout.tsx` — guards prevent rendering components if CMS data is malformed:
  - `ResponsiveAppBar` checks `isValidMenus(mainMenu, mobileMenu, logoData)`
  - `Footer` checks `isValidMenus(footerMenu, contactRightSide)`
  - Silent fallback (no navbar/footer) instead of crash

### Phase 3: Homepage SSR Restore (C4)
**Removed `ssr: false` from 4 dynamic imports in homepage view — re-enabled server rendering.**
- Root cause: Phase 1 optimization disabled SSR to hide loading states; killed initial render performance
- Fix: `src/views/homepage/view/main-layout-section.tsx` — removed `ssr: false` from:
  - `CouponsSection`, `PostsSectionWithCarousel`, `PostsSection`, `OperatorsSection`
- Also removed unused `postsOfOperators` prop and related data fetching logic

### Phase 4: Image Optimization Fix (C5)
**Removed `unoptimized` prop from priority/hero images across 5 files — re-enable Next.js image optimization.**
- Root cause: Phase 3 added `unoptimized: true` to disable image optimization pipeline (faster initial build); broke image quality on CDN
- Fix: Removed `unoptimized` from priority images:
  - `src/views/homepage/components/hero-section.tsx` (hero image)
  - `src/views/homepage/components/product-slide-section.tsx` (product carousel)
  - `src/views/blog/components/blog-view.tsx` (featured post images)
  - `src/views/product-detail/detail-post-section.tsx` (product detail images)
  - `src/views/default-page.tsx` (default page hero)
- Images now go through Next.js optimization pipeline (blur-up, responsive srcset)

### Phase 5: StaleTime Query Fix (C6)
**Added `staleTime: 0` to 3 transactional React Query hooks to ensure fresh data for booking/payment flows.**
- Root cause: Phase 2 set global `staleTime: 60000`; stale data caused payment form to display outdated voyage/booking info
- Fix: `src/services/apis/` — override global staleTime with `staleTime: 0` for:
  - `useGetBoatLayoutFromOperator()` — seat availability changes frequently
  - `useGetBooking()` — payment status needs real-time freshness
  - `useAuthGetMeQuery()` — user balance/auth state critical for payments
- These hooks always fetch fresh data, bypassing cache

### Phase 6: Meilisearch Buffer Safety (H2, H3)
**Changed fire-and-forget `addDocuments()` to awaited pattern with try/catch re-queue on failure.**
- Root cause: Unhandled promise rejection in Meilisearch indexer caused silent data loss
- Fix: `src/services/infrastructure/meilisearch/wordpress/wordpress-indexing.service.ts`:
  - Wrapped batch `addDocuments()` in try/catch with re-queue pattern
  - Added `process.on("exit")` handler to warn about lost documents before exit
  - Reduced idle flush timer from 3000ms to 1000ms for faster index updates

### Phase 7: LightGallery Plugins Fix (H4)
**Removed stale `share={false}` prop from product gallery modal — plugin was not imported.**
- Root cause: `lgShare` plugin was not included in `lightGallerySettings`, causing prop mismatch warning
- Fix: `src/views/product-detail/product-gallery-modal.tsx` — removed unused `share={false}` prop

### Impact
- **Stability**: Eliminated TypeError crashes in auth flow, CMS null crashes, Meilisearch data loss
- **Performance**: Re-enabled SSR on homepage, image optimization pipeline, fresh voyage data in payments
- **Data integrity**: Search index durability on graceful shutdown

---

## 2026-02-25 — PageSpeed Phase 3 (feat/improve-performance)

- Cache headers, script deferral, CSS chunking (`cssChunking: 'strict'`)
- CDN image bypass for `_next/image` proxy, blur placeholders added
- Navigation progress bar via `nextjs-toploader`

---

## 2026-02 — PageSpeed Phase 2

- Utils modularization (`src/lib/utils/` submodules) for better tree-shaking
- Component lazy loading (ProductGalleryModal, heavy homepage components)
- Image optimization (hero above-fold, blur-up placeholders)
- Event throttling on high-frequency handlers
- API parallelization with error isolation pattern

---

Previous: [Development Roadmap](development-roadmap.md)
