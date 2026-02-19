# Reliability Guide

Test reliability is paramount. A single flaky test can erode trust in the entire framework. Treat test flakes as high-priority bugs.

## Core Reliability Rules

### No Hardcoded Timeouts
**Never** use `page.waitForTimeout()`.
- **Reason:** It inherently makes tests brittle across different environments and slows execution.
- **Alternative:** Wait for an explicit state: `toBeVisible()`, `waitForResponse()`, `waitForLoadState('networkidle')`.

### Resilient Locators
- Prefer user-visible locators: `getByRole`, `getByText`, or semantic attributes `data-testid`.
- Never use volatile paths like `div > span:nth-child(3)`. Layout changes should not break tests unless the functionality changed.

### Flakiness Mitigation via Retries
- Auto-retries should be limited to CI (e.g., 1 or 2 retries max) to surface actual application bugs.
- If a test flakes out and passes on retry, the test logic (or application) is bugged. File a ticket and add it to `docs/exec-plans/tech-debt-tracker.md`.

### API Polling over UI Waits
When waiting for a backend-heavy processing state appearing on the UI, prefer polling the API state directly rather than repeatedly refreshing or waiting long periods on a generic UI spinner.
