---
title: "Upgrade Next.js 14 → 16"
description: "Two-stage migration from Next.js 14.2.29 to 16.x with React 19, async APIs, and proxy rename"
status: complete
priority: P1
effort: 5h
branch: feat/nextjs-16-upgrade
tags: [infra, frontend, framework]
created: 2026-03-19
completed: 2026-03-19
---

# Upgrade Next.js 14 → 16

## Overview

Two-stage upgrade: 14→15 (async APIs, React 19) then 15→16 (proxy rename, Turbopack, caching model).
Codebase has LOW migration complexity — ~6 files need async params, 1 middleware rename, 1 config migration.

**Note:** `src/app/(language)/tours/page.tsx` is ALREADY migrated to async searchParams — skip it.

## Research & Reviews

- [Research Report](../reports/researcher-260319-nextjs-14-to-16-upgrade.md)
- [Red Team Review](../reports/reviewer-260319-nextjs-16-upgrade-red-team.md)

## Phases

| # | Phase | Status | Effort | Link |
|---|-------|--------|--------|------|
| 1 | Preparation & cleanup | Complete | 20m | [phase-01](./phase-01-preparation.md) |
| 2 | Next.js 14→15 + React 19 | Complete | 1.5h | [phase-02](./phase-02-nextjs-15-migration.md) |
| 3 | Next.js 15→16 + Proxy | Complete | 1.5h | [phase-03](./phase-03-nextjs-16-migration.md) |
| 4 | Dependency updates | Complete | 1h | [phase-04](./phase-04-dependency-updates.md) |
| 5 | Validation & smoke test | Complete | 30m | [phase-05](./phase-05-validation.md) |

## Rollback Plan

Each phase commits separately. Rollback strategy:
```bash
# If Phase N fails, reset to last good commit:
git log --oneline -5          # find last good commit
git reset --hard <commit-sha> # revert
rm -rf node_modules .next
npm install
npm run build                 # verify recovery
```
Keep `package-lock.json` backed up before each phase.

## Pre-Upgrade Cleanup

Before starting:
1. Delete orphan Sentry configs: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
2. Verify `meilisearch` is actually removed or remove it from package.json
3. Verify Node.js version (≥20.9.0, check if v16 needs ≥22)

## Key Risks (Updated from Red Team)

| Risk | Severity | Mitigation |
|------|----------|------------|
| Middleware→proxy rename: verify it's in stable v16 | CRITICAL | Check nextjs.org/docs before Phase 3 |
| ESLint 8→9 migration | HIGH | Address in Phase 2 or defer lint to Phase 4 |
| `tours/page.tsx` already migrated | HIGH | Skip this file in codemod, verify manually |
| Peer dep failures on React 19 | HIGH | Use `--legacy-peer-deps` in Phase 2, fix in Phase 4 |
| Postbuild cp script with Turbopack | HIGH | Test standalone output structure in Phase 5 |
| `react-day-picker` v8 + React 19 | MEDIUM | Test, upgrade to v9 if needed |
| Dual sitemap system | MEDIUM | Audit in Phase 5 |
| Missing deps in compat matrix | MEDIUM | Full audit in Phase 4 |

## Dependencies

- Node.js ≥20.9.0 (verify actual v16 requirement)
- React 19.2+ (required by Next.js 16)
- TypeScript ≥5.5 (may need ≥5.6, verify)
