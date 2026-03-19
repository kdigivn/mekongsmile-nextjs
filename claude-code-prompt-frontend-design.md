# Claude Code Prompt: Mekong Smile — Premium UI/UX Redesign

## Context

You are redesigning the frontend of **mekongsmile.com** — a premium Mekong Delta tour operator targeting high-end international travelers. The codebase already has a working Next.js 16 + headless WordPress setup. Your job is a **visual overhaul** — not a rewrite.

**Current state of the codebase:**
- Next.js 16 + React 19 + App Router (fully functional)
- **HeroUI (@heroui/react)** + **shadcn/ui** (Radix primitives) — hybrid component system
- **Apollo Client 4** + fetch-based GraphQL client (`graphql/client.ts`)
- Tailwind CSS 3.4 + `class-variance-authority` + `tailwind-merge`
- Fonts already configured: `Be_Vietnam_Pro` (body), `Playfair_Display` (headings), `Noto_Sans_SC` (Chinese)
- i18n ready (en/vi/zh) via `react-i18next`
- WordPress GraphQL services in `src/services/wordpress/` — all working
- Tour views: `tour-card.tsx`, `tour-detail-view.tsx`, `tour-listing-view.tsx`, etc. — all functional
- Homepage views: `hero-section.tsx`, `featured-tours-section.tsx`, `destination-cards-section.tsx`
- A **7-phase UI redesign plan** already exists at `plans/260319-uiux-redesign-mekongsmile/`

**What NOT to do:**
- Do NOT rewrite the GraphQL layer, services, or types — they work
- Do NOT change the routing structure (`src/app/(language)/...`) — it works
- Do NOT remove HeroUI — it's used for Navbar, and coexists with shadcn
- Do NOT touch i18n infrastructure
- Do NOT add new npm packages unless absolutely necessary (embla-carousel, yet-another-react-lightbox, lucide-react already installed)

---

## Existing Redesign Plan

There is already a 7-phase plan at `plans/260319-uiux-redesign-mekongsmile/plan.md`. **Read it first.** The phases are:

| Phase | What | Status |
|-------|------|--------|
| 1 | Design Foundation (tokens, fonts, globals) | pending |
| 2 | Tour Card Redesign | pending |
| 3 | Homepage Redesign | pending |
| 4 | Tour Detail Page Redesign | pending |
| 5 | Tour Listing & Filter UX | pending |
| 6 | Destination & Blog Polish | pending |
| 7 | Trust Signals & Final Polish | pending |

Each phase has a detailed `.md` file with implementation steps. **Follow these plans** — they were designed around this codebase. The information below supplements the plans with design direction and reference sites.

---

## Design Direction

### Reference Websites (in priority order)

1. **Remote Lands** (remotelands.com) — PRIMARY REFERENCE
   - Asia-focused luxury travel, warm color palette, narrative-driven
   - Full-bleed hero imagery, dark navy backgrounds, gold accents
   - Trust signals bar (Travel + Leisure, Condé Nast Traveler, Robb Report)
   - Emotional destination pages — "how you'll feel, not just what you'll see"

2. **Butterfield & Robinson** (butterfield.com) — SECONDARY REFERENCE
   - Active luxury travel, intelligent information disclosure
   - Expandable sections for trip detail pages (itinerary, pricing, inclusions)
   - Dynamic but sophisticated layout

3. **Aman** (aman.com) — ASPIRATIONAL REFERENCE
   - Minimalist, vast white space, subtle navigation
   - Serif typography for headings, clean sans-serif for body
   - Calm, peaceful feeling through design restraint

4. **GetYourGuide** (getyourguide.com) — FUNCTIONAL REFERENCE
   - Excellent UX for search, filtering, tour cards
   - Star ratings, review counts, clear pricing on cards
   - Responsive grid layouts, mobile-first booking flow

### Design Principles

- **White space is premium** — generous padding, minimum 48px between sections
- **Photography-led** — let images do the storytelling, minimal text overlay
- **Editorial typography** — Playfair Display for headings (already in `font-heading`), Be Vietnam Pro for body
- **Trust & credibility** — reviews, certifications, partner logos, transparent pricing
- **Progressive disclosure** — don't overwhelm, reveal details on demand (use shadcn Accordion)
- **Warm color palette** — river greens, earthy golds, warm neutrals

---

## Design Token Updates

The existing `tailwind.config.ts` already has most tokens. Here are the **specific changes** needed for the luxury feel:

### Colors to Add/Update in `tailwind.config.ts`

```typescript
// In theme.extend.colors — ADD these new tokens
brand: {
  navy: '#0B1D3A',          // Dark navy for header/footer backgrounds
  gold: '#C5A55A',          // Warm gold for CTAs, prices, star ratings
  'gold-light': '#D4BA7A',  // Gold hover state
  cream: '#FAF7F2',         // Already exists as pageBackground — alias it
  'sage-light': '#E8F0EA',  // Light green tint for alternate section bg
},
```

**Keep existing tokens** (`primary`, `secondary`, `cta`, `pageBackground`) — just add the brand navy/gold for premium elements.

### Typography Enhancement

The fonts are already loaded. Add a fluid heading scale for hero sections:

```typescript
// In theme.extend.fontSize
'hero': ['clamp(2.5rem, 5vw, 4.5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
'display': ['clamp(2rem, 4vw, 3.5rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
```

---

## ASCII Skeleton Layouts

### 1. HOMEPAGE (`src/app/(language)/page.tsx` + `page-content.tsx`)

```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo]         Tours  Destinations  Blog  About    [Contact Us] │ ← HeroUI Navbar
│                                                                 │   transparent on hero
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│              ┌─────────────────────────────────────┐            │
│              │                                     │            │ ← hero-section.tsx
│              │     EXPLORE THE MEKONG DELTA         │            │   Full viewport (80vh)
│              │                                     │            │   bg: real photo + dark
│              │   Authentic tours, river cruises,    │            │   overlay 40%
│              │   and cultural experiences in        │            │
│              │   Vietnam's most vibrant region      │            │   h1: font-heading text-hero
│              │                                     │            │
│              │       [ Explore All Tours ]          │            │ ← CTA: brand-gold bg
│              │                                     │            │
│              └─────────────────────────────────────┘            │
│                                                                 │
│  ─── Trust Bar ────────────────────────────────────────────── │ ← NEW component
│  TripAdvisor ★★★★★  |  Viator Top Rated  |  500+ Reviews      │   bg-white, partner logos
│  ──────────────────────────────────────────────────────────── │
│                                                                 │
│  FEATURED TOURS                              View All Tours →   │ ← featured-tours-section.tsx
│  ─────────────────────────────────────────────────────────────  │   SectionHeading component
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │          │
│  │ │  IMAGE   │ │  │ │  IMAGE   │ │  │ │  IMAGE   │ │          │ ← tour-card.tsx
│  │ │  16:10   │ │  │ │  16:10   │ │  │ │  16:10   │ │          │   aspect-[16/10] (existing)
│  │ │[Can Tho] │ │  │ │[Ben Tre] │ │  │ │[Phu Quoc]│ │          │   destination badge top-left
│  │ └──────────┘ │  │ └──────────┘ │  │ └──────────┘ │          │   duration badge bottom-left
│  │ Tour Name    │  │ Tour Name    │  │ Tour Name    │          │ ← font-heading text-base
│  │ ★★★★★ (42)  │  │ ★★★★★ (38)  │  │ ★★★★☆ (27)  │          │ ← amber-500 stars (existing)
│  │ 5 hours      │  │ Full day     │  │ 2 days       │          │
│  │ From $29     │  │ From $45     │  │ From $120    │          │ ← price: brand-gold bold
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  DISCOVER DESTINATIONS                                          │ ← destination-cards-section.tsx
│  ─────────────────────────────────────────────────────────────  │   bg: brand-sage-light
│                                                                 │
│  ┌────────────────────────────┐  ┌──────────┐  ┌──────────┐   │ ← Bento grid layout
│  │                            │  │          │  │          │   │   Large card: col-span-2
│  │      MEKONG DELTA          │  │ CAN THO  │  │ BEN TRE  │   │   gradient fallback if no img
│  │      12 Tours              │  │ 8 Tours  │  │ 5 Tours  │   │
│  │                            │  │          │  │          │   │
│  │                            │  ├──────────┤  ├──────────┤   │
│  │                            │  │ PHU QUOC │  │ CON DAO  │   │
│  │                            │  │ 3 Tours  │  │ 2 Tours  │   │
│  └────────────────────────────┘  └──────────┘  └──────────┘   │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  WHY CHOOSE MEKONG SMILE                                        │ ← why-choose-section.tsx
│  ─────────────────────────────────────────────────────────────  │   uses tourConstantOptions
│                                                                 │   ACF whyChooseUs (6 items)
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  [icon]  │  │  [icon]  │  │  [icon]  │  │  [icon]  │       │ ← Lucide icons
│  │ Headline │  │ Headline │  │ Headline │  │ Headline │       │   3x2 grid on desktop
│  │ Desc...  │  │ Desc...  │  │ Desc...  │  │ Desc...  │       │   2x3 on tablet, 1x6 mobile
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│  ┌──────────┐  ┌──────────┐                                    │
│  │  [icon]  │  │  [icon]  │                                    │
│  │ Headline │  │ Headline │                                    │
│  │ Desc...  │  │ Desc...  │                                    │
│  └──────────┘  └──────────┘                                    │
│                                                                 │
│  ── Stats Counter ──────────────────────────────────────────  │ ← stats-counter-section.tsx
│    10,000+          50+              7+              500+       │   (already exists)
│    Happy Guests     Tours Available  Years Experience Reviews   │   animate on scroll
│  ──────────────────────────────────────────────────────────── │
│                                                                 │
│  FROM OUR BLOG                                  Read More →     │ ← existing blog section
│  ┌──────────────────────────────────┐  ┌──────────────┐        │   featured + 2 side cards
│  │   FEATURED POST (large)          │  │  BlogCard    │        │
│  │                                  │  ├──────────────┤        │
│  │                                  │  │  BlogCard    │        │
│  └──────────────────────────────────┘  └──────────────┘        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │ ← CTA Banner (NEW)
│  │     Ready to Explore the Mekong Delta?                  │   │   bg: brand-navy
│  │     [ Browse Tours ]    [ Contact Us ]                  │   │   text: white + gold
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  MEKONG SMILE    │ TOURS      │ COMPANY   │ CONNECT            │ ← footer.tsx
│  Tagline         │ All Tours  │ About Us  │ Email              │   bg: brand-navy
│                  │ By Dest.   │ Blog      │ Phone              │   text: white
│                  │            │ FAQ       │ TripAdvisor        │
│  © 2026 Mekong Smile. All rights reserved.                     │
└─────────────────────────────────────────────────────────────────┘
```

### 2. TOUR LISTING (`src/app/(language)/tours/page.tsx`)

```
┌─────────────────────────────────────────────────────────────────┐
│ [Header — solid bg, not transparent]                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Breadcrumbs: Home > Tours                  ← breadcrumb-nav.tsx│
│                                                                 │
│  ALL TOURS                                  ← font-heading      │
│  Discover 34 authentic experiences          ← text-muted        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [All ▾] [Destination ▾] [Tour Type ▾] [Style ▾]        │   │ ← tour-filter-bar.tsx
│  │ [Sort: Recommended ▾]                                   │   │   + tour-filter-pills.tsx
│  └─────────────────────────────────────────────────────────┘   │   uses shadcn Select
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  TourCard    │  │  TourCard    │  │  TourCard    │          │ ← 3-col grid (lg)
│  └──────────────┘  └──────────────┘  └──────────────┘          │   2-col (md), 1-col (sm)
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  TourCard    │  │  TourCard    │  │  TourCard    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│              [ Load More Tours ]                                │ ← cursor pagination
│              Showing 12 of 34                                   │   (already implemented)
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ [Footer]                                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 3. TOUR DETAIL (`src/app/(language)/tour/[slug]/page.tsx`)

```
┌─────────────────────────────────────────────────────────────────┐
│ [Header]                                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Breadcrumbs: Home > Tours > Tour Name                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │ ← tour-bento-gallery.tsx
│  │  ┌───────────────────────┐ ┌──────────┐ ┌──────────┐   │   │   (already exists)
│  │  │                       │ │          │ │          │   │   │   bento layout of images
│  │  │    MAIN IMAGE         │ │  IMG 2   │ │  IMG 3   │   │   │   with lightbox
│  │  │                       │ │          │ │          │   │   │
│  │  │                       │ ├──────────┤ ├──────────┤   │   │
│  │  │                       │ │  IMG 4   │ │  +3 more │   │   │
│  │  └───────────────────────┘ └──────────┘ └──────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────┐  ┌───────────────────────┐   │
│  │                              │  │                       │   │
│  │  TOUR NAME (h1)              │  │  BOOKING SIDEBAR      │   │ ← sticky on desktop
│  │  ★★★★★ (42 reviews)         │  │  ─────────────────    │   │   tour-pricing-section.tsx
│  │                              │  │                       │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ │  │  From $29 / person    │   │ ← text-brand-gold text-2xl
│  │  │⏱ 5hr│ │🌍 EN │ │📍 Can│ │  │  ★★★★★ (42 reviews)  │   │
│  │  └──────┘ └──────┘ └ Tho ─┘ │  │                       │   │ ← tour-info-badges.tsx
│  │                              │  │  [ Book This Tour  ]  │   │   (already exists)
│  │  ────────────────────────    │  │                       │   │
│  │                              │  │  ✓ Free cancellation  │   │
│  │  HIGHLIGHTS                  │  │  ✓ Instant confirm    │   │ ← trust-badges.tsx
│  │  from shortTourInformation   │  │  ✓ Mobile voucher     │   │   (already exists)
│  │  .highlights (HTML)          │  │                       │   │
│  │                              │  └───────────────────────┘   │
│  │  ────────────────────────    │                               │
│  │                              │                               │
│  │  WHAT'S INCLUDED             │                               │ ← tour-includes-section.tsx
│  │  ▼ Included                  │                               │   (already exists)
│  │    ✓ Hotel pickup            │                               │   uses shadcn Accordion
│  │  ▼ Not Included              │                               │
│  │    ✗ Flights                 │                               │
│  │                              │                               │
│  │  ────────────────────────    │                               │
│  │                              │                               │
│  │  MEETING & PICKUP            │                               │ ← tour-meeting-section.tsx
│  │  📍 Pickup: Hotel lobby      │                               │   (already exists)
│  │  ⏰ Start: 5:30 AM           │                               │
│  │  [View on Google Maps →]     │                               │
│  │                              │                               │
│  │  ────────────────────────    │                               │
│  │                              │                               │
│  │  FAQ                         │                               │ ← tour-faq-section.tsx
│  │  ▶ What should I bring?      │                               │   (already exists)
│  │  ▶ Is the tour suitable...?  │                               │   uses shadcn Accordion
│  │                              │                               │
│  └──────────────────────────────┘                               │
│                                                                 │
│  ┌─────────────────── Mobile only ──────────────────────────┐  │ ← tour-mobile-cta-bar.tsx
│  │  From $29    [ Book This Tour ]                          │  │   (already exists)
│  └──────────────────────────────────────────────────────────┘  │   sticky bottom on mobile
│                                                                 │
│  YOU MAY ALSO LIKE                                              │ ← Related tours (NEW)
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │   same destination
│  │  TourCard    │  │  TourCard    │  │  TourCard    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ [Footer]                                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 4. DESTINATION PAGE (`src/app/(language)/destination/[slug]/page.tsx`)

```
┌─────────────────────────────────────────────────────────────────┐
│ [Header]                                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │ ← Hero: 50vh
│  │  Breadcrumbs: Home > Destinations > Can Tho              │   │   destination name + count
│  │            CAN THO                                      │   │   gradient bg (no image
│  │            8 tours available                             │   │   field on destination yet)
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  TOURS IN CAN THO                                               │ ← destination-view.tsx
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │   (already exists)
│  │  TourCard    │  │  TourCard    │  │  TourCard    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  STORIES FROM CAN THO                                           │ ← Blog posts filtered
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │   by destination
│  │  BlogCard    │  │  BlogCard    │  │  BlogCard    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  SUB-DESTINATIONS (if parent)                                   │ ← child destination cards
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Vinh Long    │  │ An Giang     │  │ Dong Thap    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ [Footer]                                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 5. BLOG LISTING (`src/app/(language)/blog/page.tsx`)

```
┌─────────────────────────────────────────────────────────────────┐
│ [Header]                                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  MEKONG DELTA STORIES                       ← font-heading      │
│  Travel guides, local insights, stories     ← text-muted        │
│                                                                 │
│  [All] [Travel Guide] [Top Destinations] [News] [Toplist]       │ ← blog-custom-chip.tsx
│  ─────────────────────────────────────────────────────────────  │   (already exists)
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │ ← Featured post (latest)
│  │  ┌──────────────────────┐  [Category Badge]              │  │   2-column layout
│  │  │   FEATURED IMAGE     │  Post Title (large)            │  │
│  │  │   16:9               │  Excerpt...                    │  │
│  │  └──────────────────────┘  Date · Author · 5 min         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │ ← 3-column grid
│  │  BlogCard    │  │  BlogCard    │  │  BlogCard    │          │   blog-posts-grid-view.tsx
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│              [ Load More Posts ]                                 │ ← paginator
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ [Footer]                                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 6. BLOG DETAIL (`src/app/(language)/blog/[slug]/page.tsx`)

```
┌─────────────────────────────────────────────────────────────────┐
│ [Header]                                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────── container max-w-[960px] ─────────────────────┐ │
│  │  Breadcrumbs                                              │ │
│  │  [Category Badge]                                         │ │
│  │  POST TITLE IN PLAYFAIR DISPLAY               ← display  │ │
│  │  By Author · Date · 5 min read                            │ │
│  │  ┌───────────────────────────────────────────┐            │ │
│  │  │         FEATURED IMAGE (16:9)              │            │ │
│  │  └───────────────────────────────────────────┘            │ │
│  │  Article body with prose typography...                    │ │ ← post-detail-new-view.tsx
│  │  (existing component handles this)                        │ │   sanitizeCmsHtml
│  │  ─────────────────────────────────────────────            │ │
│  │  Tags: [Mekong Delta] [Can Tho]                           │ │
│  │  Share: [Facebook] [Twitter] [Copy]                       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  RELATED ARTICLES                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  BlogCard    │  │  BlogCard    │  │  BlogCard    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ [Footer]                                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Styling Changes (Phase-by-Phase)

### Phase 1: Design Foundation

Update `tailwind.config.ts`:
```typescript
// ADD to theme.extend.colors
brand: {
  navy: '#0B1D3A',
  gold: '#C5A55A',
  'gold-light': '#D4BA7A',
  'sage-light': '#E8F0EA',
},

// ADD to theme.extend.fontSize
'hero': ['clamp(2.5rem, 5vw, 4.5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
'display': ['clamp(2rem, 4vw, 3.5rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
```

Update `src/app/globals.css`:
```css
/* Add section spacing utility */
.section-spacing { padding-block: clamp(3rem, 6vw, 6rem); }
```

### Phase 2: Tour Card

In `src/views/tour/tour-card.tsx`:
- Add `font-heading` to tour name `<h3>`
- Change price color to `text-brand-gold font-bold`
- Ensure badges use proper trust colors
- The card structure is already good — just refine colors and typography

### Phase 3: Homepage

In `src/views/homepage/hero-section.tsx`:
- Replace gradient bg with actual photo + dark overlay
- Use `text-hero` for h1, `font-heading`
- CTA button: `bg-brand-gold text-brand-navy hover:bg-brand-gold-light`

Create `src/views/homepage/trust-bar.tsx`:
- TripAdvisor, Viator logos
- Stats: "500+ Reviews", "Top Rated"

### Phase 4: Tour Detail

In `src/views/tour/tour-detail-view.tsx`:
- Add `font-heading` to h1
- Price: `text-brand-gold text-2xl font-bold`
- Section headings: `font-heading text-xl`
- Ensure sticky sidebar works (already has `lg:w-[35%]` layout)

### Phase 7: Footer

In `src/components/footer/footer.tsx`:
- Change bg to `bg-brand-navy`
- Text to white/white-80
- Multi-column layout with logo + nav columns

---

## Critical Design Rules

1. **Use existing components** — don't recreate what exists. Modify `tour-card.tsx`, not create `premium-tour-card.tsx`
2. **All headings use `font-heading` (Playfair Display)** — this is the #1 premium differentiator
3. **Body text stays `font-sans` (Be Vietnam Pro)** — already configured
4. **Gold (#C5A55A) for prices, CTAs, stars** — use sparingly
5. **Navy (#0B1D3A) for header/footer** — premium frame
6. **Cream (#F9F7F2) alternates with white** — already set as `pageBackground`
7. **Images: `rounded-2xl`** — already used on tour cards, keep consistent
8. **Section spacing: `section-spacing` class** — generous, premium feel
9. **Mobile: sticky CTA bar at bottom** — `tour-mobile-cta-bar.tsx` already exists
10. **Do NOT remove HeroUI Navbar** — it handles mobile hamburger, just restyle colors

---

## File Map (What Exists vs What to Create)

### Already Exists — MODIFY Only
```
src/views/tour/tour-card.tsx              ← restyle typography + colors
src/views/tour/tour-detail-view.tsx       ← restyle sections + add font-heading
src/views/tour/tour-listing-view.tsx      ← adjust grid spacing
src/views/tour/tour-filter-bar.tsx        ← restyle filter UI
src/views/tour/tour-faq-section.tsx       ← already uses Accordion
src/views/tour/tour-includes-section.tsx  ← already works
src/views/tour/tour-meeting-section.tsx   ← already works
src/views/tour/tour-pricing-section.tsx   ← add brand-gold price color
src/views/tour/tour-mobile-cta-bar.tsx    ← restyle with brand-gold CTA
src/views/tour/tour-info-badges.tsx       ← already works
src/views/tour/tour-bento-gallery.tsx     ← already works
src/views/homepage/hero-section.tsx       ← replace gradient with photo
src/views/homepage/featured-tours-section.tsx ← adjust section heading
src/views/homepage/destination-cards-section.tsx ← add bento layout
src/views/homepage/stats-counter-section.tsx   ← already exists
src/views/blog/blog-posts-grid-view.tsx   ← restyle cards
src/views/destination/destination-view.tsx ← add hero section
src/components/app-bar.tsx                ← restyle colors (navy bg option)
src/components/footer/footer.tsx          ← restyle to navy bg
src/components/trust-badges.tsx           ← already has BestSeller, FreeCancellation
src/components/breadcrumb-nav.tsx         ← keep as-is
tailwind.config.ts                        ← add brand colors + fluid fonts
src/app/globals.css                       ← add section-spacing utility
```

### NEW Components to Create
```
src/views/homepage/trust-bar.tsx          ← partner logos bar
src/views/homepage/cta-banner.tsx         ← bottom CTA section
src/views/tour/related-tours-section.tsx  ← "You may also like"
```

---

## GraphQL Integration (Already Done)

All queries are in `graphql/queries/` and services in `src/services/wordpress/`. Key services:

```typescript
// Already working — just call them
import { getAllTours, getTourBySlug } from "@/services/wordpress/tour-service";
import { getAllPosts, getPostBySlug } from "@/services/wordpress/post-service";
import { getDestinations } from "@/services/wordpress/taxonomy-service";
import { getWhyChooseUs } from "@/services/wordpress/options-service";
import { getLayoutData } from "@/services/wordpress/site-service";
```

---

## Environment (Already Configured)

```env
NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL=https://mekongsmile.com/graphql
NEXT_PUBLIC_SITE_URL=https://mekongsmile.com
```

## Build & Deploy

```bash
npm run build          # Next.js build
npm run start          # Production start
# User deploys with PM2 + Nginx (see ecosystem.config.js)
```

---

## Implementation Order

**Follow the 7-phase plan in `plans/260319-uiux-redesign-mekongsmile/`.** Read each phase file before starting. The order is:

1. Phase 1: Design Foundation → must be first
2. Phase 2: Tour Card → used by everything else
3. Phase 3: Homepage → most visible impact
4. Phase 4: Tour Detail → most complex page
5. Phase 5: Tour Listing & Filters
6. Phase 6: Destination & Blog
7. Phase 7: Trust Signals & Polish

After each phase: `npm run build` to verify no errors.
