# Research Report: OTA Design Inspiration for mekongsmile.com

**Date:** 2026-03-19
**Sources:** Gemini 3 Flash — Klook, GetYourGuide, Viator, Airbnb, Traveloka, Cookly, WithLocals
**Stack:** Next.js 14 + Tailwind CSS + shadcn/ui

---

## Executive Summary

Analyzed 7 OTA platforms: major OTAs (Klook, GetYourGuide, Viator), experience platforms (Airbnb), SEA aggregators (Traveloka), niche tour sites (Cookly, WithLocals). Key 2026 patterns: 5-image bento grids, sticky booking sidebars, mobile bottom CTA bars, social proof badges, AI review summaries. Mekongsmile should adopt "premium niche" aesthetic — Viator's trust signals + Airbnb's storytelling + Cookly's authenticity.

---

## 1. Tour Detail Page — Competitor Analysis

### Klook (Vibrant, Gen Z)
- **Gallery:** 5-image asymmetrical grid (hero 60%, 2x2 thumbnails 40%)
- **Booking:** Sticky sidebar, frosted glass `backdrop-blur`
- **CTA:** Pill `rounded-full`, `#FF5B00` Blaze Orange
- **Proof:** `⭐ 4.8 (12,403) | 500k+ Booked` below title
- **Mobile:** Fixed bottom bar: price + pill CTA

```html
<div class="grid grid-cols-4 grid-rows-2 gap-2 h-[450px]">
  <div class="col-span-2 row-span-2 rounded-l-2xl overflow-hidden">
    <img class="h-full w-full object-cover hover:scale-105 transition-transform" />
  </div>
  <div class="col-span-1 row-span-1 overflow-hidden"><img /></div>
  <div class="col-span-1 row-span-1 rounded-tr-2xl overflow-hidden"><img /></div>
  <div class="col-span-1 row-span-1 overflow-hidden"><img /></div>
  <div class="col-span-1 row-span-1 rounded-br-2xl overflow-hidden"><img /></div>
</div>
```

### GetYourGuide (Premium, Structured)
- **Gallery:** 3-image masonry
- **Badges:** Circular icons: Duration, Language, Group Size on `#F5F5F5` bg
- **Sidebar:** Clean white, sticky, soft `shadow-[0_8px_30px_rgb(0,0,0,0.04)]`
- **CTA:** `rounded-lg`, `#FF5533`
- **Reviews:** AI "What travelers love" summary

```html
<div class="flex gap-6 border-y border-gray-100 py-4 my-6">
  <div class="flex items-center gap-2">
    <div class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">🕒</div>
    <span class="text-sm font-medium">3 hours</span>
  </div>
</div>
```

### Viator (Trust-focused)
- **Trust badges:** "Likely to Sell Out" (red bg), "Best Seller" (gold) above title
- **Price:** `From $XX` + strikethrough + "Lowest Price Guarantee"
- **Traveler photos:** Horizontal scroll with user handles
- **Sections:** Accordion for Included/Meeting Point
- **Mobile:** Dark navy `#034757` bar + coral `#FF7F50` CTA

```html
<span class="inline-flex items-center px-2 py-1 bg-red-50 border border-red-100 rounded text-red-600 text-xs font-bold uppercase tracking-wider">
  🔥 Likely to sell out
</span>

<div class="fixed bottom-0 inset-x-0 bg-[#034757] p-4 flex items-center justify-between z-50 lg:hidden">
  <div>
    <p class="text-gray-300 text-xs uppercase">From</p>
    <p class="text-white text-xl font-bold">$129.50</p>
  </div>
  <button class="bg-[#FF7F50] text-white px-6 py-3 rounded-md font-bold">Check Availability</button>
</div>
```

### Comparison

| Feature | Klook | GetYourGuide | Viator |
|---------|-------|-------------|--------|
| Aesthetic | Vibrant, Social | Premium, Structured | Trust-focused |
| Grid | 5-Asymmetrical | 3-Masonry | 5-Bento |
| Button | Pill `rounded-full` | `rounded-lg` | `rounded-md` |
| Primary | `#FF5B00` | `#FF5533` | `#008768` |
| Innovation | Sensory Reviews | AI Itineraries | Traveler Photos |

---

## 2. Homepage & Listing Patterns

### Klook Homepage
- Hero 40vh, split search bar (Location 35% + Activity 65%) `rounded-full`
- Category icons: horizontal scroll 80px circles
- Cards: 4-col, 3:4 portrait, "Best Seller" badge top-left

### Airbnb Experiences
- Cards: 10:13 aspect, frosted glass overlay bottom with price + rating
- Filters: Horizontal pill chips, sticky, `bg-black text-white` active state
- "Hosted by": 48px avatar overlapping card bottom-left

### Traveloka (SEA)
- Promo carousel: 21:9 banners with app QR
- Category: pill toggles in white container
- Local payment icons (Momo, ZaloPay) in footer

### Niche Sites (Cookly, WithLocals)
- Trust bar: media logos (CNN, Lonely Planet) + live Trustindex
- Guide-first: titles start with guide name ("Cook with Mama Joy")
- Hand-drawn font accents (`font-family: 'Caveat'`) for Local Tips

---

## 3. Recommended Packages

| Category | Package | Version |
|----------|---------|---------|
| Image Gallery | `yet-another-react-lightbox` | ^3.21 |
| Photo Layout | `react-photo-album` | ^3.0 |
| Calendar | `react-day-picker` | ^9.0 |
| Carousel | `embla-carousel-react` | ^8.1 |
| Maps | `react-leaflet` | ^4.2 (already installed) |
| Animation | `framer-motion` | ^11.0 (already installed) |

```bash
npm install embla-carousel-react yet-another-react-lightbox react-photo-album
```

---

## 4. Mekongsmile Design Strategy

### Positioning: "Premium Niche" (not corporate OTA)

**Borrow from:**
- Viator: Trust signals, social proof badges, accordion sections
- Airbnb: Storytelling, guide emphasis, editorial cards
- Cookly/WithLocals: Authenticity, local guide highlight
- GetYourGuide: Info badges, structured layout

**Avoid:**
- Klook's corporate neon energy (too generic)
- Traveloka's super-app complexity (overkill for 34 tours)

### Unique Elements
1. "Meet Your Guide" card — photo + bio + years
2. "Local's Tip" callout with hand-drawn accent font
3. Mekong Delta interactive map with tour pins
4. "River Story" video hero (boat through green canopy)
5. Sustainability/eco-tourism badge

---

## 5. Implementation Priority

| # | Task | Source | Effort |
|---|------|--------|--------|
| 1 | Bento image gallery (5-image) | Klook + Viator | 2h |
| 2 | Sticky booking sidebar + mobile bottom bar | GYG + Viator | 3h |
| 3 | Tour card redesign (badges, rating, hover) | Airbnb + Klook | 2h |
| 4 | Info badges (duration, language, group) | GetYourGuide | 1h |
| 5 | Trust signals (Free cancellation, Best Seller) | Viator | 1h |
| 6 | Hero video/image background | Klook | 2h |
| 7 | Destination image cards with hover | Airbnb | 1h |
| 8 | "Meet Your Guide" section | WithLocals | 1h |
| 9 | Embla carousel for related tours | Airbnb | 1h |
| 10 | Filter pill chips (horizontal, sticky) | Airbnb | 1h |

**Total: ~15h**

---

## Unresolved Questions

1. Dark mobile bottom bar (Viator style) or white (brand alignment)?
2. "Meet Your Guide" — WP has guide data, or need ACF fields?
3. Video hero — have drone/boat footage?
4. Sustainability badge — actual eco-certification?
