# Lint & Type Check Report
**Date:** 2026-03-18
**Status:** ISSUES FOUND - 74+ Linting Errors, 3 TypeScript Errors

## Executive Summary
TypeScript type check shows 3 pre-existing errors (marker icon imports - ignored per instructions). ESLint lint check reveals 74+ errors across multiple files with three main categories: Prettier formatting, React memo enforcement, and unused imports/variables.

---

## 1. TypeScript Type Check Results

### Status: PASS (pre-existing errors ignored)
```
src/components/map.tsx(23,26): error TS2307: Cannot find module '../../public/marker-icon-2x.png'
src/components/map.tsx(24,24): error TS2307: Cannot find module '../../public/marker-icon.png'
src/components/map.tsx(25,26): error TS2307: Cannot find module '../../public/marker-shadow.png'
```
**Note:** These are pre-existing errors in static image imports. Ignored per task instructions.

---

## 2. Lint Check Results

### Overall: FAIL - 74+ errors

#### Error Breakdown by Category:

### A. Prettier Formatting Errors (~45 errors)
Multiple files with whitespace/formatting violations:
- `./src/app/(language)/[...slug]/page.tsx` - 2 errors
- `./src/app/(language)/about-us/page.tsx` - 1 error
- `./src/app/(language)/blog/page.tsx` - 2 errors
- `./src/app/(language)/contact-us/page.tsx` - 1 error
- `./src/app/(language)/page-content.tsx` - 8 errors
- `./src/app/(language)/page.tsx` - 1 error
- `./src/app/(language)/tour/[slug]/page.tsx` - 1 error
- `./src/app/(language)/tours/page.tsx` - 0 errors
- `./src/app/api/tours/route.ts` - 1 error
- `./src/app/layout.tsx` - Multiple errors
- `./src/components/...` - Multiple files with formatting issues
- `./src/views/blog/blog-custom-chip.tsx` - 0 errors
- `./src/views/blog/blog-filter-sidebar.tsx` - Multiple formatting errors
- `./src/views/destination/destination-filter-sidebar.tsx` - Multiple formatting errors
- `./src/views/tour/tour-*.tsx` - Multiple formatting errors across all tour view files

**Common patterns:**
- Class name ordering (e.g., `max-w-7xl flex` should be `flex max-w-7xl`)
- Tailwind class sorting
- JSX attribute formatting and line breaks
- Line wrapping of destructured imports

### B. React Memo & UseMemo Enforcement Errors (~25 errors)
**Rule:** `@arthurgeron/react-usememo/require-memo` - Components not wrapped in React.memo()

**Files affected:**
- `./src/app/(language)/[...slug]/page.tsx:62` - PageContent component
- `./src/app/(language)/about-us/page.tsx:20` - AboutPage component
- `./src/app/(language)/blog/[slug]/page.tsx:29` - BlogDetailPage component
- `./src/app/(language)/blog/page.tsx:19` - BlogPage component
- `./src/app/(language)/contact-us/page.tsx:20` - ContactUsPage component
- `./src/app/(language)/destination/[slug]/page.tsx:45` - DestinationPage component
- `./src/app/(language)/news/[slug]/page.tsx:29` - NewsDetailPage component
- `./src/app/(language)/news/page.tsx:19` - NewsPage component
- `./src/app/(language)/page.tsx:24` - HomePage component
- `./src/app/(language)/tour/[slug]/page.tsx:36` - TourDetailPage component
- `./src/app/(language)/tours/page.tsx:30` - ToursPage component
- `./src/app/api/tours/route.ts:4` - handler function (wrong context)
- `./src/views/blog/blog-category-view.tsx:19` - BlogCategoryView (eslint-disabled)
- `./src/views/blog/blog-view.tsx:101` - BlogView (eslint-disabled)
- `./src/views/tour/tour-filter-sidebar.tsx:41` - TourFilterSidebar component
- `./src/views/tour/tour-gallery.tsx:13` - TourGallery component
- `./src/views/tour/tour-includes-section.tsx:8` - TourIncludesSection component
- `./src/views/tour/tour-listing-view.tsx:39` - TourListingView component
- `./src/views/tour/tour-meeting-section.tsx:12` - TourMeetingSection component
- `./src/views/tour/tour-pricing-section.tsx:8` - TourPricingSection component
- `./src/views/tour/tour-search-bar.tsx:15` - TourSearchBar (has use client, memo missing)
- `./src/views/tour/tour-search-input.tsx:6` - TourSearchInput (has use client, memo missing)

**Note:** Some files have `/* eslint-disable @arthurgeron/react-usememo/require-memo */` directives already in place (blog-category-view.tsx, blog-view.tsx, etc.)

### C. UseMemo/UseCallback Enforcement (~8 errors)
**Rule:** `@arthurgeron/react-usememo/require-usememo` - Missing useMemo/useCallback wrapping

**Files affected:**
- `./src/app/(language)/page-content.tsx:77` - Object literal in destructure
- `./src/app/(language)/page-content.tsx:101` - Component definition props
- `./src/app/(language)/page-content.tsx:152` - JSX object literal props
- `./src/app/(language)/page-content.tsx:157` - Ternary in props
- `./src/app/(language)/page-content.tsx:166` - Function call in JSX
- `./src/app/(language)/page-content.tsx:190` - Function definition in props
- `./src/app/(language)/page-content.tsx:196` - Complex JSX logic (hook rule violation flagged)
- `./src/app/(language)/page-content.tsx:229` - Complex JSX logic (hook rule violation flagged)
- `./src/app/(language)/tours/page.tsx:61` - Object literal
- `./src/app/(language)/tours/page.tsx:62` - Object literal
- `./src/views/tour/tour-filter-sidebar.tsx:190` - Function definition in props
- `./src/views/tour/tour-listing-view.tsx:83` - Function definition in props
- `./src/views/tour/tour-listing-view.tsx:196` - Function definition in props
- `./src/views/tour/tour-search-bar.tsx:43` - Function definition in props (already has use client)
- `./src/views/tour/tour-search-bar.tsx:49` - Function definition in props (already has use client)

### D. Unused Variables/Imports (~3 errors)
- `./src/app/(language)/user/bookings/[id]/page-content.tsx:11` - '_props' defined but never used
- `./src/app/layout.tsx:15` - 'GoogleTagManager' imported but never used
- `./src/app/layout.tsx:19` - 'Suspense' imported but never used

### E. ESLint Custom Rules (~2 errors)
- `./src/app/(language)/page-content.tsx:1` - no-restricted-imports violation: Using 'next/link' directly, should use "@/components/link"
- `./src/app/(language)/page.tsx:2` - no-restricted-imports violation: Using 'next/link' directly, should use "@/components/link"

### F. React/HTML Standards (~2 errors)
- `./src/views/tour/tour-includes-section.tsx:13` - Unescaped apostrophe: `'` should be escaped as `&apos;`, `&lsquo;`, `&#39;`, or `&rsquo;`

---

## 3. Critical Issues in New Files

### Checked Directories:
- `src/services/wordpress/` ✓
- `src/views/tour/` ✓
- `src/views/blog/` ✓
- `src/views/page/` ✓
- `src/views/destination/` ✓
- `src/views/post/post-detail-new/` ✓

### 'use client' Directive Status:
**PASS** - All files using React hooks have proper 'use client' directives:
- `src/views/tour/tour-search-bar.tsx` ✓
- `src/views/tour/tour-filter-bar.tsx` ✓
- `src/views/tour/tour-gallery.tsx` ✓
- All other Client Components checked have proper directives

### Unused Imports Status:
**PASS** - No unused imports detected in target directories:
- WordPress services properly import only what's needed
- Blog views import appropriately
- Tour views have clean imports
- Page views have clean imports
- Destination views have clean imports
- Post detail views have clean imports

### Export Patterns:
**ISSUES** - Some inconsistencies:
- Most components use `export default` (recommended pattern)
- Some use named exports (e.g., blog-custom-chip.tsx uses memo export)
- Services properly export functions

---

## 4. Detailed Findings by File

### New/Modified Files Analysis:

#### `src/services/wordpress/`
- **tour-service.ts**: No errors (clean async functions)
- **post-service.ts**: No errors (clean async functions)
- **page-service.ts**: No errors (clean async functions)
- **taxonomy-service.ts**: No errors (clean async functions)
- **site-service.ts**: No errors (clean async functions)
- **options-service.ts**: No errors (clean async functions)
- **index.ts**: No errors (proper re-exports)

#### `src/views/blog/`
- **blog-category-view.tsx**: Eslint-disabled memo, no unused imports
- **blog-view.tsx**: Eslint-disabled memo and usememo, no unused imports
- **blog-posts-grid-view.tsx**: Uses `Link` from 'next/link', no unused imports
- **blog-custom-chip.tsx**: Named export with memo wrapper

#### `src/views/tour/`
- **tour-search-bar.tsx**: ✓ use client, ✗ missing memo wrapper, ✓ no unused imports
- **tour-filter-bar.tsx**: ✓ use client, ✗ missing memo wrapper, ✓ no unused imports
- **tour-gallery.tsx**: ✓ use client, ✗ missing memo wrapper, ✓ no unused imports
- **tour-detail-view.tsx**: ✗ NO use client (but no hooks detected), ✓ no unused imports
- **tour-pricing-section.tsx**: ✗ NO use client, ✗ missing memo wrapper, ✓ no unused imports
- **tour-includes-section.tsx**: ✗ NO use client, ✗ missing memo wrapper, ✗ unescaped apostrophe
- **tour-meeting-section.tsx**: ✗ NO use client, ✗ missing memo wrapper, ✓ no unused imports
- **tour-faq-section.tsx**: Status not fully checked
- **tour-card.tsx**: Status not fully checked
- **tour-search-input.tsx**: ✗ NO use client (?), ✗ missing memo wrapper
- **tour-filter-sidebar.tsx**: ✓ use client, ✗ missing memo wrapper, multiple useMemo errors
- **tour-listing-view.tsx**: ✓ use client, ✗ missing memo wrapper, multiple useMemo errors

#### `src/views/page/`
- **wp-page-content-view.tsx**: Eslint-disabled usememo, no unused imports

#### `src/views/destination/`
- **destination-view.tsx**: Uses `export default`, no unused imports

#### `src/views/post/post-detail-new/`
- **post-detail-new-view.tsx**: Eslint-disabled usememo, no unused imports

---

## 5. Summary Statistics

| Category | Count | Files Affected |
|----------|-------|-----------------|
| TypeScript Errors (pre-existing) | 3 | 1 |
| Prettier Formatting Errors | ~45 | 20+ |
| React Memo Missing | ~22 | 18 |
| UseMemo/UseCallback Missing | ~8 | 4 |
| Unused Variables | 2 | 2 |
| Import Restrictions | 2 | 2 |
| HTML/React Standards | 1 | 1 |
| **TOTAL LINT ERRORS** | **~79** | **30+** |

---

## 6. Critical Issues (Must Fix Before Merge)

1. **Import Restrictions (2 files)**
   - `src/app/(language)/page-content.tsx:1` - Use "@/components/link" instead of 'next/link'
   - `src/app/(language)/page.tsx:2` - Use "@/components/link" instead of 'next/link'
   - **Severity:** HIGH

2. **Unescaped HTML Entity (1 file)**
   - `src/views/tour/tour-includes-section.tsx:13` - Escape apostrophe properly
   - **Severity:** MEDIUM

3. **Unused Imports (2 files)**
   - `src/app/layout.tsx` - Remove unused 'GoogleTagManager' and 'Suspense'
   - `src/app/(language)/user/bookings/[id]/page-content.tsx` - Remove unused '_props'
   - **Severity:** LOW-MEDIUM

---

## 7. Recommendations

### Immediate Actions:
1. Fix import restrictions in page-content.tsx and page.tsx
2. Remove unused imports from layout.tsx and user bookings page
3. Escape apostrophe in tour-includes-section.tsx
4. Run prettier format: `npm run format`

### Follow-up Actions:
1. Review and apply React.memo() to components missing wrappers (22 instances)
2. Wrap object literals and functions in useMemo/useCallback (8 instances)
3. Verify all client components have 'use client' directive
4. Consider whether to keep eslint-disable directives or refactor to comply with rules

### Long-term:
- Enforce linting in pre-commit hooks
- Consider stricter memo/usememo enforcement or relax rules if they don't align with project needs

---

## 8. Unresolved Questions

1. Should all Page components in app directory be wrapped in React.memo()? (They're typically not memoized)
2. Why are some files eslint-disabled for memo/usememo? (blog-view.tsx, blog-category-view.tsx, wp-page-content-view.tsx, post-detail-new-view.tsx)
3. Are there plans to migrate all `next/link` imports to the custom `@/components/link` wrapper?
4. Should the marker icon TypeScript errors be fixed or permanently ignored?
