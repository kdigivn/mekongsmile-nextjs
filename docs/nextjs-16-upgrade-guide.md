# Next.js 14 → 16 Upgrade Guide

> Documentation of breaking changes and migration steps for mekongsmile.com

**Upgrade Date:** 2026-03-19
**Previous Version:** Next.js 14.2.29, React 18.3.1
**Current Version:** Next.js 16.2.0, React 19.2.4

## Key Changes Summary

### 1. Middleware → Proxy Renaming

**What Changed:**
- `src/middleware.ts` → `src/proxy.ts`
- Function export `middleware()` → `proxy()`

**Migration:**
```typescript
// Before (Next.js 14)
export function middleware(req: NextRequest) {
  // ...
}

// After (Next.js 16)
export function proxy(req: NextRequest) {
  // ...
}
```

**Reason:** Next.js 16 introduces middleware composition with the `proxy` function handling Edge Middleware routing.

### 2. Next.js Config Migration (CJS → ESM/TypeScript)

**What Changed:**
- `next.config.js` (CJS) → `next.config.ts` (ESM/TypeScript)

**Migration:**
```typescript
// Before (CJS)
module.exports = {
  output: "standalone",
  // ...
};

// After (ESM + TypeScript)
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: "standalone",
  // ...
};
export default nextConfig;
```

**Benefits:**
- Type-safe configuration with full IntelliSense
- Better IDE support and error detection
- Consistent with modern JavaScript ecosystem

### 3. React 19 Runtime

**What Changed:**
- React upgraded from 18.3.1 → 19.2.4
- Dependencies updated: `react`, `react-dom`, `@types/react`

**Key Features:**
- Improved error handling and stack traces
- Better React Server Component support
- Enhanced form handling (built-in form actions)
- Automatic batching improvements

**Compatibility:** Existing hooks and components require no changes. React 19 maintains backward compatibility with React 18 code patterns.

### 4. ESLint Configuration (External)

**What Changed:**
- ESLint config removed from `next.config.ts`
- ESLint now handled by external `.eslintrc.json`
- Lint script changed: `next lint` → `eslint src/ --ext .ts,.tsx`

**New `.eslintrc.json` Structure:**
```json
{
  "extends": [
    "next",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "root": true
  // ... rules
}
```

**Lint Command:**
```bash
npm run lint  # Now runs: eslint src/ --ext .ts,.tsx
```

**Reason:** Decoupling ESLint from Next.js build process improves:
- Build speed (ESLint doesn't run during `next build`)
- Flexibility (use external ESLint config independently)
- Consistency (same ESLint config in CI/CD and IDE)

### 5. Turbopack as Default Bundler (Dev Mode)

**What Changed:**
- Dev server now uses Turbopack by default
- Production builds still use Webpack (optimized)

**Dev Script:**
```bash
# New default (Turbopack)
npm run dev  # Equivalent to: next dev -p 3001 --turbopack

# To use Webpack (if needed)
npm run dev --no-turbopack
```

**Performance Impact:**
- 50-100x faster compilation in development
- Faster hot module replacement (HMR)
- Faster incremental builds
- No changes needed to existing code

**Turbopack vs Webpack (Production):**
| Aspect | Development | Production |
|--------|-------------|------------|
| Bundler | Turbopack | Webpack |
| Speed | ~50-100x faster | Production-optimized |
| Code Splitting | Incremental | Full tree-shaking |
| Output Size | Relevant for dev | Fully optimized |

### 6. Animation Library Update

**What Changed:**
- `framer-motion` (v11) → `motion` (v12)

**Migration Example:**
```typescript
// Before
import { motion } from "framer-motion";
export function AnimatedBox() {
  return <motion.div animate={{ x: 100 }} />;
}

// After
import { motion } from "motion/react";
export function AnimatedBox() {
  return <motion.div animate={{ x: 100 }} />;
}
```

**Key Differences:**
- Import path: `"framer-motion"` → `"motion/react"`
- API remains largely the same
- Better tree-shaking with motion package
- Smaller bundle size

**Note:** Update all framer-motion imports in components. Search for `from "framer-motion"` and replace with `from "motion/react"`.

### 7. React Date Picker Update

**What Changed:**
- `react-day-picker` v8 → v9

**Migration:**
```typescript
// v8 — Props changed
<DayPicker
  mode="single"
  selected={date}
  onSelect={setDate}
/>

// v9 — Same API, slight improvements to styling
<DayPicker
  mode="single"
  selected={date}
  onSelect={setDate}
/>
```

**Notes:**
- API is mostly backward-compatible
- CSS classes may have changed—check component styling
- Improved accessibility features

### 8. Removed Dependencies

**Meilisearch (Removed):**
- `meilisearch` package removed
- `react-instantsearch` package removed
- Search now uses client-side filtering (taxonomy + text)

**Migration:**
- All search/filter features use the tour taxonomy system
- No API calls to Meilisearch during page load
- Reduced bundle size and dependencies

**Sentry (Removed):**
- `@sentry/nextjs` package removed
- Error tracking and session replay no longer active

### 9. GraphQL Client Updates

**What Changed:**
- Apollo Client upgraded: `^3.x` → `^4.1.6`

**API Compatibility:**
- GraphQL query/mutation patterns unchanged
- Configuration mostly compatible
- Performance improvements in caching

**Notes:**
- No breaking changes to existing GraphQL services
- TypeScript types remain compatible

## File Changes Checklist

### Renamed Files
- [x] `src/middleware.ts` → `src/proxy.ts`
- [x] Function export renamed: `middleware()` → `proxy()`

### Modified Configuration
- [x] `next.config.js` → `next.config.ts` (ESM/TypeScript)
- [x] `.eslintrc.json` updated (external ESLint config)
- [x] `package.json` updated (deps + scripts)

### Updated Import Statements
- [x] Search/replace `"framer-motion"` → `"motion/react"`
- [x] Removed Meilisearch imports
- [x] Removed Sentry imports (if any app-level imports)

### Package Dependencies
- [x] React: 18.3.1 → 19.2.4
- [x] Next.js: 14.2.29 → 16.2.0
- [x] motion: ^12.38.0 (new, replaces framer-motion)
- [x] react-day-picker: ^9.14.0 (upgraded from v8)
- [x] apollo-client: ^4.1.6 (upgraded from ^3.x)

## Development Workflow Changes

### Build & Dev Commands
```bash
# Development (Turbopack, much faster)
npm run dev

# Production build
npm run build

# Linting (now external, faster build)
npm run lint         # eslint src/ --ext .ts,.tsx

# Type checking
npm run ts

# Format code
npm run format
```

### Performance Gains
- **Dev compilation:** 50-100x faster with Turbopack
- **Build time:** Slightly faster overall (no ESLint during build)
- **Hot reload:** Faster HMR with Turbopack
- **Bundle size:** Reduced (Sentry, Meilisearch removed)

## Testing & Validation

### What to Test
1. **i18n Routing:** Language detection and cookie-based routing works
2. **Animation Components:** Verify all `motion` (formerly framer-motion) components render
3. **Date Picker:** Ensure calendar selection and date formatting work
4. **Search/Filter:** Taxonomy filters and text search function correctly
5. **Client-side functionality:** No breaking changes in React 19

### QA Checklist
- [ ] Dev server starts (port 3001)
- [ ] Hot reload works during development
- [ ] `npm run build` completes without errors
- [ ] `npm run lint` passes
- [ ] `npm run ts` passes type checking
- [ ] Tour listing & filtering work
- [ ] Blog/news pages render
- [ ] Auth flows (login/register) work
- [ ] Date picker renders correctly
- [ ] Animations play smoothly

## Troubleshooting

### Issue: "Cannot find module 'framer-motion'"
**Solution:** Update import paths to `"motion/react"`

### Issue: Turbopack build errors
**Solution:** Clear `.next/` directory and rebuild:
```bash
rm -rf .next/
npm run dev
```

### Issue: ESLint not running during build
**Expected behavior:** In Next.js 16+, ESLint is external and must be run separately:
```bash
npm run lint  # Explicit lint step
npm run build # Builds without linting
```

### Issue: Proxy function not working
**Solution:** Ensure `src/proxy.ts` is correctly exported:
```typescript
export function proxy(req: NextRequest) {
  // ...
}
```

## Links & Resources

- [Next.js 16 Upgrade Guide](https://nextjs.org/docs)
- [React 19 Announcement](https://react.dev)
- [Turbopack Documentation](https://turbo.build/pack)
- [Motion (formerly Framer Motion)](https://motion.dev)
- [react-day-picker v9](https://daypicker.dev)

## Related Documentation

- [System Architecture](./system-architecture.md)
- [Code Standards](./code-standards.md)
- [Codebase Summary](./codebase-summary.md)
