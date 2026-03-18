---
phase: 2
title: "Tour Card Redesign"
status: pending
effort: 2h
priority: P1
depends_on: [phase-01]
---

# Phase 2: Tour Card Redesign

## Context Links
- [UI/UX Research — Tour Card section](../reports/researcher-uiux-mekongsmile-redesign.md)
- [OTA Inspiration — Klook/Airbnb cards](../reports/researcher-ota-design-inspiration.md)
- Current: `src/views/tour/tour-card.tsx` (81 lines)

## Overview
Transform basic card (name + destination pills + price) into rich card with image badges, star rating, hover effects, and structured pricing. This card is reused on homepage, listing, destination, and related-tours sections.

## Key Insights
- Current card already has 16:10 aspect ratio and duration badge — extend, not rewrite
- `TourCard` type has `shortDescription`, `destination.nodes`, `productTags.nodes` — can use for badges
- Star rating not in GraphQL type — show placeholder UI, conditional render when data available
- Card uses shadcn `Card/CardHeader/CardContent/CardFooter` — keep structure, update styling

## Related Code Files

### Files to Modify
- `src/views/tour/tour-card.tsx` — Full redesign of card markup and styles

### Files to Verify After
- `src/views/homepage/featured-tours-section.tsx` — Uses TourCard
- `src/views/tour/tour-listing-view.tsx` — Uses TourCard
- `src/views/destination/destination-view.tsx` — Uses TourCard

## Implementation Steps

### Step 1: Update card container
Replace shadcn Card with simpler div for more control:
```tsx
<Link href={`/tour/${tour.slug}/`} className="group block">
  <div className="h-full overflow-hidden rounded-2xl border bg-white shadow-card transition-all duration-300 hover:shadow-cardHover">
```

### Step 2: Update image section with badges
```tsx
<div className="relative aspect-[16/10] overflow-hidden">
  <Image ... className="object-cover transition-transform duration-300 group-hover:scale-105" />
  {/* Location badge — top-left */}
  {tour.destination?.nodes?.[0] && (
    <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
      {tour.destination.nodes[0].name}
    </span>
  )}
  {/* Duration badge — bottom-left */}
  {duration && (
    <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
      {duration}
    </span>
  )}
</div>
```

### Step 3: Update content section
```tsx
<div className="p-4">
  <h3 className="line-clamp-2 text-base font-semibold leading-snug group-hover:text-primary transition-colors">
    {tour.name}
  </h3>
  {/* Star rating — conditional, placeholder for now */}
  <div className="mt-2 flex items-center gap-1 text-sm text-amber-500">
    <span>★</span>
    <span className="text-muted-foreground text-xs">(New)</span>
  </div>
  {/* Pricing */}
  <div className="mt-3 flex items-baseline gap-1">
    {price ? (
      <>
        <span className="text-xs text-muted-foreground">From</span>
        <span className="text-lg font-bold">${price}</span>
        <span className="text-xs text-muted-foreground">/ person</span>
      </>
    ) : (
      <span className="text-sm text-muted-foreground">Contact for price</span>
    )}
  </div>
</div>
```

### Step 4: Install embla-carousel-react
```bash
npm install embla-carousel-react
```
(Used in Phase 3+ for horizontal scroll sections, install now to avoid re-install)

## Todo List
- [ ] Rewrite `tour-card.tsx` with new markup
- [ ] Location badge overlay (top-left, `bg-white/90 backdrop-blur-sm`)
- [ ] Duration badge (bottom-left, `bg-black/60`)
- [ ] Star rating row (placeholder `(New)` until data available)
- [ ] "From $XX / person" pricing format
- [ ] Hover: image scale + shadow transition + title color change
- [ ] Use `rounded-2xl` container
- [ ] Install `embla-carousel-react`
- [ ] Run `npm run build` — verify no type errors
- [ ] Visual check: homepage featured tours, listing page, destination page

## Success Criteria
- Card has location badge top-left, duration bottom-left on image
- Image scales on hover, shadow elevates
- Price shows "From $XX / person" format
- Card corners are `rounded-2xl`
- No regression on listing, homepage, destination pages

## Risk Assessment
- **Removing shadcn Card components** — Other components may depend on Card styling. Keep Card imports available but switch to plain div for this specific component
- **Star rating placeholder** — Must not look broken when no real data exists
