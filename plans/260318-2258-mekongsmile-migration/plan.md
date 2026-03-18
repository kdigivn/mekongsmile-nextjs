---
title: "Migrate vetaucaotoc.net to mekongsmile.com Tour Booking Site"
description: "Replace ferry booking system with Mekong Delta tour booking website using existing WPGraphQL package"
status: completed
priority: P1
effort: 40h
branch: develop
tags: [migration, wpgraphql, nextjs, tour-booking, headless-wordpress]
created: 2026-03-18
progress: 100%
---

# Migration Plan: vetaucaotoc.net -> mekongsmile.com

## Architecture

**Hybrid setup:**
- WordPress (mekongsmile.com/graphql) = content CMS (tours, blog, pages, SEO, menus, destinations)
- Custom backend = booking engine (availability, cart, checkout, payment, orders) -- future phase
- Next.js 14 = frontend consuming both via `fetchGraphQL()` (Server Components)

## Phase Overview

| # | Phase | Effort | Status | Deps |
|---|-------|--------|--------|------|
| 1 | [Config & Dependencies](./phase-01-config-and-dependencies.md) | 2h | completed | -- |
| 2 | [GraphQL Integration & Service Layer](./phase-02-graphql-integration-and-service-layer.md) | 4h | completed | P1 |
| 3 | [Layout & Navigation](./phase-03-layout-and-navigation.md) | 4h | completed | P2 |
| 4 | [Core Pages -- Tours](./phase-04-core-pages-tours.md) | 6h | completed | P3 |
| 5 | [Blog & Content Pages](./phase-05-blog-and-content-pages.md) | 4h | completed | P3 |
| 6 | [SEO & Sitemap](./phase-06-seo-and-sitemap.md) | 3h | completed | P4, P5 |
| 7 | [Search & Filtering](./phase-07-search-and-filtering.md) | 3h | completed | P4 |
| 8 | [Auth & User System](./phase-08-auth-and-user-system.md) | 4h | completed (simplified) | P3 |
| 9 | [Booking Engine](./phase-09-booking-engine.md) | 8h | deferred | P4, P8 |
| 10 | [i18n -- Trilingual Support](./phase-10-i18n-trilingual-support.md) | 3h | completed | P4, P5 |
| 11 | [Cleanup & Polish](./phase-11-cleanup-and-polish.md) | 3h | completed | all |

## Key Decisions

- Use `fetchGraphQL()` for Server Components, NOT Apollo Client (saves ~45KB client bundle)
- Always use `... on BookingProduct {}` inline fragment for tours
- `allDestination` (singular) for taxonomy queries
- Posts don't support `taxQuery` -- use reverse query `destination(id:) { posts {} }`
- Cursor-based pagination (first, after, pageInfo)
- English primary language; Vietnamese + Chinese added in Phase 10

## Critical Prerequisites (WP Backend)

1. Rank Math SEO plugin installed -- confirmed
2. ACF Options Page `tourConstantOptions` query -- confirmed working
3. Image domain `mekongsmile.com` added to next.config.js remotePatterns

## Reports

- [Research Report](../reports/research-260318-2245-mekongsmile-migration-analysis.md)
