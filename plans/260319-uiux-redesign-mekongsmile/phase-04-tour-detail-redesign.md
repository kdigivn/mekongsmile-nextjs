---
phase: 4
title: "Tour Detail Page Redesign"
status: pending
effort: 4h
priority: P1
depends_on: [phase-01, phase-02]
---

# Phase 4: Tour Detail Page Redesign

## Context Links
- [UI/UX Research — Tour Detail](../reports/researcher-uiux-mekongsmile-redesign.md)
- [OTA Inspiration — Klook/GYG/Viator detail pages](../reports/researcher-ota-design-inspiration.md)
- Current: `src/views/tour/tour-detail-view.tsx` (121 lines)

## Overview
Transform single-column detail page into 65/35 split layout with bento image gallery, glassmorphism booking widget, info badges, and mobile sticky bottom CTA. Largest phase — most impactful for booking conversion.

## Key Insights
- Current layout is `lg:w-8/12 / lg:w-4/12` — close to 65/35, but sidebar has basic pricing card
- Gallery is basic thumbnail strip — replace with 5-image bento grid + lightbox
- Pricing section uses `mailto:` for booking — keep this but wrap in premium widget
- Content sections exist but in wrong order per research
- `TourDetail` extends `TourCard` and adds `galleryImages`, `shortTourInformation` with full fields

## Related Code Files

### Files to Modify
- `src/views/tour/tour-detail-view.tsx` — Update layout, section ordering, add info badges
- `src/views/tour/tour-gallery.tsx` — Replace with bento grid + lightbox
- `src/views/tour/tour-pricing-section.tsx` — Redesign as glassmorphism booking widget

### Files to Create
- `src/views/tour/tour-bento-gallery.tsx` — 5-image bento grid (client component)
- `src/views/tour/tour-info-badges.tsx` — Duration, language, group size badges
- `src/views/tour/tour-mobile-cta-bar.tsx` — Sticky bottom CTA for mobile
- `src/views/tour/tour-highlights-cards.tsx` — Highlight bento cards (optional, if highlights are structured)

### Packages to Install
```bash
npm install yet-another-react-lightbox
```

## Implementation Steps

### Step 1: Install yet-another-react-lightbox
```bash
npm install yet-another-react-lightbox
```

### Step 2: Create TourBentoGallery
`src/views/tour/tour-bento-gallery.tsx` (client component):
```tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// Bento grid: 4 cols x 2 rows
// Cell 1: col-span-2 row-span-2 (hero image)
// Cells 2-4: single cells
// Cell 5: single cell with "+N photos" overlay button
```
- Open lightbox on any image click
- Show "+X Photos" overlay on 5th image if gallery has >5 images
- Rounded corners on outer container: `rounded-2xl overflow-hidden`
- Mobile: single image with "See all photos" button below

### Step 3: Create TourInfoBadges
`src/views/tour/tour-info-badges.tsx`:
```tsx
// GYG-style circular icon badges
<div className="flex gap-6 border-y border-gray-100 py-4 my-4">
  {duration && <InfoBadge icon={<Clock />} label={duration} />}
  {language && <InfoBadge icon={<Languages />} label={language} />}
  {/* Group size if available */}
</div>
```
Use Lucide icons: `Clock`, `Languages`, `Users`, `MapPin`.

### Step 4: Redesign TourPricingSection (booking widget)
`src/views/tour/tour-pricing-section.tsx`:
```tsx
<div className="rounded-2xl border border-white/20 bg-white/70 p-6 shadow-booking backdrop-blur-xl">
  <div className="flex items-baseline gap-2">
    <span className="text-3xl font-bold">${priceInUsd}</span>
    <span className="text-sm text-muted-foreground">/ person</span>
  </div>
  {/* Trust signal */}
  <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-green-600">
    <Check className="h-4 w-4" /> Free cancellation until 24h before
  </div>
  {/* VND price */}
  {priceInVnd && (
    <p className="mt-1 text-sm text-muted-foreground">
      {priceInVnd.toLocaleString("vi-VN")} VND
    </p>
  )}
  {/* Duration, Language info */}
  <div className="mt-4 flex flex-col gap-2 text-sm">...</div>
  {/* CTA button */}
  <a href={`mailto:...`}
    className="mt-4 flex w-full items-center justify-center rounded-xl bg-primary py-4 text-base font-bold text-white transition-all hover:bg-primary/90 active:scale-[0.98]">
    Book Now
  </a>
  <p className="mt-2 text-center text-xs text-muted-foreground">Instant confirmation</p>
</div>
```

### Step 5: Create TourMobileCtaBar
`src/views/tour/tour-mobile-cta-bar.tsx` (client component):
```tsx
"use client";
<div className="fixed bottom-0 inset-x-0 z-50 border-t bg-white p-4 lg:hidden">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">From</p>
      <p className="text-xl font-bold">${price}</p>
    </div>
    <a href={bookingLink}
      className="rounded-lg bg-primary px-8 py-3 font-bold text-white">
      Select Date
    </a>
  </div>
</div>
```

### Step 6: Update TourDetailView layout and section order
`src/views/tour/tour-detail-view.tsx`:

New section order per research:
1. Bento Gallery (full width above the split)
2. Title + Info Badges
3. Highlights (if structured data)
4. Description (truncatable)
5. Itinerary (if available — future)
6. Includes / Excludes
7. Meeting Point
8. FAQ Accordion
9. Additional Info
10. Related Tours (future phase)

Layout change:
```tsx
<div className="mx-auto w-full max-w-screen-xl px-4 py-6 md:px-8">
  {/* Full-width bento gallery */}
  <TourBentoGallery ... />

  <div className="mt-6 flex flex-col gap-6 lg:flex-row">
    {/* Left content — 65% */}
    <div className="flex flex-col gap-6 lg:w-[65%]">
      <h1 className="text-2xl font-bold md:text-3xl">{tour.name}</h1>
      <TourInfoBadges info={info} />
      {/* ... sections ... */}
    </div>
    {/* Right sidebar — 35% */}
    <div className="lg:w-[35%]">
      <div className="sticky top-20">
        <TourPricingSection ... />
      </div>
    </div>
  </div>
</div>
```

### Step 7: Add padding-bottom for mobile CTA bar
Add `pb-24 lg:pb-0` to the detail page container so content isn't hidden behind the sticky bar.

## Todo List
- [ ] Install `yet-another-react-lightbox`
- [ ] Create `tour-bento-gallery.tsx` with 5-image grid + lightbox
- [ ] Create `tour-info-badges.tsx` with icon badges
- [ ] Redesign `tour-pricing-section.tsx` as glassmorphism widget
- [ ] Create `tour-mobile-cta-bar.tsx` — sticky bottom bar
- [ ] Update `tour-detail-view.tsx` — 65/35 layout, reorder sections
- [ ] Move gallery to full-width (above split layout)
- [ ] Add `pb-24 lg:pb-0` for mobile CTA clearance
- [ ] Run `npm run build` — verify no errors
- [ ] Visual check: desktop split layout, mobile stacked + sticky bar

## Success Criteria
- Gallery shows 5-image bento grid on desktop, single image + "See all" on mobile
- Lightbox opens on image click with full gallery
- Booking widget has glassmorphism effect (`backdrop-blur-xl`)
- Info badges show duration, language with Lucide icons
- Mobile shows sticky bottom CTA bar
- Content sections in correct order per research
- `tour-detail-view.tsx` stays under 200 lines (delegate to sub-components)

## Risk Assessment
- **`yet-another-react-lightbox` CSS import** — May need `next.config.js` transpilePackages if CSS fails
- **Gallery images < 5** — Bento grid must gracefully handle 1-4 images (fallback to simpler grid)
- **Mobile CTA overlapping footer** — Use z-index carefully; hide on scroll-to-bottom if needed
- **File count** — 3-4 new files, all under 150 lines. Main view file stays compact by delegating
