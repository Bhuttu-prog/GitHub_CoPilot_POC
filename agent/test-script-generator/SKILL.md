---
name: test-script-generator
description: Automates UI test case catalogs as Playwright + TypeScript Page Object Model scripts under test-scripts, with requirement traceability. Use when asked to generate, write or automate Playwright, web, functional, regression, smoke or end-to-end test scripts from test-case-generation catalogs, a URL, user story or feature. Reads catalogs produced by test-case-generator and does not redesign them.
---

# Test script generator

Turns catalogs in `test-case-generation/test-cases/` into Playwright scripts under `test-scripts`:

1. **Page objects** in `test-scripts/src/pages/<area>/`
2. **Specs** in `test-scripts/scripts/<area>/<feature>.spec.ts`
3. A **requirements traceability matrix** in `test-scripts/reports/traceability.html`

If a catalog does not exist yet, follow `agent/test-case-generator/SKILL.md` first. When the user wants the catalog and the scripts from a URL, story, feature, or picture in one request, follow `agent/direct-test-automator/SKILL.md`. Do not invent test cases in the spec that are missing from the catalog.

Repository rules are in `agent/agent/AGENTS.md`. Run every command from `test-scripts`.

## Workflow

```
- [ ] 1. Read the catalog
- [ ] 2. Automate
- [ ] 3. Run and triage
- [ ] 4. Publish traceability
```

### 1. Read the catalog

Use only cases in `test-case-generation/test-cases/<module>.json`. Keep the TC ID, title, tags and expected result. Only automate cases whose `automation.status` is `Automated` or `Candidate` and whose behaviour has been observed.

### 2. Automate

Follow [standards.md](standards.md) and the worked example in [examples.md](examples.md):

1. Reuse an existing page object if one exists. Otherwise create one in `test-scripts/src/pages/<area>/`, extending `RoutablePage` for URL-addressable pages or `BasePage` for in-app views.
2. Register new page objects as fixtures in `test-scripts/src/fixtures/test.ts`.
3. Put test data in `test-scripts/src/data/<area>.ts` and secrets in `test-scripts/env/.env` (read through `src/config/env.ts`).
4. Write specs in `test-scripts/scripts/<area>/<feature>.spec.ts`. The test title must begin with the TC ID, and tags must match the catalog.
5. Set `automation.status` to `Automated` and `automation.spec` to `scripts/<area>/<feature>.spec.ts`.

### 3. Run and triage

```bash
npm run test:scripts -- --grep "TC-<MODULE>" --project=chromium
```

`npm run test:scripts` runs every spec under `test-scripts/scripts`.

For each failure, decide which kind it is:

- **Test defect** (wrong locator, timing, data): fix the test. Never add `waitForTimeout` or `force: true`.
- **Product defect**: keep the assertion of the expected behaviour and add `test.fail()` with a `defect` annotation. Set `defectId` (`DEF-<MODULE>-NNN`) and `notes` in the catalog, and tag the test `@known-defect`.

Then run cross-browser: `npm run test:cross-browser`.

### 4. Publish traceability

```bash
npm run quality
npm run tc:coverage
```

`npm run quality` runs typecheck, lint, format, catalog validation and traceability. `npm run tc:coverage` writes `test-scripts/reports/traceability.html`, which links requirement → test case → spec → per-browser result.

## Output to the user

1. The spec paths written under `test-scripts/scripts`
2. Execution summary (passed, failed, known defects)
3. Report locations: `test-scripts/reports/html/index.html` and `test-scripts/reports/traceability.html`

## Additional resources

- [standards.md](standards.md): automation and locator standards
- [examples.md](examples.md): a catalog case taken through the page object and spec
- `agent/test-case-generator/standards.md`: catalog field rules
