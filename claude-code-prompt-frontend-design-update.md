# Claude Code Prompt: Mekong Smile — Premium UI/UX Redesign (v3)

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
| 1 | Design Foundation (tokens, fonts, globals) | ✅ completed |
| 2 | Tour Card Redesign | ✅ completed |
| 3 | Homepage Redesign | ✅ completed |
| 4 | Tour Detail Page Redesign | ✅ completed |
| 5 | Tour Listing & Filter UX | ✅ completed |
| 6 | Destination & Blog Polish | ✅ completed |
| 7 | Trust Signals & Final Polish | ✅ completed |

Each phase has a detailed `.md` file with implementation steps. **Follow these plans** — they were designed around this codebase. The information below supplements the plans with design direction and reference sites.

---

## Design Direction

### Combined Reference: Wayfare + JTravel

The design blends TWO reference sites — **Wayfare's clean premium editorial layout** with **JTravel's content-rich Vietnamese travel market UX patterns**.

#### Reference 1: Wayfare (wayfare-nextjs.vercel.app) — LAYOUT & FEEL
- **Tech stack:** Next.js + Tailwind v4 + shadcn/ui — same stack as Mekong Smile
- **Hero:** Full-viewport parallax photography with centered white serif/italic headline ("Wander beyond the *bucket list*") + inline search bar (From, To, Date, Duration, People)
- **Typography:** Clean serif + sans-serif pairing, with italic emphasis on key words — editorial magazine feel
- **Tour cards:** Image with badge overlay (e.g., "Seasonal Favorite", "Trending Now"), star rating (★ 4.9), price ($3,799), duration (5 Days / 4 Nights), 2-3 highlight bullet points, "View Details" CTA
- **Destination cards:** Large image cards with region tabs (Asia, Europe, etc.) + "Explore [City]" CTA
- **Experience categories:** Illustrated icon cards (Adventure, Family, Cruises, Wellness)
- **Color palette:** Teal/navy primary, white backgrounds, generous whitespace
- **Overall feel:** Clean, breathing, premium — like a luxury travel magazine

**What to take from Wayfare:**
- ✅ Overall layout structure and spacing (generous whitespace, sections breathe)
- ✅ Typography hierarchy: serif headings (Playfair Display italic for hero) + sans-serif body
- ✅ Tour card layout: image → badges → title + rating → price → highlights → CTA
- ✅ Inline search/filter bar on Tours page
- ✅ Destination region tabs
- ✅ Clean, minimal nav with rounded pill-style active state

#### Reference 2: JTravel (jtravel.com.vn) — CONTENT PATTERNS & UX
- **Market context:** Vietnamese premium tour operator, content-dense but professional
- **Hero:** Full-viewport photography with dark gradient overlay + interactive continent map widget (tabbed: Châu Á / Âu / Mỹ) + trust stats (3900 customers, 180 tours)
- **Navigation:** Dual-bar — dark utility bar on top (About, Blog, Search, Loyalty, Language) + white main nav below (logo + categories + gold CTA button)
- **Tour cards:** Image with layered badges (Tour Hot, airline logo, Flash Sale, Tour No Shopping) + red slot availability bar ("Còn 2/20 slot") + duration + departure city + price (green, bold) with strikethrough original + discount % badge + green CTA button
- **Tour detail:** Sticky bottom tab bar (Overview / Review / Itinerary / Visa / Reviews), day-by-day itinerary timeline with numbered day markers, real-time booking calculator
- **Footer:** 4-5 column grid, logo + tagline + addresses, nav links, contact info, social icons, government certification badge
- **Color:** Green #22A06B primary, red accents for urgency, cream section backgrounds
- **Overall feel:** Professional, content-rich, trust-building — demonstrates operational depth

**What to take from JTravel:**
- ✅ Tour card enrichments: slot availability indicator, departure dates, airline/transport branding
- ✅ Day-by-day itinerary timeline (vertical timeline with day numbers)
- ✅ Trust stats on hero (number of customers, tours, years)
- ✅ Section intro chip labels (small pill above section headings)
- ✅ Sticky tour detail tabs (Overview / Itinerary / Inclusions / FAQ / Reviews)
- ✅ Footer with government/certification badges + multi-column layout
- ✅ Floating multi-channel contact (Phone + Messenger + Zalo)

### How They Merge for Mekong Smile

| Aspect | Source | Implementation |
|--------|--------|----------------|
| Overall spacing & whitespace | Wayfare | Generous padding, sections breathe, magazine feel |
| Hero section | Wayfare layout + JTravel trust stats | Full-bleed photo + serif headline + trust stats bar below |
| Typography | Wayfare | Playfair Display italic for hero, regular for section headings; Be Vietnam Pro for body |
| Tour card layout | Wayfare structure | Image → badges → title + rating → price → highlights → CTA |
| Tour card enrichments | JTravel | Add: availability indicator, departure date chips, duration/nights format |
| Tour card badges | Both | Wayfare-style pill badges + JTravel layered approach (Best Seller, Free Cancellation) |
| Tour detail page | JTravel | Sticky tab bar for sections, day-by-day itinerary timeline |
| Filter/search | Wayfare | Clean inline filter bar with dropdowns |
| Destination cards | Wayfare | Large image cards with region filtering |
| Section headings | JTravel | Small chip/pill label above heading text (e.g., "[TOURS]" then "Featured Experiences") |
| Nav style | Wayfare (simplified) | Single clean nav bar — NOT JTravel's dual-bar (too heavy for international audience) |
| Footer | JTravel structure + Wayfare aesthetics | Multi-column navy footer with certification badges, but clean/minimal styling |
| Color palette | Mekong Smile's own | Green #2D5A27 primary, teal #4A7C8C secondary, gold accents, cream bg — NOT JTravel green or Wayfare teal |
| Contact/chat widget | JTravel | Floating contact cluster (WhatsApp/Messenger/Zalo + Phone) |

### Design Principles

- **Wayfare's breathing room** — generous padding, minimum 48px between sections, images get space to shine
- **JTravel's information density (but cleaner)** — show availability, dates, duration on cards, but with Wayfare's clean typography
- **Editorial serif typography** — Playfair Display for headings, italic for hero emphasis (Wayfare-inspired)
- **Photography-led** — let images do the storytelling, dark overlays only where needed for readability
- **Trust & credibility** — reviews, stats bar, certification badges, transparent pricing (both references)
- **Progressive disclosure** — Wayfare's "View Details" approach, not JTravel's everything-visible cards. Reveal details on demand (shadcn Accordion)
- **Warm Mekong palette** — river greens, earthy golds, warm neutrals. NOT the bright green of JTravel or cool teal of Wayfare

---

## Design Token Updates

The existing `tailwind.config.ts` already has most tokens. Here are the **specific changes** needed:

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

## Component Patterns from References

### Section Heading Pattern (JTravel-inspired, Wayfare-styled)

Every major homepage section uses this pattern:
```tsx
{/* Section intro chip (JTravel) + clean heading (Wayfare) */}
<div className="text-center mb-12">
  <span className="inline-block px-4 py-1.5 text-xs font-medium tracking-wider uppercase
    bg-brand-sage-light text-primary rounded-full mb-4">
    Tours
  </span>
  <h2 className="font-heading text-display">
    Featured <em className="italic">Experiences</em>
  </h2>
  <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
    Handpicked tours through the heart of the Mekong Delta
  </p>
</div>
```

### Tour Card Pattern (Wayfare layout + JTravel enrichments)

```
┌─────────────────────────┐
│ ┌─────────────────────┐ │
│ │                     │ │  ← aspect-[16/10] image
│ │  [Best Seller]      │ │  ← top-left badge (Wayfare pill style)
│ │              [♥]    │ │  ← top-right wishlist heart
│ │  [Can Tho]          │ │  ← bottom-left destination chip
│ └─────────────────────┘ │
│                         │
│  Mekong Delta Day Tour  │  ← font-heading text-base, 2 lines max
│  ★★★★★ (42 reviews)    │  ← amber-500 stars + count
│                         │
│  ⏱ 5 hours  ·  📍 Can Tho │  ← meta row: duration + location
│                         │
│  ┌─ Highlights ───────┐ │  ← 2-3 bullet points (Wayfare pattern)
│  │ ✓ Floating market  │ │
│  │ ✓ Local cooking    │ │
│  └────────────────────┘ │
│                         │
│  From $29 /person       │  ← text-brand-gold text-lg font-bold
│  [ View Details → ]     │  ← outline button, brand-gold border
└─────────────────────────┘
```

**Differences from current card:**
- Add 2-3 highlight bullets (from shortTourInformation.highlights)
- Price moves below highlights (was inline with title)
- "View Details" text-link CTA at bottom
- Section chip + italic emphasis on section headings

### Tour Detail — Sticky Tab Bar (JTravel-inspired)

On tour detail page, add a sticky tab navigation below the main header:

```tsx
{/* Sticky sub-nav for tour detail — appears after scrolling past gallery */}
<div className="sticky top-16 z-40 bg-white/95 backdrop-blur border-b">
  <div className="container mx-auto flex gap-8 overflow-x-auto py-3">
    {['Overview', 'Itinerary', 'Inclusions', 'FAQ', 'Reviews'].map(tab => (
      <button key={tab} className="text-sm font-medium whitespace-nowrap
        text-muted-foreground hover:text-primary transition-colors
        data-[active=true]:text-primary data-[active=true]:border-b-2
        data-[active=true]:border-primary pb-2">
        {tab}
      </button>
    ))}
  </div>
</div>
```

Scroll-spy to highlight active section. Each section has an `id` matching the tab.

### Itinerary Timeline (JTravel-inspired, clean)

```
Day 1 ─── Ho Chi Minh City → Can Tho
│
│  ┌────────────────────────────────────┐
│  │ 📍 06:00 — Hotel pickup in HCMC    │
│  │ 📍 09:30 — Arrive at floating mkt  │
│  │ 🍽️ 12:00 — Lunch at local home     │
│  │ 📍 14:00 — Coconut candy workshop  │
│  └────────────────────────────────────┘
│
Day 2 ─── Can Tho → Ben Tre
│
│  ┌────────────────────────────────────┐
│  │ ...                                │
│  └────────────────────────────────────┘
```

This uses a vertical timeline with day markers on the left. Implementation: CSS border-left + pseudo-element dots.

### Floating Contact Widget (JTravel-inspired)

```tsx
{/* Fixed bottom-right, z-50 */}
<div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
  <button className="w-12 h-12 rounded-full bg-green-500 text-white shadow-lg
    flex items-center justify-center hover:scale-110 transition-transform"
    aria-label="WhatsApp">
    {/* WhatsApp icon */}
  </button>
  <button className="w-12 h-12 rounded-full bg-blue-500 text-white shadow-lg
    flex items-center justify-center hover:scale-110 transition-transform"
    aria-label="Messenger">
    {/* Messenger icon */}
  </button>
  <a href="tel:+84..." className="w-12 h-12 rounded-full bg-brand-gold text-white shadow-lg
    flex items-center justify-center hover:scale-110 transition-transform"
    aria-label="Call us">
    {/* Phone icon */}
  </a>
</div>
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
│              │  Explore the                        │            │   Full viewport (85vh)
│              │  *Mekong Delta*                     │            │   bg: real photo + dark
│              │                                     │            │   overlay 35%
│              │  Authentic river tours, cultural     │            │   h1: font-heading text-hero
│              │  experiences, and hidden gems        │            │   "Mekong Delta" in italic
│              │                                     │            │   (Wayfare-style emphasis)
│              │     [ Explore All Tours ]            │            │ ← CTA: brand-gold bg
│              │                                     │            │
│              └─────────────────────────────────────┘            │
│                                                                 │
│  ─── Trust Stats Bar ─────────────────────────────────────── │ ← NEW: JTravel-inspired
│    ★★★★★           10,000+          50+           7+           │   bg-white, shadow-sm
│    TripAdvisor     Happy Guests    Tours          Years         │   flex justify-around
│  ──────────────────────────────────────────────────────────── │   animate-in on scroll
│                                                                 │
│  [TOURS]                                                        │ ← chip label (JTravel)
│  Featured *Experiences*                     View All Tours →   │ ← italic emphasis (Wayfare)
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │          │
│  │ │  IMAGE   │ │  │ │  IMAGE   │ │  │ │  IMAGE   │ │          │ ← tour-card.tsx
│  │ │  16:10   │ │  │ │  16:10   │ │  │ │  16:10   │ │          │   (Wayfare layout +
│  │ │[BestSell]│ │  │ │[Trending]│ │  │ │[Popular] │ │          │    JTravel enrichments)
│  │ │[Can Tho] │ │  │ │[Ben Tre] │ │  │ │[Phu Quoc]│ │          │
│  │ └──────────┘ │  │ └──────────┘ │  │ └──────────┘ │          │
│  │ Tour Name    │  │ Tour Name    │  │ Tour Name    │          │
│  │ ★★★★★ (42)  │  │ ★★★★★ (38)  │  │ ★★★★☆ (27)  │          │
│  │ ⏱ 5hr · 📍  │  │ ⏱ Full day  │  │ ⏱ 2 days    │          │
│  │ ✓ Highlight  │  │ ✓ Highlight  │  │ ✓ Highlight  │          │
│  │ ✓ Highlight  │  │ ✓ Highlight  │  │ ✓ Highlight  │          │
│  │ From $29     │  │ From $45     │  │ From $120    │          │
│  │ View Details→│  │ View Details→│  │ View Details→│          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  [DESTINATIONS]                                                 │ ← chip label
│  Discover *Iconic Places*                                       │ ← italic emphasis
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  [All] [Can Tho] [Ben Tre] [Phu Quoc] [Con Dao]               │ ← region/area tabs (Wayfare)
│                                                                 │
│  ┌────────────────────────────┐  ┌──────────┐  ┌──────────┐   │ ← Bento grid layout
│  │                            │  │          │  │          │   │   Large card: col-span-2
│  │      MEKONG DELTA          │  │ CAN THO  │  │ BEN TRE  │   │
│  │      12 Tours              │  │ 8 Tours  │  │ 5 Tours  │   │
│  │                            │  │          │  │          │   │
│  │                            │  ├──────────┤  ├──────────┤   │
│  │                            │  │ PHU QUOC │  │ CON DAO  │   │
│  │                            │  │ 3 Tours  │  │ 2 Tours  │   │
│  └────────────────────────────┘  └──────────┘  └──────────┘   │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  [ABOUT US]                                                     │
│  Why Choose *Mekong Smile*                                      │ ← why-choose-section.tsx
│  ─────────────────────────────────────────────────────────────  │   uses ACF whyChooseUs
│                                                                 │
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
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  [BLOG]                                                         │
│  Stories from the *Mekong*                      Read More →     │
│  ┌──────────────────────────────────┐  ┌──────────────┐        │   featured + 2 side cards
│  │   FEATURED POST (large)          │  │  BlogCard    │        │
│  │                                  │  ├──────────────┤        │
│  │                                  │  │  BlogCard    │        │
│  └──────────────────────────────────┘  └──────────────┘        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │ ← CTA Banner (NEW)
│  │     Ready to Explore the Mekong Delta?                  │   │   bg: brand-navy
│  │     [ Browse Tours ]    [ Contact Us ]                  │   │   text: white + gold CTAs
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  MEKONG SMILE    │ TOURS      │ COMPANY   │ CONNECT            │ ← footer.tsx
│  Tagline         │ All Tours  │ About Us  │ Email              │   bg: brand-navy
│  Cert. badges    │ By Dest.   │ Blog      │ Phone              │   JTravel-style columns
│                  │            │ FAQ       │ TripAdvisor        │   + certification badges
│  © 2026 Mekong Smile. All rights reserved.                     │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────── Floating Contact (JTravel) ──────────┐
│                                    [WhatsApp]  ← fixed   │
│                                    [Messenger] ← bottom-  │
│                                    [📞 Phone]  ← right    │
└──────────────────────────────────────────────────────────┘
```

### 2. TOUR LISTING (`src/app/(language)/tours/page.tsx`)

```
┌─────────────────────────────────────────────────────────────────┐
│ [Header — solid bg, not transparent]                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │ ← Page hero (Wayfare-style)
│  │  Breadcrumbs: Home > Tours                               │   │   bg: brand-navy or photo
│  │                                                          │   │   40vh max
│  │  ALL TOURS                                               │   │   font-heading text-display
│  │  Discover 34 authentic *experiences*                     │   │   white text
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🔍 Search tours...                                      │   │ ← Wayfare-style search bar
│  │ [Destination ▾] [Tour Type ▾] [Duration ▾] [Sort ▾]    │   │   clean inline dropdowns
│  └─────────────────────────────────────────────────────────┘   │   uses shadcn Select
│                                                                 │
│  Active filters: [Can Tho ×] [Half Day ×]        Clear All    │ ← tour-filter-pills.tsx
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
│  │  │                       │ │          │ │          │   │   │
│  │  │    MAIN IMAGE         │ │  IMG 2   │ │  IMG 3   │   │   │
│  │  │                       │ │          │ │          │   │   │
│  │  │                       │ ├──────────┤ ├──────────┤   │   │
│  │  │                       │ │  IMG 4   │ │  +3 more │   │   │
│  │  └───────────────────────┘ └──────────┘ └──────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─ Sticky Tab Bar (JTravel) ─────────────────────────────┐   │ ← NEW: appears after gallery
│  │  Overview  |  Itinerary  |  Inclusions  |  FAQ  |  Reviews │   scroll-spy highlights active
│  └────────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────┐  ┌───────────────────────┐   │
│  │                              │  │                       │   │
│  │  TOUR NAME (h1)              │  │  BOOKING SIDEBAR      │   │ ← sticky on desktop
│  │  ★★★★★ (42 reviews)         │  │  ─────────────────    │   │
│  │                              │  │                       │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ │  │  From $29 / person    │   │ ← text-brand-gold text-2xl
│  │  │⏱ 5hr│ │🌍 EN │ │📍 Can│ │  │  ★★★★★ (42 reviews)  │   │
│  │  └──────┘ └──────┘ └ Tho ─┘ │  │                       │   │ ← tour-info-badges.tsx
│  │                              │  │  [ Book This Tour  ]  │   │   brand-gold CTA
│  │  ── #overview ─────────── │  │                       │   │
│  │                              │  │  ✓ Free cancellation  │   │
│  │  HIGHLIGHTS                  │  │  ✓ Instant confirm    │   │ ← trust-badges.tsx
│  │  from shortTourInformation  │  │  ✓ Mobile voucher     │   │
│  │  .highlights (HTML)         │  │                       │   │
│  │                              │  └───────────────────────┘   │
│  │  ── #itinerary ────────── │                               │
│  │                              │                               │
│  │  DAY-BY-DAY ITINERARY       │                               │ ← NEW: JTravel timeline
│  │  ┌─ Day 1 ──────────────┐  │                               │   vertical line + dots
│  │  │ HCMC → Can Tho       │  │                               │   numbered day markers
│  │  │ • 06:00 Hotel pickup  │  │                               │   expand/collapse per day
│  │  │ • 09:30 Floating mkt  │  │                               │
│  │  │ • 12:00 Local lunch   │  │                               │
│  │  └──────────────────────┘  │                               │
│  │  ┌─ Day 2 ──────────────┐  │                               │
│  │  │ Can Tho → Ben Tre    │  │                               │
│  │  │ • ...                 │  │                               │
│  │  └──────────────────────┘  │                               │
│  │                              │                               │
│  │  ── #inclusions ─────── │                               │
│  │                              │                               │
│  │  WHAT'S INCLUDED             │                               │ ← tour-includes-section.tsx
│  │  ▼ Included                  │                               │   (already exists)
│  │    ✓ Hotel pickup            │                               │   uses shadcn Accordion
│  │  ▼ Not Included              │                               │
│  │    ✗ Flights                 │                               │
│  │                              │                               │
│  │  ── #faq ──────────────── │                               │
│  │                              │                               │
│  │  FAQ                         │                               │ ← tour-faq-section.tsx
│  │  ▶ What should I bring?     │                               │   (already exists)
│  │  ▶ Is it suitable for...?   │                               │
│  │                              │                               │
│  │  ── #reviews ──────────── │                               │
│  │                              │                               │
│  │  GUEST REVIEWS               │                               │ ← reviews section
│  │  ★★★★★ 4.8 (42 reviews)    │                               │
│  │                              │                               │
│  │  ┌── Review Card ──────┐   │                               │
│  │  │ "Amazing experience" │   │                               │
│  │  │ — John D., Mar 2026  │   │                               │
│  │  └─────────────────────┘   │                               │
│  │                              │                               │
│  └──────────────────────────────┘                               │
│                                                                 │
│  ── Mobile CTA bar ────────────────────────────────────────── │ ← tour-mobile-cta-bar.tsx
│  │  From $29    [ Book This Tour ]                           │ │   (already exists)
│  ─────────────────────────────────────────────────────────── │   sticky bottom on mobile
│                                                                 │
│  [RELATED]                                                      │
│  You May Also *Like*                                            │ ← Related tours
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
│  │  Breadcrumbs: Home > Destinations > Can Tho              │   │   destination photo or
│  │            CAN THO                                      │   │   gradient fallback
│  │            8 tours available                             │   │   font-heading text-display
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [TOURS]                                                        │
│  Tours in *Can Tho*                                             │ ← destination-view.tsx
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │   (already exists)
│  │  TourCard    │  │  TourCard    │  │  TourCard    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  [STORIES]                                                      │
│  Stories from *Can Tho*                                         │ ← Blog posts filtered
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
│  [BLOG]                                                         │
│  Mekong Delta *Stories*                     ← font-heading      │
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

/* Section chip label */
.section-chip {
  @apply inline-block px-4 py-1.5 text-xs font-medium tracking-wider uppercase
    bg-brand-sage-light text-primary rounded-full mb-4;
}
```

### Phase 2: Tour Card

In `src/views/tour/tour-card.tsx`:
- Add `font-heading` to tour name `<h3>`
- Change price to `text-brand-gold font-bold`
- Add 2-3 highlight bullet points below meta (from shortTourInformation.highlights)
- Add "View Details →" link at bottom
- Keep existing badge system, but style as Wayfare-style pills (rounded-full, subtle bg)

### Phase 3: Homepage

In `src/views/homepage/hero-section.tsx`:
- Replace gradient bg with actual photo + dark overlay 35%
- Use `text-hero font-heading` for h1
- Add italic `<em>` on "Mekong Delta" (Wayfare editorial style)
- CTA button: `bg-brand-gold text-brand-navy hover:bg-brand-gold-light font-semibold`

Create `src/views/homepage/trust-stats-bar.tsx` (NEW — JTravel-inspired):
- TripAdvisor rating, guest count, tour count, years
- `bg-white shadow-sm rounded-2xl -mt-12 relative z-10 mx-auto max-w-4xl`
- Overlaps hero section by 48px for visual depth

Add section chip labels to all homepage sections (JTravel pattern):
- `<span className="section-chip">Tours</span>`
- Before each section heading

### Phase 4: Tour Detail

Add sticky tab bar (JTravel-inspired):
- Appears after scrolling past gallery
- Tabs: Overview | Itinerary | Inclusions | FAQ | Reviews
- Scroll-spy highlights active tab
- `sticky top-16 z-40 bg-white/95 backdrop-blur border-b`

Add day-by-day itinerary timeline (JTravel-inspired):
- Vertical timeline with `border-l-2 border-primary/20`
- Day markers: numbered circles on the line
- Collapsible per day using shadcn Accordion

In `src/views/tour/tour-detail-view.tsx`:
- Add `font-heading` to h1
- Price: `text-brand-gold text-2xl font-bold`
- Section headings: `font-heading text-xl`
- Ensure sticky sidebar works (already has `lg:w-[35%]` layout)

### Phase 5: Tour Listing

Add page hero section (Wayfare-style):
- 40vh hero with brand-navy bg or destination photography
- White text, breadcrumbs inside hero
- Search/filter bar below hero (clean Wayfare-style inline dropdowns)

### Phase 6: Destination & Blog

- Add section chips to destination and blog pages
- Italic emphasis on key heading words

### Phase 7: Trust Signals & Polish

Create `src/components/floating-contact.tsx` (JTravel-inspired):
- Fixed bottom-right cluster: WhatsApp, Messenger, Phone
- `fixed bottom-6 right-6 flex flex-col gap-3 z-50`
- Circular buttons with shadow-lg

Update footer (JTravel structure + Wayfare aesthetics):
- `bg-brand-navy text-white`
- Multi-column: Brand + Tours + Company + Connect
- Add certification/partner badges row at bottom (TripAdvisor, Viator, etc.)

---

## Critical Design Rules

1. **Use existing components** — don't recreate what exists. Modify `tour-card.tsx`, not create `premium-tour-card.tsx`
2. **All headings use `font-heading` (Playfair Display)** — this is the #1 premium differentiator
3. **Hero headings use italic `<em>` on 1-2 key words** — Wayfare's editorial technique
4. **Body text stays `font-sans` (Be Vietnam Pro)** — already configured
5. **Gold (#C5A55A) for prices, CTAs, stars** — use sparingly
6. **Navy (#0B1D3A) for header/footer** — premium frame
7. **Cream (#F9F7F2) alternates with white** — already set as `pageBackground`
8. **Section chips before every section heading** — JTravel's organizational pattern
9. **Images: `rounded-2xl`** — already used on tour cards, keep consistent
10. **Section spacing: `section-spacing` class** — generous, premium feel
11. **Mobile: sticky CTA bar at bottom** — `tour-mobile-cta-bar.tsx` already exists
12. **Do NOT remove HeroUI Navbar** — it handles mobile hamburger, just restyle colors
13. **Floating contact widget** — always visible on all pages (WhatsApp/Messenger/Phone)
14. **Progressive disclosure** — Wayfare's clean approach, NOT JTravel's everything-visible style

---

## File Map (What Exists vs What to Create)

### Existing Components — All Restyled ✅
```
✅ src/views/tour/tour-card.tsx              ← font-heading h3, brand-gold stars + price, trust badges
✅ src/views/tour/tour-detail-view.tsx       ← font-heading h1 + section headings, brand-gold stars, 65/35 split
✅ src/views/tour/tour-listing-view.tsx      ← filter pills, sort dropdown, gap-6 grid
✅ src/views/tour/tour-faq-section.tsx       ← font-heading text-xl heading
✅ src/views/tour/tour-includes-section.tsx  ← font-heading text-xl heading
✅ src/views/tour/tour-meeting-section.tsx   ← font-heading text-xl heading
✅ src/views/tour/tour-pricing-section.tsx   ← brand-gold price, brand-gold CTA button, glassmorphism
✅ src/views/tour/tour-mobile-cta-bar.tsx    ← brand-gold price + CTA
✅ src/views/tour/tour-info-badges.tsx       ← Lucide icon badges (duration, language, group)
✅ src/views/tour/tour-bento-gallery.tsx     ← 5-image bento grid + lightbox
✅ src/views/homepage/hero-section.tsx       ← navy bg + dot pattern, text-hero, brand-gold CTA
✅ src/views/homepage/featured-tours-section.tsx ← font-heading, section-spacing
✅ src/views/homepage/destination-cards-section.tsx ← bento grid (large first card), brand-sage-light bg
✅ src/views/homepage/stats-counter-section.tsx   ← animated count-up (IntersectionObserver)
✅ src/views/blog/blog-posts-grid-view.tsx   ← rounded-2xl shadow-card hover:shadow-cardHover
✅ src/views/destination/destination-view.tsx ← gradient hero + breadcrumbs, font-heading, section-spacing
✅ src/components/app-bar.tsx                ← bg-white/95 backdrop-blur-md, font-heading brand name
✅ src/components/footer/footer.tsx          ← bg-brand-navy, white text hierarchy, payment opacity-70
✅ src/components/trust-badges.tsx           ← BestSeller, LikelyToSellOut, FreeCancellation, SecurePayment
✅ src/components/breadcrumb-nav.tsx         ← ChevronRight separators, white text for dark heroes
✅ tailwind.config.ts                        ← brand-navy/gold/sage-light, text-hero/display, shadow-card/booking
✅ src/app/globals.css                       ← section-spacing, font-heading h1/h2/h3, premium focus/selection/scrollbar
```

### NEW Components — Status
```
✅ src/views/homepage/trust-bar.tsx          ← trust stats bar (stars, TripAdvisor, "Trusted since 2017")
✅ src/views/homepage/cta-banner.tsx         ← bottom CTA section (navy bg, gold + ghost buttons)
✅ src/views/tour/related-tours-section.tsx  ← "You May Also Like" embla carousel
✅ src/components/trust-badges.tsx           ← BestSeller, LikelyToSellOut, FreeCancellation badges
✅ src/components/section-heading.tsx        ← reusable heading with subtitle
✅ src/components/breadcrumb-nav.tsx         ← breadcrumb with chevron separators
✅ src/components/horizontal-scroll-carousel.tsx ← embla-based horizontal scroll
✅ src/views/homepage/stats-counter-section.tsx  ← animated count-up stats
✅ src/views/homepage/destination-cards-section.tsx ← bento grid with gradients
✅ src/views/tour/tour-bento-gallery.tsx     ← 5-image bento grid + lightbox
✅ src/views/tour/tour-info-badges.tsx       ← duration/language/group badges
✅ src/views/tour/tour-mobile-cta-bar.tsx    ← sticky bottom CTA (mobile)
✅ src/views/tour/tour-filter-pills.tsx      ← horizontal sticky filter chips
✅ src/views/tour/tour-sort-dropdown.tsx     ← sort by price/popularity
✅ src/components/ui/loading-skeleton.tsx    ← TourCard + Content skeletons

PENDING:
   src/views/tour/tour-sticky-tabs.tsx       ← sticky section tabs (future)
   src/views/tour/tour-itinerary-timeline.tsx ← day-by-day timeline (future)
   src/components/floating-contact.tsx       ← WhatsApp/Messenger/Phone cluster (future)
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

1. Phase 1: Design Foundation → must be first (tokens, chips, spacing)
2. Phase 2: Tour Card → used by everything else (add highlights, restyle)
3. Phase 3: Homepage → most visible impact (hero, trust bar, section chips)
4. Phase 4: Tour Detail → most complex (sticky tabs, itinerary timeline)
5. Phase 5: Tour Listing & Filters (page hero, Wayfare-style search bar)
6. Phase 6: Destination & Blog (section chips, polish)
7. Phase 7: Trust Signals & Polish (floating contact, footer, final refinements)

After each phase: `npm run build` to verify no errors.

---

## Design Reference URLs

- **Wayfare:** https://wayfare-nextjs.vercel.app/ — Layout, spacing, typography, editorial feel
- **JTravel:** https://jtravel.com.vn/ — Content patterns, tour card enrichments, itinerary timeline, trust signals
- **Live site:** https://mekongsmile.vercel.app/ — Current state to improve from
- **GitHub:** https://github.com/kdigivn/mekongsmile-nextjs — Source code
