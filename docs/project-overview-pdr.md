# Project Overview — Ferry Ticket Booking Frontend

> Product Design Requirements (PDR) for ferry-frontend

**Last Updated:** 2026-03-03

## Table of Contents

- [1. Project Summary](#1-project-summary)
- [2. Business Context](#2-business-context)
- [3. Core Features](#3-core-features)
- [4. User Flows](#4-user-flows)
- [5. Tech Stack Summary](#5-tech-stack-summary)
- [6. External Integrations](#6-external-integrations)
- [7. Non-Functional Requirements](#7-non-functional-requirements)
- [8. Target Platforms](#8-target-platforms)

## 1. Project Summary

**ferry-frontend** is a Next.js 14 web application for booking ferry tickets in Vietnam. It serves as the customer-facing frontend and operator admin interface for a multi-organization ferry booking platform.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · React Query v5 · i18next

## 2. Business Context

Vietnamese ferry services connect mainland ports to islands (Condao, Phuquoc, Mekong Delta routes). Customers need a convenient online booking platform to:
- Search available voyages by route and date
- Select seats and enter passenger information
- Pay via local payment gateways (OnePay, SMS banking, offline transfer)
- Manage bookings, cancel requests, and download VAT invoices

The platform supports **multiple ferry operators** (multi-tenant) with brand-specific themes.

## 3. Core Features

### Customer Features
| Feature | Description |
|---------|-------------|
| Schedule Search | Search voyages by origin, destination, date; filter by operator/class |
| Seat Selection | Visual boat layout with seat status (available, booked, eco, vip, business, president) |
| Passenger Management | Multi-passenger forms with ID card OCR (Viettel AI) |
| Booking Management | View history, check status, download tickets |
| Payment | OnePay (card/bank), SMS banking, offline transfer |
| Vouchers | Apply promo codes, auto-suggest applicable vouchers |
| VAT Invoice | Export VAT receipts for corporate bookings |
| Cancel Requests | Submit and track cancellation requests |
| Ticket Export | Download/email ticket PDFs |

### Authentication
| Method | Description |
|--------|-------------|
| Email + OTP | Register via email with OTP verification |
| Email + Password | Login with existing credentials |
| Google OAuth | One-click Google login |
| Facebook OAuth | Optional Facebook login |

### Content & SEO
- WordPress CMS integration (GraphQL) — travel guides, blog posts, product pages, static pages
- Dynamic CMS pages via `[...slug]` catch-all route
- ISR (Incremental Static Regeneration) for content pages
- Sitemap auto-generation (next-sitemap)
- Meilisearch full-text search integration

## 4. User Flows

### Booking Flow
```
Home → Search Schedules → Select Voyage → Enter Passengers → Choose Seat →
Review Summary → Choose Payment → Complete Payment → View Booking Confirmation
```

### Auth Flow
```
Email Check → (New user) Register with OTP → Login →
Session via HTTP-only JWT cookie → Token refresh on expiry
```

### Cancel Flow
```
Booking Detail → Request Cancellation → Confirmation → Admin Review → Refund
```

## 5. Tech Stack Summary

| Category | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 14 App Router | SSR/ISR, file-based routing, React Server Components |
| Language | TypeScript 5.5 | Type safety, better DX |
| Styling | Tailwind CSS 3 + HeroUI | Rapid UI development, design tokens |
| State | TanStack Query v5 | Server state caching, background refresh |
| Forms | React Hook Form + Yup | Performant forms, schema validation |
| i18n | i18next + react-i18next | Multi-language (vi/en) |
| Auth | Custom JWT + HTTP-only cookies | Security, server-side token handling |
| Monitoring | Sentry | Error tracking, session replay |
| Testing | Cypress E2E | End-to-end test automation |
| Search | Meilisearch | Fast full-text search |
| CMS | WordPress GraphQL | Flexible content management |

## 6. External Integrations

| Integration | Purpose |
|-------------|---------|
| **Backend REST API** | Core business data (bookings, voyages, passengers) via BFF proxy |
| **WordPress CMS** | Blog posts, travel guides, menus, SEO data |
| **OnePay** | Card and bank transfer payment gateway |
| **SMS Banking** | Vietnamese bank SMS payment |
| **Google OAuth** | Social authentication |
| **Facebook OAuth** | Social authentication (optional) |
| **Viettel AI** | ID card OCR for passenger autofill |
| **Meilisearch** | Full-text search index |
| **Google Analytics 4** | Web analytics |
| **Sentry** | Error tracking & performance monitoring |
| **Google reCAPTCHA v2** | Bot prevention on auth forms |
| **Leaflet Maps** | Route/pickup location maps |

## 7. Non-Functional Requirements

### Performance
- ISR for static content (home, blog, CMS pages) — fast TTFB
- React Query stale-while-revalidate for dynamic data
- Image optimization via Next.js Image + sharp
- Lazy loading for below-fold components
- Bundle analysis via `npm run build:analyze`

### SEO
- Server-rendered metadata per page
- JSON-LD structured data (FAQ, breadcrumbs)
- Auto-generated sitemap
- Robots.txt configurable via env var
- WordPress SEO data (Yoast) consumed via GraphQL

### Internationalization
- Languages: Vietnamese (vi, default), English (en)
- URL prefix routing: optional (controlled by `INTERNATIONAL_ROUTING_ENABLED`)
- Server-side and client-side translation support
- RTL: not required

### Security
- JWT in HTTP-only cookies (XSS-safe)
- BFF API proxy — backend credentials hidden from browser
- reCAPTCHA on auth forms
- HTTPS enforced in production
- Sentry for security-relevant error tracking

### Multi-tenancy
- Organization context via `OrgProvider`
- Per-org theme (default `light`, `condao-express-light`, etc.)
- API key per organization
- Branding (logo, colors) fetched from backend/WordPress

### Accessibility
- Radix UI primitives (ARIA-compliant)
- Keyboard navigation for dialogs/modals
- Screen reader support via semantic HTML

## 8. Target Platforms

| Platform | Support |
|----------|---------|
| Desktop (Chrome, Firefox, Safari, Edge) | Primary |
| Mobile (iOS Safari, Android Chrome) | Primary — responsive design |
| PWA | Supported (manifest.ts) |
| Tablet | Responsive |

---

Previous: [Installing and Running](installing-and-running.md)
Next: [System Architecture](system-architecture.md)
