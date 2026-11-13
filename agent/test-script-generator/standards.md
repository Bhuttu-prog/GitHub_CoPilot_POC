# Automation standards

### Project layout

```
test-scripts/env/          .env, .env.example, staging.env
test-scripts/src/config/   environment configuration (env.ts)
test-scripts/src/pages/    page objects grouped by application area
test-scripts/src/components/ reusable fragments shared by several pages
test-scripts/src/fixtures/ test.ts extends Playwright test with page-object fixtures
test-scripts/src/data/     typed test data, with no secrets
test-scripts/src/utils/    pure helpers (parsing, maths)
test-scripts/scripts/<area>/ *.spec.ts files, one feature per file
test-scripts/package.json  npm run test:scripts runs the specs
test-case-generation/test-cases/ catalogs (source of truth for traceability)
```

Run npm commands from `test-scripts`.

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
- Set the catalog `automation.spec` to `scripts/<area>/<feature>.spec.ts`.

## Review checklist

- [ ] `npm run tc:validate` passes
- [ ] New locators follow the locator priority and are observed, not guessed
- [ ] Specs pass on chromium, firefox and webkit
- [ ] `npm run test:scripts` is the command that runs the specs
- [ ] `npm run quality` passes
