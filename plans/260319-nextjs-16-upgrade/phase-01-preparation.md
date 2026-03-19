# Phase 1: Preparation & Cleanup

## Context
- [Research Report](../reports/researcher-260319-nextjs-14-to-16-upgrade.md)
- [Red Team Review](../reports/reviewer-260319-nextjs-16-upgrade-red-team.md)
- [Plan Overview](./plan.md)

## Overview
- **Priority:** P1
- **Status:** Complete
- **Effort:** 20m

Create upgrade branch, clean up orphan files, verify baseline, backup lock file.

## Implementation Steps

1. Check Node.js version: `node -v` (must be ≥ 20.9.0)
2. Create branch: `git checkout -b feat/nextjs-16-upgrade`
3. **Delete orphan Sentry configs** (removed in b2e372f but files left behind):
   ```bash
   rm sentry.client.config.ts sentry.server.config.ts sentry.edge.config.ts
   ```
4. **Verify `src/instrumentation.ts` exists** — it does (`src/instrumentation.ts`), but it's minimal (empty `register()`). Keep it.
5. **Backup package-lock.json**: `cp package-lock.json package-lock.json.bak`
6. Run `npm run build` — verify clean baseline
7. Run `npm run lint` — verify no lint errors
8. Commit cleanup: `chore: remove orphan sentry config files`

## Todo List
- [ ] Verify Node.js version ≥ 20.9.0
- [ ] Create feature branch
- [ ] Delete 3 orphan sentry config files
- [ ] Backup package-lock.json
- [ ] Verify clean build
- [ ] Verify clean lint
- [ ] Commit cleanup

## Success Criteria
- Clean build on current Next.js 14.2.29
- Feature branch created
- Orphan files removed

## Risk Assessment
- LOW: If build fails now, fix first before upgrading
