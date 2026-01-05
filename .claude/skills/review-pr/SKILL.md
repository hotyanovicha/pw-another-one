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

### 3. Review Checklist (Production Focus)

#### Critical Issues (Block Merge)
- [ ] Build/compilation errors or type issues
- [ ] Test failures or broken fixtures
- [ ] Logic errors in test scenarios
- [ ] Data integrity issues (duplicate users, race conditions)

#### Test Design & Business Logic
- [ ] **Test covers actual user scenarios** - not just happy paths
- [ ] **Business logic is correct** - verifies the right behavior
- [ ] **Test scope is appropriate** - not too broad or too narrow
- [ ] **Edge cases considered** - what could go wrong?
- [ ] **Assertions validate meaningful outcomes** - not just presence of elements

#### Test Stability & Reliability
- [ ] **Selectors are resilient** - won't break on UI changes (use role, text, semantic HTML where possible)
- [ ] **No race conditions** - proper waits for async operations
- [ ] **No hard-coded waits** - `page.waitForTimeout()` is a red flag
- [ ] **Parallel execution safe** - no shared state or dependencies
- [ ] **Data isolation** - each test has unique data, no conflicts
- [ ] **Flaky patterns avoided** - timing-dependent assertions, external dependencies
- [ ] **Idempotent for retries** - test can rerun without manual cleanup
- [ ] **Proper cleanup on failure** - no partial state left behind

#### Test Independence & Isolation
- [ ] **Tests can run in any order** - no implicit dependencies between tests
- [ ] **No shared mutable state** - each test creates its own data
- [ ] **Proper setup/teardown** - beforeEach/afterEach used correctly
- [ ] **No test pollution** - one test's failure doesn't cascade

#### Test Data Strategy
- [ ] **Data creation strategy is clear** - factories vs fixtures vs inline
- [ ] **Unique data per test/worker** - no conflicts in parallel
- [ ] **Cleanup strategy defined** - how is test data removed?
- [ ] **No hardcoded magic values** - data is meaningful and traceable

#### Code Quality & Architecture
**Naming Conventions:**
- [ ] **Variables/methods follow conventions** - camelCase, descriptive, no abbreviations
- [ ] **File names are consistent** - kebab-case, clear purpose
- [ ] **Test names are specific** - describe scenario and expected outcome
- [ ] **Constants are UPPER_CASE** - configuration values, magic numbers extracted

**Over-Engineering:**
- [ ] **No premature abstraction** - don't create utilities for single use
- [ ] **No unnecessary complexity** - KISS principle, straightforward solutions
- [ ] **No over-generic methods** - specific is better than flexible
- [ ] **No unused code** - dead code removed, imports cleaned up

**Method Optimization:**
- [ ] **Methods do one thing** - single responsibility
- [ ] **No duplicate logic** - DRY principle applied where it makes sense
- [ ] **Proper return types** - TypeScript types are explicit and useful
- [ ] **Async/await used correctly** - no unnecessary awaits, proper error handling

**Config Organization:**
- [ ] **Environment configs are clean** - no hardcoded URLs/credentials in code
- [ ] **Config structure makes sense** - easy to find and modify settings
- [ ] **Secrets are not committed** - .env files in .gitignore
- [ ] **Config is typed** - TypeScript interfaces for config objects

**Utils & Helpers:**
- [ ] **Utils are truly reusable** - used in multiple places, not premature
- [ ] **Utils have clear purpose** - not a dumping ground
- [ ] **Utils are well-documented** - JSDoc or clear naming
- [ ] **Utils are testable** - pure functions when possible

**Reporting & Debugging:**
- [ ] **`@step()` usage is meaningful** - steps tell a story in reports
- [ ] **Error messages are actionable** - include context, expected vs actual
- [ ] **Console logs are removed** - no debug statements left behind
- [ ] **Screenshots/videos will be useful** - failures capture enough context

#### Page Object Quality
- [ ] **Abstractions make sense** - methods represent user actions, not implementation
- [ ] **Not over-engineered** - simple, clear, maintainable
- [ ] **Proper error handling** - failures are debuggable with clear messages

#### CI/CD & Pipeline Considerations
- [ ] **Timeouts are reasonable** - won't fail in slow CI environments
- [ ] **Resource efficient** - not creating unnecessary browser contexts
- [ ] **Environment agnostic** - works in CI without local dependencies
- [ ] **Retry-friendly** - tests work with Playwright's retry mechanism
- [ ] **Parallelization ready** - consider worker count and resource limits

#### Test Maintainability (6-month test)
- [ ] **Easy to update** - when requirements change, is this easy to modify?
- [ ] **Tests behavior, not implementation** - UI changes shouldn't break logic tests
- [ ] **New team member readable** - can someone understand this without context?
- [ ] **Change impact is limited** - page object change doesn't break 50 tests

#### Test Coverage & Gaps
- [ ] **Negative scenarios covered** - what happens when things go wrong?
- [ ] **Boundary conditions tested** - min/max values, empty states
- [ ] **Error states handled** - network failures, validation errors
- [ ] **Coverage gaps identified** - what important scenarios are NOT tested?

#### Assertion Strategy
- [ ] **Asserting the right things** - meaningful business outcomes
- [ ] **Not over-asserting** - too many assertions = brittle tests
- [ ] **Not under-asserting** - weak tests that pass when they shouldn't
- [ ] **Soft vs hard assertions used correctly** - collect multiple failures vs fail fast

#### Security in Tests
- [ ] **No credentials in code** - use environment variables
- [ ] **Sensitive data not in screenshots** - mask or avoid capturing
- [ ] **API keys/tokens managed properly** - not committed, rotatable
- [ ] **Test users are isolated** - not using production accounts

#### Regression Risk Assessment
- [ ] **Shared fixture changes reviewed** - could break other tests
- [ ] **Page object modifications** - check downstream impact
- [ ] **Config changes** - verify no unintended side effects
- [ ] **New dependencies introduced** - npm packages reviewed

#### Git Hygiene
- [ ] **Commit messages are clear** - explain WHY, not just WHAT
- [ ] **PR title is descriptive** - explains the feature/fix clearly
- [ ] **Commits are logical** - each commit is a coherent unit of work
- [ ] **No "WIP", "test", "fix" commit messages** - be professional

### 4. Output Format

**Review Style - Senior AQA Mindset:**
- Direct, concise, production-focused
- **CRITICAL: Re-read ALL changed files before posting** - don't review stale code
- Only show sections with issues - skip sections that are fine
- At the end, list areas that are good in one line: "✅ Good: [area1], [area2], [area3]"
- For commits with issues, provide specific rewrite suggestions
- Think long-term: "Will this be maintainable in 6 months?"
- Challenge decisions: "Why this approach? Is it necessary?"
- Consider CI/CD: "Will this work reliably in pipeline?"
- Assess risk: "What could this break? What's not covered?"

```markdown
## PR Review: [Title] (#[Number])

**Changes**: +X / -Y across Z files

---

[ONLY INCLUDE SECTIONS WITH ISSUES - SKIP SECTIONS THAT ARE FINE]

### 🔴 Blockers
Critical issues that must be fixed.

### ⚠️ Issues
| File:Line | Issue | Suggestion |
|-----------|-------|------------|
| `file.ts:42` | Description | How to fix |

### 📝 Git Hygiene
**PR title:** `Current` → `Suggested improvement`

**Commits to improve:**
| Current | Suggested |
|---------|-----------|
| `bad commit msg` | `feat: clear description of change` |

---

✅ **Good:** [list areas with no issues, e.g., "test isolation, factory patterns, step decorator usage"]

**Verdict:** Approved / Changes requested

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### 5. Automatically Post Review
After generating the review, ALWAYS post it as a comment on the PR:
```bash
gh pr review <number> --comment --body "$(cat <<'EOF'
[review content]
EOF
)"
```

**Important:** Do not ask the user if they want to post - automatically post the review after completing the analysis.

## Reference
See `.claude/testing-principles.md` for detailed testing standards.
