# PR Review Command

Review a pull request for this Playwright test automation project.

## Usage
```
/review-pr [PR_NUMBER]
```

## Review Process

### 1. Gather Information
- Fetch PR metadata: `gh pr view <number> --json title,body,state,additions,deletions,changedFiles`
- Get full diff: `gh pr diff <number>`
- Read modified files for full context
- Read the testing guide: `docs/PLAYWRIGHT_TESTING_GUIDE.md`

### 2. Check for Breaking Issues
- [ ] Build/compilation errors
- [ ] Module resolution issues (path aliases)
- [ ] Missing dependencies
- [ ] Type errors

### 3. Spec File Standards

**File Naming:**
- [ ] UI tests use `*.ui.spec.ts` or `*.e2e.spec.ts`
- [ ] API tests use `*.api.spec.ts`
- [ ] Contract tests use `*.contract.spec.ts`
- [ ] Visual tests use `*.visual.spec.ts`

**File Structure (in order):**
- [ ] Imports at top
- [ ] Test metadata (tags, links, ids)
- [ ] `test.describe()` blocks
- [ ] Shared setup via `test.beforeEach`/fixtures
- [ ] Tests ordered: happy path → edge cases → negative

**Requirements Traceability:**
- [ ] Test titles include requirement ID (`REQ-123`) OR
- [ ] Test titles include Jira link (`JIRA-456`) OR
- [ ] Test titles include API endpoint (`GET /orders/{id}`) OR
- [ ] Test IDs present (`#101`, `#102`)

**Tagging:**
- [ ] Tags present on describe or test level
- [ ] Appropriate tags used (`@smoke`, `@regression`, `@api`, `@ui`)
- [ ] Priority tags for test importance (`@P1`, `@P2`, `@P3`)
- [ ] `@flaky` tests have linked ticket
- [ ] `@readonly` for non-mutating API tests

**Test Isolation:**
- [ ] Hermetic tests (no cross-test dependencies)
- [ ] No shared mutable state between tests
- [ ] Parallel-safe or explicitly serial

**Fixture Usage:**
- [ ] Reusable setup extracted to fixtures (not repeated in tests)
- [ ] Page objects provided via fixtures (not instantiated in tests)
- [ ] API clients provided via fixtures with proper auth
- [ ] Composite fixtures for complex setup (e.g., `issueProduct` fixture)
- [ ] Cleanup handled in fixture teardown where needed

**Step Discipline:**
- [ ] Tests have 5-12 meaningful steps
- [ ] Steps follow Arrange/Act/Assert pattern
- [ ] Steps visible in reports (`test.step()` or `@step()` decorator)
- [ ] No micro-step noise (stepping every click)

### 4. UI Tests Checklist

**Locators:**
- [ ] Semantic selectors (`getByRole`, `getByLabel`, `getByTestId`)
- [ ] No fragile `nth()` or deep CSS hierarchies
- [ ] No XPath locators
- [ ] `{ exact: true }` used when needed
- [ ] Locators are private in page objects

**Page Objects:**
- [ ] Methods expose business intent, not implementation details
- [ ] `@step()` decorator on all public methods
- [ ] Extends `BasePage` with `uniqueElement`
- [ ] No business logic (only interactions)
- [ ] No navigation to other pages (except navigation pages)

**Synchronization:**
- [ ] No `waitForTimeout()` or arbitrary delays
- [ ] Built-in auto-waiting leveraged
- [ ] Explicit waits for specific conditions
- [ ] `waitForLoadState()` for page transitions

**Assertions:**
- [ ] Descriptive error messages with context
- [ ] `toBeVisible()` then `toContainText()` for clearer failures
- [ ] Appropriate use of soft vs hard assertions
- [ ] Screenshot/trace config enabled for failures

### 5. API Tests Checklist

**Service Layer:**
- [ ] `@step()` decorator on all public methods
- [ ] Fluent API pattern used correctly
- [ ] Authentication handled via fixtures (not repeated)
- [ ] Clear baseURL configuration

**Request Models:**
- [ ] Type definitions complete
- [ ] Default values provided
- [ ] Override mechanism works correctly

**Response Validation:**
- [ ] Zod schema validation present
- [ ] Status code checked
- [ ] Key business invariants validated
- [ ] Custom matchers used for common checks

**Data Strategy:**
- [ ] Create/cleanup pattern OR
- [ ] Isolated readonly dataset
- [ ] Request/response logged on failure (sanitized)

**Negative Tests:**
- [ ] Auth/permissions enforcement tested
- [ ] Validation error responses tested
- [ ] Not-found behavior tested

### 6. Improvement Opportunities (Learning Focus)

Look for patterns that work but could be better:

**Fixture Candidates:**
- Repeated setup code across tests → suggest fixture extraction
- Manual page object instantiation → suggest fixture injection
- Repeated API auth setup → suggest API client fixture
- Test data creation → suggest composite fixture (e.g., `issueProduct`)

**Playwright Features to Suggest:**
- Manual polling loops → `expect.poll()` or `expect.toPass()`
- Multiple awaits for same element → action chaining
- Hardcoded waits → auto-waiting or `waitForLoadState()`
- Raw locators in tests → page object extraction
- Repeated assertions → custom matchers

**Pattern Improvements:**
- Long test files → split by feature/endpoint
- Tests without steps → add `test.step()` for debugging
- Missing soft assertions → suggest for multiple checks
- No error context → add assertion messages

### 7. Code Quality

**Naming:**
- [ ] Test names describe scenario and expected outcome
- [ ] Method names are verb-based and action-oriented
- [ ] Variables named for business concepts

**Test Data:**
- [ ] No duplicate credentials
- [ ] Unique test data per parallel worker
- [ ] Proper data cleanup

**TypeScript:**
- [ ] Explicit types for parameters and returns
- [ ] No `any` type (use `unknown` if dynamic)
- [ ] `Partial<>` for optional overrides

**Comments & TODOs:**
- [ ] Flag unresolved TODO comments
- [ ] Vague comments clarified or removed

### 8. Review Output Format

```markdown
## PR Review: [Title] (#[Number])

### Summary
Brief description of changes and their purpose.

**Changes**: +X / -Y across Z files

---

### Spec File Standards
| Check | Status |
|-------|--------|
| File naming convention | ✅/❌ |
| Requirements traceability | ✅/❌ |
| Tagging (incl. priority) | ✅/❌ |
| Test isolation (hermetic) | ✅/❌ |
| Step discipline | ✅/❌ |

### Critical Issues (if any)
Issues that block merge.

### Issues & Suggestions
| File | Line | Issue | Severity |
|------|------|-------|----------|
| ... | ... | ... | High/Medium/Low |

### Good Practices
Positive observations about the code.

### Recommendations
Optional improvements for consideration.

### Learning Opportunities
Suggestions to improve Playwright skills (explain WHY, not just WHAT):
- Fixture opportunities: "This setup could be a fixture because..."
- Better patterns: "Consider using X instead of Y because..."
- Playwright features: "You could use `expect.poll()` here for..."

### Verdict
- **Approved** - Ready to merge
- **Approved with suggestions** - Can merge, consider improvements
- **Changes Requested** - Must address issues before merge
```

## Post Review
After generating the review, ask user if they want to post it to the PR:
```bash
gh pr review <number> --comment --body "<review_content>"
```
