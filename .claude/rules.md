# Project Rules - Playwright Test Automation

## Project Context
- **Framework**: Playwright with TypeScript
- **Pattern**: Page Object Model with Step decorators
- **Fixtures**: Custom fixtures in `src/ui/fixtures/`
- **Test Data**: JSON files in `src/ui/test-data/`

## Code Standards

### Page Objects
- Locators must be **private** and return `Locator` objects
- Use `@step()` decorator on all public methods
- Prefer semantic selectors: `getByRole()`, `getByText()`, semantic HTML
- **Do NOT suggest `data-testid`** - developers won't add them to this project
- Work with existing DOM structure - use role-based and text-based selectors
- Avoid fragile selectors: `nth()` without context, deep CSS hierarchies

### Tests
- Follow **Arrange-Act-Assert** pattern
- Use descriptive test names: `'Feature: Action and expected outcome'`
- Tag tests with priority: `{ tag: '@P1' }` or `{ tag: '@P2' }`
- Each test must be hermetic (no dependencies on other tests)

### TypeScript
- Let TypeScript infer Promise types - explicit `Promise<T>` only needed for custom return types

### Assertions
- Use `expect.poll()` for async state changes with clear error messages
- Prefer hard assertions for critical checks, soft assertions for multiple validations
- Always include meaningful assertion messages

### Fixtures
- Pre-authenticated users: `userPages` (uses `.auth/user-{index}.json`)
- Fresh user registration: `newUserPages` (creates new user per test)
- Page manager: `pages` (unauthenticated)

## Path Aliases
```
@/config/*    -> src/config/*
@/utils/*     -> src/utils/*
@/ui/pages/*  -> src/ui/pages/*
@/ui/fixtures/* -> src/ui/fixtures/*
```

## File Structure
```
src/
├── config/           # Configuration (auth, env)
├── ui/
│   ├── fixtures/     # Playwright fixtures
│   ├── pages/        # Page objects
│   └── test-data/    # JSON test data
├── utils/            # Helpers, factories
tests/
├── auth.setup.ts     # Authentication setup
└── ui/               # UI test specs
```

## Claude Code Behavior

### Learning Mode
- **NEVER automatically fix test code** unless explicitly asked
- User is learning Playwright and wants to fix issues themselves
- When reviewing or analyzing tests:
  - Identify and explain issues clearly
  - Provide examples of correct patterns
  - Explain WHY something is wrong
  - Show the correct approach
  - **DO NOT** implement the fix unless user explicitly requests it

### When to Fix vs. Explain
- ✅ **Always explain:** Identify issues, explain concepts, show examples
- ❌ **Never auto-fix:** Test implementations, test structure, test logic
- ✅ **OK to suggest:** Code improvements, best practices, patterns
- ✅ **Only fix when asked:** "Fix this", "Implement the solution", "Apply the changes"

### PR Review Focus Areas
When reviewing PRs, provide production-level feedback on:
- **Test Design & Business Logic** - Does it test the right scenarios?
- **Test Stability** - Potential flakiness, race conditions, parallel safety
- **Naming Conventions** - Variables, methods, files, constants
- **Over-Engineering** - Premature abstractions, unnecessary complexity
- **Method Optimization** - Single responsibility, DRY, proper types
- **Config Organization** - Environment setup, secrets, structure
- **Utils & Helpers** - Reusability, documentation, purpose, testability
- **Reporting Quality** - `@step()` usage, error messages, debug artifacts
- **Git Hygiene** - PR titles, commit messages, logical commits
