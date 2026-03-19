# Project Overview — Mekong Delta Tour Booking Frontend

> Product Design Requirements (PDR) for mekongsmile.com

**Last Updated:** 2026-03-19
**Status:** Migration complete. Mekong Delta tour booking platform fully deployed on mekongsmile.com. Upgraded to Next.js 16 (2026-03-19).

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

**mekongsmile.com** is a Next.js 16 tour booking platform for discovering and reserving guided tours in the Mekong Delta region. The platform provides content via WordPress CMS and order management through a custom backend API (future phase).

**Stack:** Next.js 16 (App Router + Turbopack) · React 19 · TypeScript · Tailwind CSS · React Query v5 · i18next · WPGraphQL + Custom Backend

## 2. Business Context

Mekong Delta offers diverse tour experiences: delta cruises, floating market visits, riverside villages, and nature walks. Customers expect:
- Intuitive tour discovery with filtering by destination, type, duration
- Rich travel guides and insider blog content
- Secure date + guest selection and booking
- Multiple payment methods (online gateway + bank transfer)
- Booking history and tour management dashboard

Single-tenant platform (mekongsmile.com) with UI in English, Vietnamese, and Chinese. Content sourced from WordPress CMS.

## 3. Core Features

### Tour Discovery & Content
| Feature | Description |
|---------|-------------|
| Tour Listing | Browse all 34+ tours with filtering by destination, type, duration |
| Tour Detail | Full tour information with gallery, pricing, highlights, FAQ, meeting point |
| Destination Pages | Explore by region (Mekong Delta, Can Tho, Con Dao, etc.) |
| Blog & News | Travel guides, insider tips, destination articles |
| Static Pages | About, Contact, FAQ, Terms, Privacy policy |
| Search & Filter | Text search + taxonomy filters (destination, tour type, travel style) |

### Booking & Checkout (Phase 9 — Deferred)
| Feature | Description | Status |
|---------|-------------|--------|
| Booking Form | Select date, guest count (adult/child), contact info | Deferred |
| Availability Check | Real-time from custom backend API | Deferred |
| Payment Methods | Online gateway + bank transfer | Deferred |
| Order Confirmation | Email + confirmation page | Deferred |
| Booking History | User bookings dashboard | Deferred |
| Cancellation | Refund request + policy info | Deferred |

### Authentication
| Method | Description | Status |
|--------|-------------|--------|
| Email + Password | Register and login (backend TBD) | Simplified |
| Google OAuth | One-click Google login | Active |
| Password Recovery | Forgot password flow | Simplified |
| User Profile | View/edit personal info | Basic |

### Content & Localization
- WordPress CMS integration (WPGraphQL) — tours, blog posts, pages, menus, SEO data
- Dynamic CMS pages via `[...slug]` catch-all route
- ISR (Incremental Static Regeneration) for static content
- Trilingual UI: English (primary), Vietnamese, Chinese
- Rank Math SEO integration for metadata

## 4. User Flows

### Tour Discovery Flow
```
Home → Browse Tours / Search → Filter by Destination → View Tour Detail →
Related Tours / Destination Page → Read Blog Articles
```

### Booking Flow
```
Tour Detail "Book Now" → Select Date & Guests → Enter Contact Info →
Review Price & Details → Choose Payment Method → Complete Payment →
Confirmation Email & Page → View in Booking History
```

### Auth Flow
```
Sign In Page (Email+Password or Google OAuth) → Create Account (if new) →
Login with JWT cookie → View Profile & Bookings → Manage Preferences
```

### Content Discovery Flow
```
Home → Blog/News Section → Browse Posts → Filter by Category →
Read Full Article → Share / Related Posts
```

## 5. Tech Stack Summary

| Category | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 16 App Router + Turbopack | SSR/ISR, file-based routing, React Server Components, fast dev builds |
| Runtime | React 19 | Modern hooks, improved performance, better error handling |
| Language | TypeScript 5.5+ | Type safety, better DX |
| Styling | Tailwind CSS 3+ | Rapid UI development, design tokens |
| State | TanStack Query v5 | Server state caching, background refresh |
| Forms | React Hook Form + Yup | Performant forms, schema validation |
| i18n | i18next + react-i18next | Multi-language (en/vi/zh) |
| Auth | Custom JWT + HTTP-only cookies | Security, server-side token handling |
| CMS | WordPress WPGraphQL | Tours, blog, pages, SEO via GraphQL |
| Animation | motion (framer-motion replacement) | Modern motion library with better Next.js 16 support |
| Testing | Cypress E2E | End-to-end test automation |
| Search | Client-side filtering | Filter 34 tours via taxonomy + text search |

## 6. External Integrations

| Integration | Purpose |
|-------------|---------|
| **WordPress CMS** | Tours, blog posts, pages, menus, SEO metadata (Rank Math) |
| **WPGraphQL** | GraphQL API for WordPress content queries |
| **Custom Backend API** | Tour availability, bookings, payments, orders (future) |
| **Google OAuth** | Social sign-in |
| **Payment Gateway** | OnePay (online) or custom backend (future) |
| **Google Analytics 4** | Web analytics & performance tracking |
| **Sentry** | Error tracking & session replay |
| **Google reCAPTCHA v2** | Bot prevention on forms |
| **Leaflet Maps** | Tour meeting point / pickup location maps |

## 7. Non-Functional Requirements

### Performance
- ISR for static content (home, tours, blog, pages) — revalidate 60-300s
- React Query stale-while-revalidate for dynamic data
- Image optimization via Next.js Image + sharp
- Lazy loading for below-fold components
- Code splitting (7 service layers, view components)

### SEO
- Server-rendered metadata per page via `generateMetadata()`
- JSON-LD structured data for tours (Product schema) and posts (Article schema)
- Auto-generated XML sitemaps (tours, posts, pages, destinations)
- Robots.txt — allow all crawlers
- Rank Math SEO data from WordPress (meta, OG, breadcrumbs)

### Internationalization
- Languages: English (en, primary), Vietnamese (vi), Chinese (zh)
- Cookie-based language routing (no URL prefix)
- Server-side + client-side translation via i18next
- RTL: not required (all LTR)

### Security
- JWT in HTTP-only cookies (XSS-safe)
- BFF API proxy for auth + payments (credentials hidden)
- reCAPTCHA on auth forms
- HTTPS enforced in production
- Sentry for error tracking + security events

### Accessibility
- Radix UI primitives (ARIA-compliant)
- Keyboard navigation for all interactive elements
- Screen reader support via semantic HTML + labels
- Responsive design (mobile-first)

## 8. Target Platforms

| Platform | Support |
|----------|---------|
| Desktop (Chrome, Firefox, Safari, Edge) | Primary |
| Mobile (iOS Safari, Android Chrome) | Primary — responsive design |
| PWA | Supported (manifest.ts) |
| Tablet | Responsive |

---

## Recent Updates

**2026-03-19: Next.js 14→16 Upgrade**
- Upgraded from Next.js 14.2.29 to 16.2.0
- Updated React from 18.3.1 to 19.2.4
- Turbopack now default bundler for development (50-100x faster builds)
- Migration guide: [Next.js 16 Upgrade Guide](./nextjs-16-upgrade-guide.md)

---

Previous: [Installing and Running](installing-and-running.md)
Next: [System Architecture](system-architecture.md)
