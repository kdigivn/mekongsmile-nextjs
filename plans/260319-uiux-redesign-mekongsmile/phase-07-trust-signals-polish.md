---
phase: 7
title: "Trust Signals & Final Polish"
status: pending
effort: 1h
priority: P2
depends_on: [phase-01, phase-02, phase-04]
---

# Phase 7: Trust Signals & Final Polish

## Context Links
- [UI/UX Research — Trust Signals section](../reports/researcher-uiux-mekongsmile-redesign.md)
- [OTA Inspiration — Viator trust badges](../reports/researcher-ota-design-inspiration.md)

## Overview
Add trust signal badges, social proof micro-copy, and final visual polish across the site. Small effort, significant conversion impact.

## Key Insights
- Trust signals are small UI additions scattered across existing components
- "Best Seller" / "Likely to Sell Out" — need data source (WP product tags: `productTags.nodes`)
- Free cancellation badge — static text, show on tour card + detail + booking widget
- Payment icons already in footer — just verify styling
- "Booked X times today" — no real-time data; can use static or hide

## Related Code Files

### Files to Modify
- `src/views/tour/tour-card.tsx` — Add "Best Seller" badge if productTag matches
- `src/views/tour/tour-pricing-section.tsx` — Already has trust signals from Phase 4; add instant confirmation icon
- `src/views/tour/tour-detail-view.tsx` — Add trust badge below title
- `src/components/footer/footer.tsx` — Verify payment icons; add "Secure Payment" text

### Files to Create
- `src/components/trust-badges.tsx` — Reusable trust badge components

## Implementation Steps

### Step 1: Create trust badge components
`src/components/trust-badges.tsx`:
```tsx
import { Check, Shield, Flame, Award } from "lucide-react";

export function FreeCancellationBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
      <Check className="h-3.5 w-3.5" /> Free cancellation
    </span>
  );
}

export function BestSellerBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-bold text-amber-700 uppercase tracking-wider">
      <Award className="h-3 w-3" /> Best Seller
    </span>
  );
}

export function LikelyToSellOutBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-red-50 border border-red-100 px-2 py-0.5 text-xs font-bold text-red-600 uppercase tracking-wider">
      <Flame className="h-3 w-3" /> Likely to sell out
    </span>
  );
}

export function InstantConfirmationBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Check className="h-3.5 w-3.5" /> Instant confirmation
    </span>
  );
}

export function SecurePaymentBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Shield className="h-3.5 w-3.5" /> Secure payment
    </span>
  );
}
```

### Step 2: Add badges to TourCard
In `tour-card.tsx`, check `productTags.nodes` for "best-seller" or "likely-to-sell-out" tags:
```tsx
const isBestSeller = tour.productTags?.nodes?.some(t => t.slug === "best-seller");
const isLikelyToSellOut = tour.productTags?.nodes?.some(t => t.slug === "likely-to-sell-out");

// Render above card title or on image overlay
{isBestSeller && <BestSellerBadge />}
{isLikelyToSellOut && <LikelyToSellOutBadge />}
```

### Step 3: Add free cancellation to tour card
Below the price line in tour card:
```tsx
<FreeCancellationBadge />
```

### Step 4: Add trust signals to tour detail title area
In `tour-detail-view.tsx`, below the h1:
```tsx
<div className="flex flex-wrap gap-2">
  {isBestSeller && <BestSellerBadge />}
  {isLikelyToSellOut && <LikelyToSellOutBadge />}
  <FreeCancellationBadge />
</div>
```

### Step 5: Footer payment section polish
In `footer.tsx`, add "Secure Payment" text above payment icons:
```tsx
<p className="mb-2 flex items-center gap-1 text-sm font-semibold">
  <Shield className="h-4 w-4" /> Secure Payment
</p>
```

### Step 6: Final polish sweep
- Verify all `rounded-2xl` corners are consistent
- Verify `shadow-card` / `shadow-cardHover` applied on all cards
- Check `bg-pageBackground` (Rice Paper) is applied on body
- Ensure consistent `transition-all duration-300` on hover effects
- Check mobile responsive: no horizontal overflow, touch targets >= 44px

## Todo List
- [ ] Create `src/components/trust-badges.tsx`
- [ ] Add Best Seller / Likely to Sell Out badges to tour card (based on productTags)
- [ ] Add Free Cancellation badge to tour card
- [ ] Add trust badges to tour detail page title area
- [ ] Add "Secure Payment" label to footer
- [ ] Final consistency check: rounded corners, shadows, transitions
- [ ] Run `npm run build` — full build success
- [ ] Visual check: all pages, mobile + desktop

## Success Criteria
- "Best Seller" gold badge appears on tagged tours
- "Likely to Sell Out" red badge appears on tagged tours
- Free cancellation green text on tour cards and detail page
- "Secure Payment" in footer above payment icons
- All hover effects consistent across the site
- Full build passes with no errors

## Risk Assessment
- **ProductTag slugs** — Must match exact WP tag slugs ("best-seller", "likely-to-sell-out"). Verify tag names in WP admin
- **Badge visual clutter** — If tour has both Best Seller + Likely to Sell Out, show only one (prefer Best Seller)
