---
name: review-pr
description: Review a pull request for Playwright test automation using project standards. Use when user asks to review a PR, check a pull request, or mentions a PR number.
allowed-tools: Bash(gh:*), Bash(git:*), Read, Grep, Glob
---

# Pull Request Review

## Process

### 1. Gather PR Information
```bash
# Get PR metadata
gh pr view <number> --json title,body,state,additions,deletions,changedFiles,baseRefName,headRefName

# Get full diff
gh pr diff <number>
```

### 2. Read modified files for context
Use Read tool to view complete files mentioned in the diff.

### 3. Review Checklist

#### Critical Issues (Block Merge)
- [ ] Build/compilation errors
- [ ] Module resolution issues (path aliases @/config/*, @/utils/*, etc.)
- [ ] Type errors
- [ ] Test failures

#### UI Test Standards

**Locators:**
- [ ] Use semantic selectors (`data-testid`, `getByRole`, `getByText`)
- [ ] Avoid fragile selectors (`nth()`, deep CSS)
- [ ] Locators are private in page objects

**Page Objects:**
- [ ] Methods expose business intent, not implementation
- [ ] `@step()` decorator on all public methods
- [ ] Explicit waits (no `page.waitForTimeout()`)
- [ ] Proper cleanup (`context.close()`)

**Assertions:**
- [ ] Descriptive error messages
- [ ] `expect.poll()` for async state changes
- [ ] Appropriate soft vs hard assertions

**Test Structure:**
- [ ] Arrange-Act-Assert pattern
- [ ] Hermetic tests (no cross-dependencies)
- [ ] Correct fixture usage (`userPages` vs `newUserPages`)
- [ ] Priority tags (`@P1`, `@P2`)

#### Code Quality

**Naming:**
- [ ] Test names describe scenario and outcome
- [ ] Verb-based method names
- [ ] Business-focused variable names

**Test Data:**
- [ ] No duplicate user credentials
- [ ] Unique data per parallel worker
- [ ] Proper cleanup

**Comments:**
- [ ] Flag unresolved TODO comments
- [ ] Vague comments clarified or removed

### 4. Output Format

```markdown
## PR Review: [Title] (#[Number])

### Summary
Brief description of changes.

**Changes**: +X / -Y across Z files

---

### 🔴 Critical Issues
Issues that block merge.

### ⚠️ Issues & Suggestions
| File | Line | Issue |
|------|------|-------|
| ... | ... | ... |

### 👍 Good Practices
Positive observations.

### 💡 Recommendations
Optional improvements.

### Verdict
- **Approved** / **Approved with suggestions** / **Changes Requested**

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### 5. Ask to Post Review
After generating review, ask if user wants to post it:
```bash
gh pr review <number> --comment --body "$(cat <<'EOF'
[review content]
EOF
)"
```

## Reference
See `.claude/testing-principles.md` for detailed testing standards.
