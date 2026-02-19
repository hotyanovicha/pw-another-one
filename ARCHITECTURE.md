# Architecture Overview

This project implements a multi-layered testing architecture to cleanly separate concerns between test execution, business logic orchestration, and low-level system interaction.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Test Specification                    │
│              (What should happen)                        │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│                   Step Classes                           │
│         (Orchestrate page/service interactions)          │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│              Page Objects / Services                     │
│           (How to interact with system)                  │
└──────────────────────────────────────────────────────────┘
```

## Layers Explained

### Tests Specification Layer
- Written in Playwright's native `test` block.
- **Goal:** Be explicit, readable, and focused on business intent.
- Do not mix raw Playwright locators or API fetching logic inside tests directly unless unavoidable.

### Step Classes Layer
- Contains business workflows using the `@step` reporting pattern.
- Combines interactions spanning multiple pages or multiple services.
- E.g., `AuthenticationSteps`, `CheckoutSteps`.

### Page Objects and API Services Layer
- **Page Objects:** Handle CSS/Role locators for UI components. Should return standard elements or custom component wrappers. Avoid deep CSS paths.
- **API Services:** Define low-level `GET`, `POST`, `PATCH` operations mapping to endpoints.

For more deep-dive design beliefs on this architecture, see `docs/design-docs/core-beliefs.md`.
