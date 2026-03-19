# Phase 3: Next.js 15→16 + Proxy Rename

## Context
- [Research Report](../reports/researcher-260319-nextjs-14-to-16-upgrade.md)
- [Plan Overview](./plan.md)

## Overview
- **Priority:** P1
- **Status:** Complete
- **Effort:** 1h

Upgrade to Next.js 16: middleware→proxy rename, config migration to TS, remove deprecated experimental flags.

## Key Insights

1. `middleware.ts` → `proxy.ts`, function `middleware` → `proxy`
2. Proxy runs on Node.js runtime (not Edge) — our middleware uses `accept-language` (pure JS), so compatible
3. `experimental.instrumentationHook` removed — auto-detected now
4. `next.config.js` → `next.config.ts` (optional but recommended)
5. Turbopack is default bundler
6. `@next/bundle-analyzer` is Webpack-only; Turbopack uses `next experimental-analyze`
7. Config flags renamed: `skipMiddlewareUrlNormalize` → `skipProxyUrlNormalize`

## ⚠️ CRITICAL PRE-CHECK (Red Team Finding)

**BEFORE starting this phase**, verify the middleware→proxy rename is in stable Next.js 16:
```bash
# Check actual version installed
npm ls next

# Verify docs
# Visit: https://nextjs.org/docs/app/guides/upgrading/version-16
# Visit: https://nextjs.org/docs/messages/middleware-to-proxy
```

Web search confirmed: proxy rename IS in stable v16 (verified via nextjs.org docs links).
If for any reason the rename is NOT in the installed version, skip the rename and keep `middleware.ts`.

## ⚠️ `@next/bundle-analyzer` CJS Import

`@next/bundle-analyzer` is a CJS package. In `next.config.ts` (ESM), the import syntax may need adjustment:
```typescript
// Try this first:
import withBundleAnalyzer from "@next/bundle-analyzer";

// If that fails, use:
import pkg from "@next/bundle-analyzer";
const withBundleAnalyzer = pkg;
```

Verify `tsconfig.json` has `esModuleInterop: true` (it does — line 9).

## Related Code Files

| File | Action | Detail |
|------|--------|--------|
| `package.json` | Modify | Update `next` to 16.x |
| `src/middleware.ts` | Rename → `src/proxy.ts` | Rename file + function |
| `next.config.js` | Rename → `next.config.ts` | Convert CJS to ESM + TypeScript |
| `src/instrumentation.ts` | No change | Flag removal only in config |

## Implementation Steps

### Step 1: Upgrade Next.js to 16
```bash
npx @next/codemod@canary upgrade latest
```

### Step 2: Middleware → Proxy migration
```bash
# Run codemod if available
npx @next/codemod@canary middleware-to-proxy
```

If codemod doesn't work, manual:
1. Rename `src/middleware.ts` → `src/proxy.ts`
2. Rename function:

```tsx
// BEFORE: src/middleware.ts
export function middleware(req: NextRequest) { ... }

// AFTER: src/proxy.ts
export function proxy(req: NextRequest) { ... }
```

3. Update `tsconfig.json` if it explicitly includes `src/middleware.ts`:
```json
// Change: "src/middleware.ts" → "src/proxy.ts"
```

### Step 3: Convert next.config.js → next.config.ts

```typescript
// next.config.ts
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
      "framer-motion",
      "@radix-ui/react-select",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-navigation-menu",
      "@radix-ui/react-accordion",
      "@radix-ui/react-tooltip",
    ],
    // instrumentationHook REMOVED — now auto-detected
    cssChunking: "strict",
  },
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/static-img/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:file(.*\\.(?:png|jpg|jpeg|webp|svg|ico|gif|woff2|woff|ttf))",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/post-sitemap.xml", destination: "/sitemap/posts.xml" },
      { source: "/tour-sitemap.xml", destination: "/sitemap/tours.xml" },
      { source: "/page-sitemap.xml", destination: "/sitemap/pages.xml" },
      { source: "/destination-sitemap.xml", destination: "/sitemap/destinations.xml" },
      { source: "/category-sitemap.xml", destination: "/sitemap/categories.xml" },
    ];
  },
  trailingSlash: true,
  async redirects() {
    return [
      { source: "/product/:slug*", destination: "/tour/:slug*", permanent: true },
      { source: "/shop/", destination: "/tours/", permanent: true },
      { source: "/product-tag/:slug*", destination: "/tours/", permanent: true },
      { source: "/travel-guide/", destination: "/blog/", permanent: true },
      { source: "/travel-guide/:slug*", destination: "/blog/:slug*", permanent: true },
    ];
  },
};

const config = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(nextConfig);

export default config;
```

### Step 4: Remove old config
```bash
rm next.config.js
```

### Step 5: Build & verify
```bash
npm run build
npm run ts
```

## Todo List
- [ ] Run `npx @next/codemod@canary upgrade latest`
- [ ] Rename `src/middleware.ts` → `src/proxy.ts`
- [ ] Rename function `middleware` → `proxy`
- [ ] Update `tsconfig.json` middleware include
- [ ] Convert `next.config.js` → `next.config.ts`
- [ ] Remove `experimental.instrumentationHook` from config
- [ ] Delete old `next.config.js`
- [ ] `npm run build` passes
- [ ] Commit: `chore(deps): upgrade Next.js 15→16, rename middleware to proxy`

## Success Criteria
- Clean build with Next.js 16
- Proxy (formerly middleware) handles i18n routing correctly
- Turbopack dev server starts without errors

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Proxy Node.js runtime breaks i18n | LOW | `accept-language` is pure JS, works everywhere |
| `@next/bundle-analyzer` incompatible with Turbopack | LOW | Keep for Webpack analysis, use `--webpack` flag |
| `withBundleAnalyzer` import syntax | LOW | Check if default export or named export in v16 |
