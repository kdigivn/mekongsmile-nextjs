# Research Report: Next.js 14 → 16 Upgrade

**Date:** 2026-03-19
**Current:** Next.js 14.2.29, React 18.3.1, TypeScript 5.5.4
**Target:** Next.js 16.x (latest stable: 16.1.7), React 19.2+

---

## Executive Summary

Upgrading from Next.js 14.2.29 to 16.x is a **two-stage migration** (14→15→16) involving significant breaking changes: async request APIs, caching model overhaul, middleware→proxy rename, React 18→19, and Turbopack as default bundler. Our codebase has **low migration complexity** — only ~7 files need async API changes, no `framer-motion` usage (just one `motion` import in nav), no `fetch` caching directives, and a simple middleware. However, dependency compatibility (especially `@heroui/react`, `react-day-picker`, `@reactour/tour`) requires careful verification.

**Recommendation:** Upgrade now while codebase is small. The longer we wait, the more files will need async API migration.

---

## Table of Contents

1. [Breaking Changes: 14→15](#1-breaking-changes-14→15)
2. [Breaking Changes: 15→16](#2-breaking-changes-15→16)
3. [React 18→19 Migration](#3-react-18→19-migration)
4. [Dependency Compatibility Matrix](#4-dependency-compatibility-matrix)
5. [Codebase Impact Assessment](#5-codebase-impact-assessment)
6. [next.config Migration](#6-nextconfig-migration)
7. [Step-by-Step Upgrade Plan](#7-step-by-step-upgrade-plan)
8. [Risk Assessment](#8-risk-assessment)
9. [Unresolved Questions](#9-unresolved-questions)

---

## 1. Breaking Changes: 14→15

### 1.1 Async Request APIs (CRITICAL)
`cookies()`, `headers()`, `params`, `searchParams` became **async** — must be `await`ed.

```tsx
// BEFORE (v14) — synchronous
export default function Page({ params }: { params: { slug: string } }) {
  const slug = params.slug;
}

// AFTER (v15+) — async
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
}
```

### 1.2 Caching Defaults Changed
- `fetch()` defaults to `no-store` (was `force-cache`)
- Route Handler `GET` no longer cached by default
- Client Router Cache for Page segments no longer cached (was 30s)

**Our impact:** LOW — no explicit `fetch` caching directives found in codebase. We use Apollo Client/TanStack Query, not raw fetch caching.

### 1.3 React 19 Required
Next.js 15 requires React 19.0.0+. Cannot use React 18.

---

## 2. Breaking Changes: 15→16

### 2.1 Middleware → Proxy Rename (CRITICAL)
`middleware.ts` renamed to `proxy.ts`. Function export `middleware` → `proxy`.

```tsx
// BEFORE (v14/15): src/middleware.ts
export function middleware(req: NextRequest) { ... }

// AFTER (v16): src/proxy.ts
export function proxy(req: NextRequest) { ... }
```

Config flags also renamed:
- `skipMiddlewareUrlNormalize` → `skipProxyUrlNormalize`

**Runtime change:** Proxy runs on **Node.js runtime** by default (not Edge). Edge runtime NOT supported in proxy — keep `middleware.ts` if Edge is needed.

### 2.2 Turbopack Default
Turbopack is now the default bundler for dev and production.
- 2-5x faster builds, 10x faster HMR
- Custom Webpack configs need `--webpack` flag or migration to Turbopack rules
- `@next/bundle-analyzer` is Webpack-only; use `npx next experimental-analyze` for Turbopack

### 2.3 "use cache" Directive (New Caching Model)
Replaces PPR (Partial Prerendering) concept. Opt-in caching via `"use cache"` directive.

```tsx
// Cache entire page
"use cache"
export default async function Page() { ... }

// Cache individual function
async function getData() {
  "use cache"
  return fetch('...')
}
```

- Replaces `unstable_cache` (which we don't use)
- Cannot use `cookies()`, `headers()`, `searchParams` inside `"use cache"` scope

### 2.4 Strict Async Params
In v15: sync params = warning. In v16: sync params = **hard error**.

### 2.5 `experimental.instrumentationHook` → Stable
Flag no longer needed. Framework auto-detects `instrumentation.ts`.

### 2.6 React Compiler (Stable)
Eliminates need for manual `useMemo`/`useCallback` in most cases. Integrated by default.

---

## 3. React 18→19 Migration

### Key Changes
| Feature | React 18 | React 19 |
|---|---|---|
| `ref` prop | `forwardRef()` required | `ref` as regular prop |
| Context | `<Context.Provider>` | `<Context>` directly |
| `use()` hook | N/A | New — read resources in render |
| `useFormStatus` | N/A | New — form submission state |
| `useActionState` | N/A | Replaces `useFormState` |
| Cleanup functions | `useEffect` return | `ref` callbacks also support cleanup |

### Impact on Our Codebase
- Any `React.forwardRef()` usage can be simplified (optional, not breaking)
- `Context.Provider` still works (backward compatible)
- No required code changes for React 19 upgrade itself — mostly additive

---

## 4. Dependency Compatibility Matrix

| Package | Current | React 19 Support | Action |
|---|---|---|---|
| `@heroui/react` | 2.7.6 | ✅ v2.6.0+ | Update to latest |
| `@radix-ui/*` | various | ✅ Supported | Update to latest |
| `@tanstack/react-query` | 5.80.6 | ✅ Supported | OK |
| `@tanstack/react-table` | 8.21.3 | ✅ Supported | OK |
| `react-hook-form` | 7.57.0 | ✅ Supported | OK |
| `framer-motion` | 11.18.2 | ⚠️ Deprecated | **Migrate to `motion`** (same API, rename package) |
| `react-i18next` | 14.1.3 | ✅ Supported | OK |
| `@apollo/client` | ^4.1.6 | ✅ v4 supports React 19 | OK |
| `sonner` | 2.0.3 | ✅ Supported | OK |
| `vaul` | 1.1.2 | ✅ Supported | OK |
| `cmdk` | 1.1.1 | ✅ Supported | OK |
| `embla-carousel-react` | 8.6.0 | ✅ Supported | OK |
| `next-themes` | 0.4.6 | ✅ Supported | OK |
| `react-day-picker` | 8.10.1 | ⚠️ Check v9 | **Test — may need v9 upgrade** |
| `@reactour/tour` | 3.8.0 | ⚠️ Check | **Test — small lib, may need patch** |
| `react-big-calendar` | 1.18.0 | ⚠️ Check | **Test** |
| `react-instantsearch` | 7.15.5 | ✅ Algolia updated | OK |
| `lightgallery` | 2.8.3 | ⚠️ Check | **Test** |
| `html5-qrcode` | 2.3.8 | ✅ No React dep | OK (vanilla JS) |
| `nextjs-toploader` | ^3.9.17 | ⚠️ Check | **Test** |
| `@next/bundle-analyzer` | 14.2.29 | ❌ Webpack-only | **Remove or use `next experimental-analyze`** |
| `@next/third-parties` | 14.2.29 | ✅ Update | Update to v16 |
| `eslint-config-next` | 14.2.29 | ✅ Update | Update to v16 |
| `next-sitemap` | 4.2.3 | ⚠️ Check v5 | **May need v5+ for Next.js 16** |
| `tailwindcss` | 3.4.17 | ✅ Works | Optional upgrade to v4 later |

### High-Risk Dependencies (Require Testing)
1. **`framer-motion` → `motion`**: Only 1 file imports motion (`navigation-menu.tsx`). Easy migration.
2. **`react-day-picker`**: Used in UI components. May need v9.
3. **`@reactour/tour`**: Niche lib, verify React 19 peer deps.
4. **`next-sitemap`**: Check v5 compatibility with Next.js 16 metadata.

---

## 5. Codebase Impact Assessment

### Files Needing Async `params` Migration (~5 files)
- `src/app/(language)/news/[slug]/page.tsx`
- `src/app/(language)/destination/[slug]/page.tsx`
- `src/app/(language)/[...slug]/page.tsx`
- `src/app/(language)/tour/[slug]/page.tsx`
- `src/app/(language)/blog/[slug]/page.tsx`

### Files Needing Async `searchParams` Migration (~1 file)
- `src/app/(language)/tours/page.tsx`

### Middleware → Proxy (~1 file)
- `src/middleware.ts` → `src/proxy.ts`

### Config File (~1 file)
- `next.config.js` → `next.config.ts` (optional but recommended)

### Instrumentation (~1 file)
- `src/instrumentation.ts` — remove `experimental.instrumentationHook` flag

### Total Estimated Impact: ~10 files

---

## 6. next.config Migration

```typescript
// next.config.ts (AFTER — Next.js 16)
import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mekongsmile.com",
        pathname: "/wp-content/**",
      },
      {
        protocol: "https",
        hostname: "secure.gravatar.com",
        pathname: "/**",
      },
    ],
    minimumCacheTTL: 2592000,
  },
  experimental: {
    optimizePackageImports: [
      "@heroui/react",
      "date-fns",
      "react-icons",
      // framer-motion → motion if migrated
      "motion",
      "@radix-ui/react-select",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-navigation-menu",
      "@radix-ui/react-accordion",
      "@radix-ui/react-tooltip",
    ],
    // instrumentationHook: REMOVED (now stable, auto-detected)
    cssChunking: "strict",
  },
  // headers(), rewrites(), redirects() — unchanged API
};

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(nextConfig);
```

Key changes:
- `module.exports` → `export default`
- `require()` → `import`
- Remove `instrumentationHook` flag
- TypeScript types via `NextConfig`

---

## 7. Step-by-Step Upgrade Plan

### Stage 1: Preparation (Before Upgrade)
1. Create a new branch: `feat/nextjs-16-upgrade`
2. Run `npm run build` — ensure clean baseline
3. Commit current state

### Stage 2: 14→15 Migration
```bash
# Run official codemod
npx @next/codemod@canary upgrade 15

# This will:
# - Update next, react, react-dom, @types/react, @types/react-dom
# - Run async-request-api codemod on params/searchParams
# - Update eslint-config-next
```

4. Manually verify async params in 5 page files
5. Update `@next/third-parties` to v15
6. Test: `npm run dev` + `npm run build`

### Stage 3: 15→16 Migration
```bash
# Upgrade to latest
npx @next/codemod@canary upgrade latest

# Run middleware-to-proxy codemod
npx @next/codemod@canary middleware-to-proxy
```

7. Rename `middleware.ts` → `proxy.ts`, function `middleware` → `proxy`
8. Convert `next.config.js` → `next.config.ts`
9. Remove `experimental.instrumentationHook`
10. Test: `npm run dev` + `npm run build`

### Stage 4: Dependency Updates
11. `framer-motion` → `motion` (1 file change)
12. Update `@heroui/react` to latest
13. Update all `@radix-ui/*` to latest
14. Test `react-day-picker`, `@reactour/tour`, `react-big-calendar`
15. Check `next-sitemap` compatibility, update if needed
16. Update `@next/bundle-analyzer` or replace with `next experimental-analyze`

### Stage 5: Tailwind CSS (Optional, Separate PR)
- Tailwind 3 works fine with Next.js 16
- Tailwind 4 upgrade can be done separately (different concern)

### Stage 6: Validation
17. `npm run build` — clean production build
18. `npm run lint` — lint pass
19. `npm run ts` — TypeScript check
20. Manual smoke test all pages
21. Verify sitemap generation
22. Verify image optimization (sharp)

---

## 8. Risk Assessment

| Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|
| `@heroui/react` incompatible w/ React 19 | HIGH | LOW | v2.6+ confirmed compatible |
| `react-day-picker` breaks | MEDIUM | MEDIUM | Upgrade to v9 or find alternative |
| `@reactour/tour` breaks | LOW | MEDIUM | Small usage, can be replaced |
| `next-sitemap` incompatible | MEDIUM | MEDIUM | Check v5+; worst case, use Next.js native sitemap |
| Turbopack breaks custom setup | LOW | LOW | Fallback to `--webpack` flag |
| Proxy runtime change affects i18n middleware | MEDIUM | LOW | Our middleware is simple, Node.js runtime is fine |
| Build time regression | LOW | LOW | Turbopack should be faster |

---

## 9. Unresolved Questions

1. **`next-sitemap` v5:** Does it fully support Next.js 16 metadata API? Need to test.
2. **`@reactour/tour` React 19:** No official confirmation found. Need `npm install --legacy-peer-deps` test.
3. **`react-day-picker` v9 migration:** How much API changed from v8→v9?
4. **Proxy Node.js runtime:** Does our i18n `accept-language` middleware work on Node.js runtime (not Edge)? Should be fine since it's pure JS, but verify.
5. **`@next/bundle-analyzer` with Turbopack:** Is `next experimental-analyze` stable enough? Or keep Webpack analyzer as opt-in?
6. **Tailwind v4:** Should we bundle Tailwind 4 upgrade with Next.js 16, or keep separate? **Recommend: separate.**

---

## Sources

- [Next.js 16 Blog Post](https://nextjs.org/blog/next-16)
- [Next.js 16.1 Blog Post](https://nextjs.org/blog/next-16-1)
- [Upgrading: Version 16 Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Renaming Middleware to Proxy](https://nextjs.org/docs/messages/middleware-to-proxy)
- [Next.js Proxy File Convention](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
- [Next.js "use cache" Migration Guide](https://www.buildwithmatija.com/blog/nextjs-use-cache-migration-guide)
- [Next.js Codemods](https://nextjs.org/docs/pages/guides/upgrading/codemods)
- [HeroUI v2.6.0 React 19 Support](https://www.heroui.com/blog/v2.6.0)
- [Motion Upgrade Guide (framer-motion → motion)](https://motion.dev/docs/react-upgrade-guide)
- [Next.js GitHub Releases](https://github.com/vercel/next.js/releases)
