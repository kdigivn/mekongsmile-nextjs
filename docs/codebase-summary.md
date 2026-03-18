# Codebase Summary

> Quick reference for AI agents and new developers. Find files, components, hooks, and services without searching.

**Last Updated:** 2026-03-10

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
| Framework | Next.js | 14.2.29 |
| Language | TypeScript | 5.5.4 |
| Styling | Tailwind CSS | 3.4.17 |
| UI Components | @heroui/react | 2.7.6 |
| UI Primitives | @radix-ui/* | 1.x |
| Server State | @tanstack/react-query | 5.80.6 |
| Forms | react-hook-form | 7.57.0 |
| Validation | yup | 1.6.1 |
| i18n | i18next + react-i18next | 23.16.8 |
| Animation | framer-motion | 11.18.2 |
| Search | meilisearch | 0.50.0 |
| Auth (social) | @react-oauth/google | 0.12.1 |
| Maps | leaflet | 1.9.4 |
| Error Tracking | @sentry/nextjs | 9.28.1 |
| Testing | cypress | 13.6.2 |
| Notifications | sonner | 2.0.3 |
| Icons | react-icons | 5.5.0 |

## Folder Structure

```
src/
├── app/                   # Next.js App Router
│   ├── (language)/        # Route group (optional lang prefix)
│   └── api/               # BFF API routes
├── components/            # Reusable UI components
│   ├── ui/                # Radix + Tailwind primitives
│   └── form-elements/     # Form input wrappers
├── hooks/                 # Generic utility hooks
├── lib/                   # Pure utility functions
├── services/              # Business logic layer
│   ├── apis/              # API service hooks (per domain)
│   ├── auth/              # Auth context & provider
│   ├── i18n/              # i18n config & hooks
│   ├── react-query/       # QueryProvider & key factory
│   └── infrastructure/    # WordPress, Meilisearch integrations
├── views/                 # Page-level view components
└── server-actions/        # Server-only actions (auth/cookie ops)
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

### Booking & Schedule Components

| Component | File | Purpose |
|-----------|------|---------|
| `CardVoyage` | `components/cards/card-voyage/` | Voyage listing card (price, time, operator) |
| `VoyageDetailCard` | `components/cards/voyage-detail-card/` | Expanded voyage info |
| `BoatLayoutTabs` | `components/modals/boat-layout-tabs/` | Visual seat map with tabs per deck |
| `SeatLegend` | `components/chip/seat-legend/` | Seat type color legend |
| `SeatLegendFixedLabel` | `components/chip/` | Floating legend overlay |
| `CheckVoyageSeatsModal` | `components/modals/check-voyage-seats/` | Check seat availability |

### Seat Selection Components

| Component | Purpose |
|-----------|---------|
| `ChooseSeatModal` | Full-screen seat picker (mobile drawer / desktop modal) |
| `SelectedSeatSection` | Summary of chosen seats |
| `SelectedSeat` | Individual selected seat chip |

### Passenger Components

| Component | Purpose |
|-----------|---------|
| `PassengerForms` | Multi-passenger form (repeating section per passenger) |
| `PassengerFormInputs` | Type-specific fields (adult, child, infant) |
| `UpdatePassengerDialog` | Edit saved passenger dialog |
| `ImportPassengersModal` | Bulk import passengers from CSV/saved list |

### Payment Components

| Component | Purpose |
|-----------|---------|
| `PaymentMethodModal` | Select payment method (OnePay, banking, offline) |
| `PaymentModal` | Payment processing status modal |
| `PriceDetailDialog` | Itemized price breakdown popup |
| `BankAppDrawer` | Bank app deep link selector (for SMS banking) |
| `TopUpDialog` | Account credit top-up dialog |

### Voucher Components

| Component | Purpose |
|-----------|---------|
| `ApplyVoucherPopover` | Promo code input popover |
| `ListVoucher` | Grid of available vouchers |
| `ShowSuggestionVoucherDialog` | Auto-suggest applicable vouchers |

### Export Components

| Component | Purpose |
|-----------|---------|
| `ExportVATForm` | VAT invoice request form |
| `ExportPassengerModal` | Export passenger list (CSV/Excel) |
| `ConfirmExportTicketModal` | Confirm before bulk ticket export |
| `ResultExportTicketModal` | Show export result / download link |

### Card Components

| Component | Purpose |
|-----------|---------|
| `UserBookingCard` | Booking list item (status, route, date) |
| `TransactionCard` | Transaction history item |
| `CancelTicketRequestCard` | Cancellation request status card |
| `PostCard` | Blog post preview card |

### Promo & Route Modals

| Component | Purpose |
|-----------|---------|
| `ModalRouteForVietnamese` | Route selection modal for Vietnamese domestic routes |
| `PromoExpiredModal` | Notification when applied promo code has expired |

### Utility Components

| Component | Purpose |
|-----------|---------|
| `CountDown` | Timer countdown (payment timeout) |
| `ErrorContent` | Error message display with retry option |
| `FullPageLoader` | Full-screen loading overlay |
| `LinkBase` | Next.js Link wrapper with locale support |
| `HeadingBase` | Semantic heading with responsive sizing |
| `CopyButton` | Copy-to-clipboard with feedback |
| `BackToTop` | Scroll-to-top floating button |
| `Map` | Leaflet map wrapper (pickup locations) |
| `HtmlToImage` | Renders DOM node as downloadable image |
| `GoogleTranslate` | Google Translate widget embed |
| `PageTracker` | GA4 pageview tracker |
| `BigCalendar` | `react-big-calendar` wrapper for voyage calendar view |

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

| Export | Purpose |
|--------|---------|
| `AuthProvider` | React context provider — wraps app, manages session |
| `useAuth()` | Hook — `{ user, isAuthenticated, login, logout, isLoading }` |

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

### Infrastructure Services

#### WordPress (`src/services/infrastructure/wordpress/`)
| Function | Purpose |
|----------|---------|
| `getMenuItemsByLocation(location)` | Fetch nav menu from WP |
| `getHighLightPosts()` | Featured blog posts |
| `getLogo()` | Site logo URL |
| `getEnvWebsiteSettings()` | Site name, social links, contact |
| `getSEOBySlug(slug)` | Yoast SEO data for CMS pages |

#### Meilisearch (`src/services/infrastructure/meilisearch/`)
- Search client configured with host + API key from env
- Used by search dialog for instant full-text search
- `wordpress-indexing.service.ts` — batched document indexer; `beforeExit` handler flushes remaining buffer on Node.js shutdown

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
