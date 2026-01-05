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

### 2. Check for Breaking Issues
- [ ] Build/compilation errors
- [ ] Module resolution issues (path aliases)
- [ ] Missing dependencies
- [ ] Type errors

### 3. UI Tests Checklist

**Locators:**
- [ ] Semantic and stable selectors (`data-testid`, `getByRole`)
- [ ] No fragile `nth()` or deep CSS hierarchies
- [ ] Locators are private in page objects

**Page Objects:**
- [ ] Methods expose business intent, not implementation details
- [ ] `@step()` decorator on all public methods
- [ ] Explicit wait conditions (no arbitrary timeouts)
- [ ] Proper cleanup in context.close()

**Assertions:**
- [ ] Descriptive error messages with context
- [ ] `expect.poll()` for async state changes
- [ ] Appropriate use of soft vs hard assertions

**Test Structure:**
- [ ] Arrange-Act-Assert pattern
- [ ] Hermetic tests (no cross-test dependencies)
- [ ] Proper fixture usage (`userPages` vs `newUserPages`)
- [ ] Priority tags (`@P1`, `@P2`)

### 4. Code Quality

**Naming:**
- [ ] Test names describe scenario and expected outcome
- [ ] Method names are verb-based and action-oriented
- [ ] Variables named for business concepts

**Test Data:**
- [ ] No duplicate credentials in users.json
- [ ] Unique test data per parallel worker
- [ ] Proper data cleanup

**Comments & TODOs:**
- [ ] Flag unresolved TODO comments
- [ ] Vague comments should be clarified or removed

### 5. Review Output Format

```markdown
## PR Review: [Title] (#[Number])

### Summary
Brief description of changes and their purpose.

**Changes**: +X / -Y across Z files

---

### Critical Issues (if any)
Issues that block merge.

### Issues & Suggestions
| File | Line | Issue |
|------|------|-------|
| ... | ... | ... |

### Good Practices
Positive observations about the code.

### Recommendations
Optional improvements for consideration.

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
