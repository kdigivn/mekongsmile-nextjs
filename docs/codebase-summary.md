# Codebase Summary

> Quick reference for AI agents and new developers on mekongsmile.com tour booking platform.

**Last Updated:** 2026-03-19
**Project:** mekongsmile.com (Next.js 16 + React 19 + WordPress + Tour Booking)
**Status:** Phases 1-8, 10-11 complete. Phase 9 (booking engine) deferred. Upgraded to Next.js 16 (2026-03-19).

## Table of Contents

- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Components Catalog](#components-catalog)
- [Custom Hooks Catalog](#custom-hooks-catalog-srchooks)
- [Services Catalog](#services-catalog)
- [Views Catalog](#views-catalog-srcviews)
- [Server Actions](#server-actions-srcserver-actions)
- [API Routes — BFF](#api-routes--bff-srcappapi)
- [Key Utilities](#key-utilities-srclib)
- [Key Config Files](#key-config-files)

## Tech Stack

| Category | Library | Version |
|----------|---------|---------|
| Framework | Next.js | 16.2.0 |
| Runtime | React | 19.2.4 |
| Language | TypeScript | 5.5+ |
| Styling | Tailwind CSS | 3.4+ |
| UI Components | @heroui/react | 2.7.6 |
| UI Primitives | @radix-ui/* | 1.x |
| Server State | @tanstack/react-query | 5.80.6 |
| Forms | react-hook-form | 7.57.0 |
| Validation | yup | 1.6.1 |
| i18n | i18next + react-i18next | 23.16.8 |
| Animation | motion | 12.38.0 |
| Date Picker | react-day-picker | 9.14.0 |
| GraphQL | @apollo/client | 4.1.6 |
| Auth (social) | @react-oauth/google | 0.13.4 |
| Maps | leaflet | 1.9.4 |
| Testing | cypress | 13.6.2 |
| Notifications | sonner | 2.0.3 |
| Icons | react-icons | 5.5.0 |

## Folder Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (language)/               # Locale routing group (en/vi/zh)
│   │   ├── page.tsx              # Homepage (ISR 60s)
│   │   ├── tours/                # Tour listing (ISR) + [slug]/ detail (SSG)
│   │   ├── destination/[slug]/   # Destination pages (SSG)
│   │   ├── blog/                 # Blog listing (ISR) + [slug]/ post detail (SSG)
│   │   ├── news/                 # News category (ISR) + [slug]/ post detail (SSG)
│   │   ├── about-us/             # Static page (ISR)
│   │   ├── contact-us/           # Contact page (ISR)
│   │   ├── sign-in/ & sign-up/   # Auth pages (CSR)
│   │   ├── user/                 # Account pages (auth required, CSR)
│   │   │   ├── profile/
│   │   │   └── bookings/         # Phase 9 deferred
│   │   └── [...slug]/            # Dynamic CMS pages (ISR)
│   ├── api/                      # BFF routes
│   │   ├── auth/                 # Login, register, refresh
│   │   └── [..path]/             # Generic backend proxy
│   ├── sitemap.ts                # Dynamic XML sitemaps
│   ├── robots.ts                 # robots.txt
│   ├── layout.tsx                # Root layout (Sentry, providers)
│   └── globals.css
│
├── components/                   # Reusable UI
│   ├── ui/                       # Radix + Tailwind primitives (25+ components)
│   ├── form-elements/            # Form field wrappers
│   ├── app-bar.tsx               # Header navigation
│   ├── footer/                   # Footer with menus + contact
│   └── [feature]/                # Domain-specific components
│
├── hooks/                        # Custom React hooks (8 hooks)
├── lib/                          # Utilities
│   ├── utils.ts                  # Barrel export
│   ├── utils/                    # Modular utilities (format, date, string, etc.)
│   └── cms-html-sanitizer.ts     # XSS prevention
│
├── services/                     # Business Logic
│   ├── wordpress/                # WPGraphQL service layer (6 services)
│   ├── auth/                     # Auth context + JWT
│   ├── i18n/                     # i18next (en/vi/zh)
│   ├── react-query/              # QueryProvider + keys
│   └── social-auth/              # Google OAuth
│
├── graphql/                      # WPGraphQL Integration
│   ├── client.ts                 # fetchGraphQL() + Apollo
│   ├── types.ts                  # All TS interfaces
│   ├── queries/                  # Query definitions
│   │   ├── tours/
│   │   ├── blog/
│   │   ├── taxonomies/
│   │   └── site/
│   └── fragments/                # Shared fragments
│
├── views/                        # Page-level Components
│   ├── homepage/                 # Hero, featured tours, blog
│   ├── tour/                     # Tour card, listing, detail, filters
│   ├── blog/                     # Blog listing, post detail
│   ├── destination/              # Destination archive
│   └── page/                     # Generic CMS page renderer
│
├── server-actions/               # Server-only functions
└── proxy.ts                      # i18n routing + locale detection (Next.js 16+)
```

---

## Components Catalog

### UI Primitives (`src/components/ui/`)

Core building blocks — wrap Radix UI with Tailwind styling.

| Component | File | Purpose |
|-----------|------|---------|
| `Button` | `button.tsx` | CTA buttons with variants (default, outline, ghost, destructive) |
| `Input` | `input.tsx` | Text input base |
| `Card` | `card.tsx` | Card container with header/content/footer |
| `Dialog` | `dialog.tsx` | Modal dialog (Radix Dialog) |
| `Drawer` | `drawer.tsx` | Bottom drawer (vaul — mobile-friendly modal) |
| `Popover` | `popover.tsx` | Floating panel (Radix Popover) |
| `Select` | `select.tsx` | Dropdown select (Radix Select) |
| `Combobox` | `combobox.tsx` | Searchable select |
| `Checkbox` | `checkbox.tsx` | Checkbox input (Radix Checkbox) |
| `RadioGroup` | `radio-group.tsx` | Radio button group |
| `Tabs` | `tabs.tsx` | Tab navigation (Radix Tabs) |
| `Accordion` | `accordion.tsx` | Collapsible sections |
| `Collapsible` | `collapsible.tsx` | Single collapsible panel |
| `Separator` | `separator.tsx` | Horizontal/vertical divider |
| `ScrollArea` | `scroll-area.tsx` | Custom scrollbar |
| `Slider` | `slider.tsx` | Range slider |
| `Toggle` | `toggle.tsx` | Toggle button |
| `Tooltip` | `tooltip.tsx` | Hover tooltip |
| `DropdownMenu` | `dropdown-menu.tsx` | Contextual dropdown |
| `NavigationMenu` | `navigation-menu.tsx` | Nav menu with submenus |
| `AlertDialog` | `alert-dialog.tsx` | Confirmation dialog |
| `Label` | `label.tsx` | Form label |
| `Avatar` | `avatar.tsx` | User avatar with fallback |
| `Badge` | `badge.tsx` | Status badge/pill |
| `Skeleton` | `skeleton.tsx` | Loading placeholder |
| `Calendar` | `calendar.tsx` | Date picker calendar (react-day-picker) |
| `Command` | `command.tsx` | Command palette (cmdk) |
| `Sheet` | `sheet.tsx` | Side sheet/panel |
| `Table` | `table.tsx` | HTML table wrapper |
| `Textarea` | `textarea.tsx` | Multi-line text input |

### Form Elements (`src/components/form-elements/`)

Wrappers around UI primitives with label, error, and react-hook-form integration.

| Component | Purpose |
|-----------|---------|
| `FormTextInput` | Text field with label + error |
| `FormSelect` | Select with label + error |
| `FormDatePicker` | Date picker with label + error |
| `FormPhoneInput` | Phone number input with country code |
| `FormCheckbox` | Checkbox with label |
| `FormRadioGroup` | Radio group with options |
| `FormTextarea` | Textarea with label + error |

### Layout Components

| Component | File | Purpose |
|-----------|------|---------|
| `AppBar` | `components/app-bar.tsx` | Top navigation bar (logo, nav, user menu, language switch) |
| `Footer` | `components/footer/` | Site footer (links, contact, social) |
| `MobileBottomNav` | `components/mobile-bottom-nav/` | Mobile tab bar (hidden on desktop) |
| `Breadcrumbs` | `components/breadcrumbs/` | Page navigation breadcrumb trail |

### Auth Components

| Component | File | Purpose |
|-----------|------|---------|
| `AppAuthInitializer` | `components/app-auth-initializer.tsx` | Syncs server JWT to client React Query headers |
| `QuickLoginModal` | `components/modals/quick-login-modal/` | Inline login modal during checkout |
| `QuickSignUpModal` | `components/modals/quick-sign-up-modal/` | Inline register modal during checkout |

### Tour Components

| Component | Purpose |
|-----------|---------|
| `TourCard` | Tour listing card (image, title, duration, price, destination) |
| `TourDetailView` | Tour detail page layout (gallery, info, FAQ, includes/excludes, booking CTA) |
| `TourFilterBar` | Filter sidebar (destination, type, travel style, search) |
| `TourGallery` | Image gallery (hero + thumbnails) |
| `TourFaqSection` | FAQ accordion from ACF repeater field |
| `TourIncludesSection` | Included/excluded items lists |
| `TourMeetingSection` | Pickup point + Google Maps link |
| `TourPricingSection` | Price display (USD/VND) |

### Blog Components

| Component | Purpose |
|-----------|---------|
| `PostCard` | Blog post preview card (image, title, excerpt, date) |
| `BlogView` | Blog listing + pagination |
| `PostDetailView` | Full blog post (content, comments, ratings, related posts) |
| `CommentsSection` | WordPress comment submission + display |
| `RatingSection` | Star rating system |

### Destination Components

| Component | Purpose |
|-----------|---------|
| `DestinationView` | Destination archive (related tours + blog posts) |

### Other Card Components

| Component | Purpose |
|-----------|---------|
| `UserBookingCard` | Booking list item (Phase 9) |
| `TransactionCard` | Transaction history item (Phase 9) |


### Utility Components

| Component | Purpose |
|-----------|---------|
| `ErrorContent` | Error message display with retry option |
| `FullPageLoader` | Full-screen loading overlay |
| `LinkBase` | Next.js Link wrapper with locale support |
| `HeadingBase` | Semantic heading with responsive sizing |
| `CopyButton` | Copy-to-clipboard with feedback |
| `BackToTop` | Scroll-to-top floating button |
| `Map` | Leaflet map wrapper (tour meeting points) |
| `PageTracker` | GA4 pageview tracker |
| `GoogleTranslate` | Google Translate widget embed |

---

## Custom Hooks Catalog (`src/hooks/`)

| Hook | Signature | Returns | Purpose |
|------|-----------|---------|---------|
| `useBoolean` | `(initial?: boolean)` | `{ value, toggle, setTrue, setFalse }` | Boolean state with named actions |
| `useCheckScreenType` | `()` | `{ isMobile, isTablet, isDesktop }` | Responsive breakpoint detection |
| `useCopyToClipboard` | `()` | `{ copy(text), copied }` | Clipboard write with success state |
| `useDebounce` | `<T>(value: T, delay: number)` | `T` | Debounced value (search inputs, filters) |
| `useHighlightActiveHeading` | `()` | `void` | Highlights active heading on scroll (ToC) |
| `useKeyboard` | `(keys: string[])` | `{ isPressed }` | Keyboard shortcut detection |
| `useRecaptcha` | `()` | `{ token, verify, reset }` | Google reCAPTCHA v2 integration |
| `useWindowDimensions` | `()` | `{ width, height }` | Window size with resize listener |

---

## Services Catalog

### Auth Service (`src/services/auth/`)

| Export | Purpose | Status |
|--------|---------|--------|
| `AuthProvider` | React context provider — wraps app, manages JWT session | Simplified |
| `useAuth()` | Hook — `{ user, isAuthenticated, login, logout, isLoading }` | Simplified |
| `GoogleAuthProvider` | Google OAuth provider | Active |

### API Services (`src/services/apis/`)

All API hooks use React Query internally. Pattern: `use[Verb][Resource]()`.

#### Authentication (`apis/auth/`)
| Hook | Purpose |
|------|---------|
| `useAuthLoginService()` | Email + password login |
| `useEmailCheckService()` | Check if email exists in org |
| `useGoogleLoginService()` | Google OAuth login |
| `useFacebookLoginService()` | Facebook OAuth login |
| `useAuthRegisterService()` | Email registration |
| `useAuthRegisterWithEmailOtpService()` | OTP-based registration |
| `useConfirmEmailService()` | Confirm email with OTP |
| `useResendVerifyEmailService()` | Resend OTP email |
| `useVerifyEmailOtpAndResetPasswordService()` | Verify OTP + set password |
| `useRefreshTokenService()` | Refresh JWT token |

#### Bookings (`apis/bookings/`)
| Hook | Purpose |
|------|---------|
| `usePostCreateBooking()` | Create new booking |
| `useGetBookingDetailById(id)` | Fetch single booking |
| `useGetBookingsList(params)` | Paginated booking list |
| `useUpdateBookingPassengerInfo()` | Update passengers on booking |
| `usePatchBooking()` | Partial booking update |
| `serverGetBookingById(id)` | Server-side booking fetch (server actions/RSC) |

#### Voyages (`apis/voyages/`)
| Hook | Purpose |
|------|---------|
| `useGetVoyageById(id)` | Single voyage details |
| `useGetVoyagesList(params)` | Search voyages by location + date (`staleTime: 0` — always refetches on date change) |
| `useGetVoyagesListDateRange(params)` | Voyages over date range / calendar view (`staleTime: 0`) |

#### Payments (`apis/payments/`)
| Hook | Purpose |
|------|---------|
| `useGenerateOnepayPaymentUrl()` | Generate OnePay redirect URL |
| `useVerifyOnepayTransaction()` | Verify payment result |
| `usePostSmsTransactionMessage()` | Get formatted SMS banking message |

#### Orders (`apis/orders/`)
| Hook | Purpose |
|------|---------|
| `useGetOrdersList(params)` | List orders |
| `useGetOrderDetail(id)` | Order details |
| `useConfirmOrderToIssue()` | Confirm and issue order |

#### Passengers (`apis/passengers/`)
| Hook | Purpose |
|------|---------|
| `useBatchCreatePassengers()` | Create multiple passengers |
| `useBatchUpdatePassengers()` | Update multiple passengers |
| `useGetPassengersList(params)` | List saved passengers |

#### Customers (`apis/customers/`)
| Hook | Purpose |
|------|---------|
| `useGetCustomerProfile()` | Current user profile |
| `useUpdateCustomerProfile()` | Update profile info |
| `useUploadAvatar()` | Upload profile photo |

#### Other API Services
| Service | Key Hooks |
|---------|-----------|
| `apis/locations/` | `useGetLocationsList()` |
| `apis/routes/` | `useGetRoutesList()`, `useGetRouteById(id)` |
| `apis/boatLayouts/` | `useGetBoatLayoutByVoyageId(voyageId)` |
| `apis/operators/` | `useGetOperatorsList()`, `useGetOperatorNationals()` |
| `apis/tickets/` | Ticket-related operations |
| `apis/transactions/` | `useGetTransactionsList()`, `useGetTransactionDetail()` |
| `apis/vouchers/` | `useApplyVoucher()`, `useGetVouchersList()` |
| `apis/cancel-ticket-request/` | `useCreateCancelTicketRequest()`, `useGetCancelTicketRequestsList()` |
| `apis/files/` | `useUploadFile()` |
| `apis/excel/` | `useExportToExcel()` |
| `apis/cms/` | WordPress CMS content hooks |

### Base API Utilities (`src/services/apis/`)

| Export | Purpose |
|--------|---------|
| `useFetch()` | Base fetch wrapper with auth header injection, error handling |
| `useQueryFetcher()` | React Query-aware fetcher |
| `useFetchSSE()` | Server-sent events subscription |
| `wrapperFetchJsonResponse<T>()` | Parses JSON response, handles HTTP errors; early-returns empty object on 204; returns 503 on non-JSON content-type; preserves original HTTP status code |
| `buildApiPath(path)` | Prepends `API_SERVER_PREFIX` to path |
| `endpoints` | Typed API endpoint constants |

### i18n Service (`src/services/i18n/`)

| Export | Purpose |
|--------|---------|
| `useLanguage()` | Current language string (`"vi"` or `"en"`) |
| `useStoreLanguage()` | Language Zustand store state |
| `useStoreLanguageActions()` | `{ setLanguage }` action |
| `StoreLanguageProvider` | Provider — wraps app |
| `getServerTranslation(lang, ns)` | Server-side translation loader |
| `ELanguages` | Enum: `Vietnamese = "vi"`, `English = "en"` |

### React Query (`src/services/react-query/`)

| Export | Purpose |
|--------|---------|
| `QueryProvider` | Wraps app with QueryClient (with devtools in dev, global `staleTime: 60000`) |
| `createQueryKeys(feature, keys)` | Type-safe query key factory |
| `ReactQueryDevtools` | Dev-only query inspector |

**StaleTime Overrides** — The following hooks override global `staleTime: 60000` with `staleTime: 0` to ensure fresh data for transactional operations:
- `useGetBoatLayoutFromOperator()` — Seat availability changes frequently; always refetch
- `useGetBooking()` — Payment status critical; must reflect latest confirmation
- `useAuthGetMeQuery()` — User balance/auth state; must be current during checkout

### WordPress GraphQL Service (`src/services/wordpress/`)

**Service functions wrapping WPGraphQL queries:**

| Service | Functions | Purpose |
|---------|-----------|---------|
| `tour-service.ts` | `getAllTours()`, `getTourBySlug()`, `getTourSlugs()` | Tour data queries |
| `post-service.ts` | `getAllBlogPosts()`, `getPostBySlug()`, `getNews()` | Blog + news queries |
| `page-service.ts` | `getPageBySlug()`, `getAllPages()` | Static WP pages |
| `taxonomy-service.ts` | `getAllDestinations()`, `getTourFilterOptions()` | Taxonomy data (destinations, types, styles) |
| `site-service.ts` | `getLayoutData()` | Menus + site settings in one query |
| `options-service.ts` | `getTourConstant()` | ACF Options Page data (tour constants, why choose us, etc.) |

All services use `fetchGraphQL()` from `graphql/client.ts` with proper error handling and type safety.

---

## Views Catalog (`src/views/`)

Page-level component compositions — used by `page-content.tsx` files.

| View | Domain | Main Components |
|------|--------|-----------------|
| `HomepageView` | Homepage | Hero, ScheduleSearchSection, FeaturedPosts, OperatorList, PromoBanners |
| `VoyageScheduleView` | Schedules | VoyageFilterPanel, CardVoyage list, DatePicker |
| `BlogView` | Blog | PostCard grid, Pagination |
| `BlogCategoryView` | Blog | PostCard list, Sidebar, Pagination |
| `PostDetailView` | Blog | ArticleContent, RelatedPosts, ShareButtons |
| `ProductDetailView` | Product | ProductImages, ProductInfo, RelatedProducts |
| `ProductGalleryModal` | Product | LightGallery wrapper (deferred, loads on click) |
| `ListView` | Generic | Reusable list wrapper with load-more |
| `ListWithTableView` | Generic | DataTable, column config, Pagination |
| `ErrorPageView` | Error | 404/500 error display |

---

## Server Actions (`src/server-actions/`)

| File | Export | Purpose |
|------|--------|---------|
| `get-jwt.ts` | `getJWT()` | Read `Jwt` cookie (server-only) → returns JWT string |
| `check.ts` | `check()` | Verify auth is valid → returns boolean |
| `logout.ts` | `logout()` | Clear auth cookies, redirect to home |

---

## API Routes — BFF (`src/app/api/`)

| Route | Purpose |
|-------|---------|
| `api/[...path]/route.ts` | Generic proxy — forwards all requests to backend with auth header |
| `api/auth/login/email/route.ts` | Email login |
| `api/auth/login/email/checkInOrg/route.ts` | Email existence check |
| `api/auth/login/email/confirm/route.ts` | OTP confirmation |
| `api/auth/login/email/otp/resend/route.ts` | Resend OTP |
| `api/auth/register/route.ts` | User registration |
| `api/auth/register/withEmailOTP/route.ts` | OTP registration |
| `api/auth/refresh/route.ts` | Token refresh (reads RefreshToken cookie) |
| `api/payments/onepay/generate-payment-url/route.ts` | OnePay URL generation |
| `api/payments/onepay/verify-transaction/route.ts` | Verify OnePay callback |
| `api/payments/sms-banking/get-transaction-message/route.ts` | SMS banking message |
| `api/ai/scan-id-card/route.ts` | ID card OCR via Viettel AI |
| `api/sse/[...path]/route.ts` | Server-sent events proxy |
| `api/organization/me/route.ts` | Current org settings |

---

## Key Utilities (`src/lib/`)

### Main Utils
| File | Key Exports |
|------|-------------|
| `utils.ts` | **Barrel re-export** — aggregates all utils from `src/lib/utils/` submodules |
| `cms-html-sanitizer.ts` | `sanitizeCmsHtml(html)` — server-side HTML sanitizer (prevents XSS); uses `sanitize-html` library with CMS tag allowlist; applied to all 4 CMS content render points: product detail, post detail, default page, comments |
| `scheduler-yield.ts` | `schedulerYield()` — browser main thread yielding utility; uses `scheduler.yield()` (Chrome 115+) with `setTimeout(0)` fallback for INP optimization |
| `get-ticket-status.ts` | `getTicketStatus(status)` → display label + color |
| `clickBaitUtil.ts` | `isClickbait(name)` → detect clickbait voyage names |
| `countries.ts` | `COUNTRIES` — array of `{ code, name }` |
| `provinces.ts` | `PROVINCES` — Vietnamese provinces list |
| `key-codes.ts` | `KEY_CODES` — keyboard event key constants |

### Utils Modules (`src/lib/utils/`) — Performance Phase 2
Split from monolithic `utils.ts` (627 lines) for modularity and tree-shaking:

| File | Exports |
|------|---------|
| `cn.ts` | `cn()` — Tailwind class merging via clsx + tailwind-merge |
| `format-utils.ts` | `formatCurrency()`, `formatCurrencyWithShorten()` |
| `date-utils.ts` | `calculateVoyageDuration()` |
| `seo-utils.ts` | `setSeoData()`, `getBreadcrumbFromSEO()`, `getFAQSchema()`, `isBrowser()` |
| `string-utils.ts` | `removeAccents()` |
| `booking-utils.ts` | `calculateVoucherDiscountAmount()` |
| `browser-utils.ts` | `getMobileOS()`, `isBrowser()` |
| `ui-utils.ts` | `getRouteBackgroundColor()`, UI helper utilities |

---

## Key Config Files

| File | Purpose |
|------|---------|
| `next.config.js` | App config: `output: "standalone"`, Sentry, image domains, redirects |
| `tailwind.config.ts` | Theme colors, plugins (heroui, tailwindcss-animate), container |
| `tsconfig.json` | Path alias `@/*` → `./src/*`, strict mode, target ES6 |
| `example.env` | Template for all environment variables |
| `sentry.client.config.ts` | Client-side Sentry (replays, traces) |
| `sentry.server.config.ts` | Server-side Sentry |
| `sentry.edge.config.ts` | Edge runtime Sentry |
| `cypress.config.ts` | E2E test config (baseUrl, viewport, tasks) |
| `components.json` | shadcn/ui CLI config (aliases, style, Tailwind) |
| `next-sitemap.config.js` | Sitemap generation config |

---

Previous: [Design Guidelines](design-guidelines.md)
Next: [Auth](auth.md)
