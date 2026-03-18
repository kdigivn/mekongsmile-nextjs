---
phase: 5
title: "Tour Listing & Filter UX"
status: pending
effort: 2h
priority: P2
depends_on: [phase-01, phase-02]
---

# Phase 5: Tour Listing & Filter UX

## Context Links
- [UI/UX Research — Filter section](../reports/researcher-uiux-mekongsmile-redesign.md)
- [OTA Inspiration — Airbnb filter pills](../reports/researcher-ota-design-inspiration.md)
- Current: `src/views/tour/tour-listing-view.tsx` (210 lines)

## Overview
Add horizontal filter pill chips (sticky on scroll), sort dropdown, result count with active filter state, and improved mobile filter sheet. Current listing already has sidebar filters + mobile sheet — enhance, not rebuild.

## Key Insights
- `tour-listing-view.tsx` at 210 lines — already at limit; must extract components
- Filter sidebar exists (`tour-filter-sidebar.tsx`) — keep but add pill chip summary above grid
- Mobile sheet exists — improve with full-screen style
- `activeFilters` passed from server — can show active state on pills
- Need sort dropdown (currently no sort capability)

## Related Code Files

### Files to Modify
- `src/views/tour/tour-listing-view.tsx` — Add filter pills, sort, extract components
- `src/views/tour/tour-filter-sidebar.tsx` — Add dynamic counts, progressive disclosure

### Files to Create
- `src/views/tour/tour-filter-pills.tsx` — Horizontal sticky pill chips
- `src/views/tour/tour-sort-dropdown.tsx` — Sort by Popular/Price/Rating

## Implementation Steps

### Step 1: Create TourFilterPills
`src/views/tour/tour-filter-pills.tsx` (client component):
```tsx
"use client";
// Horizontal scrollable pill chips showing active filters
// Click pill to remove filter (navigate with updated params)
// Sticky: position: sticky, top: 60px (below nav)
<div className="sticky top-[60px] z-30 -mx-4 bg-pageBackground px-4 py-3">
  <div className="flex gap-2 overflow-x-auto scrollbar-hide">
    {activeDestination && (
      <FilterPill label={activeDestination} onRemove={...} />
    )}
    {activeTourType && (
      <FilterPill label={activeTourType} onRemove={...} />
    )}
    {activeTravelStyles.map(s => (
      <FilterPill key={s} label={s} onRemove={...} />
    ))}
    {hasAnyFilter && (
      <button className="text-xs text-primary hover:underline">Clear all</button>
    )}
  </div>
</div>
```

Pill chip style:
```tsx
<span className="inline-flex items-center gap-1 rounded-full border bg-white px-3 py-1 text-xs font-medium">
  {label}
  <X className="h-3 w-3 cursor-pointer" onClick={onRemove} />
</span>
```

### Step 2: Create TourSortDropdown
`src/views/tour/tour-sort-dropdown.tsx`:
```tsx
// Use shadcn Select component
// Options: Popular (default), Price Low→High, Price High→Low, Newest
// Client-side sort (tours already loaded)
```

### Step 3: Update result count header
In `tour-listing-view.tsx`, replace simple count text:
```tsx
<div className="flex items-center justify-between">
  <p className="text-sm text-muted-foreground">
    Showing {filteredTours.length} of {tours.length} tours
    {localSearch && <> for "<strong>{localSearch}</strong>"</>}
  </p>
  <TourSortDropdown onSort={handleSort} />
</div>
```

### Step 4: Extract grid + load-more into sub-component
Current `tour-listing-view.tsx` is 210 lines. Extract the grid rendering:
- Tour grid + load more can stay inline (main responsibility of this view)
- But filter pills + sort are extracted to separate files

### Step 5: Update mobile filter sheet
In mobile `Sheet`, increase width and add header:
```tsx
<SheetContent side="left" className="w-full sm:w-80 overflow-y-auto p-0">
  <div className="sticky top-0 bg-white p-4 border-b z-10">
    <div className="flex items-center justify-between">
      <h2 className="font-semibold">Filters</h2>
      <button onClick={() => setMobileFiltersOpen(false)}>
        <X className="h-5 w-5" />
      </button>
    </div>
  </div>
  <div className="p-4">
    <TourFilterSidebar ... />
  </div>
</SheetContent>
```

### Step 6: Add dynamic filter counts (if data available)
In `tour-filter-sidebar.tsx`, if filter options include counts, display them:
```tsx
<label>
  <Checkbox ... />
  Floating Markets <span className="text-muted-foreground">(12)</span>
</label>
```
Note: Counts depend on server data; show only if available in `FilterOptions`.

## Todo List
- [ ] Create `tour-filter-pills.tsx` — horizontal sticky pill chips
- [ ] Create `tour-sort-dropdown.tsx` — sort by price/popularity
- [ ] Add filter pills above tour grid in `tour-listing-view.tsx`
- [ ] Add sort dropdown next to result count
- [ ] Improve mobile filter sheet (full-width, sticky header)
- [ ] Add client-side sort logic (price asc/desc, newest)
- [ ] Keep `tour-listing-view.tsx` under 200 lines
- [ ] Run `npm run build`
- [ ] Visual check: filter pills, sort, mobile sheet

## Success Criteria
- Active filters shown as pill chips above grid (sticky on scroll)
- Clicking X on pill removes that filter
- Sort dropdown with 4 options
- Mobile filter sheet is full-width with sticky header
- Result count shows "Showing X of Y tours"

## Risk Assessment
- **URL-based filtering** — Filter pills remove filters by navigating to updated URL params. Ensure `useRouter` + `useSearchParams` work correctly
- **Sort is client-side only** — Fine for current tour count (~34 tours). If > 100, need server-side sort
