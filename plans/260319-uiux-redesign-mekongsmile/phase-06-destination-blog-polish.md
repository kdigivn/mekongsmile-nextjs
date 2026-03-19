---
phase: 6
title: "Destination & Blog Polish"
status: pending
effort: 2h
priority: P2
depends_on: [phase-01, phase-02]
---

# Phase 6: Destination & Blog Polish

## Context Links
- [UI/UX Research](../reports/researcher-uiux-mekongsmile-redesign.md)
- Current: `src/views/destination/destination-view.tsx` (133 lines)

## Overview
Upgrade destination page with image hero + improved tour grid. Polish blog post cards. Add breadcrumb component. Add horizontal scroll carousel for related tours using embla-carousel.

## Key Insights
- Destination page is basic: text header + tour grid + blog grid
- Blog post cards in `page-content.tsx` and `destination-view.tsx` are duplicated — extract shared component
- Breadcrumb data available from destination parent/child hierarchy
- `embla-carousel-react` installed in Phase 2

## Related Code Files

### Files to Modify
- `src/views/destination/destination-view.tsx` — Add hero, improve layout
- `src/app/(language)/page-content.tsx` — Use shared PostCard component

### Files to Create
- `src/components/breadcrumb-nav.tsx` — Reusable breadcrumb from SEO/taxonomy data
- `src/components/post-card.tsx` — Shared blog post card (extract from page-content.tsx)
- `src/components/horizontal-scroll-carousel.tsx` — Embla-based horizontal scroll wrapper

## Implementation Steps

### Step 1: Create shared PostCard component
Extract the duplicated blog card markup from `page-content.tsx` and `destination-view.tsx`:
`src/components/post-card.tsx`:
```tsx
import Image from "next/image";
import Link from "@/components/link-base";
import type { PostCard } from "@/graphql/types";
import { sanitizeCmsHtml } from "@/lib/cms-html-sanitizer";

export default function PostCard({ post }: { post: PostCard }) {
  return (
    <Link href={`/blog/${post.slug}/`} className="group block">
      <div className="overflow-hidden rounded-2xl border bg-white shadow-card transition-all hover:shadow-cardHover">
        {post.featuredImage?.node && (
          <div className="relative aspect-[16/9] overflow-hidden">
            <Image ... className="object-cover transition-transform duration-300 group-hover:scale-105" />
          </div>
        )}
        <div className="p-4">
          <p className="text-xs text-muted-foreground">{formatDate(post.date)}</p>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold group-hover:text-primary">{post.title}</h3>
          {post.excerpt && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">...</p>}
        </div>
      </div>
    </Link>
  );
}
```

### Step 2: Create BreadcrumbNav
`src/components/breadcrumb-nav.tsx`:
```tsx
// Simple breadcrumb: Home > Destinations > {parent} > {current}
// Uses Lucide ChevronRight separator
// Structured data via JSON-LD for SEO
```

### Step 3: Update DestinationView with hero
Add gradient hero section at top of destination page:
```tsx
<div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-primary to-secondary md:h-64">
  <div className="absolute inset-0 flex items-end p-8">
    <div className="text-white">
      <BreadcrumbNav items={breadcrumbs} />
      <h1 className="mt-2 text-3xl font-bold">{destination.name}</h1>
      <p className="mt-1 text-white/80">{destination.count} tours available</p>
    </div>
  </div>
</div>
```

### Step 4: Create HorizontalScrollCarousel
`src/components/horizontal-scroll-carousel.tsx` (client component):
```tsx
"use client";
import useEmblaCarousel from "embla-carousel-react";
// Wrapper component that takes children and renders horizontal scroll
// Prev/Next arrow buttons on desktop
// Swipe on mobile
// Used for related tours, blog posts, etc.
```

### Step 5: Update destination tour grid
Replace plain grid with option for carousel on mobile:
```tsx
{/* Desktop: grid, Mobile: horizontal scroll */}
<div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {tours.map(t => <TourCardComponent key={t.databaseId} tour={t} />)}
</div>
<div className="sm:hidden">
  <HorizontalScrollCarousel>
    {tours.map(t => <div key={t.databaseId} className="min-w-[280px]"><TourCardComponent tour={t} /></div>)}
  </HorizontalScrollCarousel>
</div>
```

### Step 6: Replace duplicated PostCard in page-content.tsx and destination-view.tsx
Import shared `PostCard` component and replace inline markup in both files.

## Todo List
- [ ] Create `src/components/post-card.tsx` — shared blog card
- [ ] Create `src/components/breadcrumb-nav.tsx` — reusable breadcrumbs
- [ ] Create `src/components/horizontal-scroll-carousel.tsx` — embla wrapper
- [ ] Update `destination-view.tsx` — gradient hero + breadcrumbs
- [ ] Update `page-content.tsx` — use shared PostCard
- [ ] Update `destination-view.tsx` — use shared PostCard
- [ ] Add mobile carousel for tours on destination page
- [ ] Run `npm run build`
- [ ] Visual check: destination page, blog cards on homepage

## Success Criteria
- Destination page has colored hero header with breadcrumbs
- Blog cards updated with new design (rounded-2xl, date, shadow)
- No duplicated PostCard markup (DRY)
- Horizontal carousel works on mobile destination page
- Breadcrumbs render correctly with parent hierarchy

## Risk Assessment
- **Embla carousel SSR** — Must be client component; ensure no hydration mismatch
- **Destination images** — Still using gradient fallback until WP has image field
