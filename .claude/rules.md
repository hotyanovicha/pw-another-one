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
- Prefer semantic selectors: `data-testid`, `getByRole()`, `getByText()`
- Avoid fragile selectors: `nth()`, deep CSS hierarchies

### Tests
- Follow **Arrange-Act-Assert** pattern
- Use descriptive test names: `'Feature: Action and expected outcome'`
- Tag tests with priority: `{ tag: '@P1' }` or `{ tag: '@P2' }`
- Each test must be hermetic (no dependencies on other tests)

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
