# Phase 1: Config & Dependencies

## Context Links
- [Plan Overview](./plan.md)
- [Research Report](../reports/research-260318-2245-mekongsmile-migration-analysis.md)
- [Migration Prompt](/Users/khoilq/Documents/DeveloperZone/mekongsmile/claude-code-prompt-mekongsmile.md)

## Overview
- **Priority:** P1 (blocking all other phases)
- **Status:** completed
- **Effort:** 2h
- **Description:** Update all configuration files, env vars, and install new dependencies to point at mekongsmile.com

## Key Insights
- `@apollo/client` and `graphql` are NOT in package.json yet -- required by `graphql/` package (uses `gql` tag)
- Current `next.config.js` has ferry-specific image domains and redirects
- Sentry config points to `frontend-vetaucaotoc` project
- `package.json` name is `@vetaucaotoc/frontend`

## Requirements

### Functional
- App connects to `https://mekongsmile.com/graphql` endpoint
- Images from mekongsmile.com WP media load correctly
- Build succeeds with new dependencies

### Non-Functional
- No ferry-specific env vars remain in active config
- Sentry reports to correct project

## Related Code Files

### Modify
- `package.json` -- rename, add deps
- `next.config.js` -- image domains, redirects, Sentry project
- `example.env` / `.env.local` -- new env vars
- `src/services/i18n/language-enum.ts` -- add Chinese locale placeholder
- `src/services/i18n/config.ts` -- update fallback to `en`

### Create
- `ecosystem.config.js` -- PM2 deployment config

## Implementation Steps

### 1. Update `package.json`
```
name: "@mekongsmile/frontend"
```
Add dependencies:
```bash
npm install @apollo/client graphql
```
Note: `@apollo/client` needed for `gql` tagged template in `graphql/` queries. `fetchGraphQL()` extracts the query string at runtime -- no Apollo runtime in RSC.

### 2. Update `next.config.js`

**Image remotePatterns** -- replace all ferry domains with:
```js
{ protocol: "https", hostname: "mekongsmile.com", pathname: "/wp-content/**" },
{ protocol: "https", hostname: "secure.gravatar.com", pathname: "/**" },
```

**Redirects** -- remove `/product` -> `/diem-den/con-dao/` redirect. Add:
```js
{ source: "/product/:slug*", destination: "/tour/:slug*", permanent: true },
{ source: "/shop/", destination: "/tours/", permanent: true },
```

**Rewrites** -- update sitemap rewrites:
```js
{ source: "/tour-sitemap.xml", destination: "/sitemap/tours.xml" },
{ source: "/destination-sitemap.xml", destination: "/sitemap/destinations.xml" },
```

**Sentry** -- update org/project:
```js
org: "mekongsmile",
project: "frontend-mekongsmile",
```

**Head preconnect** -- replace `cdn.vetaucaotoc.net` with `mekongsmile.com`

### 3. Create/update `.env.local`
```env
NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL=https://mekongsmile.com/graphql
NEXT_PUBLIC_SITE_URL=https://mekongsmile.com
NEXT_PUBLIC_BASE_URL=https://mekongsmile.com
INTERNATIONAL_ROUTING_ENABLED=false
# Remove: API_SERVER_URL, API_SERVER_PREFIX, MEILISEARCH vars
```

### 4. Update `example.env`
Mirror `.env.local` structure with placeholder values for documentation.

### 5. Create `ecosystem.config.js`
```js
module.exports = {
  apps: [{
    name: "mekongsmile-frontend",
    script: ".next/standalone/server.js",
    env: { PORT: 3000, NODE_ENV: "production" },
    instances: 1,
    exec_mode: "fork",
  }],
};
```

### 6. Update i18n config
- `src/services/i18n/language-enum.ts`: keep `en` and `vi`, add `zh` placeholder
- `src/services/i18n/config.ts`: change fallback from `vi` to `en`
- Leave Chinese translation files for Phase 10

## Todo List
- [x] Rename package.json to `@mekongsmile/frontend`
- [x] `npm install @apollo/client graphql`
- [x] Update `next.config.js` image domains
- [x] Update `next.config.js` redirects and rewrites
- [x] Update Sentry config (org, project)
- [x] Create/update `.env.local` with mekongsmile vars
- [x] Update `example.env`
- [x] Create `ecosystem.config.js` for PM2
- [x] Update i18n fallback language to `en`
- [x] Run `npm run build` to verify no compile errors

## Success Criteria
- `npm run build` succeeds
- `fetchGraphQL(GET_ALL_TOURS, { first: 1 })` returns data from mekongsmile.com
- Images from WP media library render correctly

## Risk Assessment
- **Sentry project may not exist yet** -- create on Sentry dashboard or skip config until ready
- **Missing env vars** -- build will fail if old ferry env vars are referenced; grep for `API_SERVER_URL` usage before removing

## Next Steps
-> Phase 2: GraphQL Integration & Service Layer
