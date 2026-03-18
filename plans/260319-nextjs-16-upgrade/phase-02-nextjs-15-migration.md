# Phase 2: Next.js 14→15 + React 19

## Context
- [Research Report](../reports/researcher-260319-nextjs-14-to-16-upgrade.md)
- [Red Team Review](../reports/reviewer-260319-nextjs-16-upgrade-red-team.md)
- [Plan Overview](./plan.md)

## Overview
- **Priority:** P1
- **Status:** Complete
- **Effort:** 1.5h

Biggest breaking change phase: React 18→19, async request APIs (params/searchParams become Promise).

## Key Insights

1. `params` and `searchParams` must be `Promise<{...}>` and `await`ed
2. `fetch()` default changes from `force-cache` to `no-store` — no impact (we use Apollo/TanStack)
3. React 19 required — some libs may have peer dep conflicts
4. **ALREADY MIGRATED:** `src/app/(language)/tours/page.tsx` already has `searchParams: Promise<{...}>` — DO NOT touch
5. **ESLint 8→9:** `eslint-config-next` v15 may require ESLint 9 with flat config. Defer lint fix to Phase 4 if needed; build has `ignoreDuringBuilds: true`

## Related Code Files

### Files to Modify (6 files — NOT tours/page.tsx)

| File | Change |
|------|--------|
| `package.json` | Update next, react, react-dom, @types/react, @types/react-dom |
| `src/app/layout.tsx` | `params: { language: string }` → `params: Promise<{ language: string }>` |
| `src/app/(language)/tour/[slug]/page.tsx` | `params: { slug: string }` → `params: Promise<{ slug: string }>` |
| `src/app/(language)/blog/[slug]/page.tsx` | `params: { slug: string }` → `params: Promise<{ slug: string }>` |
| `src/app/(language)/news/[slug]/page.tsx` | `params: { slug: string }` → `params: Promise<{ slug: string }>` |
| `src/app/(language)/destination/[slug]/page.tsx` | `params: { slug: string }` → `params: Promise<{ slug: string }>` |
| `src/app/(language)/[...slug]/page.tsx` | `params: { slug: string[] }` → `params: Promise<{ slug: string[] }>` |

### Files to CHECK (no changes expected)
- `src/app/(language)/tours/page.tsx` — ALREADY async, verify codemod doesn't break it
- `src/app/sitemap.ts` — verify sitemap functions work with v15
- `src/app/robots.ts` — verify
- `src/app/api/tours/route.ts` — GET handler no longer cached by default (behavioral change, no code change)

## Implementation Steps

### Step 1: Run official codemod (DRY RUN first!)
```bash
# DRY RUN to see what codemod will change
npx @next/codemod@canary upgrade 15 --dry-run

# If dry run looks good, execute:
npx @next/codemod@canary upgrade 15
```

**IMPORTANT:** If codemod tries to modify `tours/page.tsx` (already migrated), manually revert that file:
```bash
git checkout -- src/app/\(language\)/tours/page.tsx
```

### Step 2: Handle peer dependency conflicts
If `npm install` fails due to React 19 peer deps:
```bash
npm install --legacy-peer-deps
```
Known packages that may complain: `react-day-picker`, `@reactour/tour`, `react-google-recaptcha`, `body-scroll-lock`. These are fixed in Phase 4.

### Step 3: Manual async params migration (verify/fix codemod output)

For each file, apply this pattern:

**Type change:**
```tsx
// BEFORE
type Props = {
  params: { slug: string };
};

// AFTER
type Props = {
  params: Promise<{ slug: string }>;
};
```

**Function body change:**
```tsx
// BEFORE
export async function generateMetadata({ params }: Props) {
  const tour = await getTourBySlug(params.slug);
}
export default async function TourPage({ params }: Props) {
  const tour = await getTourBySlug(params.slug);
}

// AFTER
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
}
export default async function TourPage({ params }: Props) {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
}
```

### Step 4: Root Layout special case

`src/app/layout.tsx` has destructured params in function signature:
```tsx
// BEFORE (line 72-78)
async function RootLayout({
  children,
  params: { language = "en" },
}: {
  children: React.ReactNode;
  params: { language: string };
}) {

// AFTER
async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ language: string }>;
}) {
  const { language = "en" } = await params;
```

### Step 5: Update companion packages
```bash
npm install @next/bundle-analyzer@latest @next/third-parties@latest eslint-config-next@latest --legacy-peer-deps
```

### Step 6: Build & verify
```bash
npm run build    # MUST pass
npm run ts       # TypeScript check
# npm run lint   # May fail due to ESLint 8→9 — defer to Phase 4 if so
```

### Step 7: Commit
```bash
git add -A
git commit -m "chore(deps): upgrade Next.js 14→15 with React 19"
```

## Todo List
- [ ] Run codemod with `--dry-run` first
- [ ] Run codemod, verify `tours/page.tsx` untouched
- [ ] Handle peer dep conflicts with `--legacy-peer-deps`
- [ ] Verify/fix `src/app/layout.tsx` params → Promise
- [ ] Verify/fix `src/app/(language)/tour/[slug]/page.tsx`
- [ ] Verify/fix `src/app/(language)/blog/[slug]/page.tsx`
- [ ] Verify/fix `src/app/(language)/news/[slug]/page.tsx`
- [ ] Verify/fix `src/app/(language)/destination/[slug]/page.tsx`
- [ ] Verify/fix `src/app/(language)/[...slug]/page.tsx`
- [ ] Verify `src/app/sitemap.ts` still works
- [ ] Update companion packages
- [ ] `npm run build` passes
- [ ] `npm run ts` passes
- [ ] Commit

## Success Criteria
- Clean `npm run build` with Next.js 15 + React 19
- TypeScript: zero errors
- `tours/page.tsx` unchanged (already migrated)

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Codemod breaks already-migrated tours page | HIGH | Run `--dry-run`, revert if touched |
| React 19 peer dep conflicts | HIGH | `--legacy-peer-deps`, fix in Phase 4 |
| ESLint config breaks | MEDIUM | Defer to Phase 4; build has `ignoreDuringBuilds: true` |
| `src/app/sitemap.ts` breaks | MEDIUM | Verify build output includes sitemaps |
