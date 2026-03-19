# Installing and Running

> Setup, environment variables, build commands, and development server for Mekong Smile Tours.

**Last Updated:** 2026-03-03

---

## Table of Contents

- [Requirements](#requirements)
- [Development](#development)
- [Environment Variables](#environment-variables)
- [Production Build](#production-build)
- [Available Scripts](#available-scripts)

---

## Requirements

| Tool | Version |
|------|---------|
| Node.js | 18.x or 20.x LTS |
| npm | 9.x+ (bundled with Node) |

---

## Development

1. Clone repository

   ```bash
   git clone <repo-url>
   cd mekongsmile
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Copy environment file and configure

   ```bash
   cp example.env .env.local
   ```

   Edit `.env.local` — minimum required values:

   ```env
   API_SERVER_URL=http://localhost:3000
   API_SERVER_PREFIX=/api
   NEXT_PUBLIC_BASE_URL=http://localhost:3001
   ```

   See [Environment Variables](#environment-variables) below for the full reference,
   or [Deployment Guide](deployment-guide.md) for detailed descriptions.

4. Run development server

   ```bash
   npm run dev
   # App runs at http://localhost:3001
   ```

---

## Environment Variables

All environment variables are documented in `example.env` with inline comments.

### Required

| Variable | Example | Description |
|----------|---------|-------------|
| `API_SERVER_URL` | `http://localhost:3000` | Backend REST API base URL |
| `API_SERVER_PREFIX` | `/api` | API path prefix |
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:3001` | Frontend public URL |

### Optional (commonly needed)

| Variable | Description |
|----------|-------------|
| `WORDPRESS_GRAPHQL_ENDPOINT` | WordPress CMS GraphQL URL (blog, menus, SEO) |
| `NEXT_PUBLIC_IS_GOOGLE_AUTH_ENABLED` | `true` to show Google login button |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `NEXT_PUBLIC_MEILISEARCH_HOST` | Meilisearch server URL (search feature) |
| `NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY` | Meilisearch search-only key |
| `NEXT_PUBLIC_MEILISEARCH_INDEX_NAME` | Meilisearch index name |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking DSN |

For the full list of environment variables with descriptions, see [Deployment Guide](deployment-guide.md#3-environment-variables-reference).

---

## Production Build

1. Build application

   ```bash
   npm run build
   ```

2. After build, copy static assets to standalone output

   ```bash
   cp -r public .next/standalone/public
   cp -r .next/static .next/standalone/.next/static
   ```

3. Start production server

   ```bash
   npm run start
   # Or directly:
   node .next/standalone/server.js
   ```

### UAT Build

```bash
# Requires .env.uat file with UAT environment values
npm run build:uat
```

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server on port 3001 |
| `npm run build` | Production build |
| `npm run build:uat` | UAT build (uses `.env.uat`) |
| `npm run build:analyze` | Build with bundle analyzer |
| `npm run start` | Start standalone production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Auto-format with Prettier |
| `npm run ts` | TypeScript type check |
| `npm run ts:watch` | TypeScript watch mode |

---

Next: [Project Overview](project-overview-pdr.md)
