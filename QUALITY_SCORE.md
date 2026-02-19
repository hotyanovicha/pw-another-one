# Quality Score and Metrics

This document defines how we measure and track the quality of our test suite.

## The Quality Score Matrix

A healthy automation project maintains a high Quality Score. Check the following attributes:

| Metric | Target | Failure Impact |
|--------|--------|----------------|
| **Pass Rate** | > 99% | Unstable builds, lost developer trust |
| **Flakiness** | < 1% | Inconsistent CI, manual re-runs |
| **Execution Time** | < 10 mins (parallel) | Slow feedback loop |
| **LOC per Test** | < 50 lines | Unreadable tests, difficult maintenance |

## Keeping the Score High
1. **Write Independent Tests:** Tests must not rely on the outcome or state of a previous test.
2. **Data Isolation:** Each test should provision and clean up its own data via API if possible.
3. **Atomic Assertions:** Use explicit `expect` blocks with clear error messages.
4. **Use Soft Assertions (`expect.soft`) Wisely:** For checking multiple independent states on a single page, but use hard assertions for blocking navigation logic.

When issues are found that lower this score, they should be immediately recorded in `docs/exec-plans/tech-debt-tracker.md`.
