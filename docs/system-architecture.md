# System Architecture

> Technical architecture for mekongsmile.com (Next.js 14 App Router + WPGraphQL + Custom Backend)

**Last Updated:** 2026-03-19
**Status:** Phase 1-8, 10-11 complete. Phase 9 (booking engine) deferred pending backend API design. Upgraded to Next.js 16 (2026-03-19).

## Table of Contents

- [1. High-Level Architecture](#1-high-level-architecture)
- [2. Folder Structure](#2-folder-structure)
- [3. Page / Route Inventory](#3-page--route-inventory)
- [4. Data Flow](#4-data-flow)
- [5. Auth Architecture](#5-auth-architecture)
- [6. State Management](#6-state-management)
- [7. i18n Architecture](#7-i18n-architecture)
- [8. Payment Architecture](#8-payment-architecture)
- [9. WordPress CMS Integration](#9-wordpress-cms-integration)
- [10. Component Architecture](#10-component-architecture)
- [11. Error Handling](#11-error-handling)
- [11b. Performance Optimization Patterns](#11b-performance-optimization-patterns-phase-2)
- [12. Multi-Tenancy Architecture](#12-multi-tenancy-architecture)
- [13. Server-Sent Events (SSE)](#13-server-sent-events-sse)
- [14. Middleware Deep-Dive](#14-middleware-deep-dive)
- [15. Build & Deployment](#15-build--deployment)

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Browser                         │
│  React Components (CSR) + Next.js Pages (SSR/ISR)   │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP
┌──────────────────────▼──────────────────────────────┐
│         Next.js 16 Frontend (mekongsmile.com)       │
│  ┌─────────────────────────────────────────────┐    │
│  │    App Router (src/app/) + Turbopack        │    │
│  │   Tour Pages · Blog · Auth · Booking (P9)   │    │
│  │   API Routes (BFF) · Layouts                │    │
│  └──────────────┬───────────────────────────   │    │
│                 │                               │    │
│  ┌──────────────▼───────────────────────────   │    │
│  │      Services & GraphQL Layer               │    │
│  │   wordpress/ · auth/ · i18n/ · graphql/    │    │
│  └──────────────┬───────────────────────────   │    │
└─────────────────┼───────────────────────────────────┘
                  │ HTTP
      ┌───────────┴──────────────────────┐
      ▼                                  ▼
┌──────────────────────┐      ┌──────────────────────┐
│   WordPress CMS      │      │  Custom Backend API  │
│   (mekongsmile.com)  │      │    (TBD — Phase 9)   │
│                      │      │                      │
│ • Tours (34)         │      │ • Bookings           │
│ • Blog Posts         │      │ • Availability       │
│ • Pages              │      │ • Payments           │
│ • Menus + Settings   │      │ • Orders             │
│ • SEO (Rank Math)    │      │ • User Accounts      │
└──────────────────────┘      └──────────────────────┘
```

**Hybrid Architecture:**
- **Content Layer:** WordPress (WPGraphQL) — tours, blog, pages, menus, SEO
- **Frontend:** Next.js 14 App Router with Server Components + ISR
- **Commerce Layer:** Custom backend API (deferred — Phase 9 pending design)
- **Communication:** Server-side `fetchGraphQL()` for CMS; BFF proxy for backend (future)

## 2. Folder Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (language)/         # Locale routing group
│   │   ├── layout.tsx      # Shared layout (header, footer, providers)
│   │   ├── page.tsx        # Homepage — featured tours + blog (ISR 60s)
│   │   ├── tours/          # Tour listing (filter, pagination)
│   │   │   └── [slug]/     # Tour detail (SSG: 34 tours)
│   │   ├── destination/    # Destination pages (SSG: 14 dests)
│   │   │   └── [slug]/     # Tours + posts per destination
│   │   ├── blog/           # Blog listing (ISR 3600s)
│   │   │   └── [slug]/     # Blog post (SSG: all posts)
│   │   ├── news/           # News category (ISR 3600s)
│   │   │   └── [slug]/     # News post (SSG)
│   │   ├── about-us/       # Static page (ISR 86400s)
│   │   ├── contact-us/     # Contact page + form (ISR 86400s)
│   │   ├── sign-in/        # Login (email + Google OAuth)
│   │   ├── sign-up/        # Registration
│   │   ├── user/           # User account (auth required)
│   │   │   ├── profile/    # Profile edit
│   │   │   └── bookings/   # Booking history (Phase 9)
│   │   └── [...slug]/      # WP pages catch-all (ISR)
│   ├── api/                # BFF API routes
│   │   ├── auth/           # Login, register, refresh
│   │   └── [..path]/       # Proxy to custom backend (Phase 9)
│   ├── sitemap.ts          # Dynamic sitemaps (tours, blog, pages, destinations)
│   ├── robots.ts           # Robots.txt
│   ├── layout.tsx          # Root layout (Sentry, providers)
│   └── globals.css         # Global styles + Tailwind
│
├── components/             # UI Components
│   ├── ui/                 # Radix + Tailwind primitives (25+)
│   ├── form-elements/      # Form field wrappers
│   ├── app-bar.tsx         # Header navigation
│   ├── footer/             # Footer with menus
│   └── [feature]/          # Domain-specific components
│
├── services/               # Business Logic
│   ├── wordpress/          # GraphQL service layer (6 files)
│   │   ├── tour-service.ts
│   │   ├── post-service.ts
│   │   ├── page-service.ts
│   │   ├── taxonomy-service.ts
│   │   ├── site-service.ts
│   │   └── options-service.ts
│   ├── auth/               # Auth context + JWT handling
│   ├── i18n/               # i18next (en/vi/zh)
│   ├── react-query/        # QueryProvider + key factory
│   ├── apis/               # API hooks (legacy — removing in Phase 11)
│   └── social-auth/        # Google OAuth
│
├── graphql/                # WPGraphQL Integration
│   ├── client.ts           # fetchGraphQL() + Apollo client
│   ├── types.ts            # All TS interfaces (SeoData, TourDetail, etc.)
│   ├── queries/            # Query definitions (tours, blog, pages, taxonomies)
│   └── fragments/          # Shared fragments (tour, post, seo, menu, media)
│
├── hooks/                  # Custom React hooks (useBoolean, useDebounce, etc.)
├── lib/                    # Utilities
│   ├── utils.ts            # Barrel export
│   ├── utils/              # Modular utilities (format, date, string, etc.)
│   └── cms-html-sanitizer.ts
│
├── views/                  # Page View Components
│   ├── homepage/           # Hero, featured tours, blog section
│   ├── tour/               # Tour card, listing, detail, filters
│   ├── blog/               # Blog listing, post detail
│   ├── destination/        # Destination archive
│   └── page/               # Generic CMS page renderer
│
├── server-actions/         # Server-only actions (getJWT, logout)
└── proxy.ts                # i18n routing + locale detection (Next.js 16+)
```

## 3. Page / Route Inventory

### Tour & Content Routes

| Route | Rendering | Auth | Data Source | Description |
|-------|-----------|------|-------------|-------------|
| `/` | ISR (60s) | No | WPGraphQL | Homepage — hero, featured tours (6), blog preview (4), why choose section |
| `/tours/` | ISR (60s) | No | WPGraphQL | Tour listing — all 34 tours with destination/type/style filters, pagination |
| `/tour/[slug]/` | SSG | No | WPGraphQL | Tour detail — gallery, description, pricing, highlights, FAQ, includes/excludes, meeting point, booking CTA |
| `/destination/[slug]/` | SSG | No | WPGraphQL | Destination page — related tours + blog posts for that destination (14 destinations) |
| `/blog/` | ISR (3600s) | No | WPGraphQL | Blog listing — all posts, paginated (12 per page) |
| `/blog/[slug]/` | SSG | No | WPGraphQL | Blog post detail — article, comments, ratings, related posts |
| `/news/` | ISR (3600s) | No | WPGraphQL | News category listing — filtered by category slug |
| `/news/[slug]/` | SSG | No | WPGraphQL | News post detail — article layout |
| `/about-us/` | ISR (86400s) | No | WPGraphQL | Static page from WP |
| `/contact-us/` | ISR (86400s) | No | WPGraphQL | Static page + contact form |
| `/[...slug]/` | ISR | No | WPGraphQL | Dynamic CMS pages (FAQ, privacy, terms, custom pages) |

### Auth & User Routes

| Route | Rendering | Auth | Status | Description |
|-------|-----------|------|--------|-------------|
| `/sign-in` | CSR | No | Simplified | Email + password + Google OAuth (simplified from ferry) |
| `/sign-up` | CSR | No | Simplified | Registration (backend TBD) |
| `/user/profile` | CSR | Yes | Basic | View/edit profile (name, email, avatar) |
| `/user/bookings` | CSR | Yes | Phase 9 | Booking history (deferred, requires backend) |

### API Routes (BFF & Backend Proxy)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/login` | POST | Email login |
| `/api/auth/register` | POST | User registration |
| `/api/auth/refresh` | POST | Token refresh |
| `/api/[...path]` | `*` | Generic proxy to custom backend |

### API Routes (BFF)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/[...path]` | `*` | Generic proxy to backend REST API |
| `/api/auth/login/email` | `POST` | Email login |
| `/api/auth/login/email/checkInOrg` | `POST` | Email existence check |
| `/api/auth/login/email/confirm` | `POST` | OTP confirmation |
| `/api/auth/login/email/otp/resend` | `POST` | Resend OTP |
| `/api/auth/register` | `POST` | User registration |
| `/api/auth/register/withEmailOTP` | `POST` | OTP-based registration |
| `/api/auth/refresh` | `POST` | Token refresh |
| `/api/payments/onepay/generate-payment-url` | `POST` | OnePay URL |
| `/api/payments/onepay/verify-transaction` | `POST` | Verify OnePay |
| `/api/payments/sms-banking/get-transaction-message` | `POST` | SMS banking msg |
| `/api/ai/scan-id-card` | `POST` | ID card OCR |
| `/api/sse/[...path]` | `*` | SSE proxy |
| `/api/organization/me` | `GET` | Org settings |

## 4. Data Flow

### BFF Pattern (Backend-for-Frontend)

All API calls from the browser go through Next.js API routes — never directly to the backend:

```
Browser
  │
  ▼ fetch /api/[...path]
Next.js API Route (BFF)
  │ • Inject Authorization header from server-side cookie
  │ • Transform request/response
  │ • Convert HTTP 204 NO_CONTENT → 200 with empty JSON body
  │ • Handle CORS
  ▼ HTTP
Backend REST API
  │
  ▼
JSON Response → BFF → Browser
```

**Key benefit:** The JWT stored in HTTP-only cookies is invisible to browser JS. The BFF reads it server-side and forwards it as a Bearer token.

**204→200 conversion:** Backend endpoints that return 204 NO_CONTENT are normalized to 200 by the BFF before sending to the client. This prevents `Response.json()` errors on empty bodies and allows client code to check a single status code (`HTTP_CODES_ENUM.OK`) across all success responses. Applies to: generic proxy (`api/[...path]`), auth register, refresh, and reporting routes.

**BFF Resilience Patterns** (Phase 7 fixes):
- **Guard against undefined responses**: All BFF routes use `data ?? null` to prevent `Response.json(undefined)` crashes in auth flow
- **Preserve HTTP status codes**: `wrapperFetchJsonResponse()` preserves original status instead of hardcoding `SERVICE_UNAVAILABLE`
- **CMS null guard**: `src/app/layout.tsx` validates CMS menu/logo data before rendering navbar/footer; falls back to no header/footer on CMS outage
- **Transactional data freshness**: Hooks like `useGetBoatLayoutFromOperator()`, `useGetBooking()`, `useAuthGetMeQuery()` override global `staleTime: 60000` with `staleTime: 0` to ensure payment forms display current data

### Client → API Service Hook → BFF

```typescript
// Component
const { data } = useGetBookingDetailById(bookingId);

// Hook (React Query)
function useGetBookingDetailById(id: string) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => fetcher(`/api/bookings/${id}`),
  });
}

// fetcher → /api/[...path] → Backend
```

### SSR Data Flow

```
Request
  │
  ▼ Next.js Server
  getJWT() → Read JWT cookie (server action)
  │
  ▼ Server Component or Server Action
  Direct backend call with JWT in Authorization header
  │
  ▼ Rendered HTML → Browser
  (React Query hydrated for CSR takeover)
```

## 5. Auth Architecture

### Token Lifecycle

```
Login Request
    │
    ▼ /api/auth/login/email (BFF)
Backend validates credentials
    │
    ▼ Returns { jwt, refreshToken, user }
BFF sets HTTP-only cookies:
    - Jwt (short-lived, 15min-1h)
    - RefreshToken (long-lived, 7-30 days)
    │
    ▼ AppAuthInitializer mounts
Reads cookies server-side → injects JWT into React Query headers
    │
    ▼ On JWT expiry (401 response or proactive)
/api/auth/refresh called with RefreshToken cookie
    │
    ▼ Backend returns new JWT (+ optional new RefreshToken)
Cookies updated, failed requests retried
```

### Auth Guard (Middleware)

`src/middleware.ts` runs on every request:
1. Detect language from cookie/header → redirect if needed
2. Check if route requires auth
3. If auth required and no JWT cookie → redirect to `/sign-in`

### Auth State in Components

```typescript
// Access auth in any component
const { user, isAuthenticated, login, logout } = useAuth();

// Login mutation
const { mutate: login } = useAuthLoginService();

// Logout server action
import { logout } from "@/server-actions/logout";
```

## 6. State Management

### Hierarchy (precedence order)

```
URL Search Params (searchParams)
    ↓ overrides
React Query Cache (server state)
    ↓ overrides
React Context (app-wide state)
    ↓ overrides
Component useState / useReducer (local)
```

### React Query (Server State)

```typescript
// Query key factory (type-safe)
const bookingKeys = createQueryKeys("bookings", {
  all: null,
  list: (params) => ({ params }),
  detail: (id) => ({ id }),
});

// Usage
const { data, isLoading } = useQuery({
  queryKey: bookingKeys.detail(id),
  queryFn: () => fetch(`/api/bookings/${id}`),
  staleTime: 30_000,       // 30s fresh
  gcTime: 5 * 60_000,      // 5min cache
});
```

### React Contexts

| Context | Provider | Purpose |
|---------|----------|---------|
| `AuthContext` | `AuthProvider` | User session, login/logout |
| `StoreLanguageContext` | `StoreLanguageProvider` | Current language (vi/en) |
| `OrgContext` | `OrgProvider` | Multi-tenant org settings |
| `ThemeContext` | `ThemeProvider` (next-themes) | Light/dark mode |
| `QueryContext` | `QueryProvider` | React Query client |
| `ConfirmDialogContext` | `ConfirmDialogProvider` | Global confirm modals |

## 7. i18n Architecture

```
middleware.ts
    │ detect language (cookie → Accept-Language → default: vi)
    ▼
(language)/ route group
    │ passes lang param to layouts/pages
    ▼
Server Component:
    const { t } = await getServerTranslation(lang, "namespace");

Client Component:
    const { t } = useTranslation("namespace");
```

### Translation File Structure

```
public/locales/
├── vi/
│   ├── common.json       # Shared UI strings
│   ├── booking.json      # Booking flow
│   ├── auth.json         # Auth screens
│   └── ...
└── en/
    └── (same namespaces)
```

### Routing Modes

| Mode | `INTERNATIONAL_ROUTING_ENABLED` | URL pattern |
|------|--------------------------------|-------------|
| Prefixed | `true` | `/en/schedules`, `/vi/schedules` |
| Cookie-only | `false` (default) | `/schedules` (lang from cookie) |

## 8. Payment Architecture

```
User selects payment method
    │
    ├── OnePay ──────────────────────────────────────────┐
    │   POST /api/payments/onepay/generate-payment-url   │
    │   ↓ Redirect to external OnePay gateway            │
    │   ↓ OnePay redirects back                          │
    │   POST /api/payments/onepay/verify-transaction ────┘
    │
    ├── SMS Banking
    │   POST /api/payments/sms-banking/get-transaction-message
    │   Display formatted SMS → user sends manually
    │   Poll booking status for confirmation
    │
    └── Offline
        Display bank account info
        Admin confirms manually
        Booking status updated by backend
```

## 9. WordPress CMS Integration

```
WordPress (mekongsmile.com/graphql)
    │
    ├─→ GraphQL Queries (src/graphql/queries/)
    │   ├── tours/          → GET_ALL_TOURS, GET_TOUR_BY_SLUG
    │   ├── blog/           → GET_ALL_BLOG_POSTS, GET_POST_BY_SLUG
    │   ├── taxonomies/     → GET_ALL_DESTINATIONS, GET_TOUR_FILTER_OPTIONS
    │   └── site/           → GET_LAYOUT_DATA, GET_PAGES, GET_MENUS
    │
    ├─→ Service Layer (src/services/wordpress/)
    │   ├── tour-service.ts              → getAllTours(), getTourBySlug(), getTourSlugs()
    │   ├── post-service.ts              → getAllBlogPosts(), getPostBySlug(), getNews()
    │   ├── page-service.ts              → getPageBySlug(), getAllPages()
    │   ├── taxonomy-service.ts          → getAllDestinations(), getTourFilterOptions()
    │   ├── site-service.ts              → getLayoutData() (menus + settings)
    │   └── options-service.ts           → getTourConstant() (ACF Options Page)
    │
    └─→ Consumed in:
        ├── Root layout (menus, logo, settings via getLayoutData())
        ├── Tour detail pages (tour data + SEO)
        ├── Blog/news pages (posts + filters)
        ├── Destination pages (destination + related content)
        └── [...slug] catch-all (dynamic WP pages)

**Resilience:** Root layout uses Promise.all with error catches. CMS failures return null gracefully.
Header/footer render conditionally when CMS data available. Page render continues without CMS metadata fallback.
```

## 10. Component Architecture

### Page Pattern

Every page follows a two-file pattern:

```
src/app/(language)/[page]/
├── page.tsx          # Server Component — data fetching, metadata
└── page-content.tsx  # Client Component — interactive UI
```

### Component Composition

```
page.tsx (Server)
    ↓ passes prefetched data as props
page-content.tsx (Client)
    ↓ uses React Query (hydrated)
    ├── Domain components (PassengerForms, BoatLayout, etc.)
    │   ├── UI primitives (src/components/ui/)
    │   ├── Form elements (src/components/form-elements/)
    │   └── Modals/Dialogs
    └── Custom hooks (useBoolean, useDebounce, etc.)
```

### UI Primitive Stack

```
Radix UI (accessibility, behaviour)
    +
Tailwind CSS (styling)
    +
class-variance-authority (variants)
    +
HeroUI (extended components)
    =
src/components/ui/ (project primitives)
```

## 11. Error Handling

| Layer | Mechanism |
|-------|-----------|
| React render | Error boundaries (Next.js `error.tsx`); `CalendarErrorBoundary` for dynamic import failures |
| API errors | `wrapperFetchJsonResponse()` — parses error body; 204 → empty object; non-JSON content-type → 503; preserves original HTTP status |
| BFF crashes | All `Response.json(data)` calls use `data ?? null` guard to prevent TypeError on undefined responses |
| CMS failures | Type guards in `layout.tsx` prevent crashes on malformed menu/logo data; silent fallback to no header/footer |
| Network errors | React Query retry logic (3 retries default) |
| Auth errors | 401 → token refresh → retry or redirect to login |
| XSS attacks | `sanitizeCmsHtml()` sanitizes WordPress HTML before `dangerouslySetInnerHTML` (CMS content in product detail, etc.) |
| Search index loss | Meilisearch indexer flushes buffer on Node.js exit via `process.on("exit")` handler |
| Unhandled | Sentry (client + server + edge) |
| User feedback | Sonner toast notifications |

## 11b. Performance Optimization Patterns (Phases 2-4)

### Code Splitting & Lazy Loading

**Utils Modularization** (src/lib/utils/) — Phase 2 & Phase 3
```
src/lib/utils/
├── cn.ts                 # Class merging
├── format-utils.ts       # Currency, number formatting
├── date-utils.ts         # Duration, date calculations
├── seo-utils.ts          # SEO metadata, schemas
├── string-utils.ts       # String manipulation
├── booking-utils.ts      # Booking calculations
├── browser-utils.ts      # Browser detection
├── ui-utils.ts           # UI helpers
└── (barrel re-export via ../utils.ts)

// Import directly for better tree-shaking:
import { formatCurrency } from "@/lib/utils/format-utils";
// Or use barrel export for convenience:
import { formatCurrency } from "@/lib/utils";
```

**Thread Yielding for INP** (src/lib/scheduler-yield.ts) — Phase 4
```typescript
// Main thread yield utility (Chrome 115+ native support)
export function schedulerYield() {
  return typeof (globalThis as any).scheduler?.yield === 'function'
    ? (globalThis as any).scheduler.yield()
    : Promise.resolve().then(() => {});
}

// Use in long-running operations:
for (let i = 0; i < largeArray.length; i++) {
  processItem(largeArray[i]);
  if (i % BATCH_SIZE === 0) await schedulerYield();
}
```

**Component Lazy Loading**
```typescript
// Product gallery — deferred until user click (saves ~85-110KB gzipped)
// src/views/product/product-gallery-modal.tsx
export function ProductGalleryModal() {
  const [isOpen, setIsOpen] = useState(false);
  // LightGallery loaded only when modal opens
}

// Homepage heavy components
const HeavyComponent = dynamic(() => import('./heavy'), { ssr: false });
// or with Suspense for streaming:
<Suspense fallback={<Skeleton />}>
  <ServerComponent />
</Suspense>
```

### Performance Primitives

**API Parallelization** (Error-isolated)
```typescript
// Don't: Fails if any request fails
const [a, b] = await Promise.all([fetchA(), fetchB()]);

// Do: Graceful degradation
const [resA, resB] = await Promise.all([
  fetchA().catch(err => ({ error: err })),
  fetchB().catch(err => ({ error: err })),
]);
const a = resA.error ? null : resA;
const b = resB.error ? null : resB;
```

**Event Throttling** (High-frequency events)
```typescript
// Star rating hover — throttle to 100ms
import { throttle } from 'lodash-es';
const handleMouseEnter = throttle((index: number) => {
  setHoverIndex(index);
}, 100);
```

**Image Optimization** (Above-fold hero)
```typescript
// src/views/homepage/hero-image.tsx
<Image
  src={heroUrl}
  fill                    // Stretch to parent
  sizes="100vw"          // Full viewport width
  priority               // Load immediately
  placeholder="blur"     // Blur-up effect
  alt="Hero background"
/>
```

### Configuration Optimizations

**Granular Imports** (next.config.js)
```javascript
experimental: {
  optimizePackageImports: [
    '@heroui/react',    // Load only used components
    'date-fns',         // Load only used utilities
    '@radix-ui/*',      // Modular Radix imports
  ],
}
```

### SEO & Schema

**JSON-LD Schema** (Product pages)
```typescript
// Fixed: Use "Product" not "CreativeWorkSeries"
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Ferry Ticket",
  "description": "...",
  "offers": { "@type": "Offer", ... }
}
```

**Pagination Deindexing** (Prevent duplicate content)
```typescript
// page.tsx (paginated routes)
export const metadata = {
  robots: page > 1 ? { index: false } : undefined,
};
```

---

## 12. Multi-Tenancy Architecture

Each deployment serves a single operator (tenant). Tenant identity is resolved at startup via the backend organization API.

### OrgProvider Context

```
OrgProvider (src/services/apis/organizations/context/)
    │ Calls useGetCurrentOrganizationQuery() on mount
    │ Fetches /api/organization/me from BFF
    ▼
OrgContext provides:
    ├── organization: { id, name, slug, balance, credit, setting }
    ├── settings: Organization["setting"] — appearance, payment, integrations
    └── fetchOrganization: () => void — manual refresh
```

**Hook:** `useOrganizationContext()` — access org data from any client component.

### Per-Tenant Configuration

| Setting | Path | Purpose |
|---------|------|---------|
| Logo | `settings.appearance.logo` | Brand logo (FileEntity) |
| Primary color | `settings.appearance.primary_color` | Theme accent color |
| Font | `settings.appearance.font_family` | Brand typography |
| Favicon | `settings.appearance.favicon_url` | Browser tab icon |
| Payment | `settings.payment.OnePaySettings` | OnePay merchant config |
| SMS Banking | `settings.payment.SMSBankingSettings` | Bank transfer config |
| Cancel rules | `settings.cancel_tickets.rules` | Refund policy per operator |
| Default route | `settings.application.default_route_id` | Landing page route |

### API Key Injection

The SSE proxy uses `FERRY_DEFAULT_API_KEY` env var for authentication instead of per-user JWT — the SSE endpoint requires org-level access.

---

## 13. Server-Sent Events (SSE)

### SSE Proxy Pattern

```
Browser
    │ EventSource(/api/sse/v1/bookings/...)
    ▼
Next.js SSE Proxy (src/app/api/sse/[...path]/route.ts)
    │ • Strips /api/sse prefix, prepends API_SERVER_PREFIX
    │ • Injects Authorization: Bearer FERRY_DEFAULT_API_KEY
    │ • Creates TransformStream — pipes backend SSE to client
    ▼
Backend SSE Endpoint
    │ Sends event: message\ndata: {...}\n\n
    ▼
TransformStream.writable → TextEncoder → client ReadableStream
```

**Client hook:** `useFetchSSE<T>(url, enabled, onMessage, onFinishStreaming)` from `src/services/apis/common/use-fetch-sse.ts`

Returns `{ streamingStatus }` — `NOT_STARTED | IN_PROGRESS | FINISH`

**Use case:** Real-time booking/seat status updates during payment flows.

---

## 14. Middleware Deep-Dive (Now Proxy)

`src/proxy.ts` (formerly `src/middleware.ts` in Next.js 14) runs on every non-API, non-static request. In Next.js 16+, middleware is renamed to `proxy` with the function renamed from `middleware()` to `proxy()`.

### Execution Flow

```
Incoming Request
    │
    ├── Skip if: /_next/*, /api/*, static files (.*)
    │
    ▼ INTERNATIONAL_ROUTING_ENABLED?
    │
    ├── true: i18n Prefixed Routing
    │   │ 1. Check cookie (i18next) for language
    │   │ 2. Check Accept-Language header
    │   │ 3. Fallback: vi (default)
    │   │ 4. If URL lacks lang prefix → redirect to /{lang}/path
    │   └── NextResponse.redirect(/{lang}/path)
    │
    └── false (default): Cookie-Only Routing
        │ 1. If URL has /en/ or /vi/ prefix
        │ 2. Strip prefix → redirect to /path (no lang in URL)
        └── NextResponse.redirect(/path)
```

### Key Details

- **Skip conditions:** `/_next`, `/api/`, files with extensions (`.js`, `.css`, `.png`, etc.)
- **Language detection (prefixed mode):** Cookie `i18next` → `Accept-Language` header → `vi`
- **Supported languages:** Defined in `src/services/i18n/config.ts` (`languages` array)
- **No auth guard in middleware** — auth is handled by `AppAuthInitializer` + React Query at the component level

---

## 15. Build & Deployment

```
Development:    npm run dev          → localhost:3001 (Turbopack by default)
Type check:     npm run ts
Lint:           npm run lint (external ESLint)
Format:         npm run format

Production:     npm run build        → .next/standalone
UAT:            npm run build:uat    → uses .env.uat
Start:          npm run start        → Node standalone server

Post-build:
    ├── next-sitemap → public/sitemap.xml
    └── Copy public/ + static/ to standalone output
```

**Turbopack:** Next.js 16 uses Turbopack as the default bundler in dev mode (replaces Webpack). For production builds, Next.js still uses its optimized Webpack build, but dev-time compilation is significantly faster (50-100x faster for large projects).

### Standalone Server Output

`next.config.js` uses `output: "standalone"` — the build produces a self-contained Node.js server that can be deployed without `node_modules`.

```
.next/standalone/
├── server.js           # Entry point
├── .next/              # Compiled app
└── node_modules/       # Only required runtime deps
```

---

Previous: [Project Overview](project-overview-pdr.md)
Next: [Code Standards](code-standards.md)
