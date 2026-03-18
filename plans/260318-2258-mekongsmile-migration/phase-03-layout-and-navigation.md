# Phase 3: Layout & Navigation

## Context Links
- [Plan Overview](./plan.md)
- [Current Root Layout](/Users/khoilq/Documents/DeveloperZone/mekongsmile/src/app/layout.tsx)
- [GraphQL Menu Queries](/Users/khoilq/Documents/DeveloperZone/mekongsmile/graphql/queries/site/getMenus.ts)
- [GraphQL Menu Types](/Users/khoilq/Documents/DeveloperZone/mekongsmile/graphql/types.ts) (Menu, MenuItem)

## Overview
- **Priority:** P1
- **Status:** completed
- **Effort:** 4h
- **Description:** Simplify root layout by removing ferry-specific providers (OrgProvider, LeavePageProvider, FacebookAuthProvider, Meilisearch, Permate). Replace old CMS menu/logo/footer data fetching with new GraphQL service layer. Keep reusable providers (QueryProvider, ThemeProvider, AuthProvider, GoogleAuthProvider, TooltipProvider).

## Key Insights
- Current layout has 12+ nested providers -- many are ferry-specific
- Menu data comes from WPGraphQL: PRIMARY (header), SECONDARY (footer), TOP_BAR_NAV
- Logo/footer/contact info currently fetched via old WP queries -- replace with `getLayoutData()`
- `getLayoutData()` returns `generalSettings` + `menus` in one query
- Header/footer components need adaptation, not full rewrite

## Requirements

### Functional
- Header displays mekongsmile logo + main navigation from WP PRIMARY menu
- Footer displays footer menu + site info from WP
- Mobile navigation works with responsive menu
- All pages render within the layout shell

### Non-Functional
- Layout data fetched in single `getLayoutData()` call (reduces TTFB)
- Dynamic imports for Footer + AppBar preserved (bundle splitting)

## Architecture

```
Root Layout (src/app/layout.tsx)
  |-- QueryProvider
  |-- AuthProvider (simplified, no Facebook)
  |-- GoogleAuthProvider
  |-- ThemeProvider (simplified, no multi-tenant themes)
  |-- StoreLanguageProvider
  |-- TooltipProvider
  |-- Header (ResponsiveAppBar) <-- adapted for new menu shape
  |-- <main>{children}</main>
  |-- Footer <-- adapted for new menu + site info
```

## Related Code Files

### Modify
- `src/app/layout.tsx` -- strip ferry providers, replace data fetching
- `src/components/app-bar.tsx` (or wherever ResponsiveAppBar lives) -- adapt props for new Menu type
- `src/components/footer/footer.tsx` -- adapt props for new menu/site data
- `src/components/footer/footer-mobile-contact-buttons/` -- simplify for tour site

### Remove from layout (not delete files yet -- Phase 11)
- `OrgProvider` import
- `FacebookAuthProvider` import
- `LeavePageProvider` import
- `AppThemeInitializer` (multi-tenant theme)
- `SchemaMarkup` (old ferry schema)
- `PermateTracker` (affiliate)
- `PageTracker` (old analytics)
- Meilisearch `deleteAllDocuments` call in `generateStaticParams`

### Keep as-is
- `src/components/theme-provider.tsx`
- `src/components/confirm-dialog/`
- `src/components/ui/sonner.tsx`
- `src/components/ui/tooltip.tsx`
- `src/services/react-query/query-provider.tsx`

## Implementation Steps

### 1. Simplify root layout data fetching

Replace the 11-item `Promise.all` with:
```ts
import { getLayoutData, getMenuByLocation } from "@/services/wordpress";

const layoutData = await fetchGraphQL<GetLayoutDataResponse>(GET_LAYOUT_DATA);
const { generalSettings, menus } = layoutData;

// Extract menus by location
const primaryMenu = menus.nodes.find(m => m.locations.includes("PRIMARY"));
const secondaryMenu = menus.nodes.find(m => m.locations.includes("SECONDARY"));
```

### 2. Strip ferry-specific providers from JSX tree

Remove these wrapper components from the layout:
- `OrgProvider`
- `FacebookAuthProvider`
- `LeavePageProvider`
- `SearchDialogProvider` (will re-add in Phase 7 with new search)
- `MobileBottomNavProvider` (evaluate if needed for tour site)

### 3. Adapt ResponsiveAppBar props

Current props: `mainMenu`, `mobileMenu`, `logoData`, `highLightPosts`, `contactHeaderIcons`, `displayVoucherSuggestion`

New props:
```ts
interface AppBarProps {
  menu: Menu;          // PRIMARY menu from graphql/types.ts
  siteTitle: string;   // from generalSettings.title
  siteLogo?: string;   // from generalSettings or ACF
}
```

### 4. Adapt Footer props

Current: `footerMenu`, `footerInfo`, `contactRightSide`, `logoData`, `language`

New:
```ts
interface FooterProps {
  menu: Menu;                // SECONDARY menu
  siteSettings: GeneralSettings;
}
```

### 5. Update head preconnects

Replace ferry CDN preconnects:
```html
<link rel="preconnect" href="https://mekongsmile.com" />
```

### 6. Update Google fonts

Change `Inter` subsets from `["vietnamese"]` to `["latin", "vietnamese"]` (English primary).

### 7. Clean up analytics scripts

- Keep GA4/GTM structure but remove smax.ai chat widget
- Remove Permate tracker
- Remove Microsoft Clarity (re-add if needed later)
- Keep cookie banner scripts

## Todo List
- [x] Replace layout data fetching with new GraphQL service
- [x] Remove OrgProvider, FacebookAuthProvider, LeavePageProvider
- [x] Remove Meilisearch, Permate, PageTracker imports
- [x] Adapt ResponsiveAppBar for new Menu type
- [x] Adapt Footer for new menu/settings data
- [x] Update head preconnects to mekongsmile.com
- [x] Update font subsets
- [x] Remove smax.ai chat widget script
- [x] Verify layout renders with `npm run dev`
- [x] Test mobile navigation

## Success Criteria
- Root layout renders with header, main content area, footer
- Navigation menus populate from WP PRIMARY/SECONDARY menus
- No ferry-specific provider errors in console
- Mobile responsive nav works

## Risk Assessment
- **AppBar/Footer deeply coupled to old types** -- may need significant prop refactoring; keep old components as reference
- **Logo source unclear** -- old code uses `getLogo()` which queries `siteLogo`; new schema may use `generalSettings` or ACF field. Test with live endpoint.

## Next Steps
-> Phase 4: Core Pages -- Tours
-> Phase 5: Blog & Content Pages (can start in parallel)
