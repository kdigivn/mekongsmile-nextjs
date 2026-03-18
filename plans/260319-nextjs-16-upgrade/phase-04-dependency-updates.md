# Phase 4: Dependency Updates

## Context
- [Research Report](../reports/researcher-260319-nextjs-14-to-16-upgrade.md)
- [Plan Overview](./plan.md)

## Overview
- **Priority:** P2
- **Status:** Complete
- **Effort:** 45m

Update third-party dependencies for React 19 compatibility. Fix peer dependency conflicts.

## Key Insights

1. `framer-motion` is deprecated, replaced by `motion` — BUT zero JS imports exist. Just uninstall, install `motion`
2. `navigation-menu.tsx` uses `data-[motion]` Tailwind CSS attributes, NOT framer-motion JS import
3. Most deps (heroui, radix, tanstack, react-hook-form) already support React 19
4. `react-day-picker` v8 may need upgrade to v9
5. **Red Team findings — MISSING from original matrix:**
   - `react-google-recaptcha` — class component, may need React 19 check
   - `@react-aria/i18n` — React Aria needs React 19 compatible version
   - `@react-oauth/google` — verify React 19 support
   - `react-dropzone` — verify
   - `react-intersection-observer` — verify
   - `leaflet` — no React dep, safe
   - `body-scroll-lock` — abandoned (2020), beta version, not React-related
6. `next-sitemap` — check v5 compatibility
7. **ESLint 8→9:** If `eslint-config-next@latest` needs ESLint 9, migrate `.eslintrc` to flat config
8. **TypeScript** — may need upgrade from 5.5.4 to 5.6+

## Related Code Files

| File | Action | Detail |
|------|--------|--------|
| `package.json` | Modify | Update deps |

## Implementation Steps

### Step 1: Update confirmed-compatible packages
```bash
npm install @heroui/react@latest
npm install @radix-ui/react-accordion@latest @radix-ui/react-alert-dialog@latest @radix-ui/react-avatar@latest @radix-ui/react-checkbox@latest @radix-ui/react-collapsible@latest @radix-ui/react-dialog@latest @radix-ui/react-dropdown-menu@latest @radix-ui/react-icons@latest @radix-ui/react-label@latest @radix-ui/react-navigation-menu@latest @radix-ui/react-popover@latest @radix-ui/react-scroll-area@latest @radix-ui/react-select@latest @radix-ui/react-separator@latest @radix-ui/react-slider@latest @radix-ui/react-slot@latest @radix-ui/react-tabs@latest @radix-ui/react-toggle@latest @radix-ui/react-tooltip@latest
```

### Step 2: Migrate framer-motion → motion
Since `navigation-menu.tsx` uses `data-[motion]` Tailwind attributes (NOT framer-motion JS import), check if anything else imports framer-motion:

```bash
grep -r "from.*framer-motion" src/ --include="*.tsx" --include="*.ts"
```

If no imports found: simply uninstall framer-motion, install motion:
```bash
npm uninstall framer-motion
npm install motion
```

Update `optimizePackageImports` in next.config.ts: `"framer-motion"` → `"motion"`

If imports found: replace import paths:
```tsx
// BEFORE
import { motion } from "framer-motion";
// AFTER
import { motion } from "motion/react";
```

### Step 3: Test react-day-picker
```bash
npm ls react-day-picker
```
Check if v8.10.1 works with React 19. If peer dep error:
```bash
npm install react-day-picker@latest
```
Note: v9 has API changes — review `src/components/ui/calendar.tsx`.

### Step 4: Test @reactour/tour
```bash
npm ls @reactour/tour
```
If peer dep error, check latest version. If no React 19 support, consider:
- `--legacy-peer-deps` temporarily
- Or remove if not actively used

### Step 5: Update next-sitemap
```bash
npm install next-sitemap@latest
```
Verify `next-sitemap.config.js` still works with `postbuild` script.

### Step 6: Verify additional React 19 deps (Red Team findings)
```bash
# These packages may have peer dep issues with React 19:
npm ls react-google-recaptcha @react-aria/i18n @react-oauth/google react-dropzone react-intersection-observer @reactour/tour
```
Update any that fail:
```bash
npm install react-google-recaptcha@latest @react-aria/i18n@latest @react-oauth/google@latest react-dropzone@latest react-intersection-observer@latest
```

### Step 7: ESLint 8→9 migration (if needed)
Check if `eslint-config-next@latest` requires ESLint 9:
```bash
npm ls eslint-config-next
npm ls eslint
```
If ESLint 9 required:
```bash
npm install eslint@latest @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest
```
May need to convert `.eslintrc.*` → `eslint.config.mjs` (flat config). If too complex, defer ESLint upgrade and pin `eslint-config-next` to a v15/v16 version that still supports ESLint 8.

### Step 8: Update TypeScript and dev dependencies
```bash
npm install typescript@latest
npm install -D @types/react@latest @types/react-dom@latest @types/node@latest
npm install -D @tanstack/react-query-devtools@latest
```

### Step 9: Clean install & verify
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
npm run lint  # Should now pass
```

## Todo List
- [ ] Update `@heroui/react` to latest
- [ ] Update all `@radix-ui/*` to latest
- [ ] Migrate `framer-motion` → `motion`
- [ ] Test/update `react-day-picker`
- [ ] Test/update `@reactour/tour`
- [ ] Update `next-sitemap`
- [ ] Update `@types/react`, `@types/react-dom`
- [ ] Clean install + build passes
- [ ] Commit: `chore(deps): update dependencies for React 19 compatibility`

## Success Criteria
- Zero peer dependency warnings (or only non-critical ones)
- Clean build
- Calendar component renders correctly (react-day-picker)

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| `react-day-picker` v9 API changes | MEDIUM | May need to update `calendar.tsx` component |
| `@reactour/tour` no React 19 support | LOW | Low usage, can be deferred or replaced |
| `next-sitemap` v5 config changes | LOW | Config is simple, easy to update |
