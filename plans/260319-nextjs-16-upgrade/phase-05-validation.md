# Phase 5: Validation & Smoke Test

## Context
- [Plan Overview](./plan.md)

## Overview
- **Priority:** P1
- **Status:** Complete
- **Effort:** 30m

Full validation: build, lint, TypeScript, dev server, key pages smoke test, sitemap.

## Implementation Steps

### Step 1: Build validation
```bash
npm run build
npm run lint
npm run ts
```

### Step 2: Dev server test
```bash
npm run dev
```
Verify Turbopack starts (should see "Turbopack" in terminal output).

### Step 3: Smoke test key pages
Open in browser and verify rendering:
- [ ] Homepage: `http://localhost:3001/`
- [ ] Tours listing: `http://localhost:3001/tours/`
- [ ] Tour detail: `http://localhost:3001/tour/[any-slug]/`
- [ ] Blog listing: `http://localhost:3001/blog/`
- [ ] Blog post: `http://localhost:3001/blog/[any-slug]/`
- [ ] Destination: `http://localhost:3001/destination/[any-slug]/`
- [ ] News: `http://localhost:3001/news/[any-slug]/`
- [ ] About: `http://localhost:3001/about-us/`
- [ ] Contact: `http://localhost:3001/contact-us/`

### Step 4: Verify proxy (middleware) works
- Visit `/en/tours/` — should redirect to `/tours/` (language prefix strip)
- Check no i18n routing regressions

### Step 5: Verify postbuild cp script (Red Team concern)
The postbuild script copies files to standalone:
```bash
"postbuild": "cross-env next-sitemap && cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/"
```
Verify standalone directory structure is intact:
```bash
ls -la .next/standalone/
ls -la .next/standalone/.next/static/
ls -la .next/standalone/public/
# Verify server.js exists
ls -la .next/standalone/server.js
```
If paths changed with Turbopack, update postbuild script accordingly.

### Step 6: Verify sitemap generation
```bash
# next-sitemap runs in postbuild
# Verify sitemaps were generated:
ls .next/standalone/sitemap*.xml 2>/dev/null || ls .next/sitemap*.xml 2>/dev/null
```
**Note:** Project has DUAL sitemap system:
- `next-sitemap.config.js` (CLI, runs in postbuild)
- `src/app/sitemap.ts` (Next.js native, dynamic XML routes)
Both should be verified. Consider consolidating to native-only in future.

### Step 7: Verify standalone output
```bash
npm run start:dev
# Test a few pages on standalone server
```

### Step 8: Update documentation
- Update `docs/codebase-summary.md` — change Next.js version, note proxy rename
- Update `docs/system-architecture.md` — middleware section → proxy
- Update `docs/code-standards.md` — config file reference

## Todo List
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `npm run ts` passes
- [ ] Dev server starts with Turbopack
- [ ] All key pages render correctly
- [ ] Proxy handles language redirects
- [ ] Sitemap generates correctly
- [ ] Standalone output works
- [ ] Documentation updated
- [ ] Final commit: `docs: update documentation for Next.js 16`

## Success Criteria
- Zero build errors
- All pages render without runtime errors
- i18n proxy routing works
- Sitemap generates correctly
- Documentation reflects new stack
