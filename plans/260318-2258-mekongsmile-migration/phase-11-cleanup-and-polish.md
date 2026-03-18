# Phase 11: Cleanup & Polish

## Context Links
- [Plan Overview](./plan.md)
- [Research Report](../reports/research-260318-2245-mekongsmile-migration-analysis.md)

## Overview
- **Priority:** P3
- **Status:** completed
- **Effort:** 3h
- **Description:** Remove all ferry-specific dead code, update documentation, performance audit, final build verification. This is the "gut" phase -- safe to do only after all tour features work.

## Key Insights
- ~60% of `src/services/apis/` is ferry-specific (voyages, tickets, bookings, passengers, payments, boat-layouts, routes, operators, invoices, vouchers, etc.)
- Ferry-specific routes: schedules, ticket-detail, booking/[id], payment-gateway/*, user/bookings, transactions
- Ferry-specific views: schedule/, list-with-table/ (voyage tables)
- Meilisearch integration no longer needed
- Permate affiliate tracking no longer needed
- Multi-tenant org system no longer needed

## Requirements

### Functional
- No ferry-specific code remains in codebase
- All imports resolve (no broken references)
- Build succeeds, all pages render

### Non-Functional
- Reduced bundle size (remove unused deps)
- Clean git history (single cleanup commit or small series)
- Updated documentation

## Implementation Steps

### 1. Delete ferry-specific service directories

```
DELETE src/services/apis/voyages/
DELETE src/services/apis/tickets/
DELETE src/services/apis/bookings/        # old ferry bookings (not new tour bookings)
DELETE src/services/apis/passengers/
DELETE src/services/apis/payments/        # old ferry payments
DELETE src/services/apis/boat-layouts/    # (boatLayouts/)
DELETE src/services/apis/routes/
DELETE src/services/apis/operators/
DELETE src/services/apis/invoices/
DELETE src/services/apis/voucher/
DELETE src/services/apis/cancel-ticket-request/
DELETE src/services/apis/ticket-price-additions/
DELETE src/services/apis/tax-record/
DELETE src/services/apis/excel/
DELETE src/services/apis/permate/
DELETE src/services/apis/organizations/
DELETE src/services/apis/companies/       # if exists
DELETE src/services/apis/locations/       # ferry locations
DELETE src/services/apis/cms/notification.service.ts  # evaluate
```

### 2. Delete ferry-specific route pages

```
DELETE src/app/(language)/schedules/
DELETE src/app/(language)/ticket-detail/
DELETE src/app/(language)/booking/         # old ferry booking (new tour booking is separate)
DELETE src/app/(language)/payment-gateway/
DELETE src/app/(language)/user/bookings/   # old ferry bookings history
DELETE src/app/(language)/user/cancel-ticket-request/
DELETE src/app/(language)/transactions/
```

### 3. Delete ferry-specific views

```
DELETE src/views/schedule/
DELETE src/views/list-with-table/         # voyage table view
```

### 4. Delete old WordPress service layer

```
DELETE src/services/infrastructure/wordpress/  # replaced by src/services/wordpress/ + graphql/
DELETE src/services/infrastructure/meilisearch/
DELETE src/services/infrastructure/permate/
```

### 5. Delete ferry-specific API routes

```
DELETE src/app/api/voyageCounts/
DELETE src/app/api/baocao/
```

### 6. Clean up old view components

Evaluate and remove ferry-specific homepage sections:
```
DELETE src/views/homepage/operators-section.tsx       # ferry operators
DELETE src/views/homepage/ferry-schedules-section.tsx  # ferry schedules
DELETE src/views/homepage/coupons-section.tsx          # ferry vouchers
DELETE src/views/homepage/coop-section.tsx             # ferry partnerships
```

### 7. Remove unused dependencies

After deleting code, audit `package.json` for orphaned deps. Candidates:
- Meilisearch client (if installed)
- Any ferry-specific packages

Run `npx depcheck` to find unused deps.

### 8. Update lib/utils

- `src/lib/utils/booking-utils.ts` -- delete if ferry-specific
- `src/lib/clickBaitUtil.ts` -- evaluate relevance
- Keep: `cn.ts`, `date-utils.ts`, `format-utils.ts`, `string-utils.ts`, `browser-utils.ts`, `seo-utils.ts`, `ui-utils.ts`

### 9. Update documentation

- `README.md` -- rewrite for mekongsmile.com (stack, setup, features)
- `docs/project-overview-pdr.md` -- update for tour booking
- `docs/system-architecture.md` -- update for hybrid architecture
- `docs/code-standards.md` -- review, likely still valid
- `docs/deployment-guide.md` -- update env vars, PM2 config
- `docs/auth.md` -- simplify for JWT + Google OAuth only

### 10. Performance audit

- Run `npm run build` and check bundle size
- Run Lighthouse on key pages (homepage, tour detail, blog)
- Check Core Web Vitals (LCP, CLS, FID)
- Verify ISR revalidation works in production mode

### 11. Final build verification

```bash
npm run build
npm run start
# Test all routes manually or with simple script
```

## Todo List
- [x] Delete ferry-specific service directories (15+ dirs)
- [x] Delete ferry-specific route pages (7+ dirs)
- [x] Delete ferry-specific views
- [x] Delete old WordPress service layer
- [x] Delete ferry-specific API routes
- [x] Clean up homepage view components
- [x] Run `npx depcheck` and remove unused deps
- [x] Clean up lib/utils
- [x] Update README.md
- [x] Update docs/ files
- [x] Run `npm run build` -- verify success
- [x] Run `npm run ts` -- no type errors
- [x] Run `npm run lint` -- no critical lint errors
- [x] Lighthouse audit on homepage + tour detail
- [x] Verify no broken imports (grep for deleted module paths)

## Success Criteria
- `npm run build` succeeds with zero errors
- No references to deleted ferry modules
- Bundle size reduced (measure before/after)
- Lighthouse Performance score >= 80 on homepage
- All 11 route types render correctly
- Documentation reflects current architecture

## Risk Assessment
- **Breaking imports** -- deleting directories may break files that still import from them. Run `npm run ts` after each batch of deletions to catch early.
- **Accidental deletion of shared utilities** -- some files in `src/services/apis/common/` are shared. Do NOT delete common/. Only delete domain-specific subdirectories.
- **Git history** -- large deletion commit. Consider splitting into logical groups (services, routes, views) for reviewability.

## Next Steps
This is the final phase. After completion:
- Deploy to staging for QA
- Monitor Sentry for errors
- Iterate on design/UX based on feedback
