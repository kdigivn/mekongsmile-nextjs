# Deployment Guide

> Setup, build, and deploy mekongsmile.com Next.js 16 tour booking frontend.

**Last Updated:** 2026-03-19
**Status:** Core tour booking platform deployed. Phase 9 (booking engine) deferred

## Table of Contents

- [1. System Requirements](#1-system-requirements)
- [2. Local Development Setup](#2-local-development-setup)
- [3. Environment Variables Reference](#3-environment-variables-reference)
- [4. Available Scripts](#4-available-scripts)
- [5. Production Build](#5-production-build)
- [6. Sentry Setup](#6-sentry-setup)
- [7. PWA Configuration](#7-pwa-configuration)
- [8. Sitemap](#8-sitemap)
- [9. Image Domains](#9-image-domains-nextconfigjs)
- [10. Bundle Analysis](#10-bundle-analysis)
- [11. E2E Testing (Cypress)](#11-e2e-testing-cypress)
- [12. Git Hooks](#12-git-hooks)

## 1. System Requirements

| Requirement | Version |
|------------|---------|
| Node.js | 18.x or 20.x LTS |
| npm | 9.x+ (bundled with Node) |
| OS | Linux, macOS, Windows (WSL2 recommended) |

## 2. Local Development Setup

### Clone & Install

```bash
git clone <repo-url>
cd mekongsmile
npm install
```

### Environment Variables

Copy the template and fill in values:

```bash
cp example.env .env.local
```

Edit `.env.local` with your local configuration (see §3 for full variable reference).

**Minimum required for local dev:**
```env
NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL=https://mekongsmile.com/graphql
NEXT_PUBLIC_SITE_URL=https://mekongsmile.com
NEXT_PUBLIC_BASE_URL=http://localhost:3001
NEXT_PUBLIC_IS_GOOGLE_AUTH_ENABLED=true
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
```

### Run Development Server

```bash
npm run dev          # Starts on http://localhost:3001
```

### Type Checking & Linting

```bash
npm run ts           # TypeScript type check (one-shot)
npm run ts:watch     # TypeScript type check (watch mode)
npm run lint         # ESLint
npm run format       # Prettier auto-format
```

## 3. Environment Variables Reference

### General

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_BASE_URL` | **Yes** | — | Frontend public URL (e.g., `https://mekongsmile.com`) |
| `NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL` | **Yes** | — | WordPress GraphQL endpoint (e.g., `https://mekongsmile.com/graphql`) |
| `INTERNATIONAL_ROUTING_ENABLED` | No | `false` | Enable `/[lang]/` URL prefix routing (e.g., `/en/tours`) |
| `NEXT_PUBLIC_DISABLE_ROBOTS` | No | — | Set `true` to add `noindex, nofollow` (staging/dev only) |

### Sentry (Error Tracking)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | No | Sentry project DSN URL |
| `SENTRY_AUTH_TOKEN` | No | Auth token for sourcemap upload (CI only) |
| `ENABLE_SENTRY_DEBUG` | No | Set `true` for verbose Sentry logging |

> **Sentry org:** `mekongsmile` | **project:** `frontend-mekongsmile`
> Sourcemaps deleted after upload (not served to users).
> Error tunnel: `/monitoring` (bypasses ad blockers).

### i18n Debug

| Variable | Required | Description |
|----------|----------|-------------|
| `ENABLE_I18NEXT_DEBUG` | No | Set `true` for verbose i18next logging |

### WordPress CMS

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL` | **Yes** | WordPress GraphQL endpoint (e.g., `https://mekongsmile.com/graphql`) |
| `MAX_PAGES_TO_BUILD` | No | Max SSG pages per category (default: `100`) |
| `POSTS_PER_PAGES` | No | Blog posts per page (default: `20`) |
| `NEXT_PUBLIC_ALLOW_ANONYMOUS_COMMENT` | No | Allow comments without auth (default: `true`) |
| `NEXT_PUBLIC_DEFAULT_TOUR_IMAGE_URL` | No | Fallback image if WP image unavailable |

### Authentication

| Variable | Required | Description | Status |
|----------|----------|-------------|--------|
| `NEXT_PUBLIC_IS_GOOGLE_AUTH_ENABLED` | No | Enable Google OAuth (default: `false`) | Active |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | No | Google OAuth client ID | Active |
| `NEXT_PUBLIC_IS_FACEBOOK_AUTH_ENABLED` | No | Enable Facebook OAuth (deprecated) | Removed (Phase 8) |
| `NEXT_PUBLIC_FACEBOOK_APP_ID` | No | Facebook app ID (deprecated) | Removed (Phase 8) |

### Analytics & Tracking

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_GA4_ID` | No | Google Analytics 4 Measurement ID (e.g., `G-XXXXX`) |

### Booking Settings

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_MAX_ALLOWED_PASSENGERS` | No | Max passengers per booking (default: `30`) |

### Search

| Variable | Required | Description | Status |
|----------|----------|-------------|--------|
| `NEXT_PUBLIC_MEILISEARCH_HOST` | No | Meilisearch server URL | Removed (Phase 11) — Use client-side filtering |
| `MEILISEARCH_ADMIN_KEY` | No | Admin API key | Removed |
| `NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY` | No | Search-only API key | Removed |
| `NEXT_PUBLIC_MEILISEARCH_INDEX_NAME` | No | Search index name | Removed |

**Note:** Tour search implemented via client-side text filtering + server-side taxonomy filters (destination, type, style). No external search service needed for 34 tours.

### Security

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_RECAPTCHA_V2_INVISIBLE_SITE_KEY` | No | Google reCAPTCHA v2 site key |

### Content & UI

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_BOOKED_NUMBER` | No | Marketing counter (e.g., `"5K"`) on homepage |
| `NEXT_PUBLIC_TRAVEL_GUIDE_CATEGORY` | No | WordPress category slug for travel guides |
| `NEXT_PUBLIC_MAX_ALLOWED_PASSENGERS` | No | Max passengers per booking (default: `30`) |

### AI Integrations

| Variable | Required | Description |
|----------|----------|-------------|
| `VIETTEL_AI_TOKEN` | No | Viettel AI API token for ID card OCR (`/api/ai/scan-id-card`) |

### Custom Backend (Phase 9 — Deferred)

| Variable | Required | Description | Status |
|----------|----------|-------------|--------|
| `NEXT_PUBLIC_BOOKING_API_URL` | No | Custom backend API base URL | Deferred |
| `MEKONG_DEFAULT_API_KEY` | No | Default API key for backend requests | Deferred |

---

## 4. Available Scripts

```bash
# Development
npm run dev              # Dev server on port 3001 with HMR

# Production Build
npm run build            # Production build (reads .env.local)
npm run build:uat        # UAT build (reads .env.uat)
npm run build:analyze    # Build + open bundle analyzer (ANALYZE=true)
npm run build:cypress    # Build for Cypress E2E testing

# Production Server
npm run start            # Start standalone server from .next/standalone
npm run start:dev        # Start on port 3001

# Code Quality
npm run lint             # ESLint check
npm run format           # Prettier auto-format
npm run ts               # TypeScript type check
npm run ts:watch         # TypeScript watch mode

# Testing
npx cypress open         # Interactive E2E test runner
npx cypress run          # Headless E2E tests

# Sitemap
npx next-sitemap         # Generate sitemap (runs automatically post-build)
```

## 5. Production Build

### Standard Build

```bash
# 1. Configure environment
cp example.env .env.production.local
# Edit .env.production.local with production values:
# - NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL=https://mekongsmile.com/graphql
# - NEXT_PUBLIC_BASE_URL=https://mekongsmile.com
# - NEXT_PUBLIC_SENTRY_DSN=https://...
# - Etc.

# 2. Build
npm run build

# 3. Standalone output:
#    .next/standalone/server.js
```

### Standalone Server Output

`next.config.js` uses `output: "standalone"` — produces a minimal Node.js server:

```
.next/
└── standalone/
    ├── server.js              # Entry point
    ├── .next/                 # Compiled application
    └── node_modules/          # Only runtime dependencies
```

**Post-build copy step** (required for standalone):
```bash
# Static assets must be copied manually
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static
```

### Start Production Server

```bash
node .next/standalone/server.js
# Or
npm run start
```

Default port: `3000` (set `PORT` env var to change).

### UAT Build

```bash
# Uses .env.uat for environment config
npm run build:uat
```

Ensure `.env.uat` exists with UAT-specific values (UAT API URL, Sentry DSN, etc.).

## 6. Sentry Setup

Sentry configured across 3 runtimes:
- `sentry.client.config.ts` — browser error tracking + session replay
- `sentry.server.config.ts` — Node.js server errors
- `sentry.edge.config.ts` — Edge runtime (middleware) errors

**Sentry org:** `mekongsmile` | **project:** `frontend-mekongsmile`

### Sourcemap Upload (CI)

Sourcemaps are automatically uploaded during build when `SENTRY_AUTH_TOKEN` is set:

```bash
SENTRY_AUTH_TOKEN=xxx npm run build
```

Sourcemaps are deleted after upload (`deleteSourcemapsAfterUpload: true`) — not served publicly.

### Initial Setup (first time)

```bash
npx @sentry/wizard@latest -i sourcemaps
```

## 7. PWA Configuration

PWA manifest is defined in `src/app/manifest.ts` (Next.js native manifest route).

- Manifest served at: `/manifest.webmanifest`
- Icons in: `public/icons/`
- Theme color: green (`#218721`)

No additional PWA build step required — Next.js handles manifest serving.

## 8. Sitemap

Auto-generated by `next-sitemap` post-build:

```bash
npm run build  # Automatically runs next-sitemap after build
```

**Sitemap index:** `/sitemap.xml`

**Sub-sitemaps:**
- `/sitemap/tours.xml` — Tour detail pages (34 tours)
- `/sitemap/posts.xml` — Blog posts (all)
- `/sitemap/pages.xml` — CMS pages (about, contact, etc.)
- `/sitemap/destinations.xml` — Destination archive pages (14 destinations)

## 9. Image Domains (next.config.js)

Allowed remote image hostnames for `next/image`:

| Hostname | Usage |
|----------|-------|
| `mekongsmile.com` | WordPress media library (tours, blog, pages) |
| `secure.gravatar.com` | User avatars (WordPress author pictures) |

To add new domain: Update `images.remotePatterns` in `next.config.js`.

## 10. Bundle Analysis

```bash
npm run build:analyze
# Opens bundle analyzer in browser at http://localhost:8888
```

Use this to identify large dependencies and optimize bundle size.

## 11. E2E Testing (Cypress)

```bash
# Build the app first
npm run build:cypress

# Start the server
npm run start

# In another terminal — run tests
npx cypress run          # Headless
npx cypress open         # Interactive
```

**Config:** `cypress.config.ts`
- Base URL: `http://localhost:3000`
- Viewport: 1200×800
- Timeout: 60 seconds

**Email testing (OTP flows):**
- Requires IMAP access to a test email inbox
- Configure in `cypress/helpers/email.ts`

## 12. Git Hooks

Husky is configured with pre-commit hooks:

```bash
# Runs automatically on git commit:
npm run format  # Prettier
npm run lint    # ESLint
```

If a commit fails due to lint errors:
```bash
npm run format  # Auto-fix formatting
npm run lint    # Check for remaining issues (fix manually)
git add -A && git commit -m "..."
```

**Never use `--no-verify`** to bypass hooks — fix the actual issues.

---

Previous: [Testing](testing.md)
Next: [Development Roadmap](development-roadmap.md)
