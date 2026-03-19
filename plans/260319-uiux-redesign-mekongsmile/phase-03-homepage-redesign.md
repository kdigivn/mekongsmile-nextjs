---
phase: 3
title: "Homepage Redesign"
status: pending
effort: 3h
priority: P1
depends_on: [phase-01, phase-02]
---

# Phase 3: Homepage Redesign

## Context Links
- [UI/UX Research — Homepage section](../reports/researcher-uiux-mekongsmile-redesign.md)
- [OTA Inspiration — Klook/Airbnb homepages](../reports/researcher-ota-design-inspiration.md)
- Current: `src/app/(language)/page.tsx` + `page-content.tsx`

## Overview
Replace solid-color hero with immersive image/video background + search overlay. Upgrade destinations from text pills to image cards. Add "Why Choose Us" with icons and stats counter. Improve blog cards.

## Key Insights
- Homepage is a **server component** (`page.tsx`) with client content (`page-content.tsx`)
- Hero is inline in `page.tsx` — extract to dedicated component
- `DestinationsSection` in `page-content.tsx` renders text pills — needs image cards
- `WhyChooseSection` exists but is basic text — needs icons + stats
- Destinations from WP may lack images — need fallback gradient

## Related Code Files

### Files to Modify
- `src/app/(language)/page.tsx` — Replace inline hero with HeroSection component
- `src/app/(language)/page-content.tsx` — Update DestinationsSection, WhyChooseSection

### Files to Create
- `src/views/homepage/hero-section.tsx` — Full-width hero with image bg + search bar
- `src/views/homepage/destination-cards-section.tsx` — Image-based destination grid
- `src/views/homepage/why-choose-section.tsx` — Icons + stats counter
- `src/views/homepage/stats-counter.tsx` — Animated stats (client component)

### Files to Verify After
- `src/views/homepage/featured-tours-section.tsx` — Already uses new TourCard from Phase 2

## Implementation Steps

### Step 1: Create HeroSection component
`src/views/homepage/hero-section.tsx`:
```tsx
// Server component — no "use client"
<section className="relative h-[80vh] min-h-[500px] w-full overflow-hidden bg-black">
  {/* Static hero image (video can be added later) */}
  <Image src="/static-img/hero-mekong.jpg" alt="Mekong Delta" fill
    className="object-cover opacity-60" priority sizes="100vw" />
  <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
    <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-6xl">
      Discover the Heart of the Delta
    </h1>
    <p className="mt-4 max-w-xl text-lg text-white/80">
      Authentic day tours, river cruises, and cultural experiences
    </p>
    {/* Quick Search Bar */}
    <div className="mt-8 w-full max-w-3xl rounded-2xl bg-white/95 p-3 shadow-2xl backdrop-blur-sm sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Destination select + Explore button */}
      </div>
    </div>
  </div>
</section>
```

**Note:** Use a high-res static image initially. Add `<video>` tag when footage available. The image file should be placed at `public/static-img/hero-mekong.jpg`.

### Step 2: Update page.tsx
Replace inline hero div with `<HeroSection />`. Move hero outside the `max-w-screen-xl` container so it's full-width.

### Step 3: Create DestinationCardsSection
`src/views/homepage/destination-cards-section.tsx`:
```tsx
<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
  {destinations.map(d => (
    <Link href={`/destination/${d.slug}/`}
      className="group relative aspect-[4/3] overflow-hidden rounded-2xl">
      {/* Image or gradient fallback */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-secondary/80" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-4 left-4 text-white">
        <h3 className="text-lg font-bold">{d.name}</h3>
        <p className="text-sm text-white/80">{d.count} tours</p>
      </div>
    </Link>
  ))}
</div>
```

**Fallback strategy:** If destination has no image, use gradient from primary to secondary. When WP destinations gain image fields, swap gradient for `<Image>`.

### Step 4: Create WhyChooseSection with icons
`src/views/homepage/why-choose-section.tsx`:
- Use Lucide icons (already installed): `Shield`, `Clock`, `Users`, `MapPin`
- Card layout: icon circle + headline + description
- Below cards: stats counter row

### Step 5: Create StatsCounter (client component)
`src/views/homepage/stats-counter.tsx`:
```tsx
"use client";
// Intersection Observer to trigger count-up animation
// Stats: "10k+ Guests | 50+ Tours | 7 Years Experience"
```
Use `useRef` + `IntersectionObserver` + `requestAnimationFrame` for count-up. No external animation library needed (framer-motion already installed but simple counter doesn't need it).

### Step 6: Update page-content.tsx
- Replace inline `DestinationsSection` with new `DestinationCardsSection`
- Replace inline `WhyChooseSection` with new component
- Keep `FeaturedToursSection` and `LatestPostsSection` (they benefit from Phase 2 card)
- Update section spacing: `py-12` instead of `py-10`

### Step 7: Add hero placeholder image
Place a placeholder image at `public/static-img/hero-mekong.jpg`. Can be sourced from Unsplash (Mekong Delta, sunrise, river boat). Optimal size: 1920x1080, WebP preferred.

## Todo List
- [ ] Create `hero-section.tsx` with full-width image bg + search overlay
- [ ] Prepare hero placeholder image in `public/static-img/`
- [ ] Update `page.tsx` to use HeroSection
- [ ] Create `destination-cards-section.tsx` with image/gradient cards
- [ ] Create `why-choose-section.tsx` with icon features
- [ ] Create `stats-counter.tsx` with scroll-triggered animation
- [ ] Update `page-content.tsx` — replace inline sections with new components
- [ ] Update section spacing to `py-12`
- [ ] Run `npm run build` — verify no errors
- [ ] Visual check: homepage hero, destinations, why choose, stats

## Success Criteria
- Hero is full-width with image background, darkened overlay, centered text
- Search bar visible on hero (can be non-functional placeholder initially)
- Destinations show as image cards (or gradient fallback) instead of text pills
- "Why Choose Us" has icon circles + stats counter with animation
- Blog section uses updated card style from Phase 2

## Risk Assessment
- **Hero image not available** — Use Unsplash royalty-free image as placeholder
- **Search bar functionality** — Implement as navigation link to `/tours/` initially; functional search can come later
- **Stats counter numbers** — Hardcode initially; can connect to WP later
- **File count** — Creating 4 new files; each under 100 lines. `page-content.tsx` reduces to ~40 lines (delegating to components)
