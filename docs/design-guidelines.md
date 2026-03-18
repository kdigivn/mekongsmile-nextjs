# Design Guidelines

> UI/UX design system and styling conventions for ferry-frontend.

**Last Updated:** 2026-03-03

## Table of Contents

- [1. Design System Stack](#1-design-system-stack)
- [2. Color Tokens](#2-color-tokens)
- [3. Typography](#3-typography)
- [4. Spacing System](#4-spacing-system)
- [5. Responsive Breakpoints](#5-responsive-breakpoints)
- [6. Component Variants with CVA](#6-component-variants-with-cva)
- [7. Class Merging](#7-class-merging)
- [8. Icons](#8-icons)
- [9. Animation](#9-animation)
- [10. Loading States](#10-loading-states)
- [11. Form Design Patterns](#11-form-design-patterns)
- [12. Dialog / Modal Patterns](#12-dialog--modal-patterns)
- [13. Card Design](#13-card-design)
- [14. Dark Mode](#14-dark-mode)
- [15. Toast Notifications](#15-toast-notifications)
- [16. Mobile Bottom Nav & Footer Pattern](#16-mobile-bottom-nav--footer-pattern)

## 1. Design System Stack

```
Radix UI Primitives        ← accessibility, keyboard nav, ARIA
    +
HeroUI (@heroui/react)     ← extended component library
    +
Tailwind CSS               ← utility-first styling
    +
class-variance-authority   ← component variant definitions
    =
src/components/ui/         ← project-level primitives
```

**Rule:** Always prefer components from `src/components/ui/` over raw HTML or direct Radix usage. Only reach for HeroUI directly when the primitive doesn't exist in `ui/`.

## 2. Color Tokens

Defined in `tailwind.config.ts` → `theme.extend.colors` and CSS custom properties.

### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#218721` (green, 9 shades) | CTAs, active states, brand |
| `success` | `#1d8719` | Success states, confirmation |
| `warning` | `#e89d06` | Warnings, pending states |
| `danger` | `#ff5630` | Errors, destructive actions |
| `info` | `#1b52e8` | Info messages, links |
| `default` | Gray scale 100–900 | Text, borders, backgrounds |

### Seat Status Colors (custom HSL vars)

| Variable | Purpose |
|----------|---------|
| `--color-seat-default` | Available seat |
| `--color-seat-booked` | Taken seat |
| `--color-seat-eco` | Economy class |
| `--color-seat-vip` | VIP class |
| `--color-seat-business` | Business class |
| `--color-seat-president` | President class |

### Theme Variants

| Theme | Trigger | Use case |
|-------|---------|---------|
| `light` | default | Standard branding |
| `condao-express-light` | org setting | Con Dao Express operator branding |

Apply theme class on `<html>` or root container. The `OrgProvider` handles this automatically.

### Usage in Code

```tsx
// Tailwind semantic class
<Button className="bg-primary text-white hover:bg-primary/90">Book Now</Button>

// Danger state
<span className="text-danger">Booking expired</span>

// Status-based dynamic color
<div className={cn(
  "rounded-full w-4 h-4",
  seatStatus === "booked" ? "bg-seat-booked" : "bg-seat-default"
)} />
```

## 3. Typography

### Font

- **Family:** Inter (variable font — loaded via `next/font/google`)
- **Weights:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Vietnamese support:** Full — Inter includes Latin Extended

### Scale (Tailwind defaults + custom)

| Class | Size | Usage |
|-------|------|-------|
| `text-xs` | 12px | Captions, metadata |
| `text-sm` | 14px | Secondary text, labels |
| `text-base` | 16px | Body text (default) |
| `text-lg` | 18px | Subheadings |
| `text-xl` | 20px | Section headings |
| `text-2xl` | 24px | Card headings |
| `text-3xl` | 30px | Page section headings |
| `text-4xl` | 36px | Hero subheadings |
| `text-5xl` | 48px | Hero headings |
| `text-6xl` | 60px | Display headings |

### Heading Hierarchy

```tsx
// Use semantic HTML — HeadingBase handles responsive sizing
import { HeadingBase } from "@/components/heading-base";

<HeadingBase level={1}>Ferry Ticket Booking</HeadingBase>
<HeadingBase level={2}>Available Voyages</HeadingBase>
```

**Rule:** Never skip heading levels for visual styling. Use CSS to restyle, not semantic shortcuts.

## 4. Spacing System

Tailwind's default spacing scale (4px base):

| Class | Value | Usage |
|-------|-------|-------|
| `p-1` / `m-1` | 4px | Tight internal padding |
| `p-2` / `m-2` | 8px | Component internal spacing |
| `p-3` / `m-3` | 12px | Small gaps |
| `p-4` / `m-4` | 16px | Standard component padding |
| `p-6` / `m-6` | 24px | Card/section padding |
| `p-8` / `m-8` | 32px | Large section padding |
| `p-12` / `m-12` | 48px | Page-level padding |

**Rule:** Prefer Tailwind spacing utilities over arbitrary values. If using arbitrary `[value]`, document why.

## 5. Responsive Breakpoints

Tailwind defaults (mobile-first):

| Breakpoint | Min-width | Usage |
|-----------|-----------|-------|
| (default) | 0px | Mobile layout |
| `sm:` | 640px | Small devices (large phones) |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Wide desktop |
| `2xl:` | 1536px | Ultra-wide |

**Container:** Max-width 1400px, centered, `px-8` padding.

```tsx
// Mobile-first responsive pattern
<div className="flex flex-col md:flex-row gap-4 md:gap-8">
  <aside className="w-full md:w-64">...</aside>
  <main className="flex-1">...</main>
</div>
```

### Mobile-Specific Components

- `<MobileBottomNav>` — visible only on mobile (`md:hidden`)
- `<ChooseSeatModal>` — drawer on mobile, modal on desktop
- `useCheckScreenType()` hook for conditional rendering logic

## 6. Component Variants with CVA

```tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  // Base classes
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary/90",
        outline: "border border-primary text-primary hover:bg-primary/10",
        ghost: "text-primary hover:bg-primary/10",
        destructive: "bg-danger text-white hover:bg-danger/90",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
```

## 7. Class Merging

Always use `cn()` from `@/lib/utils` (clsx + tailwind-merge) when combining class names:

```tsx
import { cn } from "@/lib/utils";

// Correct — merges properly, overrides win
<div className={cn("px-4 py-2 bg-primary", isActive && "bg-primary/80", className)} />

// Wrong — raw string concat causes conflicts
<div className={`px-4 py-2 bg-primary ${isActive ? "bg-primary/80" : ""} ${className}`} />
```

## 8. Icons

**Primary library:** `react-icons` (v5) — large icon set, tree-shakeable

```tsx
import { FiCalendar, FiUser, FiArrowRight } from "react-icons/fi";  // Feather
import { MdAirlineSeatFlat } from "react-icons/md";                 // Material
import { BiBoat } from "react-icons/bi";                            // BoxIcons

// Sizing via className
<FiCalendar className="w-5 h-5 text-primary" />
```

**Radix Icons:** Used within Radix UI components (ChevronDown, Cross2, etc.)

**Rule:** Prefer Feather icons (`react-icons/fi`) for UI actions, Material icons (`react-icons/md`) for domain concepts. Be consistent within a feature.

## 9. Animation

**Library:** Framer Motion (v11)

```tsx
import { motion, AnimatePresence } from "framer-motion";

// Fade in
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2 }}
>
  Content
</motion.div>

// Conditional animation
<AnimatePresence>
  {isVisible && (
    <motion.div
      key="panel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Panel content
    </motion.div>
  )}
</AnimatePresence>
```

**Tailwind animations** (configured):
- `animate-accordion-down` / `animate-accordion-up` — accordion transitions
- `animate-marquee` — scrolling ticker (promotional banners)

**Rule:** Keep animations subtle. Duration ≤ 300ms for UI feedback, ≤ 500ms for transitions. No animations on data tables or lists of items (performance).

## 10. Loading States

### Skeleton Loading

```tsx
// Use Skeleton from @/components/ui/skeleton
import { Skeleton } from "@/components/ui/skeleton";

function VoyageCardSkeleton() {
  return (
    <div className="p-4 border rounded-lg">
      <Skeleton className="h-6 w-48 mb-2" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

// In page — React Suspense boundary
<Suspense fallback={<VoyageCardSkeleton />}>
  <VoyageCard id={voyageId} />
</Suspense>
```

### Full Page Loading

```tsx
import { FullPageLoader } from "@/components/full-page-loader";

// Blocking overlay for payment processing
{isProcessingPayment && <FullPageLoader />}
```

### Button Loading State

```tsx
<Button disabled={isPending}>
  {isPending ? <Spinner className="w-4 h-4" /> : "Confirm Booking"}
</Button>
```

## 11. Form Design Patterns

### Input Fields

```tsx
// Always use form-elements wrappers
import { FormTextInput } from "@/components/form-elements/form-text-input";
import { FormSelect } from "@/components/form-elements/form-select";
import { FormDatePicker } from "@/components/form-elements/form-date-picker";

<FormTextInput
  label="Full Name"
  placeholder="Nguyen Van A"
  error={errors.name?.message}
  {...register("name")}
/>
```

### Form Layout

```tsx
// Standard form grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <FormTextInput label="First Name" {...register("firstName")} />
  <FormTextInput label="Last Name" {...register("lastName")} />
  <FormTextInput label="Email" type="email" {...register("email")} className="md:col-span-2" />
</div>
```

**Rules:**
- Label above input (not placeholder-only)
- Error message below input in `text-danger text-sm`
- Required fields marked with `*`
- Disabled state clearly visible (`opacity-60 cursor-not-allowed`)

## 12. Dialog / Modal Patterns

```tsx
// Standard dialog
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Confirm Cancellation</DialogTitle>
    </DialogHeader>
    <p>Are you sure you want to cancel this booking?</p>
    <div className="flex gap-3 justify-end mt-4">
      <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button variant="destructive" onClick={handleConfirm}>Yes, cancel</Button>
    </div>
  </DialogContent>
</Dialog>
```

**Drawer on mobile (vaul):**

```tsx
import { Drawer, DrawerContent } from "@/components/ui/drawer";

// Same pattern, swap Dialog → Drawer on mobile
const isMobile = useCheckScreenType();
const Component = isMobile ? Drawer : Dialog;
```

## 13. Card Design

```tsx
// Standard card
<div className="rounded-lg border bg-card p-4 shadow-sm hover:shadow-card-hover transition-shadow">
  <h3 className="font-semibold text-lg">Card Title</h3>
  <p className="text-muted-foreground text-sm mt-1">Description</p>
</div>
```

**Custom box shadows** (configured in Tailwind):
- `shadow-card-hover` — elevated card on hover

## 14. Dark Mode

Implemented via `next-themes` with Tailwind's class strategy:

```tsx
// In tailwind.config.ts
darkMode: "class"

// CSS custom properties for theming
.dark {
  --background: 224 71.4% 4.1%;
  --foreground: 210 20% 98%;
  ...
}
```

**Rule:** Use semantic Tailwind color classes that respect dark mode:
```tsx
// Good — respects dark mode via CSS vars
<div className="bg-background text-foreground border-border">

// Avoid — hardcoded colors don't adapt
<div className="bg-white text-gray-900">
```

## 15. Toast Notifications

```tsx
import { toast } from "sonner";

// Success
toast.success("Booking confirmed!");

// Error
toast.error("Payment failed. Please try again.");

// Loading + promise
toast.promise(submitBooking(data), {
  loading: "Processing your booking...",
  success: "Booking confirmed!",
  error: "Something went wrong.",
});
```

**Rule:** Use toast only for transient feedback (not errors that require user action). For critical errors, use inline error states.

## 16. Mobile Bottom Nav & Footer Pattern

### MobileBottomNav

Floating bottom navigation bar visible only on mobile (`md:hidden`). Manages visibility via context.

```
src/components/footer/footer-mobile-contact-buttons/
├── mobile-bottom-nav-context.ts       # MobileBottomNavContext + ActionsContext
├── mobile-bottom-nav-provider.tsx     # Provider managing nav, support form, voucher states
├── use-mobile-bottom-nav.ts           # useMobileBottomNav() — read { isNavVisible, isShowSupportForm, isShowVoucherForm }
├── use-mobile-bottom-nav-actions.ts   # useMobileBottomNavActions() — { toggleNavVisibility, hideNav, showNav, showForm, hideForm, showVoucher, hideVoucher }
└── footer-mobile-contact-buttons.tsx  # Renders floating contact buttons (Zalo, phone, support)
```

**Visibility control:** Components call `hideNav()` when opening full-screen modals (seat picker, payment) to avoid UI overlap. Restored via `showNav()` on close.

### Footer Responsive Layout

Footer menu columns use flex layout with `flex-wrap` on mobile for side-by-side display:

- **Desktop:** Multi-column grid layout
- **Mobile:** Columns display side-by-side (2 columns) with `flex-wrap`
- Footer hides on mobile when `MobileBottomNav` is visible to avoid double navigation

### Breakpoints Reference

| Breakpoint | Width | Usage |
|-----------|-------|-------|
| `sm` | 640px | Small mobile adjustments |
| `md` | 768px | MobileBottomNav hidden, desktop nav shown |
| `lg` | 1024px | Full desktop layout |
| `xl` | 1280px | Wide desktop |

---

Previous: [Code Standards](code-standards.md)
Next: [Codebase Summary](codebase-summary.md)
