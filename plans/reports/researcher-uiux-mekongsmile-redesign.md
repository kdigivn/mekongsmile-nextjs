# Research Report: UI/UX Redesign — mekongsmile.com

**Date:** 2026-03-19
**Sources:** Gemini 3 Flash, Klook/GetYourGuide/Viator/Airbnb pattern analysis
**Stack:** Next.js 14 + Tailwind CSS + shadcn/ui + HeroUI

---

## Executive Summary

Current mekongsmile.com frontend is functional but visually basic — solid color hero, minimal tour cards, no social proof, no interactive filtering UX. Competitors (Klook, Viator, GetYourGuide) set high bar with immersive heroes, rich tour cards, sticky booking widgets, and trust signals.

Key upgrades needed: (1) immersive hero with video/image, (2) enriched tour cards with ratings + badges, (3) sticky booking widget on tour detail, (4) mobile-first sticky CTA bar, (5) refined color palette reflecting Mekong Delta brand.

---

## Color Palette: "The Delta's Breath"

| Role | Name | Hex | Tailwind Key | Usage |
|------|------|-----|-------------|-------|
| Primary | Paddy Green | `#2D5A27` | `primary` | Brand, primary buttons |
| Secondary | Silt Blue | `#4A7C8C` | `secondary` | Nav, secondary buttons |
| Accent | Clay Earth | `#B35D38` | `accent` | Badges, terracotta accents |
| CTA | Sunlight Gold | `#F4E30C` | `cta` | Booking buttons (high contrast) |
| Background | Rice Paper | `#F9F7F2` | `pageBackground` | Page bg (soft, organic) |

## Typography

| Script | Font | Weight | Usage |
|--------|------|--------|-------|
| EN/VI | **Be Vietnam Pro** | 400, 500, 600, 700 | All text (designed for Vietnamese diacritics) |
| ZH | **Noto Sans SC** | 400, 500, 700 | Chinese fallback |

```ts
// tailwind.config.ts
fontFamily: {
  sans: ['"Be Vietnam Pro"', '"Noto Sans SC"', 'sans-serif'],
}
```

---

## Homepage Redesign

### Hero Section
**Current:** Solid `primary-900` background + text
**Recommended:** Full-width video/image background

```tsx
<section className="relative h-[80vh] min-h-[500px] w-full overflow-hidden bg-black">
  <video autoPlay loop muted playsInline
    className="absolute inset-0 h-full w-full object-cover opacity-60">
    <source src="/hero-video.mp4" type="video/mp4" />
  </video>
  <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
    <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-6xl">
      Discover the Heart of the Delta
    </h1>
    <p className="mt-4 max-w-xl text-lg text-white/80">
      Authentic day tours, river cruises, and cultural experiences
    </p>
    <div className="mt-8 w-full max-w-4xl rounded-xl bg-white/95 p-2 shadow-2xl backdrop-blur-sm sm:p-4">
      {/* Quick Search: Destination + Date + Guests */}
    </div>
  </div>
</section>
```

**Fallback:** High-res static image of sunrise over Mekong with boat.

### Featured Tours Grid
- 2x3 grid desktop, 1-col mobile
- Cards with 16:10 image ratio, location badge overlay, duration badge, star rating, price

### Destinations Section
**Current:** Simple text pills
**Recommended:** Image-based cards with hover overlay

```tsx
<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
  {destinations.map(d => (
    <Link href={`/destination/${d.slug}/`} className="group relative aspect-[4/3] overflow-hidden rounded-2xl">
      <img src={d.image} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-4 left-4 text-white">
        <h3 className="text-lg font-bold">{d.name}</h3>
        <p className="text-sm text-white/80">{d.count} tours</p>
      </div>
    </Link>
  ))}
</div>
```

### Why Choose Us
- Icon-based feature cards (3-4 items)
- Stats counter with scroll animation: *10k+ Guests | 50+ Tours | 7 Years*

---

## Tour Card Redesign

**Current:** Basic card with name + price
**Recommended:**

```tsx
<div className="group overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-xl transition-shadow">
  <div className="relative aspect-[16/10] overflow-hidden">
    <img src={tour.image} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
    {/* Location badge */}
    <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
      {tour.destination}
    </span>
    {/* Duration badge */}
    <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
      {tour.duration}
    </span>
  </div>
  <div className="p-4">
    <h3 className="line-clamp-2 text-base font-semibold group-hover:text-primary">{tour.name}</h3>
    <div className="mt-2 flex items-center gap-1 text-sm text-amber-500">
      ★ 4.9 <span className="text-muted-foreground">(120)</span>
    </div>
    <div className="mt-3 flex items-baseline justify-between">
      <div>
        <span className="text-xs text-muted-foreground">From</span>
        <span className="ml-1 text-lg font-bold">${tour.price}</span>
        <span className="text-xs text-muted-foreground"> / person</span>
      </div>
    </div>
  </div>
</div>
```

---

## Tour Detail Page

### Layout: 65/35 Split
```
┌────────────────────────┬──────────────┐
│  Image Gallery (Bento) │              │
├────────────────────────┤  Sticky      │
│  Title + Rating        │  Booking     │
│  Highlights            │  Widget      │
│  Description           │              │
│  Itinerary (timeline)  │  - Date      │
│  Includes / Excludes   │  - Guests    │
│  Meeting Point + Map   │  - Price     │
│  FAQ Accordion         │  - [Book]    │
│  Reviews               │              │
│  Related Tours         │              │
└────────────────────────┴──────────────┘
```

### Image Gallery: Bento Grid (5 images)
```tsx
<div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden aspect-[16/9]">
  <div className="col-span-2 row-span-2 relative group">
    <img className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
  </div>
  <div className="col-span-1 row-span-1" /> {/* thumbnail */}
  <div className="col-span-1 row-span-1" /> {/* video loop */}
  <div className="col-span-1 row-span-1" /> {/* thumbnail */}
  <div className="col-span-1 row-span-1 relative">
    <button className="absolute inset-0 bg-black/40 text-white">+12 Photos</button>
  </div>
</div>
```

### Booking Widget (Sticky Sidebar)
```tsx
<div className="rounded-2xl border border-white/20 bg-white/70 backdrop-blur-xl p-6 shadow-xl">
  <div className="flex items-baseline gap-2">
    <span className="text-3xl font-bold">$120</span>
    <span className="text-sm text-muted-foreground">/ person</span>
  </div>
  <div className="mt-2 flex items-center gap-2 text-green-600 text-sm font-semibold">
    ✓ Free cancellation until 24h before
  </div>
  {/* Date picker, guest selector */}
  <button className="mt-4 w-full bg-primary py-4 rounded-xl text-white font-bold hover:bg-primary/90 active:scale-[0.98] transition-all">
    Book Now
  </button>
  <p className="mt-2 text-center text-xs text-muted-foreground">Instant confirmation</p>
</div>
```

### Mobile: Sticky Bottom CTA
```tsx
<div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t p-4 flex items-center justify-between z-50">
  <div>
    <div className="text-xs text-muted-foreground uppercase tracking-wider">From</div>
    <div className="text-xl font-bold">$120</div>
  </div>
  <button className="bg-primary text-white px-8 py-3 rounded-lg font-bold">
    Select Date
  </button>
</div>
```

### Content Sections Order
1. Title + Quick Rating + Location + Wishlist
2. Highlights (3-5 bullet bento cards)
3. Description (truncated with "Read More")
4. Itinerary (vertical timeline)
5. Includes / Excludes (side-by-side)
6. Meeting Point + embedded map
7. FAQ (accordion)
8. Reviews (summary + list)
9. Related Tours (horizontal scroll)

---

## Tours Listing Page

### Filter Sidebar
- Progressive disclosure: show Price Range, Tour Type, Destination first
- Dynamic counts: `Floating Markets (12)`
- Mobile: FAB "Filters" button → full-screen sheet

### Sort Options
- Popular (default), Price Low→High, Price High→Low, Rating, Newest

### Result Count
- "Showing 1-12 of 48 tours" with clear filter state

---

## Trust Signals (Global)

| Signal | Placement | Style |
|--------|-----------|-------|
| Free cancellation | Tour card + detail + booking widget | Green badge |
| Instant confirmation | Booking widget | Check icon |
| Secure payment | Footer + checkout | Lock icon + payment logos |
| "Booked 15 times today" | Tour detail, near CTA | Subtle urgency text |
| Star ratings | Tour cards + detail header | Amber stars |
| Guest count | Homepage stats | Animated counter |

---

## Visual Trends 2025-2026

- **Micro-interactions:** `hover:scale-[1.02] transition-all duration-300`
- **Large rounded corners:** `rounded-2xl` / `rounded-3xl`
- **Glassmorphism:** `bg-white/70 backdrop-blur-xl` on booking widgets
- **Serif headings:** Large bold serif for hero, clean sans-serif body
- **Bento grid layouts:** Modular card-based sections
- **AI Summary:** Review section with "AI Summary of 500+ Reviews"

---

## Implementation Priority

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 1 | Color palette + typography update (tailwind.config) | 1h | High — brand identity |
| 2 | Tour card redesign (badges, rating, hover) | 2h | High — conversion |
| 3 | Hero section (video/image background) | 2h | High — first impression |
| 4 | Tour detail 65/35 layout + sticky booking widget | 3h | High — booking conversion |
| 5 | Mobile sticky bottom CTA bar | 1h | High — mobile conversion |
| 6 | Bento image gallery on tour detail | 2h | Medium — visual impact |
| 7 | Destination image cards | 1h | Medium — discovery |
| 8 | Filter sidebar UX (progressive disclosure, counts) | 2h | Medium — usability |
| 9 | Trust signals (badges, social proof) | 1h | Medium — conversion |
| 10 | Why Choose Us stats + animation | 1h | Medium — branding |

**Total estimated effort: ~16h**

---

## Unresolved Questions

1. Do we have hero video content? If not, use high-res static image initially
2. Are star ratings available from WP/WooCommerce reviews, or need external source (TripAdvisor)?
3. Is there a budget for professional photography for destination cards?
4. Should we keep HeroUI components or fully migrate to shadcn/ui for consistency?
