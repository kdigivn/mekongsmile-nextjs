# Phase 9: Booking Engine

## Context Links
- [Plan Overview](./plan.md)
- [Current Booking Service](/Users/khoilq/Documents/DeveloperZone/mekongsmile/src/services/apis/bookings/bookings.service.ts)
- [Current Payment Service](/Users/khoilq/Documents/DeveloperZone/mekongsmile/src/services/apis/payments/payments.service.ts)

## Overview
- **Priority:** P3 (future phase)
- **Status:** pending (blocked on custom backend implementation)
- **Effort:** 8h (frontend only; backend design separate)
- **Description:** Design and outline the custom booking engine. WordPress handles content (tours); custom backend handles availability, cart, checkout, payment, orders. This phase is an architectural outline -- full implementation depends on backend API readiness.

## Key Insights
- **Hybrid architecture decision confirmed:** WP = content CMS, custom backend = booking engine
- Existing ferry booking flow has reusable patterns: cart, checkout, payment gateway integration, order confirmation
- Tour booking is simpler than ferry (no seat selection, no multi-leg routes, no boat layouts)
- Payment integration: evaluate OnePay (existing) or new gateway for international tourists (Stripe?)
- YITH Booking plugin on WP side may provide availability data via WooGraphQL -- investigate

## Architecture (High-Level)

```
Next.js Frontend
  |
  |-- Tour Detail Page (WPGraphQL) --> "Book Now" CTA
  |
  |-- /booking/[tourSlug]/ --> Booking Form (date, guests, contact)
  |       |
  |       v
  |-- Custom Backend API
  |       POST /api/bookings/check-availability
  |       POST /api/bookings/create
  |       POST /api/payments/initiate
  |       GET  /api/bookings/:id
  |       GET  /api/user/bookings
  |
  |-- /booking/confirmation/[id] --> Order confirmation
  |-- /payment/result --> Payment callback
```

### Data Flow
1. User browses tour detail (data from WP)
2. Clicks "Book Now" -> goes to `/booking/[tourSlug]/`
3. Selects date, number of guests, fills contact info
4. Frontend calls custom backend: check availability -> create booking -> initiate payment
5. Redirect to payment gateway (or inline payment form)
6. Payment callback -> confirmation page

## Requirements

### Functional (Frontend)
- Booking form: date picker, guest count (adults/children), contact info
- Availability check before booking submission
- Cart/order summary before payment
- Payment gateway redirect flow
- Order confirmation page
- User booking history (`/user/bookings`)

### Functional (Backend API -- to be designed)
- `POST /bookings/check-availability` -- { tourId, date, guests }
- `POST /bookings/create` -- { tourId, date, guests, contact, paymentMethod }
- `POST /payments/initiate` -- { bookingId, method }
- `GET /bookings/:id` -- order details
- `GET /user/bookings` -- authenticated user's bookings
- Webhook: payment confirmation callback

### Non-Functional
- Booking form works without auth (guest checkout) + with auth
- Payment data never stored in frontend (PCI compliance)

## Related Code Files

### Reuse patterns from
- `src/services/apis/bookings/bookings.service.ts` -- API call patterns
- `src/services/apis/payments/payments.service.ts` -- payment flow patterns
- `src/services/apis/common/server-query-fetcher.ts` -- fetch wrapper
- `src/app/(language)/booking/[id]/page.tsx` -- booking page layout pattern
- `src/app/(language)/payment-gateway/` -- payment result pages pattern

### Create (when backend ready)
- `src/services/apis/tour-bookings/booking-service.ts`
- `src/services/apis/tour-bookings/types/booking.ts`
- `src/services/apis/tour-payments/payment-service.ts`
- `src/app/(language)/booking/[tourSlug]/page.tsx`
- `src/app/(language)/booking/confirmation/[id]/page.tsx`
- `src/app/(language)/payment/result/page.tsx`
- `src/views/booking/booking-form-view.tsx`
- `src/views/booking/order-summary-view.tsx`
- `src/views/booking/confirmation-view.tsx`

## Implementation Steps (Outline)

### 1. Backend API Design
- Define REST endpoints and data models
- Decide: build from scratch or adapt existing ferry backend?
- Database: tour availability calendar, bookings table, payments table

### 2. "Book Now" CTA on Tour Detail
- Add prominent booking button on `/tour/[slug]/` page
- Link to `/booking/[tourSlug]/` with tour data pre-loaded

### 3. Booking Form Page
- Date picker (calendar component from shadcn/ui)
- Guest count selector (adults, children)
- Contact info form (name, email, phone, nationality)
- Price calculation (priceInUsd * guests)
- "Proceed to Payment" button

### 4. Availability Check
- On date selection, call backend to verify availability
- Show available/unavailable state
- Disable booking if unavailable

### 5. Payment Integration
- Support at minimum: bank transfer (offline) + online payment
- Reuse OnePay pattern if applicable, or integrate Stripe for international
- Payment result page handles callback

### 6. Order Confirmation
- Display booking details, payment status
- Send confirmation email (backend responsibility)
- Link to user booking history

## Todo List
- [ ] Design backend API contract (endpoints, request/response shapes)
- [ ] Decide payment gateway (OnePay, Stripe, or both)
- [ ] Investigate YITH Booking availability data via WooGraphQL
- [ ] Add "Book Now" CTA to tour detail page
- [ ] Create booking form page
- [ ] Create order summary component
- [ ] Implement availability check
- [ ] Implement payment flow
- [ ] Create confirmation page
- [ ] Create user booking history page
- [ ] End-to-end test: browse -> book -> pay -> confirm

## Success Criteria
- User can book a tour with date and guest selection
- Payment flow completes (at least offline/bank transfer)
- Booking confirmation displays correctly
- User can view booking history when authenticated

## Risk Assessment
- **Backend not ready** -- this is the biggest blocker. Frontend can be built with mock API, but real integration requires backend.
- **Payment gateway compliance** -- PCI requirements for online payments. Use hosted payment page (redirect) to avoid handling card data.
- **YITH Booking data access** -- may need custom WP REST endpoint or WooGraphQL extension to expose availability calendar

## Security Considerations
- Never store payment card data in frontend or custom backend (use payment gateway's hosted page)
- Booking creation requires CSRF protection
- Rate-limit availability checks to prevent abuse
- Validate all booking inputs server-side

## Next Steps
-> Phase 10: i18n (independent)
-> Phase 11: Cleanup & Polish (final)
