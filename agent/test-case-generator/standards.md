# Standards

## Test case fields

Fields follow ISO/IEC/IEEE 29119-3 test case specification.

| Field | Rule |
|---|---|
| `id` | `TC-<MODULE>-NNN`, unique across all catalogs, never reused |
| `title` | 15–110 chars, outcome-focused, present tense, no "Verify/Check/Test/Validate/Ensure" prefix |
| `requirementIds` | At least one `REQ-<MODULE>-NN` defined in the same catalog |
| `priority` | Business urgency of execution (scale below) |
| `severity` | Impact if this case fails (scale below) |
| `type` | Functional, Negative, Boundary, UI, Accessibility, Security, End-to-End |
| `technique` | The design technique that produced the case |
| `tags` | Must include `@smoke` or `@regression`, plus the module tag (`@login`) and `@e2e` / `@known-defect` when they apply |
| `preconditions` | System state before step 1, not steps themselves |
| `testData` | Concrete values; secrets as `${ENV_VAR}` |
| `steps` | One user action per step; add `expected` only for intermediate checkpoints |
| `expectedResult` | The single observable outcome that decides pass or fail |
| `defectId` | `DEF-<MODULE>-NNN` when the case exposes a known product defect |
| `automation.status` | `Automated` (has a spec), `Candidate` (automatable, awaiting clarification), `Manual` (not cost-effective or unstable to automate) |

### Priority

| Level | Meaning | Run in |
|---|---|---|
| P1 | Core revenue or access journey; release blocker | Every commit (`@smoke`) |
| P2 | Important feature or common negative path | Every build (`@regression`) |
| P3 | Secondary feature, UI detail | Nightly regression |
| P4 | Rare path or cosmetic | Release regression |

### Severity

| Level | Meaning |
|---|---|
| Critical | User cannot complete a core journey, or data/security is compromised |
| Major | Feature misbehaves and has no reasonable workaround |
| Minor | Feature misbehaves and has a workaround, or the impact is limited |
| Trivial | Cosmetic issue only |

## Test design techniques

ISTQB Foundation Level black-box techniques:

| Technique | Apply when | Produces |
|---|---|---|
| Equivalence Partitioning | Inputs fall into valid and invalid classes | One case per class (valid user, invalid password, unknown user) |
| Boundary Value Analysis | Numeric, length or date ranges | min-1, min, max, max+1 (empty fields, quantity 0/1) |
| Decision Table | Outcome depends on combined conditions | One case per rule column (terms ✓/✗ × country set/empty) |
| State Transition | Modals, toggles, wizards, cart states, roles | Valid transitions and at least one invalid transition |
| Use Case | Business journeys across pages | End-to-end happy path per journey |
| Error Guessing | Known risk areas (retired passwords, double submit, whitespace) | Targeted negative cases |
| Checklist | Static UI, content, accessibility, security attributes | One case per checklist item |

## Automation standards

### Project layout

```
src/config/      environment configuration (env.ts)
src/pages/       page objects grouped by application area
src/components/  reusable fragments shared by several pages (headers, modals)
src/fixtures/    test.ts extends Playwright test with page-object fixtures
src/data/        typed test data, with no secrets
src/utils/       pure helpers (parsing, maths)
tests/<area>/    *.spec.ts files, one feature per file
test-cases/      test case catalogs (source of truth for traceability)
```

### Page objects

- One class per page or in-app view. Extend `RoutablePage` when the page has its own URL (define `path`), and `BasePage` otherwise.
- Declare locators as `readonly` fields assigned in the constructor. Expose parameterised locators as methods, for example `productCard(name)`.
- Methods describe user intent (`loginAs`, `addToCart`, `applyPromoCode`) and return data or `void`.
- Keep assertions out of page objects. Specs assert, and pages act and expose state.
- Do not use hard waits. Rely on Playwright auto-waiting, and use `locator.waitFor` only to synchronise on an app event.

### Locator priority

1. `getByRole(role, { name })`
2. `getByLabel(text)`
3. `getByPlaceholder(text)`
4. `getByText(text)` for non-interactive content
5. `getByTestId(id)` (attribute `data-testid`)
6. Stable `#id` or attribute CSS. Use this only when the accessible name is missing or changes at runtime.
7. Never use XPath, `nth-child` on layout containers, or generated class names.

### Specs

- Import `test` and `expect` from `@fixtures/test`, never from `@playwright/test`.
- Title: `TC-<MODULE>-NNN <catalog title>`. Data-driven cases may append the data variant.
- Tags in the details object match the catalog: `{ tag: ['@smoke', '@regression'] }`.
- Use an Arrange-Act-Assert layout separated by blank lines. Wrap multi-stage journeys in `test.step`.
- Use web-first assertions (`await expect(locator).toHaveText(...)`). Never assert on a value that was read once and could go stale.
- Tests must be independent: no shared state, and each test runs in any order and in parallel.
- Known product defects: `test.fail()`, plus `annotation: { type: 'defect', description: 'DEF-... summary' }`, plus the `@known-defect` tag.
- Never use `test.only`, `waitForTimeout`, `force: true`, or commented-out code.

## Review checklist

- [ ] `npm run tc:validate` passes
- [ ] Every requirement has at least one positive and one negative or boundary case
- [ ] Every `Candidate` or `Manual` case explains why in `notes`
- [ ] New locators follow the locator priority and are observed, not guessed
- [ ] Specs pass on chromium, firefox and webkit
- [ ] `npm run quality` passes
