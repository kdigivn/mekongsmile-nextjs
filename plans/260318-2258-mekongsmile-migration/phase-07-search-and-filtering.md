# Phase 7: Search & Filtering

## Context Links
- [Plan Overview](./plan.md)
- [Tour Filter Options Query](/Users/khoilq/Documents/DeveloperZone/mekongsmile/graphql/queries/taxonomies/)
- [Tours by Taxonomy Query](/Users/khoilq/Documents/DeveloperZone/mekongsmile/graphql/queries/tours/getToursByTaxonomy.ts)
- [GraphQL Types](/Users/khoilq/Documents/DeveloperZone/mekongsmile/graphql/types.ts) (GetTourFilterOptionsResponse)

## Overview
- **Priority:** P2
- **Status:** completed
- **Effort:** 3h
- **Description:** Build client-side tour search and taxonomy filtering on `/tours/` page. No Meilisearch -- filter via WPGraphQL taxonomy filters and client-side text search.

## Key Insights
- `GET_TOUR_FILTER_OPTIONS` returns all destinations, tour types, travel styles, product tags in one query
- `GET_TOURS_BY_TAXONOMY` supports `taxonomyFilter: { filters: [{ taxonomy: DESTINATION, terms: [...] }] }`
- 34 tours total -- small enough for client-side text filtering on loaded data
- No need for Meilisearch -- YAGNI for 34 items

## Requirements

### Functional
- Text search input filters tours by name/description (client-side)
- Dropdown/chip filters for: Destination, Tour Type, Travel Style
- Filter state reflected in URL search params (shareable URLs)
- Clear all filters button
- Result count display

### Non-Functional
- Initial filter options fetched server-side (SSR)
- Tour filtering via URL params triggers server-side WPGraphQL query
- Debounced text search (300ms)

## Architecture

```
/tours/?destination=mekong-delta&type=group-tour&q=floating+market

Server: fetch tours with taxonomy filter from WPGraphQL
Client: text search filters the server-returned results
```

## Related Code Files

### Create
- `src/views/tour/tour-filter-bar.tsx` -- filter UI component (client component)
- `src/views/tour/tour-search-input.tsx` -- text search input with debounce

### Modify
- `src/app/(language)/tours/page.tsx` -- read searchParams, pass to query
- `src/views/tour/tour-listing-view.tsx` -- accept filter state, display results

### Reuse
- `src/hooks/use-debounce.ts` -- debounce hook for text search
- `src/components/ui/popover.tsx` -- for filter dropdowns
- `src/components/ui/command.tsx` -- for searchable select

## Implementation Steps

### 1. Fetch filter options server-side

In `/tours/page.tsx`:
```ts
const filterOptions = await getTourFilterOptions();
// Returns: { allDestination, allPaTourType, allPaTravelStyle, productTags }
```

### 2. Build tour filter bar (client component)

```tsx
"use client";
interface TourFilterBarProps {
  destinations: Destination[];
  tourTypes: TourType[];
  travelStyles: TravelStyle[];
  currentFilters: { destination?: string; type?: string; style?: string; q?: string };
}
```

Uses `useRouter()` + `useSearchParams()` to update URL on filter change.

### 3. Server-side filtered query

When URL has taxonomy params, use `GET_TOURS_BY_TAXONOMY`:
```ts
// In page.tsx
const destination = searchParams.destination;
const tourType = searchParams.type;

if (destination || tourType) {
  tours = await getToursByTaxonomy({ destination, tourType, first: 50 });
} else {
  tours = await getAllTours(50); // 34 total, fetch all
}
```

### 4. Client-side text search

Filter already-loaded tours by name/shortDescription matching query string.
Use `useDebounce` hook from existing codebase.

### 5. URL state management

```ts
// In filter bar
const updateFilter = (key: string, value: string | null) => {
  const params = new URLSearchParams(searchParams.toString());
  if (value) params.set(key, value);
  else params.delete(key);
  router.push(`/tours/?${params.toString()}`);
};
```

## Todo List
- [x] Add filter options fetching to `/tours/page.tsx`
- [x] Create `tour-filter-sidebar.tsx` client component
- [x] Create `tour-search-bar.tsx` with debounce
- [x] Implement server-side taxonomy filtering via URL params
- [x] Implement client-side text search on loaded results
- [x] Add "Clear filters" button
- [x] Display result count
- [x] Test filter combinations (manual testing required)

## Success Criteria
- `/tours/?destination=mekong-delta` shows only Mekong Delta tours
- `/tours/?type=group-tour` shows only group tours
- Text search "floating market" filters visible tours
- Filters are URL-shareable
- Clear filters returns to full listing

## Risk Assessment
- **`GET_TOURS_BY_TAXONOMY` query variants** -- verify exact variable names against `getToursByTaxonomy.ts`. May need multiple taxonomy filter combinations.
- **Empty filter results** -- show "No tours found" message with clear filters CTA

## Next Steps
-> Phase 8: Auth & User System
