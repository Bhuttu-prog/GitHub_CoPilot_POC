---
name: test-case-generator
description: Designs standards-compliant UI test cases (ISTQB test design techniques, ISO/IEC/IEEE 29119-3 fields) as a schema-validated JSON catalog under test-case-generation/test-cases. Use when asked to create, design, generate or review UI, web, functional, regression, smoke or end-to-end test cases or test scenarios for a URL, page, user story, acceptance criteria or feature. Does not write Playwright scripts; that is test-script-generator.
---

# Test case generator

Turns a URL, user story or acceptance criteria into a **test case catalog** at `test-case-generation/test-cases/<module>.json`, validated against [test-case.schema.json](test-case.schema.json).

Do not create page objects or Playwright specs. When the user also wants automation, finish this skill and then follow `agent/test-script-generator/SKILL.md`. When the user wants both from a URL, story, feature, or picture in one request, follow `agent/direct-test-automator/SKILL.md` instead of this skill alone.

Repository rules are in `agent/agent/AGENTS.md`. Works with any agent that can read files and run shell commands. No browser tooling is required, because `npm run tc:explore` captures the page. Run every command from `test-scripts`.

## Inputs

Collect these before designing. Ask only for what is missing.

| Input | Example | Required |
|---|---|---|
| Target URL or page | `https://rahulshettyacademy.com/loginpagePractise/` | Yes |
| Requirements / user story / acceptance criteria | "Users sign in with valid credentials" | No (derive from observed behaviour) |
| Module code (2–8 uppercase letters) | `LOGIN` | Yes (propose one) |

## Workflow

```
- [ ] 1. Explore the page
- [ ] 2. Define requirements
- [ ] 3. Design test cases
- [ ] 4. Write the catalog
- [ ] 5. Validate the catalog
```

### 1. Explore the page

```bash
npm run tc:explore -- <url>
```

This prints the accessibility tree and every visible interactive element with a suggested Playwright locator, and saves them to `test-scripts/reports/exploration/<page>.json`. If browser tools are available, also walk the main flows by hand to observe dynamic behaviour (modals, validation messages, redirects, delays).

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

Create or extend `test-case-generation/test-cases/<module>.json`. Field rules are in [standards.md](standards.md#test-case-fields). The key rules:

- `id` is `TC-<MODULE>-NNN`. Never renumber or reuse an ID.
- `title` states the observable outcome, for example "Invalid password is rejected". Never start with Verify, Check, Test, Validate or Ensure.
- Secrets in `testData` use `${ENV_VAR}` placeholders.
- Each test case must be atomic and independent, with no ordering dependency on other cases.
- `$schema` is `../../agent/test-case-generator/test-case.schema.json`.
- Do not set `automation.spec`. test-script-generator sets that when it writes the spec.

### 5. Validate the catalog

```bash
npm run tc:validate
```

Fix every error and re-run until it reports `✔`.

## Output to the user

1. A table of the new test cases: ID, title, priority, type, technique, automation status
2. Coverage per requirement, and any `Candidate` cases with their open questions
3. The catalog path: `test-case-generation/test-cases/<module>.json`

## Additional resources

- [standards.md](standards.md): field definitions, priority and severity scales, test design techniques
- [test-case.schema.json](test-case.schema.json): the JSON Schema enforced by `tc:validate`
- `agent/test-script-generator/examples.md`: a catalog taken through to a Playwright spec
