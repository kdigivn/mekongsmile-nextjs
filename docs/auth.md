# Auth

> Authentication flows for Mekong Smile Tours.

**Last Updated:** 2026-03-03

## Table of Contents

- [Overview](#overview)
- [Email + OTP Login](#email--otp-login)
- [Email + Password Login](#email--password-login)
- [Google OAuth](#google-oauth)
- [Facebook OAuth](#facebook-oauth)
- [Token Storage & Refresh](#token-storage--refresh)
- [Middleware Auth Guard](#middleware-auth-guard)
- [Logout](#logout)
- [Setup Guide](#setup-guide)

---

## Overview

Authentication uses **JWT stored in HTTP-only cookies** — tokens are never accessible to browser JavaScript. The flow goes through Next.js BFF API routes which handle cookie management server-side.

**Token cookies:**
| Cookie | Lifetime | Purpose |
|--------|----------|---------|
| `Jwt` | Short-lived (15min–1h) | Auth token for API requests |
| `RefreshToken` | Long-lived (7–30 days) | Renew expired JWT |

**Auth context:** `useAuth()` hook provides `{ user, isAuthenticated, login, logout, isLoading }` to any component.

---

## Email + OTP Login

Used for new users or passwordless login:

1. User enters email → `POST /api/auth/login/email/checkInOrg` — checks if email exists
2. If new → suggest registration flow (see OTP registration below)
3. If existing → proceed to password prompt
4. Submit credentials → `POST /api/auth/login/email`
5. BFF receives JWT + RefreshToken from backend → sets as HTTP-only cookies
6. `AppAuthInitializer` (client component) syncs auth state to React Query
7. User redirected to intended page or `/ticket-detail`

**OTP Registration flow:**
1. Email not found → trigger OTP → `POST /api/auth/register/withEmailOTP`
2. User receives OTP via email (verified via IMAP in Cypress tests)
3. Enter OTP + new password → `POST /api/auth/verifyEmailOTPAndResetPassword`
4. Tokens issued — same cookie flow as login

---

## Email + Password Login

Standard credential login for existing accounts:

```
POST /api/auth/login/email
Body: { email, password }
Response: Sets Jwt + RefreshToken cookies
```

Service hook: `useAuthLoginService()` from `src/services/apis/auth/`

---

## Google OAuth

### Setup

1. Go to [Google Developer Console](https://console.cloud.google.com/)
2. Create or select a project → **APIs & Services** → **Credentials**
3. Create an **OAuth 2.0 Client ID** (Web application type)
4. Add authorized JavaScript origins:
   - `http://localhost` (local dev)
   - `http://localhost:3001` (local dev with port)
   - Your production domain (e.g., `https://mekongsmile.com`)
5. Copy the **Client ID**
6. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_IS_GOOGLE_AUTH_ENABLED=true
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```

### Flow

1. User clicks Google button → `@react-oauth/google` handles consent
2. On success → `idToken` received from Google
3. `POST /api/auth/google/login` with `idToken`
4. Backend validates token with Google → returns JWT + RefreshToken
5. BFF sets HTTP-only cookies — same flow as email login

Service hook: `useGoogleLoginService()` from `src/services/apis/auth/`

---

## Facebook OAuth

### Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create an app → add **Facebook Login** product
3. Add valid OAuth redirect URIs for your domain
4. Copy the **App ID**
5. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_IS_FACEBOOK_AUTH_ENABLED=true
   NEXT_PUBLIC_FACEBOOK_APP_ID=your-app-id
   ```

### Flow

Similar to Google — idToken sent to `/api/auth/facebook/login`, backend validates, JWT issued.

Service hook: `useFacebookLoginService()` from `src/services/apis/auth/`

---

## Token Storage & Refresh

### Storage

Tokens are stored **server-side only** as HTTP-only cookies — inaccessible to browser JavaScript (XSS-safe).

```
Cookie: Jwt=<jwt-token>; HttpOnly; Secure; SameSite=Lax
Cookie: RefreshToken=<refresh-token>; HttpOnly; Secure; SameSite=Lax
```

### Reading Tokens (Server-side)

Use the server action to read the JWT in server components or API routes:

```typescript
import { getJWT } from "@/server-actions/get-jwt";

const token = await getJWT(); // Returns string | undefined
```

### Refresh Flow

Triggered automatically on 401 response or proactively before expiry:

```
Client receives 401
    ↓
POST /api/auth/refresh
    ↓ (sends RefreshToken cookie automatically)
Backend validates RefreshToken → returns new JWT
    ↓
BFF updates Jwt cookie
    ↓
Failed request retried with new JWT
```

If RefreshToken is also expired → user redirected to `/sign-in`.

---

## Middleware Auth Guard

`src/middleware.ts` runs on every request and handles:

1. **Language detection** — cookie → Accept-Language header → default `vi`
2. **i18n routing** — redirect to correct locale prefix if enabled
3. **Auth guard** — routes requiring auth redirect to `/sign-in` if no JWT cookie

Protected routes (require auth):
- `/ticket-detail`
- `/booking/*`
- `/user/*`
- `/profile`
- `/transactions`
- `/payment-gateway/*`
- `/password-change`

---

## Logout

```typescript
import { logout } from "@/server-actions/logout";

// In a client component
<button onClick={() => logout()}>Sign Out</button>
```

The `logout()` server action:
1. Clears `Jwt` and `RefreshToken` cookies
2. Clears React Query cache
3. Redirects to home page (`/`)

---

## Setup Guide

### Minimum (email auth only)

No additional setup required — email + OTP login works out of the box with just the backend API configured:

```env
API_SERVER_URL=http://localhost:3000
API_SERVER_PREFIX=/api
```

### Enable Google OAuth

```env
NEXT_PUBLIC_IS_GOOGLE_AUTH_ENABLED=true
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-client-id>
```

### Enable Facebook OAuth

```env
NEXT_PUBLIC_IS_FACEBOOK_AUTH_ENABLED=true
NEXT_PUBLIC_FACEBOOK_APP_ID=<your-app-id>
```

### Enable reCAPTCHA (bot protection on auth forms)

```env
NEXT_PUBLIC_RECAPTCHA_V2_INVISIBLE_SITE_KEY=<your-site-key>
```

---

Previous: [Codebase Summary](codebase-summary.md)
Next: [Testing](testing.md)
