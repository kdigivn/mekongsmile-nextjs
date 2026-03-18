# Deployment Guide

> Setup, build, and deploy ferry-frontend.

**Last Updated:** 2026-03-03

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
cd ferry-frontend
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
API_SERVER_URL=http://localhost:3000
API_SERVER_PREFIX=/api
NEXT_PUBLIC_BASE_URL=http://localhost:3001
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
| `API_SERVER_URL` | **Yes** | — | Backend REST API base URL (e.g., `http://localhost:3000`) |
| `API_SERVER_PREFIX` | **Yes** | — | API path prefix (e.g., `/api`) |
| `NEXT_PUBLIC_BASE_URL` | **Yes** | — | Frontend public URL (e.g., `http://localhost:3001`) |
| `INTERNATIONAL_ROUTING_ENABLED` | No | `false` | Enable `/[lang]/` URL prefix routing (e.g., `/en/schedules`) |
| `NEXT_PUBLIC_DISABLE_ROBOTS` | No | — | Set `true` to add `noindex, nofollow` (non-production envs) |

### Sentry (Error Tracking)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | No | Sentry project DSN URL |
| `SENTRY_AUTH_TOKEN` | No | Auth token for sourcemap upload (CI only) |
| `ENABLE_SENTRY_DEBUG` | No | Set `true` for verbose Sentry logging |

> Sentry org: `ferryvn`, project: `frontend-vetaucaotoc`
> Sourcemaps are deleted after upload (not served to users).
> Error tunnel route: `/monitoring` (bypasses ad blockers).

### i18n Debug

| Variable | Required | Description |
|----------|----------|-------------|
| `ENABLE_I18NEXT_DEBUG` | No | Set `true` for verbose i18next logging |

### WordPress CMS

| Variable | Required | Description |
|----------|----------|-------------|
| `WORDPRESS_GRAPHQL_ENDPOINT` | No | WordPress GraphQL API URL (e.g., `https://cms.example.com/graphql`) |
| `MAX_PAGES_TO_BUILD` | No | Max SSG pages per category (default: `100`) |
| `POSTS_PER_PAGES` | No | Blog posts per page (default: `20`) |
| `NEXT_PUBLIC_ALLOW_ANONYMOUS_COMMENT` | No | Allow unauthenticated comments (default: `true`) |
| `NEXT_PUBLIC_DEFAULT_PRODUCT_VIDEO_URL` | No | Fallback product video URL |

### Authentication

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_IS_GOOGLE_AUTH_ENABLED` | No | Enable Google OAuth button (default: `false`) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `NEXT_PUBLIC_IS_FACEBOOK_AUTH_ENABLED` | No | Enable Facebook OAuth button (default: `false`) |
| `NEXT_PUBLIC_FACEBOOK_APP_ID` | No | Facebook app ID |

### Analytics & Tracking

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_GA4_ID` | No | Google Analytics 4 Measurement ID (e.g., `G-XXXXX`) |

### Booking Settings

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_MAX_ALLOWED_PASSENGERS` | No | Max passengers per booking (default: `30`) |

### Search (Meilisearch)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_MEILISEARCH_HOST` | No | Meilisearch server URL |
| `MEILISEARCH_ADMIN_KEY` | No | Admin API key — **server-only**, never expose to browser |
| `NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY` | No | Search-only API key (safe for browser) |
| `NEXT_PUBLIC_MEILISEARCH_INDEX_NAME` | No | Search index name |

### Security

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_RECAPTCHA_V2_INVISIBLE_SITE_KEY` | No | Google reCAPTCHA v2 site key |

### Content & UI

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_BOOKED_NUMBER` | No | Marketing counter (e.g., `"10K"`) shown on homepage |
| `NEXT_PUBLIC_DEFAULT_ROUTE` | No | Default ferry route ID pre-selected in search |
| `NEXT_PUBLIC_TRAVEL_GUIDE_CATEGORY` | No | WordPress category slug for travel guides |

### AI Integrations

| Variable | Required | Description |
|----------|----------|-------------|
| `VIETTEL_AI_TOKEN` | No | Viettel AI API token for ID card OCR (`/api/ai/scan-id-card`) |

### API Authentication

| Variable | Required | Description |
|----------|----------|-------------|
| `FERRY_DEFAULT_API_KEY` | No | Default API key injected into backend requests |

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
# 1. Set environment variables
cp example.env .env.local
# Edit .env.local with production values

# 2. Build
npm run build

# 3. The standalone server output is at:
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

Sentry is configured across 3 runtimes:
- `sentry.client.config.ts` — browser
- `sentry.server.config.ts` — Node.js server
- `sentry.edge.config.ts` — Edge runtime (middleware)

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

Sitemap is generated by `next-sitemap` post-build:

```bash
# Runs automatically after `npm run build` via postbuild script
# Config: next-sitemap.config.js
```

**Sitemap routes:**
- `/sitemap.xml` — Main sitemap index
- `/sitemap/posts.xml` — Blog posts (rewritten from `/post-sitemap.xml`)
- `/sitemap/products.xml` — Products
- `/sitemap/pages.xml` — CMS pages
- `/sitemap/categories.xml` — Categories

## 9. Image Domains (next.config.js)

Allowed remote image hostnames for `next/image`:

| Hostname | Usage |
|----------|-------|
| `img.vietqr.io` | VietQR bank logos |
| `api.vietqr.io` | VietQR API images |
| `r2.kdigi.net` | CDN assets |
| `r2.nucuoimekong.vn` | Mekong operator assets |
| `cdn.condao.express` | Con Dao Express CDN |
| `cms.condao.express` | Con Dao Express CMS media |
| `cdn.phuquoc.express` | Phu Quoc Express CDN |
| `cms.phuquoc.express` | Phu Quoc Express CMS media |
| `cdn.vetaucaotoc.net` | Vetaucaotoc CDN |
| `cdn.honson.express` | Hon Son Express CDN |
| `cdn.ferryvn.com` | FerryVN CDN |
| `cdn.ferry.vn` | Ferry.vn CDN |
| `secure.gravatar.com` | User avatars (WordPress) |

To add a new image domain, update `images.remotePatterns` in `next.config.js`.

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
