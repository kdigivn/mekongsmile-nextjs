# Phase 4: Core Pages -- Tours

## Context Links
- [Plan Overview](./plan.md)
- [Tour Queries](/Users/khoilq/Documents/DeveloperZone/mekongsmile/graphql/queries/tours/)
- [Tour Fragment](/Users/khoilq/Documents/DeveloperZone/mekongsmile/graphql/fragments/tour.ts)
- [Tour Types](/Users/khoilq/Documents/DeveloperZone/mekongsmile/graphql/types.ts) (TourCard, TourDetail, ShortTourInformation)
- [Taxonomy Queries](/Users/khoilq/Documents/DeveloperZone/mekongsmile/graphql/queries/taxonomies/)
- [Current Homepage](/Users/khoilq/Documents/DeveloperZone/mekongsmile/src/app/(language)/page.tsx)

## Overview
- **Priority:** P1
- **Status:** completed
- **Effort:** 6h
- **Description:** Build homepage, tour listing, single tour detail, and destination archive pages. These are the core revenue-driving pages.

## Key Insights
- All 34 tours are `BookingProduct` type -- must always use `... on BookingProduct {}` inline fragment
- ACF `shortTourInformation` has: priceInUsd, duration, highlights, FAQ, includes/excludes, meetingPickup
- Destinations are hierarchical: Greater Saigon > HCM, Island > Con Dao, Mekong Delta > Can Tho etc.
- `GET_TOURS_BY_TAXONOMY` supports filtering by destination, tour type, travel style
- Homepage currently fetches 15+ parallel data sources -- simplify to 3-4 for tour site

## Requirements

### Functional
- Homepage: hero section + featured tours grid + latest blog posts + "Why Choose Us" section
- `/tours/`: paginated grid of all tours with cursor-based "Load More"
- `/tour/[slug]/`: full detail page with gallery, description, pricing, FAQ, includes, meeting point
- `/destination/[slug]/`: destination page showing related tours + posts

### Non-Functional
- ISR revalidation: 60s for listings, 300s for homepage
- Static generation for all 34 tour slugs + 14 destination slugs at build time

## Architecture

### Route Structure
```
src/app/(language)/
  page.tsx                       # Homepage (replace ferry homepage)
  tours/
    page.tsx                     # Tour listing
  tour/
    [slug]/
      page.tsx                   # Tour detail
  destination/
    [slug]/
      page.tsx                   # Destination archive
```

### View Components
```
src/views/
  homepage/
    hero-section.tsx             # ADAPT -- new hero for tours (no route search)
    featured-tours-section.tsx   # NEW -- grid of featured TourCards
    why-choose-section.tsx       # ADAPT -- use tourConstantOptions data
    latest-posts-section.tsx     # ADAPT from posts-section.tsx
  tour/
    tour-card.tsx                # NEW -- reusable card component
    tour-listing-view.tsx        # NEW -- grid + pagination
    tour-detail-view.tsx         # NEW or ADAPT from product-detail-view.tsx
    tour-gallery.tsx             # ADAPT from product-gallery-modal.tsx
    tour-faq-section.tsx         # NEW -- accordion for FAQ repeater
    tour-includes-section.tsx    # NEW -- included/excluded lists
    tour-meeting-section.tsx     # NEW -- pickup point + Google Maps link
    tour-pricing-section.tsx     # NEW -- price display (USD/VND)
  destination/
    destination-view.tsx         # NEW -- tours grid + posts for destination
```

## Related Code Files

### Create
- `src/app/(language)/tours/page.tsx`
- `src/app/(language)/tour/[slug]/page.tsx`
- `src/app/(language)/destination/[slug]/page.tsx`
- `src/views/tour/tour-card.tsx`
- `src/views/tour/tour-listing-view.tsx`
- `src/views/tour/tour-detail-view.tsx`
- `src/views/tour/tour-gallery.tsx`
- `src/views/tour/tour-faq-section.tsx`
- `src/views/tour/tour-includes-section.tsx`
- `src/views/tour/tour-meeting-section.tsx`
- `src/views/tour/tour-pricing-section.tsx`
- `src/views/destination/destination-view.tsx`
- `src/views/homepage/featured-tours-section.tsx`

### Modify
- `src/app/(language)/page.tsx` -- complete rewrite for tour homepage
- `src/views/homepage/hero-section.tsx` -- remove route search, add tour hero
- `src/views/homepage/why-not-choose-section.tsx` -- adapt for tourConstantOptions

### Reuse (reference for adaptation)
- `src/views/product/product-detail/product-detail-view.tsx` -- layout pattern for tour detail
- `src/views/product/product-gallery-modal.tsx` -- gallery modal pattern
- `src/views/product/product-price-section.tsx` -- price display pattern
- `src/components/ui/accordion.tsx` -- for FAQ section
- `src/components/ui/card.tsx` -- for tour cards

## Implementation Steps

### 1. Homepage (`src/app/(language)/page.tsx`)

Replace the entire ferry homepage. New data fetching:
```ts
const [tours, posts, tourConstant] = await Promise.all([
  getAllTours(6),                    // featured tours
  getAllBlogPosts(4),                // latest posts
  getTourConstant(),                 // why choose us
]);
```

Sections:
1. Hero -- background image + headline + CTA "Explore Tours"
2. Featured Tours grid (2x3 TourCards)
3. Why Choose Us (from ACF Options Page)
4. Latest Blog Posts carousel
5. Destinations overview (from getAllDestinations)

### 2. Tour Listing (`/tours/`)

```ts
// src/app/(language)/tours/page.tsx
export default async function ToursPage({ searchParams }) {
  const after = searchParams.after;
  const { nodes: tours, pageInfo } = await getAllTours(12, after);
  return <TourListingView tours={tours} pageInfo={pageInfo} />;
}

export async function generateMetadata() {
  // Static metadata or from WP "shop" page SEO
}
```

Client-side "Load More" button fetches next page via `pageInfo.endCursor`.

### 3. Tour Detail (`/tour/[slug]/`)

```ts
// src/app/(language)/tour/[slug]/page.tsx
export async function generateStaticParams() {
  const slugs = await getAllTourSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export default async function TourPage({ params }) {
  const tour = await getTourBySlug(params.slug);
  if (!tour) notFound();
  return <TourDetailView tour={tour} />;
}
```

Tour detail sections:
1. Image gallery (hero + thumbnails)
2. Title + price + duration + booking CTA
3. Description (HTML content)
4. Highlights (HTML from ACF)
5. Includes / Excludes
6. Meeting & Pickup info + Google Maps link
7. FAQ accordion
8. Related tours (same destination)

### 4. Destination Archive (`/destination/[slug]/`)

```ts
// Uses GET_DESTINATION_BY_SLUG which returns destination + products + posts
export async function generateStaticParams() {
  const destinations = await getAllDestinations();
  // Flatten hierarchical to get all slugs
  const slugs = [];
  destinations.forEach(d => {
    slugs.push({ slug: d.slug });
    d.children?.nodes.forEach(c => slugs.push({ slug: c.slug }));
  });
  return slugs;
}
```

### 5. TourCard component

Reusable card displaying:
- Featured image
- Tour name
- Duration badge
- Price (USD)
- Destination tags
- Link to `/tour/[slug]/`

Uses shadcn `Card` component as base.

## Todo List
- [x] Rewrite homepage `page.tsx`
- [x] Create hero section (no ferry route search) — inline in page.tsx
- [x] Create `featured-tours-section.tsx`
- [x] Adapt `page-content.tsx` for tourConstantOptions (WhyChooseSection inline)
- [x] Create `tour-card.tsx` component
- [x] Create `/tours/page.tsx` with pagination
- [x] Create `tour-listing-view.tsx`
- [x] Create `/tour/[slug]/page.tsx` with generateStaticParams
- [x] Create `tour-detail-view.tsx` with all sections
- [x] Create tour sub-sections (gallery, FAQ, includes, meeting, pricing)
- [x] Create `/destination/[slug]/page.tsx`
- [x] Create `destination-view.tsx`
- [x] Verify all pages render with live data
- [x] Test cursor-based pagination on /tours/

## Success Criteria
- Homepage shows featured tours + latest posts
- `/tours/` lists all 34 tours with working "Load More"
- `/tour/cai-rang-floating-market-tour/` renders full detail
- `/destination/mekong-delta/` shows related tours + posts
- All 34 tour pages + 14 destination pages statically generated at build

## Risk Assessment
- **Tour detail layout complexity** -- many ACF sections; build incrementally, start with title+price+description, add sections one by one
- **Gallery images** -- WP media URLs must match `next.config.js` remotePatterns; test early
- **Pagination UX** -- cursor-based requires client component for "Load More"; use React Query `useInfiniteQuery` or simple state

## Security Considerations
- HTML content from WP (`description`, `highlights`, `additionalInfo`) must be sanitized -- reuse `src/lib/cms-html-sanitizer.ts`

## Next Steps
-> Phase 5: Blog & Content Pages (can run in parallel)
-> Phase 6: SEO & Sitemap (after pages exist)
-> Phase 7: Search & Filtering (after tour listing works)
