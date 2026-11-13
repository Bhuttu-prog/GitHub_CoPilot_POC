# Using the skills

This repository automates UI tests for https://rahulshettyacademy.com. Three skills do that work, and they write to different folders.

| Skill | Purpose | Writes to |
|---|---|---|
| [test-case-generator](agent/test-case-generator/SKILL.md) | Design test cases from a page, user story, or acceptance criteria. Produces a schema-validated JSON catalog. Does not write Playwright code. | `test-case-generation/test-cases/<module>.json` |
| [test-script-generator](agent/test-script-generator/SKILL.md) | Turn an existing catalog into Playwright + TypeScript page objects and specs, then run them and publish a traceability report. Does not invent cases that are missing from the catalog. | `test-scripts/src/`, `test-scripts/scripts/` |
| [direct-test-automator](agent/direct-test-automator/SKILL.md) | Do both in one pass. Accepts a URL, page, user story, feature, screenshot, picture, or a mix of those, then writes the catalog and the Playwright scripts. | The catalog and `test-scripts/` |

Ask for test-case-generator when you want the cases only. Ask for test-script-generator when the catalog already exists and you want the scripts. Ask for direct-test-automator when you want runnable tests from a source without calling the other two yourself.

Agent instructions for this repository are in [agent/agent/AGENTS.md](agent/agent/AGENTS.md). There is no `AGENTS.md` at the repository root.

## What a good prompt includes

Give the skill the inputs it cannot guess well:

- The page URL.
- The behaviour you care about (user story or acceptance criteria). One rule per sentence is enough.
- A module code of 2–8 uppercase letters, such as `LOGIN` or `DROP`. The skill will propose one if you skip it.
- Which skill to use: catalog only, scripts only, or direct automation from a source. A screenshot can be attached with the prompt.

A short prompt still works. The skill explores the page and derives cases from what it observes. A prompt with acceptance criteria produces cases that match the rules you care about, instead of every control on the page.

## Prompt examples

### Test cases only (test-case-generator)

Weak:

```text
test the login page
```

Better:

```text
Use test-case-generator. Generate test cases only, not Playwright scripts.

URL: https://rahulshettyacademy.com/loginpagePractise/
Module: LOGIN
User story: A user signs in with a username and password. A valid user reaches the shop. An unknown user and a wrong password stay on the login page and see an error.

Cover the happy path, invalid credentials, empty fields, and the admin/user role switch.
Write the catalog to test-case-generation/test-cases/login.json and validate it.
```

### Test scripts only (test-script-generator)

Weak:

```text
automate the dropdown tests
```

Better:

```text
Use test-script-generator. Do not add new test cases.

Catalog: test-case-generation/test-cases/dropdowns.json
Automate every case in that catalog as Playwright page objects and specs.
Put specs in test-scripts/scripts/dropdowns/ and page objects in test-scripts/src/pages/dropdowns/.
Each spec title must start with its TC-DROP id.
Then run npm run test:scripts -- --grep "TC-DROP" --project=chromium from test-scripts.
```

### Direct automation (direct-test-automator)

Weak:

```text
automate this
```

Better, from a URL and a story:

```text
Use direct-test-automator.

URL: https://rahulshettyacademy.com/loginpagePractise/
Module: LOGIN
User story: A user signs in with a username and password. A valid user reaches the shop. An unknown user and a wrong password stay on the login page and see an error.

Design the catalog, automate it, and run the LOGIN specs on Chromium.
```

Better, from a picture:

```text
Use direct-test-automator.

I attached a screenshot of the checkout screen. Automate the flow it shows.
URL: https://rahulshettyacademy.com/seleniumPractise/#/cart
Module: GKART

Read the picture for the fields and buttons, confirm them on the live page, then write the catalog and the Playwright scripts.
```

### Cases and scripts as two steps (test-case-generator, then test-script-generator)

Weak:

```text
add tests for greenkart checkout
```

Better:

```text
Use test-case-generator, then test-script-generator.

URL: https://rahulshettyacademy.com/seleniumPractise/#/
Module: GKART
User story: A shopper searches for a vegetable, adds it to the cart, applies a promo code, and checks out.
Acceptance criteria:
- A matching search shows only products whose names contain the search text.
- A valid promo code applies its discount.
- An invalid promo code is rejected and the price stays unchanged.

First write test-case-generation/test-cases/greenkart.json and validate it.
Then automate that catalog under test-scripts and run the GKART specs on Chromium.
```

### Extend a catalog that already exists

```text
Use test-case-generator to extend test-case-generation/test-cases/practice.json.
Do not renumber existing TC ids.
URL: https://rahulshettyacademy.com/AutomationPractice/
Add boundary cases for the suggestion text box: empty input, a single character, and a value that matches no country.
Then use test-script-generator to automate only the new cases.
```

## What you get back

test-case-generator should finish with a table of case id, title, priority, type, technique, and automation status, plus the catalog path. Case ids look like `TC-LOGIN-001`. Requirements look like `REQ-LOGIN-01`.

direct-test-automator should finish with both of those: the catalog table and the spec paths, plus the same reports.

test-script-generator should finish with the spec paths, a pass/fail summary, and these reports:

- `test-scripts/reports/html/index.html`
- `test-scripts/reports/traceability.html`

## Run the scripts yourself

From `test-scripts`:

```bash
npm ci && npx playwright install --with-deps
cp env/.env.example env/.env
npm run test:scripts
```

| Purpose | Command |
|---|---|
| Explore a page before designing cases | `npm run tc:explore -- <url>` |
| Validate catalogs | `npm run tc:validate` |
| Run every spec | `npm run test:scripts` |
| Smoke or regression only | `npm run test:smoke` / `npm run test:regression` |
| One module | `npm run test:scripts -- --grep "TC-LOGIN" --project=chromium` |
| Traceability matrix | `npm run tc:coverage` |

Secrets stay in `test-scripts/env/.env`. Do not commit that file.
