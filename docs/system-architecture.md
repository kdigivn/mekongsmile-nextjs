# System Architecture

> Technical architecture for ferry-frontend (Next.js 14 App Router)

**Last Updated:** 2026-03-10

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
│              Next.js App (ferry-frontend)            │
│  ┌─────────────────────────────────────────────┐    │
│  │         App Router (src/app/)               │    │
│  │   Pages · API Routes (BFF) · Layouts        │    │
│  └──────────────┬───────────────────────────   │    │
│                 │                               │    │
│  ┌──────────────▼───────────────────────────   │    │
│  │         Services Layer (src/services/)      │    │
│  │   API hooks · Auth · i18n · React Query     │    │
│  └──────────────┬───────────────────────────   │    │
└─────────────────┼───────────────────────────────────┘
                  │ HTTP (server-side)
      ┌───────────┼───────────────┐
      ▼           ▼               ▼
┌──────────┐ ┌──────────┐ ┌──────────────┐
│ Backend  │ │WordPress │ │  Meilisearch │
│ REST API │ │ GraphQL  │ │    Search    │
└──────────┘ └──────────┘ └──────────────┘
```

## 2. Folder Structure

```
src/
├── app/                    # Next.js App Router root
│   ├── (language)/         # Route group — adds [lang] prefix if enabled
│   │   ├── layout.tsx      # Shared layout (header, footer, providers)
│   │   ├── page.tsx        # Home page (ISR)
│   │   ├── schedules/      # Schedule search pages
│   │   ├── ticket-detail/  # Booking form (CSR, auth required)
│   │   ├── booking/[id]/   # Booking detail + payment
│   │   ├── sign-in/        # Login page
│   │   ├── sign-up/        # Registration page
│   │   ├── user/           # User-specific pages (auth required)
│   │   ├── profile/        # Profile edit
│   │   ├── transactions/   # Transaction history
│   │   ├── payment-gateway/# Payment result pages
│   │   └── [...slug]/      # Dynamic CMS pages (WordPress)
│   ├── api/                # API route handlers (BFF layer)
│   │   ├── auth/           # Auth endpoints (login, register, refresh)
│   │   ├── payments/       # Payment gateway endpoints
│   │   ├── ai/             # AI integrations (ID card scan)
│   │   ├── [...path]/      # Generic backend proxy
│   │   └── sse/[...path]/  # Server-sent events proxy
│   ├── layout.tsx          # Root layout (Sentry, theme init)
│   └── globals.css         # Global CSS reset + Tailwind base
│
├── components/             # Reusable UI components
│   ├── ui/                 # Radix UI + Tailwind primitives
│   ├── form-elements/      # Form input wrappers
│   ├── cards/              # Card components
│   ├── dialog/             # Dialog/modal components
│   ├── modals/             # Large feature modals
│   ├── chip/               # Status chips/badges
│   └── [feature]/          # Domain-specific components
│
├── services/               # Business logic + external integrations
│   ├── apis/               # API service hooks (per domain)
│   ├── auth/               # Auth context + provider
│   ├── i18n/               # i18n config + hooks
│   ├── react-query/        # QueryProvider + key factory
│   ├── infrastructure/     # External: WordPress, Meilisearch
│   └── social-auth/        # Google/Facebook OAuth providers
│
├── hooks/                  # Generic custom React hooks
├── lib/                    # Utility functions (utils.ts, etc.)
├── views/                  # Page-level view components
│   └── [domain]/           # homepage, blog, schedule, error, etc.
├── server-actions/         # Next.js server actions (getJWT, check, logout)
└── middleware.ts           # i18n routing + auth guard
```

## 3. Page / Route Inventory

### Customer Pages

| Route | Rendering | Auth | Description |
|-------|-----------|------|-------------|
| `/` | ISR | No | Home — hero, schedule search, blog preview, operators |
| `/schedules` | SSR | No | Route overview |
| `/schedules/[route_def]` | SSR | No | Voyage search by route & date |
| `/ticket-detail` | CSR | Yes | Booking form: passengers, seats, summary |
| `/booking/[id]` | CSR | Yes | Booking confirmation + payment |
| `/booking/[id]/issue-ticket` | CSR | Yes | Ticket issuance |
| `/booking/[id]/check-issue-ticket` | CSR | Yes | Issue status check |
| `/sign-in` | CSR | No | Login |
| `/sign-up` | CSR | No | Register |
| `/confirm-email` | CSR | No | Email OTP confirmation |
| `/forgot-password` | CSR | No | Password reset request |
| `/password-change` | CSR | Yes | Change password |
| `/profile` | CSR | Yes | Edit user profile |
| `/user/bookings` | CSR | Yes | Booking history |
| `/user/bookings/[id]` | CSR | Yes | Booking detail |
| `/user/cancel-ticket-request` | CSR | Yes | Cancel requests |
| `/transactions` | CSR | Yes | Transaction history |
| `/payment-gateway/onepay` | CSR | Yes | OnePay gateway |
| `/payment-gateway/onepay/transaction-result` | CSR | Yes | OnePay result |
| `/payment-gateway/banking` | CSR | Yes | SMS banking |
| `/payment-gateway/offline` | CSR | Yes | Offline payment info |
| `/[...slug]` | ISR | No | Dynamic CMS pages (WordPress) |

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
WordPress (GraphQL API)
    │
    ▼ src/services/infrastructure/wordpress/
    getMenuItemsByLocation()    → Navigation menus
    getHighLightPosts()         → Featured blog posts
    getLogo()                   → Site branding
    getEnvWebsiteSettings()     → Site configuration (name, social, etc.)
    getSEO()                    → Yoast SEO metadata per page
    │
    ▼ Consumed in:
    Root layout (menus, logo, settings) — server-side on every request
    [...slug] pages (ISR) — dynamic CMS pages
    Blog/product pages (ISR)

Note: Root layout uses Promise.all with per-item catch — CMS failures return null.
ResponsiveAppBar and Footer render conditionally; null CMS data does not crash the page.
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

## 14. Middleware Deep-Dive

`src/middleware.ts` runs on every non-API, non-static request.

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
Development:    npm run dev          → localhost:3001
Type check:     npm run ts
Lint:           npm run lint
Format:         npm run format

Production:     npm run build        → .next/standalone
UAT:            npm run build:uat    → uses .env.uat
Start:          npm run start        → Node standalone server

Post-build:
    ├── next-sitemap → public/sitemap.xml
    └── Copy public/ + static/ to standalone output
```

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
