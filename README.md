<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<p align="center">
  <a href="https://kdigi.vn">
    <img alt="Kdigi" src="https://r2.kdigi.net/public/kdigi-logo.png" width="80" />
  </a>
</p>
<h1 align="center">
  Mekong Smile Tours
</h1>
<h4 align="center">
  <a href="https://kdigi.vn">Website</a> |
  <a href="https://github.com/kdigivn">Github</a>
</h4>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

## Description

Customer-facing frontend for the Mekong Smile Tours booking system. Allows users to search tours, book tours, manage passengers, and process payments across multiple Mekong Delta tour destinations.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS · React Query v5 · i18next

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp example.env .env.local
# Edit .env.local — minimum: API_SERVER_URL, API_SERVER_PREFIX, NEXT_PUBLIC_BASE_URL

# Run dev server (port 3001)
npm run dev
```

## System Requirements

| Tool | Version |
|------|---------|
| Node.js | 18.x or 20.x LTS |
| npm | 9.x+ |

## Documentation

| Doc | Description |
|-----|-------------|
| [Installing and Running](docs/installing-and-running.md) | Setup, env vars, build & deploy |
| [Project Overview](docs/project-overview-pdr.md) | Business context, features, integrations |
| [System Architecture](docs/system-architecture.md) | App Router, data flow, auth, state |
| [Code Standards](docs/code-standards.md) | Naming, patterns, TypeScript, React Query |
| [Design Guidelines](docs/design-guidelines.md) | Design system, colors, components |
| [Codebase Summary](docs/codebase-summary.md) | Full catalog: components, hooks, services |
| [Auth](docs/auth.md) | JWT, OTP, Google/Facebook OAuth flows |
| [Deployment Guide](docs/deployment-guide.md) | Env vars reference, standalone build |
| [Development Roadmap](docs/development-roadmap.md) | Features, tech debt, planned work |
| [Testing](docs/testing.md) | Cypress E2E setup |

## Features

- [x] Next.js 16 App Router (SSR, ISR, RSC, Turbopack)
- [x] TypeScript 5 (strict mode)
- [x] Tailwind CSS + HeroUI + Radix UI (shadcn/ui pattern)
- [x] TanStack Query v5 (server state)
- [x] React Hook Form + Yup (form validation)
- [x] i18n — Vietnamese (default) + English
- [x] Auth — Email/OTP, Google OAuth, Facebook OAuth
- [x] JWT in HTTP-only cookies (XSS-safe)
- [x] Tour listing & selection
- [x] Multi-passenger booking
- [x] Payments — OnePay, SMS Banking, Offline
- [x] Voucher / promo code system
- [x] VAT invoice export
- [x] Booking history & cancellation requests
- [x] WordPress CMS integration (blog, travel guides)
- [x] Meilisearch full-text search
- [x] Multi-operator / multi-tenant theming
- [x] Sentry error tracking (client + server + edge)
- [x] PWA support
- [x] E2E tests (Cypress)
- [x] ESLint + Prettier + Husky pre-commit hooks

## Scripts

```bash
npm run dev          # Dev server on port 3001 (Turbopack bundler by default)
npm run build        # Production build
npm run build:uat    # UAT build
npm run start        # Start standalone server
npm run lint         # ESLint (src/ only)
npm run format       # Prettier
npm run ts           # TypeScript check
```
