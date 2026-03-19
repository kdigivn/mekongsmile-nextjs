---
phase: 1
title: "Design Foundation — Tokens, Fonts, Globals"
status: pending
effort: 2h
priority: P1
---

# Phase 1: Design Foundation

## Context Links
- [UI/UX Research](../reports/researcher-uiux-mekongsmile-redesign.md) — Color palette, typography specs
- [OTA Inspiration](../reports/researcher-ota-design-inspiration.md) — Visual trends 2025-2026

## Overview
Replace current Inter font + ferry-era green with Mekong Delta brand identity. Update Tailwind config, CSS variables, and root layout. All subsequent phases depend on this.

## Key Insights
- Current primary `#218721` too saturated — new `#2D5A27` is earthier
- HeroUI theme system uses `themes` export in `tailwind.config.ts` — must update both HeroUI theme object AND Tailwind extend colors
- `globals.css` body font-family references `--font-inter` — must change to `--font-be-vietnam-pro`
- `layout.tsx` imports `Inter` from `next/font/google` — replace with `Be_Vietnam_Pro`

## Related Code Files

### Files to Modify
- `tailwind.config.ts` — Update HeroUI `themes.light.colors`, add new tokens (accent, cta, pageBackground)
- `src/app/globals.css` — Update body font-family, add new CSS custom properties, update `--radius`
- `src/app/layout.tsx` — Replace `Inter` with `Be_Vietnam_Pro`, update CSS variable names

### Files to Verify After
- `src/components/app-bar.tsx` — Check nav renders with new colors
- `src/components/footer/footer.tsx` — Check footer renders correctly
- `NextTopLoader` color in `layout.tsx` — Update to new primary

## Implementation Steps

### Step 1: Install Be Vietnam Pro font
In `src/app/layout.tsx`:
```tsx
// REMOVE
import { Inter, Noto_Sans_SC } from "next/font/google";
const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-inter", weight: ["400", "500", "600", "700"] });

// ADD
import { Be_Vietnam_Pro, Noto_Sans_SC } from "next/font/google";
const beVietnamPro = Be_Vietnam_Pro({ subsets: ["latin", "vietnamese"], variable: "--font-be-vietnam-pro", weight: ["400", "500", "600", "700"] });
```
Update `<html>` className to use `beVietnamPro.variable`.

### Step 2: Update body font-family in globals.css
```css
body {
  font-family: var(--font-be-vietnam-pro), var(--font-noto-sans-sc), sans-serif;
}
```

### Step 3: Update `NextTopLoader` color
```tsx
<NextTopLoader color="#2D5A27" height={3} showSpinner={false} shadow={false} />
```

### Step 4: Update HeroUI theme colors in tailwind.config.ts
Replace `themes.light.colors.primary` scale:
```ts
primary: {
  DEFAULT: "#2D5A27",
  foreground: "#ffffff",
  "100": "#e8f5e4",
  "200": "#c8e6c0",
  "300": "#8cc480",
  "400": "#5a9e4e",
  "500": "#2D5A27",
  "600": "#254d21",
  "700": "#1d3f1a",
  "800": "#153114",
  "900": "#0e240e",
},
```

### Step 5: Add new color tokens in tailwind.config.ts extend.colors
```ts
// New brand colors
secondary: {
  DEFAULT: "#4A7C8C",
  foreground: "#ffffff",
  "100": "#e0eef2",
  "200": "#b3d4de",
  "300": "#80b5c5",
  "400": "#5a97a9",
  "500": "#4A7C8C",
  "600": "#3d6776",
  "700": "#305260",
  "800": "#233d4a",
  "900": "#172934",
},
accent: {
  DEFAULT: "#B35D38",
  foreground: "#ffffff",
},
cta: {
  DEFAULT: "#F4E30C",
  foreground: "#1a1a00",
},
pageBackground: "#F9F7F2",
```

### Step 6: Update CSS custom properties in globals.css
```css
:root {
  --radius: 0.75rem; /* upgrade from 0.5rem for larger rounded corners */
  --accent: 18 54% 46%; /* #B35D38 in HSL */
  --accent-foreground: 0 0% 100%;
  --muted: 40 23% 96%; /* warmer muted matching Rice Paper */
  --muted-foreground: 0 0% 40%;
}
```

### Step 7: Add new box-shadow tokens
In tailwind.config.ts `extend.boxShadow`:
```ts
"card": "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)",
"cardHover": "0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.08)",
"booking": "0 8px 30px rgb(0 0 0 / 0.04)",
```

### Step 8: Add fontFamily to tailwind.config.ts
```ts
theme: {
  extend: {
    fontFamily: {
      sans: ['"Be Vietnam Pro"', '"Noto Sans SC"', 'sans-serif'],
    },
  }
}
```

## Todo List
- [ ] Replace Inter with Be Vietnam Pro in layout.tsx
- [ ] Update globals.css font-family reference
- [ ] Update NextTopLoader color to #2D5A27
- [ ] Update HeroUI light theme primary scale
- [ ] Add secondary, accent, cta, pageBackground tokens
- [ ] Update CSS custom properties (--radius, --accent, --muted)
- [ ] Add new box-shadow tokens
- [ ] Add fontFamily to tailwind extend
- [ ] Run `npm run build` to verify no compile errors
- [ ] Visual check: homepage, tour listing, tour detail still render

## Success Criteria
- All pages render without errors
- Font changed to Be Vietnam Pro (visible in devtools)
- Primary green changed from `#218721` to `#2D5A27`
- Background changed from white to Rice Paper `#F9F7F2`
- Rounded corners slightly larger (`0.75rem` base)

## Risk Assessment
- **HeroUI theme override conflicts** — HeroUI generates CSS vars from theme; verify new primary doesn't conflict with shadcn CSS vars
- **Font flash (FOUT)** — Next.js font optimization should handle; verify `display: swap` behavior
