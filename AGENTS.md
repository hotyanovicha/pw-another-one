# Agents Guide

Welcome, AI Agent (Claude, GitHub Copilot, etc.). This document outlines your core tenets when interacting with this repository.

## Framework Overview
This repository uses **Playwright** with **TypeScript** for test automation. The primary goal is to ensure high test reliability, excellent maintainability, and clean architecture.

## How to Operate Here
1. **Always read the context.** Before suggesting or writing code, review `ARCHITECTURE.md` to understand our pattern (POM + Steps + API).
2. **Follow RELIABILITY.md.** Flaky tests are the enemy. Do not use arbitrary timeouts (`waitForTimeout`). Always wait for states.
3. **Respect QUALITY_SCORE.md.** Ensure your code changes contribute to a high bar of test assertions and structure.
4. **Refer to `docs/design-docs/core-beliefs.md`.** All testing principles are recorded there. Make sure your solutions abide by them.
5. **No destructive actions.** If you must delete test cases, consult `docs/exec-plans/tech-debt-tracker.md` first, and ensure the action has explicit human approval.

## Agent Workflows
If you are asked to "create a test" or "add a feature", your workflow should be:
1. Identify the relevant Page Object and Step Class.
2. If UI is involved, build the necessary locators following the priority order in `core-beliefs.md`.
3. If API is involved, leverage the API Context and Services.
4. Write atomic, resilient assertions.
