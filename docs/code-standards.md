# Code Standards

> Coding conventions and patterns for ferry-frontend. All contributors and AI agents must follow these.

**Last Updated:** 2026-03-19

## Table of Contents

- [1. File Naming](#1-file-naming)
- [2. Folder / Module Organization](#2-folder--module-organization)
- [3. Page Structure Pattern](#3-page-structure-pattern)
- [4. Component Structure](#4-component-structure)
- [5. TypeScript Conventions](#5-typescript-conventions)
- [6. React Query Patterns](#6-react-query-patterns)
- [7. Server Actions vs API Routes](#7-server-actions-vs-api-routes)
- [8. Form Patterns](#8-form-patterns)
- [9. Error Handling](#9-error-handling)
- [10. i18n Usage](#10-i18n-usage)
- [11. Import Order](#11-import-order)
- [12. Git Commit Conventions](#12-git-commit-conventions)
- [13. Code File Size](#13-code-file-size)
- [14. Comments](#14-comments)

## 1. File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Pages | `page.tsx` + `page-content.tsx` | `src/app/(language)/booking/[id]/page.tsx` |
| Components | PascalCase | `BookingForm.tsx`, `CardVoyage.tsx` |
| Hooks | camelCase, `use` prefix | `useBoolean.ts`, `useDebounce.ts` |
| Services | camelCase, descriptive | `useGetBookingDetailById.ts` |
| Utilities | kebab-case | `get-ticket-status.ts`, `build-api-path.ts` |
| Types/Interfaces | kebab-case or PascalCase | `booking.types.ts` |
| API endpoints | `endpoints.ts` per domain |  |
| Configs | kebab-case | `tailwind.config.ts`, `next.config.js` |

**Rule:** File names should be self-documenting — when read by Glob/Grep tools, purpose must be clear without opening the file.

## 2. Folder / Module Organization

```
src/
├── app/            # Routing only — pages, API routes, layouts
├── components/     # Reusable UI components (grouped by domain/type)
├── hooks/          # Generic utility hooks (not domain-specific)
├── lib/            # Pure utilities with no React dependency
├── services/       # Business logic, API hooks, contexts, providers
│   └── apis/       # One subfolder per domain (bookings, voyages, etc.)
├── views/          # Page-level view components (domain views)
└── server-actions/ # Next.js server actions (minimal, auth-related)
```

**Do not put:**
- Business logic in `components/` — use `services/` or `views/`
- UI components in `services/` — use `components/`
- Generic utilities in `hooks/` — use `lib/`

## 3. Page Structure Pattern

Every page uses a **two-file pattern**:

```tsx
// src/app/(language)/booking/[id]/page.tsx — Server Component
import { serverGetBookingById } from "@/services/apis/bookings";
import { BookingDetailContent } from "./page-content";

export default async function BookingDetailPage({ params }) {
  const booking = await serverGetBookingById(params.id);
  return <BookingDetailContent initialData={booking} />;
}
```

```tsx
// src/app/(language)/booking/[id]/page-content.tsx — Client Component
"use client";

export function BookingDetailContent({ initialData }) {
  const { data } = useGetBookingDetailById(id, { initialData });
  // interactive UI here
}
```

**Rules:**
- `page.tsx` — server component, handles metadata, initial data, auth check
- `page-content.tsx` — client component, all interactivity
- No `"use client"` in `page.tsx` unless the entire page is CSR

## 4. Component Structure

```tsx
// 1. Imports — ordered: React → 3rd party → internal → relative
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useBoolean } from "@/hooks/use-boolean";
import { PassengerCard } from "./passenger-card";

// 2. TypeScript types (interfaces preferred over type aliases for objects)
interface PassengerFormProps {
  passengerId: string;
  onSave: (data: PassengerData) => void;
  disabled?: boolean;
}

// 3. Component function — named export preferred
export function PassengerForm({ passengerId, onSave, disabled = false }: PassengerFormProps) {
  // 4. Hooks (React hooks first, then custom hooks, then queries)
  const [isEditing, setIsEditing] = useState(false);
  const isLoading = useBoolean(false);
  const { data: passenger } = useGetPassengerById(passengerId);

  // 5. Derived state & memos
  const fullName = `${passenger?.firstName} ${passenger?.lastName}`;

  // 6. Event handlers
  const handleSave = async (formData: PassengerData) => {
    isLoading.setTrue();
    await onSave(formData);
    isLoading.setFalse();
  };

  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

## 5. TypeScript Conventions

### Interfaces vs Types
```typescript
// Prefer interface for object shapes
interface BookingData {
  id: string;
  status: BookingStatus;
  passengers: Passenger[];
}

// Use type for unions, intersections, utilities
type BookingStatus = "pending" | "confirmed" | "cancelled";
type PartialBooking = Partial<BookingData>;
```

### Enums
```typescript
// Use enum for named constants
export enum ELanguages {
  Vietnamese = "vi",
  English = "en",
}

// Use const enum for perf-critical paths
export const enum SeatStatus {
  Available = "available",
  Booked = "booked",
}
```

### Path Aliases
```typescript
// Always use @/ alias for src/ imports (never relative ../../../)
import { cn } from "@/lib/utils";
import { useAuth } from "@/services/auth/use-auth";
import { Button } from "@/components/ui/button";

// Only use relative imports within the same feature folder
import { PassengerCard } from "./passenger-card";

// Utils submodules can be imported directly (better tree-shaking)
import { formatCurrency } from "@/lib/utils/format-utils";
import { calculateVoyageDuration } from "@/lib/utils/date-utils";
// OR use barrel export for convenience:
import { formatCurrency, calculateVoyageDuration } from "@/lib/utils";
```

### No `any`
```typescript
// Bad
function processData(data: any) { ... }

// Good
function processData(data: BookingData) { ... }
function processData<T>(data: T): T { ... }
```

### Generics
```typescript
// Use generics for reusable utilities
function wrapperFetchJsonResponse<T>(response: Response): Promise<T> { ... }

// Use constraints
function getFirstItem<T extends { id: string }>(items: T[]): T | undefined {
  return items[0];
}
```

## 6. React Query Patterns

### Query Key Factory
```typescript
// Always use createQueryKeys for type-safe keys
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const bookingKeys = createQueryKeys("bookings", {
  all: null,
  list: (params: BookingListParams) => ({ params }),
  detail: (id: string) => ({ id }),
});

// Usage
queryKey: bookingKeys.detail(bookingId)
```

### Service Hook Pattern
```typescript
// Every API operation = a custom hook
export function useGetBookingDetailById(id: string) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => fetcher<BookingDetail>(`/api/bookings/${id}`),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

// Mutations
export function useUpdatePassengerInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePassengerDto) =>
      fetcher("/api/passengers", { method: "PATCH", body: data }),
    onSuccess: (_, { bookingId }) => {
      queryClient.invalidateQueries(bookingKeys.detail(bookingId));
    },
  });
}
```

### Prefetching (SSR)
```typescript
// In page.tsx (server component)
const queryClient = new QueryClient();
await queryClient.prefetchQuery({
  queryKey: bookingKeys.detail(id),
  queryFn: () => serverGetBookingById(id),
});
return (
  <HydrationBoundary state={dehydrate(queryClient)}>
    <BookingDetailContent />
  </HydrationBoundary>
);
```

## 7. Server Actions vs API Routes

| Use Case | Approach |
|----------|----------|
| Read JWT/auth cookie | Server Action (`getJWT()`) |
| Logout (clear cookies) | Server Action (`logout()`) |
| Check auth status | Server Action (`check()`) |
| All other API calls | API Route (BFF) + React Query |
| Direct backend fetch | Server Action or Route Handler with JWT |

**Rule:** Keep server actions minimal — only for operations that strictly require server-side cookie access.

## 8. Form Patterns

```tsx
// Standard form pattern
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object({
  email: yup.string().email().required(),
  phone: yup.string().matches(/^[0-9]{10}$/).required(),
});

type FormData = yup.InferType<typeof schema>;

export function MyForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormTextInput
        {...register("email")}
        error={errors.email?.message}
        label="Email"
      />
    </form>
  );
}
```

**Rules:**
- Always use `@hookform/resolvers` with Yup schemas
- Use custom form input wrappers from `src/components/form-elements/`
- Never use uncontrolled inputs without react-hook-form
- Validate on submit + show inline errors
- **Do not depend on backend's request/response structure** — use `transformIn`/`transformOut` functions to convert between backend and frontend data shapes
- **Use `reset()` to set data for editing** — never use `setValue()` for initial data population, as it won't set default values and breaks `isDirty` state

## 9. Error Handling

```typescript
// API service error handling
async function fetchBooking(id: string): Promise<BookingDetail> {
  try {
    const res = await fetch(`/api/bookings/${id}`);
    return wrapperFetchJsonResponse<BookingDetail>(res);
  } catch (error) {
    // Log to Sentry
    captureException(error);
    throw error;
  }
}

// React Query error UI
const { data, error, isError } = useGetBookingDetailById(id);
if (isError) return <ErrorContent message={error.message} />;
```

**Rules:**
- Wrap all fetch calls in `wrapperFetchJsonResponse()`
- Use `<ErrorContent>` component for user-facing errors
- Never swallow errors silently
- Let Sentry handle unhandled exceptions at the boundary

## 10. i18n Usage

```typescript
// Client component
import { useTranslation } from "react-i18next";

function BookingCard() {
  const { t } = useTranslation("booking");
  return <h2>{t("status.confirmed")}</h2>;
}

// Server component
import { getServerTranslation } from "@/services/i18n/server";

async function SchedulePage({ params: { language } }) {
  const { t } = await getServerTranslation(language, "schedule");
  return <title>{t("page.title")}</title>;
}
```

**Rules:**
- Always specify namespace (second argument to `useTranslation`)
- Never hardcode display strings — always use `t()`
- Exception: developer-only logs, error codes

## 11. Import Order

ESLint enforces this order:
1. React and Next.js core (`react`, `next/*`)
2. Third-party libraries (alphabetical)
3. Internal services (`@/services/*`)
4. Internal components (`@/components/*`)
5. Internal utils/lib (`@/lib/*`, `@/hooks/*`)
6. Relative imports (`./`, `../`)
7. Type-only imports (`import type`)

```typescript
// Correct order
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useAuth } from "@/services/auth/use-auth";
import { useGetBookingDetailById } from "@/services/apis/bookings";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBoolean } from "@/hooks/use-boolean";
import { PassengerCard } from "./passenger-card";
import type { BookingDetail } from "@/services/apis/bookings/types";
```

## 12. Git Commit Conventions

Format: `type(scope): description`

```
feat(booking): add seat selection modal
fix(auth): handle token refresh race condition
refactor(payment): extract onepay service hook
style(ui): update button variants for condao theme
chore(deps): upgrade react-query to v5.80
docs: update auth flow documentation
test(e2e): add cypress test for OTP login
```

**Types:** `feat`, `fix`, `refactor`, `style`, `chore`, `docs`, `test`, `perf`

**Rules:**
- No AI references in commit messages
- Keep scope focused (one logical change per commit)
- Run `npm run lint` and `npm run format` before committing (enforced by Husky)

## 13. Code File Size

- **Max 200 lines per file** (per project rules)
- Split large components into sub-components
- Extract business logic into service hooks
- Extract utility functions into `lib/`
- Use composition over deep nesting

## 14. Comments

```typescript
// Good: Explains WHY, not what
// Refresh token before expiry to avoid mid-booking interruptions
if (tokenExpiresIn < 60_000) {
  await refreshToken();
}

// Bad: Restates what code does
// Increment counter by 1
count++;

// Use JSDoc for exported functions
/**
 * Calculates voyage duration in minutes.
 * Handles overnight voyages correctly (wraps past midnight).
 */
export function calculateVoyageDuration(departure: Date, arrival: Date): number {
  ...
}
```

---

Previous: [System Architecture](system-architecture.md)
Next: [Design Guidelines](design-guidelines.md)
