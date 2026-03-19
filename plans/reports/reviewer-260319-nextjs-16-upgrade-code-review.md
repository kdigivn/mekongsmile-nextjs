# Code Review: Next.js 14 to 16 Upgrade

**Branch:** `feat/nextjs-16-upgrade`
**Date:** 2026-03-19
**Reviewer:** code-reviewer
**Commits:** 4 (a820add -> 4bc6bb3)
**Files changed:** 19 (excluding lockfile)
**Build status:** PASS (clean, no warnings)

---

## Overall Assessment

Solid upgrade. Async params migration, proxy rename, React 19 compat, and react-day-picker v9 calendar rewrite are all correctly done for the files touched. Build passes clean. However, scouting found **3 files missed** by the migration and **1 dead dependency**.

---

## Critical Issues

### 1. `initialFocus` prop not migrated in 2 files (react-day-picker v9 breaking change)

The `popover-calendar.tsx` was fixed (`initialFocus` -> `autoFocus`), but two other files still use `initialFocus`:

- `src/components/form-elements/date-picker/form-date-picker.tsx` (line 94)
- `src/components/ui/date-range-picker.tsx` (lines 367, 433)

**Impact:** `initialFocus` is removed in react-day-picker v9. Prop silently ignored, calendar won't auto-focus on open.

**Fix:** Replace `initialFocus` with `autoFocus` in both files.

### 2. `date-range-picker.tsx` uses v8 classNames (will break styling)

`src/components/ui/date-range-picker.tsx` (lines 282-311) passes old v8 class name keys to Calendar:

| v8 key (current) | v9 key (needed) |
|---|---|
| `row` | `week` |
| `head_row` | `weekdays` |
| `day_today` | `today` |
| `cell` | `day` |
| `day` | `day_button` |
| `day_disabled` | `disabled` |
| `day_outside` | `outside` |
| `day_range_middle` | `range_middle` |
| `day_hidden` | `hidden` |

**Impact:** All custom date-range-picker styling will be silently dropped. Calendar renders unstyled. This is a user-facing regression.

**Fix:** Update classNames keys to v9 names, similar to how `calendar.tsx` was already rewritten.

---

## High Priority

### 3. `framer-motion` still in dependencies alongside `motion`

`package.json` lists both:
- `"framer-motion": "11.18.2"` (old)
- `"motion": "^12.38.0"` (new)

No source files import from either directly (transitive dep from `@heroui/react`). But `next.config.ts` already changed `optimizePackageImports` from `"framer-motion"` to `"motion"`.

**Impact:** ~100KB dead dependency in lockfile. If `@heroui/react` still imports from `framer-motion`, the optimize config pointing to `"motion"` won't tree-shake it correctly.

**Fix:** Verify which import path `@heroui/react` uses at runtime, then remove the unused one. If HeroUI uses `framer-motion` internally, keep both and add `"framer-motion"` back to `optimizePackageImports`.

### 4. ESLint config removed from next.config.ts without adding it back

The `eslint.ignoreDuringBuilds: true` block was removed from `next.config.ts`. The lint script changed from `next lint` to `eslint src/ --ext .ts,.tsx`.

This is fine for local dev, but in CI/CD the build step no longer ignores lint. If the build pipeline previously relied on `ignoreDuringBuilds: true` to skip lint during `next build`, builds may now fail on lint errors.

**Recommendation:** Confirm CI pipeline runs lint separately. If `next build` should still skip lint (likely the intent), add `eslint: { ignoreDuringBuilds: true }` back to config. Next.js 16 still supports this option.

### 5. `eslint-config-next` v15 with ESLint v8

Package has `"eslint": "8.57.1"` and `"eslint-config-next": "^15.5.13"`. `eslint-config-next@15` works with ESLint 8 but logs deprecation warnings. The `.eslintrc.json` format (legacy config) is fine since ESLint 9 flat config is optional.

Not blocking, but note: Next.js 16 ships `eslint-config-next@16` which requires ESLint 9+. If upgrading ESLint later, you'll need to migrate to flat config.

---

## Medium Priority

### 6. `{ ssr: false }` removed from 2 dynamic imports but kept in 1

Removed from:
- `src/views/page/wp-page-content-view.tsx` (TableOfContentActiveHeading)
- `src/views/post/post-detail-new/post-detail-new-view.tsx` (TableOfContentActiveHeading)

Kept in:
- `src/components/app-bar.tsx` (GoogleTranslate, line 45)

`ssr: false` still works in Next.js 16 for `next/dynamic`. The removal is not required by the upgrade. However, the TableOfContent component likely uses browser APIs (IntersectionObserver for active heading detection). Removing `ssr: false` means it will render on server, which may cause hydration mismatches if it reads `window` or `document`.

**Recommendation:** Verify TableOfContentActiveHeading doesn't use browser-only APIs. If it does, restore `{ ssr: false }`.

### 7. `@vitejs/plugin-react` downgraded from ^6.0.1 to ^4.7.0

v6 -> v4 is a downgrade. This is the Vitest test runner's React plugin. v4 should work with React 19, but confirm tests still pass. If the project moves to Vitest 4, `@vitejs/plugin-react` v4 is the correct pairing.

### 8. `react-instantsearch` removed from dependencies

Was `"react-instantsearch": "7.15.5"` in old package.json, now removed. Grep confirms no source imports of `react-instantsearch`. Correct cleanup.

### 9. Operator precedence fix in `form-select-input.tsx`

Changed: `option[props.keyValue]?.toString() === event.target.value ?? false`
To: `(option[props.keyValue]?.toString() ?? "") === event.target.value`

Good fix. The old code had a precedence bug: `===` binds tighter than `??`, so `?? false` was dead code. New code properly nullish-coalesces to empty string before comparison.

---

## Low Priority

### 10. Root layout hardcodes fallbackLanguage instead of reading from params

`src/app/layout.tsx` removed `params: { language }` destructuring and hardcodes `const language = fallbackLanguage`. Also removed `generateStaticParams` for languages. This is intentional since i18n routing is disabled (`INTERNATIONAL_ROUTING_ENABLED !== "true"`). Fine for current state, but locks the app to single-language mode at the layout level.

### 11. `.eslintrc.json` still ignores `next.config.js` (renamed to `.ts`)

Line 18: `"next.config.js"` in `ignorePatterns`. Should be updated to `"next.config.ts"`. Minor since the config file is in root, not in `src/`.

---

## Edge Cases Found by Scout

1. **date-range-picker.tsx completely missed in migration** - Uses v8 classNames + `initialFocus` prop (Critical #1 and #2 above)
2. **form-date-picker.tsx missed** - Still uses `initialFocus` (Critical #1 above)
3. **No framer-motion imports but both packages installed** - Dead dep, potential tree-shaking issue (High #3)
4. **`app-bar.tsx` retains `ssr: false`** - Inconsistent with other dynamic imports that had it removed (Medium #6)
5. **searchParams in tours/page.tsx already migrated** - Uses `Promise<>` pattern correctly. No issue.

---

## Positive Observations

- Async params migration is consistently correct across all 5 page files touched
- `proxy.ts` rename and `proxy` function export work correctly (build confirms "Proxy (Middleware)")
- `calendar.tsx` rewrite for react-day-picker v9 is thorough and well-structured
- `React.JSX.IntrinsicElements` and `React.JSX.Element` migrations are correct
- `useRef<>(undefined)` fix for React 19 is correct
- `next.config.ts` ESM conversion is clean
- Build passes with zero warnings
- Bundle analyzer config correctly refactored for ESM

---

## Recommended Actions (Priority Order)

1. **[CRITICAL]** Migrate `date-range-picker.tsx` classNames to v9 keys
2. **[CRITICAL]** Replace `initialFocus` with `autoFocus` in `form-date-picker.tsx` and `date-range-picker.tsx`
3. **[HIGH]** Remove `framer-motion` from `package.json` if not needed transitively, or add it back to `optimizePackageImports`
4. **[HIGH]** Add `eslint: { ignoreDuringBuilds: true }` back to `next.config.ts` if CI relies on it
5. **[MEDIUM]** Verify `TableOfContentActiveHeading` works without `{ ssr: false }`
6. **[LOW]** Update `.eslintrc.json` ignorePatterns from `next.config.js` to `next.config.ts`

---

## Metrics

- **Build:** PASS (clean)
- **Type safety:** All async params correctly typed with `Promise<>`
- **Files needing fixes:** 2 (date-range-picker, form-date-picker)
- **Dead dependencies:** 1 (framer-motion)
- **JSX namespace migration:** Complete
- **useRef migration:** Complete
- **proxy.ts rename:** Correct

---

## Unresolved Questions

1. Does `@heroui/react` import from `framer-motion` or `motion` internally? This determines which package to keep.
2. Was `eslint.ignoreDuringBuilds` intentionally removed, or should it be restored for CI?
3. Does `TableOfContentActiveHeading` rely on browser APIs that would fail during SSR?
