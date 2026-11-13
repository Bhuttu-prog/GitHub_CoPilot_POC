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

## Catalog location

Write each module to `test-case-generation/test-cases/<module>.json`. Set `$schema` to `../../agent/test-case-generator/test-case.schema.json`. Leave Playwright specs to test-script-generator. When a case is not yet automated, set `automation.status` to `Candidate` or `Manual` and do not set `automation.spec`.

## Review checklist

- [ ] `npm run tc:validate` passes from `test-scripts`
- [ ] Every requirement has at least one positive and one negative or boundary case
- [ ] Every `Candidate` or `Manual` case explains why in `notes`
- [ ] Titles state the observable outcome and do not start with Verify, Check, Test, Validate or Ensure
- [ ] Secrets in `testData` use `${ENV_VAR}` placeholders
