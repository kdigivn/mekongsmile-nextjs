# Architecture

> Folder structure and routing overview for ferry-frontend (Next.js 14 App Router).
> For full architecture detail, see [system-architecture.md](system-architecture.md).

## Folder Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (language)/             # Route group — optional [lang] prefix
│   │   ├── layout.tsx          # Shared layout (AppBar, Footer, Providers)
│   │   ├── page.tsx            # Home page
│   │   ├── schedules/          # Ferry schedule search
│   │   ├── ticket-detail/      # Booking form (passengers, seats)
│   │   ├── booking/[id]/       # Booking confirmation + payment
│   │   ├── sign-in/            # Login page
│   │   ├── sign-up/            # Registration page
│   │   ├── confirm-email/      # Email OTP confirmation
│   │   ├── forgot-password/    # Password reset request
│   │   ├── password-change/    # Change password
│   │   ├── profile/            # User profile edit
│   │   ├── user/bookings/      # Booking history
│   │   ├── transactions/       # Transaction history
│   │   ├── payment-gateway/    # Payment result pages
│   │   └── [...slug]/          # Dynamic CMS pages (WordPress)
│   ├── api/                    # BFF API route handlers
│   │   ├── auth/               # Auth endpoints (login, register, refresh)
│   │   ├── payments/           # Payment gateway endpoints
│   │   ├── ai/                 # AI integrations (ID card OCR)
│   │   ├── [...path]/          # Generic backend proxy
│   │   └── sse/[...path]/      # Server-sent events proxy
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global CSS
│
├── components/                 # Reusable UI components
│   ├── ui/                     # Radix UI + Tailwind primitives (shadcn/ui pattern)
│   ├── form-elements/          # Form input wrappers (react-hook-form compatible)
│   ├── cards/                  # Card components (voyage, booking, transaction)
│   ├── dialog/                 # Dialog wrappers
│   ├── modals/                 # Feature modals (seat picker, payment, passenger)
│   ├── chip/                   # Status chips and badges
│   ├── app-bar.tsx             # Top navigation bar
│   ├── footer/                 # Site footer
│   └── [feature]/              # Domain-specific component groups
│
├── services/                   # Business logic and external integrations
│   ├── apis/                   # API service hooks (one subfolder per domain)
│   │   ├── auth/               # Auth API hooks
│   │   ├── bookings/           # Booking CRUD hooks
│   │   ├── voyages/            # Voyage search hooks
│   │   ├── payments/           # Payment hooks
│   │   ├── passengers/         # Passenger management hooks
│   │   ├── customers/          # Customer profile hooks
│   │   └── [domain]/           # Other domain services
│   ├── auth/                   # Auth context + useAuth() hook
│   ├── i18n/                   # i18n config, hooks, server helpers
│   ├── react-query/            # QueryProvider + query key factory
│   ├── infrastructure/         # WordPress GraphQL, Meilisearch
│   └── social-auth/            # Google + Facebook OAuth providers
│
├── hooks/                      # Generic utility hooks
│   ├── use-boolean.ts
│   ├── use-check-screen-type.ts
│   ├── use-copy-to-clipboard.ts
│   ├── use-debounce.ts
│   ├── use-keyboard.ts
│   ├── use-recaptcha.ts
│   └── useWindowDimensions.ts
│
├── lib/                        # Pure utility functions (no React)
│   ├── utils.ts                # Core utilities (cn, formatCurrency, etc.)
│   ├── get-ticket-status.ts
│   ├── clickBaitUtil.ts
│   ├── countries.ts
│   ├── provinces.ts
│   └── key-codes.ts
│
├── views/                      # Page-level view components
│   ├── homepage/               # Home page sections
│   ├── blog/                   # Blog listing view
│   ├── post/                   # Post detail view
│   ├── product/                # Product page view
│   ├── list/                   # Generic list view
│   ├── list-with-table/        # Tabular list view
│   ├── schedule/               # Voyage schedule view
│   └── error/                  # 404/500 error views
│
└── server-actions/             # Next.js server actions (auth/cookie ops)
    ├── get-jwt.ts              # Read JWT cookie
    ├── check.ts                # Verify auth status
    └── logout.ts               # Clear session, redirect
```

## Page Pattern

Every page follows a two-file pattern separating server and client concerns:

```
src/app/(language)/[page]/
├── page.tsx          # Server Component — metadata, initial data fetch, auth check
└── page-content.tsx  # Client Component — interactive UI with React Query
```

## Routing

The `(language)` route group supports optional language prefix routing:

| Mode | `INTERNATIONAL_ROUTING_ENABLED` | URL |
|------|-------------------------------|-----|
| Prefixed | `true` | `/en/schedules`, `/vi/schedules` |
| Cookie-only | `false` (default) | `/schedules` |

Language detection order: URL prefix → cookie (`i18next`) → `Accept-Language` header → default (`vi`).

## API Routes (BFF)

All browser API calls go through Next.js API routes — never directly to the backend. The BFF layer:
- Reads the JWT from HTTP-only cookies and injects it as `Authorization: Bearer <token>`
- Hides backend credentials from the browser
- Handles CORS and request transformation

See [system-architecture.md](system-architecture.md) for the full data flow diagram.

---

Previous: [Installing and Running](installing-and-running.md)

Next: [Auth](auth.md)
