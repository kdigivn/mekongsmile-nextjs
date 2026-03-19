---
title: "UI/UX Redesign — mekongsmile.com"
description: "7-phase visual overhaul: design tokens, tour cards, homepage, detail page, listing filters, destination/blog polish, trust signals"
status: pending
priority: P1
effort: 16h
branch: develop
tags: [ui, ux, redesign, tailwind, tour, homepage]
created: 2026-03-19
---

# UI/UX Redesign — mekongsmile.com

## Context

- **Research reports:** [UI/UX Redesign](../reports/researcher-uiux-mekongsmile-redesign.md) | [OTA Inspiration](../reports/researcher-ota-design-inspiration.md)
- **Design strategy:** "Premium Niche" — Viator trust + Airbnb storytelling + Cookly authenticity
- **Color palette:** "The Delta's Breath" — Paddy Green / Silt Blue / Clay Earth / Sunlight Gold / Rice Paper
- **Typography:** Be Vietnam Pro (en/vi) + Noto Sans SC (zh) replacing Inter
- **New packages:** `embla-carousel-react`, `yet-another-react-lightbox`, `react-photo-album`

## Phases

| # | Phase | Effort | Status | File |
|---|-------|--------|--------|------|
| 1 | Design Foundation (tokens, fonts, globals) | 2h | pending | [phase-01](./phase-01-design-foundation.md) |
| 2 | Tour Card Redesign | 2h | pending | [phase-02](./phase-02-tour-card-redesign.md) |
| 3 | Homepage Redesign | 3h | pending | [phase-03](./phase-03-homepage-redesign.md) |
| 4 | Tour Detail Page Redesign | 4h | pending | [phase-04](./phase-04-tour-detail-redesign.md) |
| 5 | Tour Listing & Filter UX | 2h | pending | [phase-05](./phase-05-tour-listing-filters.md) |
| 6 | Destination & Blog Polish | 2h | pending | [phase-06](./phase-06-destination-blog-polish.md) |
| 7 | Trust Signals & Final Polish | 1h | pending | [phase-07](./phase-07-trust-signals-polish.md) |

## Dependencies

- Phase 1 must complete first (all other phases depend on new tokens)
- Phases 2-7 can be done sequentially in order (each builds on prior)
- Phase 2 (tour card) is used by phases 3, 5, 6

## Key Risks

- **HeroUI compatibility** — new color tokens must integrate with existing HeroUI theme system

## Resolved Questions

1. **Hero:** Motion/animation (framer-motion parallax + animated gradient) — modern, no video needed
2. **Star ratings:** KK Star Ratings via WPGraphQL — `averageRating` + `reviewCount` confirmed on BookingProduct
3. **Destination images:** No image field → gradient bg + first tour's featuredImage as fallback
4. **"Meet Your Guide":** Deferred to future phase
