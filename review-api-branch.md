# Code Review: API Branch Changes

**Changes**: New API fixture setup with user creation via API, reorganized project structure

---

## 🔴 Blockers

### Missing Path Alias in tsconfig.json
`tsconfig.json` is missing the `@/ui/models/*` path alias. This will cause TypeScript to fail resolving imports from [registration-form.model.ts](src/ui/models/registration-form.model.ts).

**Fix:** Add to `tsconfig.json` paths:
```json
"@/ui/models/*": ["src/ui/models/*"]
```

---

## ⚠️ Issues

| File:Line | Issue | Suggestion |
|-----------|-------|------------|
| [registration-form.model.ts:3-22](src/ui/models/registration-form.model.ts#L3-L22) | `RegistrationFormData` type is exported but never used - function returns `{ [key: string]: string }` instead | Use the type: `export function createRegistrationFormData(person: Person): RegistrationFormData` |
| [api-index.ts:23](src/ui/api-fixtures/api-index.ts#L23) | Assertion in fixture (`expect(response.status()).toBe(200)`) - fixtures should setup, not assert | Throw descriptive error instead: `if (!response.ok()) throw new Error(\`Failed to create user: ${response.status()}\`)` |
| [api-fixture-check.spec.ts:3](tests/ui-updated/api-fixture-check.spec.ts#L3) | Test name doesn't follow `should [outcome] when [scenario]` pattern | Rename to: `'should be logged in when user created via API'` |
| [api-fixture-check.spec.ts:4](tests/ui-updated/api-fixture-check.spec.ts#L4) | Test duplicates fixture assertion - fixture already verifies login via `assertUserName` | Add meaningful test assertions or clarify this is a smoke test |
| [api-index.ts](src/ui/api-fixtures/api-index.ts) | File naming - `api-index.ts` is generic | Consider `api-user.fixture.ts` to match `.fixture.ts` convention |

---

## 👀 For Your Review

Design decisions that may be intentional - verify they fit your context:

- **No cleanup in fixture** at [api-index.ts:15-34](src/ui/api-fixtures/api-index.ts#L15-L34) - User created via API is not deleted after test. Intentional for debugging or missing cleanup?
- **Dynamic API base URL** at [api.constants.ts:1-4](src/ui/test-data/constants/api.constants.ts#L1-L4) - `getApiBaseUrl()` is evaluated at module load time. If `dotenv` loads after module import, `BASE_URL` might be undefined. Verify load order.

---

## 💡 Discussion Points

### Fixture vs Setup Approach
The `apiUserPage` fixture creates a new user for every test. Consider:
- **Option A (current):** Fresh user per test - good isolation, but slower and creates many accounts
- **Option B:** Use `{ scope: 'worker' }` - one user per worker, faster, need cleanup
- **Recommendation:** Current approach is fine for small test suites; consider worker scope for larger suites

### Model Location
`registration-form.model.ts` contains both a type and a factory function:
- **Option A:** Keep together (current) - simpler, model is cohesive
- **Option B:** Split - type to `src/ui/types/`, factory to `src/utils/`
- **Recommendation:** Current approach is fine since it's API-specific

---

## 📝 Project Structure Changes

### New Folders Created
| Folder | Purpose | Status |
|--------|---------|--------|
| `src/ui/api-fixtures/` | API-based test fixtures | ✅ Good location |
| `src/ui/models/` | Data models | ✅ Good location |
| `tests/ui-setup/` | Auth setup tests | ✅ Good - separates setup from tests |
| `tests/ui-updated/` | API-based tests | ⚠️ Name unclear - consider `tests/api/` or `tests/ui-api/` |

### Config Changes
| Change | Assessment |
|--------|------------|
| `WORKERS_COUNT` env var | ✅ Good - configurable workers |
| Removed `AUTH_USER_COUNT` export | ✅ Good - config via env is cleaner |
| New `chromium-api` project | ✅ Good - separates API tests |

---

## Summary

✅ **Good:** Factory pattern for form data, constants extraction, environment-based config, project separation, blockGoogleAds reuse

**Verdict:** Changes requested - fix tsconfig path alias before merge

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
