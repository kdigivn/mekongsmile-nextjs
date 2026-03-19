# Development Roadmap

> Current state, known tech debt, and planned improvements for Mekong Smile Tours.

**Last Updated:** 2026-03-10

## Current Status — March 2026

The application is in **active production** serving Mekong Delta tour bookings.

### Implemented Features

#### Core Booking Flow ✅
- [x] Tour search & listing
- [x] Tour detail with filters (destination, price, rating)
- [x] Tour scheduling and availability calendar
- [x] Multi-passenger booking form (up to 30 passengers)
- [x] ID card OCR autofill (Viettel AI integration)
- [x] Booking confirmation and summary page
- [x] Booking confirmation download / email

#### Payments ✅
- [x] OnePay gateway (card + bank transfer)
- [x] SMS Banking (VietQR / SePay)
- [x] Offline payment (bank transfer with manual confirmation)
- [x] Voucher / promo code system
- [x] VAT invoice export

#### User Account ✅
- [x] Email + OTP authentication
- [x] Google OAuth login
- [x] Facebook OAuth login (configurable)
- [x] Booking history
- [x] Cancellation request system
- [x] Transaction history
- [x] User profile management
- [x] Avatar upload

#### Content & SEO ✅
- [x] WordPress CMS integration (blog, travel guides, static pages)
- [x] Meilisearch full-text search
- [x] ISR for content pages
- [x] JSON-LD structured data (FAQ, breadcrumbs)
- [x] Auto-generated XML sitemap
- [x] i18n support (Vietnamese + English)

#### Tour Destination Features ✅
- [x] Multi-destination support
- [x] Per-destination theme (light, condao-express-light)
- [x] Tour list bulk import
- [x] Excel export (tour list, bookings)
- [x] Tour booking management dashboard

#### Infrastructure ✅
- [x] Sentry error tracking (client + server + edge)
- [x] Session replay (Sentry)
- [x] Google Analytics 4
- [x] PWA manifest
- [x] Cypress E2E test suite

---

## Known Tech Debt

### High Priority

| Item | Impact | Status | Notes |
|------|--------|--------|-------|
| **Unit tests absent** | High | Open | Only Cypress E2E tests exist. No unit or integration tests for service hooks, utilities, or components. |
| **Mixed naming conventions** | Medium | Open | Some files use PascalCase (`useWindowDimensions.ts`), some kebab-case. Needs normalisation. |
| **No CI/CD pipeline** | High | Open | No GitHub Actions workflows for automated testing/deployment. Relies on manual builds. |
| **Large utils.ts** | Medium | ✅ RESOLVED (Mar 10) | Split into 8 modular subfiles under `src/lib/utils/` (Phase 2 Performance optimization). |

### Medium Priority

| Item | Impact | Notes |
|------|--------|-------|
| **React Query v4 patterns** | Medium | Some service hooks may use older v4 patterns (e.g., `cacheTime` instead of `gcTime`). |
| **Inconsistent error handling** | Medium | Some components handle errors inline, others propagate up. No global error boundary strategy. |
| **WordPress GraphQL queries uncached** | Medium | WP queries run on every SSR request without ISR caching in some routes. |
| **`any` type usage** | Low | Some legacy service hooks use `any` types. Should be typed. |
| **Console.log statements** | Low | Dev logging left in some service files — should use proper logger. |

### Low Priority

| Item | Impact | Notes |
|------|--------|-------|
| **Dark mode incomplete** | Low | Dark mode CSS vars defined but not all components respect them. |
| **Leaflet SSR warning** | Low | Leaflet map requires dynamic import with `ssr: false` but may have edge cases. |
| **Bundle size** | Low | `xlsx` and `lightgallery` are heavy — could be lazy-loaded on demand. |

---

## Recently Completed (March 2026)

### Security & Edge Case Fixes (March 10) ✅
- [x] **XSS vulnerability fixed** — WordPress CMS HTML sanitization via `cms-html-sanitizer.ts`
- [x] **Calendar refactoring** — Removed `calendarKey` anti-pattern; added `CalendarErrorBoundary`
- [x] **Calendar state sync** — Fixed `navDate` scoping and operator state management
- [x] **INP optimization** — Implemented `scheduler.yield()` utility for main thread yielding
- [x] **CLS stabilization** — Added min-height wrapper to list-with-table component
- [x] **Homepage bugfix** — Missing error return in `getRoutes()`; added ISR revalidation
- [x] **UX improvements** — Better reCAPTCHA error messaging, image responsiveness, chat widget optimization

### Mobile & UX Improvements ✅
- [x] **Footer responsive layout** — Menu columns display side-by-side on mobile; flex layout improvements
- [x] **Location filtering** — Disabled locations now filtered from `useGetLocations` API response
- [x] **Bottom nav fix** — Applied flex layout styles to bottom nav button element
- [x] **Accessibility** — Resolved contrast, ARIA, and console error issues for PageSpeed compliance
- [x] **Clickbait detection** — Use `CLICKBAIT_SUFFIX` constant for generated voyage IDs
- [x] **CI/CD deploy pipeline** — Attempted GitHub Actions + PM2 zero-downtime deploy (reverted pending further work)

---

## Recently Completed (February 2026)

### Performance Optimization Phase 2 ✅

All optimizations aimed at improving Core Web Vitals (LCP, FID, CLS) and reducing Time to Interactive (TTI).

**Code Optimizations:**
- [x] **Utils Modularization** — Split monolithic `src/lib/utils.ts` (627 lines) into 8 focused modules for better tree-shaking
- [x] **LightGallery Deferred Loading** — Extracted to `src/views/product/product-gallery-modal.tsx`, loads only on user click (saves ~85-110KB gzipped initial JS)
- [x] **Homepage Lazy Loading** — Applied `next/dynamic` with `ssr:false` for heavy client components; server components use `<Suspense>` for streaming
- [x] **Image Optimization** — Hero images now use `fill`, `sizes="100vw"`, `priority`, and `placeholder="blur"` for above-fold optimization

**Performance Patterns:**
- [x] **API Parallelization** — Implemented `Promise.all` with per-call `.catch()` for error-isolated parallel fetching in product and homepage pages
- [x] **Hover State Throttling** — Star rating hover state throttled to 100ms, preventing jank during rapid mouse movement
- [x] **Form Submission Guards** — Double-submit prevention with loading state flags in booking modals

**Configuration Improvements:**
- [x] **optimizePackageImports** — Added `@heroui/react`, `date-fns`, `@radix-ui/*` to `next.config.js` for granular imports
- [x] **JSON-LD Schema Fix** — Corrected product schema from invalid `CreativeWorkSeries` to proper `Product` type
- [x] **Pagination SEO** — Added `noindex` meta tags to paginated routes to prevent duplicate content issues

**A11y Enhancements:**
- [x] **Star Rating Accessibility** — Implemented ARIA radiogroup pattern with roving tabindex for keyboard navigation
- [x] **Gallery Labeling** — Added region labels and proper ARIA attributes to image galleries
- [x] **Decorative Icon Handling** — Applied `aria-hidden="true"` to purely decorative icons

**Bugfixes:**
- [x] **Non-JSON API Response Handling** — Added fallback for build-time static generation when API returns non-JSON responses

---

## Planned Improvements

### Short Term (1-3 months)

- [ ] **Add GitHub Actions CI pipeline**
  - Lint + type check on PR
  - Cypress tests on staging deployment
  - Automatic deployment to UAT on merge to develop

- [ ] **Unit test coverage**
  - Service hook tests (mock API responses)
  - Utility function tests (`src/lib/utils.ts`)
  - Component snapshot tests for UI primitives

- [x] **Split `utils.ts`** (Phase 2 Complete)
  - ✅ `src/lib/utils/cn.ts` — class merging
  - ✅ `src/lib/utils/format-utils.ts` — currency formatting
  - ✅ `src/lib/utils/date-utils.ts` — date/time helpers
  - ✅ `src/lib/utils/seo-utils.ts` — SEO metadata helpers
  - ✅ `src/lib/utils/string-utils.ts` — string manipulation
  - ✅ `src/lib/utils/booking-utils.ts` — booking calculations
  - ✅ `src/lib/utils/browser-utils.ts` — browser detection
  - ✅ `src/lib/utils/ui-utils.ts` — UI helpers
  - ✅ Barrel re-export via `src/lib/utils.ts`

- [ ] **Standardise file naming**
  - Convert all hook files to kebab-case
  - Enforce via ESLint rule

### Medium Term (3-6 months)

- [ ] **React Server Components optimisation**
  - Move more data fetching to RSC (reduce client bundle)
  - Streaming with `<Suspense>` for booking detail

- [ ] **Search improvements**
  - Meilisearch index for voyages (real-time search)
  - Autocomplete for route/location search

- [ ] **Offline support (PWA)**
  - Service worker for basic offline page
  - Cache recently viewed routes/voyages

- [ ] **Accessibility audit**
  - WCAG 2.1 AA compliance check
  - Keyboard navigation for seat picker
  - Screen reader testing

- [ ] **Performance**
  - Lazy load `xlsx`, `lightgallery`, `leaflet`
  - Review and reduce React Query staleTime settings
  - Image optimisation for WordPress media

### Long Term (6+ months)

- [ ] **Admin dashboard** — operator-facing booking management UI
- [ ] **Real-time seat availability** — WebSocket/SSE for live seat updates
- [ ] **Mobile app** — React Native app reusing service layer
- [ ] **Multi-currency support** — USD pricing for international users
- [ ] **Loyalty program** — Points/rewards integration

---

## Testing Strategy

### Current State
| Test Type | Status | Coverage |
|-----------|--------|---------|
| Unit tests | ❌ Not implemented | 0% |
| Integration tests | ❌ Not implemented | 0% |
| E2E tests | ✅ Cypress | Key flows (auth, booking) |
| Visual regression | ❌ Not implemented | 0% |

### Target State
| Test Type | Target | Priority |
|-----------|--------|---------|
| Unit tests | `vitest` for utils + hooks | High |
| Component tests | `@testing-library/react` | Medium |
| E2E tests | Expand Cypress coverage | Medium |
| Visual regression | Chromatic / Percy | Low |

### Recommended Testing Stack
- **Unit + Component:** Vitest + React Testing Library
- **E2E:** Cypress (already configured)
- **API mocking:** MSW (Mock Service Worker)

---

## Dependency Health

### Key Dependencies to Monitor

| Package | Current | Watch For |
|---------|---------|-----------|
| `next` | 14.2.29 | Next.js 15 migration (App Router improvements) |
| `@tanstack/react-query` | 5.80.6 | Stable — no breaking changes expected |
| `@heroui/react` | 2.7.6 | Major version upgrades may break component API |
| `@sentry/nextjs` | 9.28.1 | Keep updated for security patches |
| `react` | 18.3.1 | React 19 migration readiness |

### Dependabot
Dependabot is configured (`.github/dependabot.yml`) to auto-create PRs for npm dependency updates weekly.

---

## Changelog

### Recent Changes (2026)

**March 2026**
- **Security:** XSS vulnerability fix with WordPress CMS HTML sanitization
- **Performance:** Phase 3-4 complete (JS Bundle/INP, ISR/Caching); `scheduler.yield()` for INP
- **Bugfixes:** Calendar refactoring (calendarKey removal), state sync, homepage edge cases
- **UX:** reCAPTCHA error messages, image responsiveness, CLS stabilization
- **Refactoring:** Utils modularization (8 modules from monolithic 600-line file)
- Footer responsive layout improvements (menu columns side-by-side on mobile)
- Disabled locations filtered from API responses
- Bottom nav flex layout fix
- Accessibility/contrast/console error fixes for PageSpeed
- `CLICKBAIT_SUFFIX` constant for generated voyage IDs
- CI/CD deploy pipeline attempted then reverted
- Documentation upgrade (consolidation, staleness fixes, gap fills)

**February 2026**
- **Performance Optimization Phase 2 Complete:**
  - Split monolithic `utils.ts` (627 lines) into 8 modular subfiles under `src/lib/utils/` for better tree-shaking
  - Deferred LightGallery loading — extracted to `product-gallery-modal.tsx` (saves ~85-110KB gzipped)
  - Implemented lazy loading for homepage heavy components with `next/dynamic` + `<Suspense>`
  - Optimized hero images with `fill`, `sizes`, `priority`, `placeholder="blur"`
  - Added API parallelization with error isolation in product/homepage pages
  - Implemented star rating hover throttle (100ms) and form submission guards
  - Added `optimizePackageImports` config for granular imports
  - Fixed JSON-LD schema: changed from `CreativeWorkSeries` to `Product`
  - Added pagination `noindex` meta tags for SEO
  - Implemented ARIA improvements for star rating, gallery, and decorative icons
  - Fixed non-JSON API response handling during build-time static generation
- Added clickbait indication to voyage name in checkout data
- Updated login background
- Changed voyage chip background color
- Updated test routes

**January 2026**
- Added comprehensive project documentation (this initiative)

> For detailed commit history, see `git log` or GitHub repository commits.

---

Previous: [Deployment Guide](deployment-guide.md)
Next: [Project Changelog](project-changelog.md)
