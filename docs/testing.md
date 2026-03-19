# Testing

> Testing setup, tools, and E2E test commands for Mekong Smile Tours.

**Last Updated:** 2026-03-03

---

## Table of Contents

- [Overview](#overview)
- [E2E Testing with Cypress](#e2e-testing-with-cypress)
- [Running Tests](#running-tests)
- [Email Testing (OTP Flows)](#email-testing-otp-flows)
- [Test Structure](#test-structure)

---

## Overview

Mekong Smile Tours currently uses **Cypress** for end-to-end (E2E) testing only.

| Test Type | Tool | Status |
|-----------|------|--------|
| E2E | Cypress 13 | ✅ Configured |
| Unit | — | ❌ Not implemented |
| Component | — | ❌ Not implemented |
| Integration | — | ❌ Not implemented |

See [development-roadmap.md](development-roadmap.md) for planned unit testing work (Vitest + React Testing Library).

---

## E2E Testing with Cypress

**Config file:** `cypress.config.ts`

| Setting | Value |
|---------|-------|
| Base URL | `http://localhost:3000` (backend) |
| Viewport | 1200×800 |
| Default command timeout | 60 seconds |
| Spec location | `cypress/e2e/` |

---

## Running Tests

### Interactive Mode (development)

1. Start the app:

   ```bash
   npm run dev
   ```

2. Open Cypress Test Runner:

   ```bash
   npx cypress open
   ```

### Headless Mode (CI / automated)

1. Build and start the app:

   ```bash
   npm run build:cypress
   npm run start
   ```

2. Run tests headlessly:

   ```bash
   npx cypress run
   ```

---

## Email Testing (OTP Flows)

Cypress tests that cover OTP login/registration use a custom task to read emails via IMAP:

```typescript
// In a Cypress test
cy.task("mail:receive").then((email) => {
  const otp = extractOTP(email.text);
  cy.get("[data-testid=otp-input]").type(otp);
});
```

**Setup:** Configure IMAP credentials in `cypress/helpers/email.ts` for the test email inbox.

Required packages (already installed): `imap`, `mailparser`

---

## Test Structure

```
cypress/
├── e2e/              # Test spec files (.cy.ts)
├── fixtures/         # Static test data (JSON)
├── support/
│   ├── commands.ts   # Custom Cypress commands
│   └── e2e.ts        # Global setup / hooks
└── helpers/
    └── email.ts      # IMAP email retrieval helper
```

### Writing Tests

```typescript
// cypress/e2e/booking/tour-search.cy.ts
describe("Tour Search", () => {
  beforeEach(() => {
    cy.visit("/tours");
  });

  it("shows tour results for a valid search", () => {
    cy.get("[data-testid=destination-select]").click();
    cy.contains("Can Tho").click();
    cy.get("[data-testid=search-btn]").click();
    cy.get("[data-testid=tour-card]").should("have.length.greaterThan", 0);
  });
});
```

---

Previous: [Auth](auth.md)
Next: [Deployment Guide](deployment-guide.md)
