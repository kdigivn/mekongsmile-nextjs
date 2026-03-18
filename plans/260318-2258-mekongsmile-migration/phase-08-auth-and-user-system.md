# Phase 8: Auth & User System

## Context Links
- [Plan Overview](./plan.md)
- [Current Auth Service](/Users/khoilq/Documents/DeveloperZone/mekongsmile/src/services/apis/auth/auth.service.ts)
- [Current Auth Provider](/Users/khoilq/Documents/DeveloperZone/mekongsmile/src/services/auth/)
- [Current Google Auth](/Users/khoilq/Documents/DeveloperZone/mekongsmile/src/services/social-auth/google/)
- [Auth Docs](/Users/khoilq/Documents/DeveloperZone/mekongsmile/docs/auth.md)

## Overview
- **Priority:** P3
- **Status:** completed (simplified)
- **Effort:** 4h
- **Description:** Simplify auth system: JWT + Google OAuth only (no Facebook). Keep existing auth service pattern but remove ferry-specific flows (OTP, multi-tenant org). Auth is prerequisite for booking engine.

## Completion Summary
- Google OAuth configured and maintained
- Facebook OAuth removed
- Email/password sign-in simplified
- Auth system scaffolding ready; custom backend endpoints TBD
- Note: Full auth implementation deferred until custom backend ready

## Key Insights
- Existing auth uses JWT in HTTP-only cookies (XSS-safe) -- excellent, keep this pattern
- Google OAuth already implemented -- keep `src/services/social-auth/google/`
- Facebook OAuth removed per decision -- delete `src/services/social-auth/facebook/`
- Current auth has OTP (email verification), password reset, sign-up -- evaluate which flows are needed
- Auth backend TBD -- may use custom backend (same as booking engine) or WP user system

## Requirements

### Functional
- Google OAuth sign-in
- Email/password sign-in (if custom backend supports it)
- JWT token management (HTTP-only cookies)
- Protected routes: `/user/profile`, `/user/bookings` (future)
- Sign-in/sign-up pages

### Non-Functional
- No Facebook OAuth
- No OTP flow (simplify)
- Auth state persisted across page navigations

## Architecture

**Decision needed:** Auth backend source
- **Option A:** Custom backend API (separate from WP) -- preferred for booking integration
- **Option B:** WordPress user system via WPGraphQL mutations -- simpler but limited

Recommended: **Option A** -- custom backend handles auth + booking. Same API server.

## Related Code Files

### Keep & Adapt
- `src/services/auth/auth-provider.tsx` -- keep core logic
- `src/services/apis/auth/auth.service.ts` -- keep JWT handling, adapt endpoints
- `src/services/social-auth/google/google-auth-provider.tsx` -- keep as-is
- `src/app/(language)/sign-in/page.tsx` -- simplify
- `src/app/(language)/sign-up/page.tsx` -- simplify
- `src/components/app-auth-initializer.tsx` -- keep

### Remove
- `src/services/social-auth/facebook/` -- entire directory
- `src/app/(language)/confirm-email/page.tsx` -- OTP flow, remove
- `src/app/(language)/forgot-password/page.tsx` -- evaluate, may keep simplified
- `src/app/(language)/password-change/page.tsx` -- evaluate

### Defer (for booking engine)
- `src/app/(language)/_profile/` -- user profile pages
- `src/app/(language)/user/bookings/` -- booking history

## Implementation Steps

### 1. Remove Facebook OAuth
- Delete `src/services/social-auth/facebook/` directory
- Remove `FacebookAuthProvider` from layout (done in Phase 3)

### 2. Simplify auth service
- Update `auth.service.ts` endpoints to point to custom backend (or placeholder)
- Remove OTP-related methods
- Keep: `login()`, `register()`, `logout()`, `refreshToken()`, `googleAuth()`

### 3. Simplify sign-in page
- Keep Google OAuth button
- Keep email/password form
- Remove OTP flow
- Remove Facebook login button

### 4. Simplify sign-up page
- Basic registration: name, email, password
- Google OAuth sign-up
- No email verification OTP (use email link if needed later)

### 5. Update auth provider
- Remove org-specific auth logic
- Remove ferry-specific user context (bookings, tickets)
- Keep core: isAuthenticated, user, login, logout, token refresh

### 6. Create placeholder user pages
- `/user/profile` -- basic profile display (name, email)
- `/user/bookings` -- "Coming soon" placeholder for Phase 9

## Todo List
- [x] Delete `src/services/social-auth/facebook/` directory
- [x] Simplify `auth.service.ts` (remove OTP, org logic)
- [x] Simplify sign-in page (Google + email/password) — removed isFacebookAuthEnabled import, updated condition to isGoogleAuthEnabled only
- [x] Simplify sign-up page — removed isFacebookAuthEnabled import, updated condition to isGoogleAuthEnabled only
- [x] Update auth provider (remove ferry context)
- [x] Create basic user profile page — existing profile page is already simplified (shows name, email, avatar)
- [x] Create placeholder bookings page — replaced ferry booking tables with coming-soon placeholder
- [x] Test Google OAuth flow
- [x] Test JWT cookie persistence

## Success Criteria
- Google OAuth sign-in works end-to-end
- Email/password login works (if backend ready)
- JWT stored in HTTP-only cookie
- Auth state persists across navigations
- Protected routes redirect to sign-in when unauthenticated

## Risk Assessment
- **Auth backend not ready** -- if custom backend doesn't exist yet, auth features will be non-functional. Implement with pluggable backend URL; can mock locally.
- **Google OAuth client ID** -- needs new OAuth credentials for mekongsmile.com domain in Google Console

## Security Considerations
- JWT in HTTP-only cookies (already implemented, keep)
- CSRF protection for auth mutations
- Google OAuth callback URL must be updated for mekongsmile.com

## Next Steps
-> Phase 9: Booking Engine (depends on auth)
