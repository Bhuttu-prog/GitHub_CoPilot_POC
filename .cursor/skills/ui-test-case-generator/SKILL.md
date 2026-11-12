---
name: ui-test-case-generator
description: Designs standards-compliant UI test cases (ISTQB test design techniques, ISO/IEC/IEEE 29119-3 fields) as a schema-validated JSON catalog, then automates them as Playwright + TypeScript Page Object Model tests with full requirement traceability. Use when asked to create, design, generate, review or automate UI, web, functional, regression, smoke or end-to-end test cases, test scenarios or Playwright tests for a URL, page, user story, acceptance criteria or feature.
---

# UI Test Case Generator

Turns a URL, user story or acceptance criteria into:

1. A **test case catalog** in `test-cases/<module>.json`, validated against [test-case.schema.json](test-case.schema.json)
2. **Page objects** in `src/pages/<area>/` and **specs** in `tests/<area>/` following this framework
3. A **requirements traceability matrix** in `reports/traceability.html`

Works with any agent that can read files and run shell commands. No browser tooling is required, because `npm run tc:explore` captures the page.

## Inputs

Collect these before designing. Ask only for what is missing.

| Input | Example | Required |
|---|---|---|
| Target URL or page | `https://rahulshettyacademy.com/loginpagePractise/` | Yes |
| Requirements / user story / acceptance criteria | "Users sign in with valid credentials" | No (derive from observed behaviour) |
| Module code (2–8 uppercase letters) | `LOGIN` | Yes (propose one) |
| Scope | catalog only, or catalog plus automation | Default: both |

## Workflow

Copy this checklist and tick each step:

```
- [ ] 1. Explore the page
- [ ] 2. Define requirements
- [ ] 3. Design test cases
- [ ] 4. Write the catalog
- [ ] 5. Validate the catalog
- [ ] 6. Automate
- [ ] 7. Run and triage
- [ ] 8. Publish traceability
```

### 1. Explore the page

```bash
npm run tc:explore -- <url>
```

This prints the accessibility tree and every visible interactive element with a suggested Playwright locator, and saves them to `reports/exploration/<page>.json`. If browser tools are available, also walk the main flows by hand to observe dynamic behaviour (modals, validation messages, redirects, delays).

Only use locators and messages that you have observed. Never invent text, IDs or behaviour.

### 2. Define requirements

Write one `REQ-<MODULE>-NN` per testable rule. Take them from the acceptance criteria when given, otherwise from observed behaviour. Each requirement must be a single, verifiable statement.

### 3. Design test cases

Apply the techniques in [standards.md](standards.md#test-design-techniques). Minimum coverage for every requirement:

- 1 positive (happy path) case
- 1 negative case per invalid equivalence partition
- Boundary cases (min-1, min, max, max+1) for every ranged or length-limited input
- State-transition cases for modals, toggles, multi-step flows and role switches
- 1 end-to-end case per critical business journey, tagged `@e2e`

Where behaviour is ambiguous or looks like a defect, still write the case. Set `automation.status` to `Candidate` and explain the question in `notes`.

### 4. Write the catalog

Create or extend `test-cases/<module>.json`. Field rules are in [standards.md](standards.md#test-case-fields). The key rules:

- `id` is `TC-<MODULE>-NNN`. Never renumber or reuse an ID.
- `title` states the observable outcome, for example "Invalid password is rejected". Never start with Verify, Check, Test, Validate or Ensure.
- Secrets in `testData` use `${ENV_VAR}` placeholders.
- Each test case must be atomic and independent, with no ordering dependency on other cases.

### 5. Validate the catalog

```bash
npm run tc:validate
```

Fix every error and re-run until it reports `✔`. Do not continue to automation while validation fails.

### 6. Automate

Follow [standards.md](standards.md#automation-standards) and the worked example in [examples.md](examples.md):

1. Reuse an existing page object if one exists. Otherwise create one in `src/pages/<area>/`, extending `RoutablePage` for URL-addressable pages or `BasePage` for in-app views.
2. Register new page objects as fixtures in `src/fixtures/test.ts`.
3. Put test data in `src/data/<area>.ts` and secrets in `.env` (read through `src/config/env.ts`).
4. Write specs in `tests/<area>/<feature>.spec.ts`. The test title must begin with the TC ID, and tags must match the catalog.
5. Set `automation.status` to `Automated` and `automation.spec` to the spec path.

### 7. Run and triage

```bash
npx playwright test --grep "TC-<MODULE>" --project=chromium
```

For each failure, decide which kind it is:

- **Test defect** (wrong locator, timing, data): fix the test. Never add `waitForTimeout` or `force: true`.
- **Product defect**: keep the assertion of the *expected* behaviour and add `test.fail()` with a `defect` annotation. Set `defectId` (`DEF-<MODULE>-NNN`) and `notes` in the catalog, and tag the test `@known-defect`.

Then run cross-browser: `npm run test:cross-browser`.

### 8. Publish traceability

```bash
npm run quality
npm run tc:coverage
```

`npm run quality` runs typecheck, lint, format, catalog validation and traceability. `npm run tc:coverage` writes `reports/traceability.html`, which links requirement → test case → spec → per-browser result.

## Output to the user

Finish with:

1. A table of the new test cases: ID, title, priority, type, technique, automation status
2. Coverage per requirement, and any `Candidate` cases or defects with their open questions
3. Execution summary (passed, failed, known defects) and the report locations: `reports/html/index.html` and `reports/traceability.html`

## Additional resources

- [standards.md](standards.md): field definitions, priority and severity scales, test design techniques, automation and locator standards, review checklist
- [examples.md](examples.md): a user story taken end to end through the catalog, page object and spec
- [test-case.schema.json](test-case.schema.json): the JSON Schema enforced by `tc:validate`
