# Red Team Review: Next.js 14 -> 16 Upgrade Plan

**Date:** 2026-03-19
**Verdict: PLAN HAS SIGNIFICANT GAPS. Do NOT execute as-is.**

---

## 1. MISSING FILES (CRITICAL)

### 1.1 `tours/page.tsx` ALREADY migrated — plan doesn't know

`src/app/(language)/tours/page.tsx` already uses `searchParams: Promise<{...}>` and `await searchParams` (lines 22, 32). The plan lists this as needing migration in the research report but the actual code is already async. This means **someone already partially migrated**, or the codebase was updated after the research was done. The plan must reconcile this — partial migrations are dangerous because the codemod may double-wrap or conflict.

**Risk:** Codemod runs on already-migrated file, breaks it.

### 1.2 `generateMetadata` in about-us and contact-us — MISSED by research, but safe

Research report lists only 5 slug pages + 1 searchParams page. But `generateMetadata` also exists in `about-us/page.tsx` and `contact-us/page.tsx` per grep. However, those do NOT use params (confirmed: no `params` reference). So they are safe, but the research report's "~5 files" claim is sloppy — there are actually 8 files with `generateMetadata` across pages.

### 1.3 `src/app/sitemap.ts` — NOT MENTIONED ANYWHERE

The `src/app/sitemap.ts` file uses `generateSitemaps()` which returns `{ id }` and the `sitemap()` function receives `{ id }`. In Next.js 15+, the `id` param in dynamic sitemap routes may need async handling. The plan completely ignores this file.

**Risk:** Sitemap generation breaks silently in production.

### 1.4 `src/app/api/tours/route.ts` — NOT MENTIONED

API Route Handler exists. While it uses `new URL(request.url).searchParams` (not the async API), the caching behavior change in v15 (GET route handlers no longer cached by default) means this route's behavior changes. Not breaking, but not documented in the plan.

### 1.5 `src/app/error.tsx` exports `metadata` from "use client" file

Line 8: `export const metadata` from a `"use client"` component. This is invalid — metadata exports must be in server components. This exists BEFORE the upgrade but could cause harder failures in v15/16 with stricter validation.

### 1.6 `src/app/robots.ts` — NOT MENTIONED

Exists but not inventoried by the plan. Likely fine but should be verified.

---

## 2. WRONG ASSUMPTIONS (HIGH)

### 2.1 "No framer-motion imports" — CORRECT but misleading

Research says "just one `motion` import in nav" — this is wrong. There are ZERO JS imports of `framer-motion` anywhere. The `navigation-menu.tsx` reference is `data-[motion]` Tailwind CSS attribute selectors, not a framer-motion import. Phase 4 correctly identifies this, but Phase 4 still says "Migrate framer-motion -> motion" as a task. Since nothing imports it, just uninstall it. No file changes needed. Plan wastes effort on a non-issue.

### 2.2 Middleware -> Proxy rename: VERIFY THIS CLAIM

The research report claims Next.js 16 renames `middleware.ts` to `proxy.ts`. **This is a massive breaking change.** Before executing, verify this is actually in the stable release and not just an RFC or canary feature. The official Next.js 16 blog post should be cross-referenced. If the middleware->proxy rename is NOT in v16 stable, this entire Phase 3 is based on false information.

**Risk:** HIGHEST. If this rename doesn't exist in stable v16, Phase 3 is fiction.

### 2.3 `sentry.edge.config.ts` references "middleware, edge routes"

The plan says "rename middleware.ts to proxy.ts" but `sentry.edge.config.ts` is specifically designed to run in the Edge Runtime for middleware. If proxy runs on Node.js runtime (not Edge), the Sentry edge config becomes irrelevant/broken for the proxy use case.

### 2.4 `@next/bundle-analyzer` import syntax in TS config

Phase 3 shows `import withBundleAnalyzer from "@next/bundle-analyzer"` — this is a CJS package. It does NOT have a default ESM export. In a `.ts` config file, you may need `import pkg from "@next/bundle-analyzer"; const withBundleAnalyzer = pkg;` or `esModuleInterop: true` plus `allowSyntheticDefaultImports: true` in tsconfig. Not tested, just assumed.

### 2.5 ESLint 8 -> ESLint 9 IGNORED

Package.json has `eslint: 8.57.1`. Next.js 15+ uses `eslint-config-next` v15 which may require ESLint 9. Next.js 16 almost certainly does. The plan says "update eslint-config-next to latest" but never addresses the ESLint 8 -> 9 migration, which is a MAJOR breaking change (flat config format, plugin API changes). `@typescript-eslint/*` v8.x also needs updating.

**Risk:** `npm run lint` breaks after upgrade. Plan says "verify lint passes" but provides no steps for fixing lint config.

---

## 3. DEPENDENCY RISKS (HIGH)

### 3.1 `@sentry/nextjs` — GHOST DEPENDENCY

Sentry config files (`sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`) exist in the root and import `@sentry/nextjs`. But `@sentry/nextjs` is NOT in `package.json`. These files are UNTRACKED (shown in `git status` as `??`). Two possibilities:

1. Sentry was removed from package.json but config files left behind (recent commit `b2e372f` says "remove Sentry")
2. Someone is about to re-add Sentry

**Either way, the plan must decide:** Delete these orphan configs, or add `@sentry/nextjs` back. If left as-is, TypeScript will error on `import * as Sentry from "@sentry/nextjs"` if these files get picked up by the build.

### 3.2 `react-google-recaptcha` — NOT MENTIONED

`react-google-recaptcha: 3.1.0` with `@types/react-google-recaptcha: 2.1.9` — this uses `React.Component` class API and likely `forwardRef`. May have React 19 peer dep issues. Not in the compatibility matrix.

### 3.3 `@react-aria/i18n` — NOT MENTIONED

`@react-aria/i18n: 3.12.8` — React Aria packages need React 19 compatible versions. Missing from dependency matrix.

### 3.4 `@react-oauth/google` — NOT MENTIONED

`@react-oauth/google: 0.12.1` — missing from compatibility matrix. May have React 19 issues.

### 3.5 `body-scroll-lock` — ABANDONED PACKAGE

`body-scroll-lock: 4.0.0-beta.0` — this package is unmaintained (last commit 2020). Still a beta version. Not a React 19 issue specifically, but worth noting during dependency audit.

### 3.6 `react-dropzone` — NOT MENTIONED

Missing from compatibility matrix.

### 3.7 `react-intersection-observer` — NOT MENTIONED

Missing from compatibility matrix. Likely fine, but should be verified.

### 3.8 `leaflet` + `@types/leaflet` — NOT MENTIONED

Likely fine (no React dep), but missing from audit.

### 3.9 34 files use `forwardRef` — FUNCTIONAL but NOISY

34 component files use `React.forwardRef()`. In React 19, `forwardRef` still works but is deprecated. This will generate console warnings in development. Plan mentions this is "optional, not breaking" but doesn't note the dev noise impact.

### 3.10 `xlsx` — CDN dependency

`"xlsx": "https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz"` — installed from a CDN tarball, not npm. `npm install` could fail if CDN is down. Not upgrade-related but fragile.

### 3.11 `typescript: 5.5.4` — Plan doesn't address

Next.js 16 may require TypeScript 5.6+. The plan never mentions upgrading TypeScript.

### 3.12 `@types/node: 20.11.0` — Outdated

Phase 4 mentions updating this but doesn't specify target version. Next.js 16 with Node 20.9+ needs current types.

---

## 4. ORDER OF OPERATIONS (MEDIUM)

### 4.1 Two-stage upgrade is correct but risky

14->15->16 is the right approach. However, committing after v15 (Phase 2, step 11) before moving to v16 (Phase 3) means if v16 upgrade fails, you can rollback to v15 commit. This is actually good.

### 4.2 Dependency updates AFTER framework upgrade is wrong

Phase 4 (dependency updates) runs AFTER Phase 3 (v16). But Phase 2 (v15 + React 19) will immediately cause `npm install` peer dependency errors for packages that don't support React 19 yet. The codemod in Phase 2 Step 1 will update React to 19, but `@reactour/tour`, `react-day-picker`, `react-google-recaptcha`, etc. may refuse to install without `--legacy-peer-deps`.

**Risk:** Phase 2 build fails because peer deps refuse React 19. Plan says "use --legacy-peer-deps temporarily" in risk table but doesn't include this in the actual implementation steps.

### 4.3 ESLint update timing

`eslint-config-next@latest` is updated in Phase 2 Step 4, but ESLint 8 -> 9 migration is not addressed. This will either fail or produce a broken lint setup that's ignored because `ignoreDuringBuilds: true`.

---

## 5. ROLLBACK PLAN (CRITICAL — MISSING)

**There is no rollback plan.** The plan says "create branch" and "commit at each phase" but never documents:

- How to rollback if Phase 2 half-succeeds
- Whether to use `git stash` or `git reset`
- What to do if production breaks after deployment
- Whether to keep the old `package-lock.json` as backup
- How to revert the proxy rename if it causes issues in production

This is a framework-level upgrade. A rollback plan is mandatory.

---

## 6. POSTBUILD SCRIPT (HIGH)

### 6.1 Current postbuild script

```
"postbuild": "cross-env next-sitemap && cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/"
```

This copies `public/` and `.next/static/` into `.next/standalone/`.

### 6.2 Standalone output changes in Next.js 16

Next.js 15 changed standalone output structure. In v15+, `output: "standalone"` behavior may differ — especially with Turbopack as default bundler. The `.next/standalone/` directory structure could change.

**Specific risks:**
- Turbopack may produce different static asset paths
- The `server.js` entry point location may change
- The `cp -r .next/static .next/standalone/.next/` assumes Webpack-era structure

Plan Phase 5 says "verify standalone output works" but provides no fallback if the copy paths break.

### 6.3 `next-sitemap` in postbuild

`next-sitemap` runs as CLI in postbuild. This package reads `.next/` build output. If Next.js 16 changes the build output format, `next-sitemap` v4.2.3 will fail silently or produce wrong sitemaps. Also note: the project has BOTH `next-sitemap.config.js` (for the CLI) AND `src/app/sitemap.ts` (Next.js native sitemap). These may conflict. Plan does not address this duplication.

---

## 7. SENTRY FILES (MEDIUM)

### 7.1 Status: Orphaned

`sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` are:
- Untracked in git (`??` in status)
- Import `@sentry/nextjs` which is NOT in package.json
- Were recently removed (commit `b2e372f`: "remove Sentry")

### 7.2 Impact on upgrade

- If left as untracked files: no build impact (not imported by anything)
- If accidentally committed: TypeScript will fail on missing `@sentry/nextjs`
- If Sentry is re-added later: need `@sentry/nextjs` v9+ for Next.js 16 compatibility
- `sentry.edge.config.ts` specifically — if proxy runs on Node.js (not Edge), this config becomes meaningless for proxy instrumentation

### 7.3 Recommendation

Delete these files before starting the upgrade, or `.gitignore` them. They are noise.

---

## 8. ADDITIONAL GAPS

### 8.1 `src/instrumentation.ts` — Referenced but doesn't exist

Plan says "remove `experimental.instrumentationHook` flag" and research says "Framework auto-detects `instrumentation.ts`." But grep found NO `src/instrumentation.ts` file. The `instrumentationHook` flag in current config is set to `process.env.NODE_ENV !== "development"` — it's conditional. If there's no instrumentation file, this flag does nothing, but the plan should confirm the file doesn't exist rather than assuming it does.

### 8.2 No `next.config.ts` migration guide for `headers()/rewrites()/redirects()`

Phase 3 shows the full config but doesn't flag that `async headers()`, `async rewrites()`, `async redirects()` syntax must remain. These are already `async` in current config, so fine, but the plan should note this explicitly.

### 8.3 `meilisearch` dependency — also recently removed

`package.json` still lists `meilisearch: 0.50.0` but commit `b2e372f` says "remove Sentry and Meilisearch." Check if this was actually removed or just partially cleaned up.

### 8.4 No mention of `react-instantsearch` + Algolia

`react-instantsearch: 7.15.5` — uses Algolia search. If Meilisearch was removed, is Algolia the replacement? Irrelevant to upgrade but shows plan didn't fully audit the dependency list.

### 8.5 Node.js version not specified

Plan says "Node.js >= 20.9.0" but Next.js 16 may require Node.js >= 22. Should be verified against actual release requirements.

---

## SEVERITY SUMMARY

| # | Issue | Severity |
|---|-------|----------|
| 2.2 | Middleware->proxy rename: VERIFY this is real in stable v16 | **CRITICAL** |
| 5 | No rollback plan | **CRITICAL** |
| 1.1 | tours/page.tsx already migrated, codemod may break it | **HIGH** |
| 2.5 | ESLint 8->9 migration completely ignored | **HIGH** |
| 3.1 | Sentry orphan files will cause confusion | **HIGH** |
| 4.2 | Peer dep failures in Phase 2 not handled in steps | **HIGH** |
| 6.2 | Postbuild standalone copy may break with Turbopack | **HIGH** |
| 1.3 | sitemap.ts not inventoried | **MEDIUM** |
| 2.4 | Bundle analyzer CJS import in TS config | **MEDIUM** |
| 3.2-3.8 | 6+ deps missing from compatibility matrix | **MEDIUM** |
| 3.11 | TypeScript version not addressed | **MEDIUM** |
| 6.3 | Dual sitemap system (next-sitemap + native) not addressed | **MEDIUM** |
| 8.1 | instrumentation.ts doesn't exist | **LOW** |
| 3.9 | 34 forwardRef files will spam console | **LOW** |

---

## RECOMMENDATIONS

1. **STOP.** Verify middleware->proxy rename is in Next.js 16 stable. If not, rewrite Phase 3.
2. Write a rollback plan with specific `git reset` commands and deployment revert steps.
3. Add `--legacy-peer-deps` to Phase 2 implementation steps, with a list of which packages will complain.
4. Delete the 3 orphan Sentry config files before starting.
5. Add ESLint 8->9 migration as a sub-phase or acknowledge it's deferred.
6. Verify `tours/page.tsx` is already migrated and exclude it from codemod scope (or run codemod with `--dry-run` first).
7. Test the postbuild `cp` commands after upgrade with a throwaway build.
8. Audit ALL React dependencies, not just the obvious ones. The compatibility matrix is missing 6+ packages.
9. Decide on the dual sitemap situation: keep `next-sitemap` CLI or go all-in on native `src/app/sitemap.ts`.
10. Verify Node.js version requirement against actual Next.js 16 release notes.
