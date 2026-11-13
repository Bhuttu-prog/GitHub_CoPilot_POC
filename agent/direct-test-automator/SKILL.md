---
name: direct-test-automator
description: Directly automates UI tests from whatever the user provides — a URL, page, user story, feature, acceptance criteria, screenshot, picture, or a mix of those. Designs the test-case catalog and writes the Playwright scripts in one pass. Use when the user wants runnable tests from a source and does not ask for the catalog only or for scripts from an existing catalog. Follows test-case-generator for the catalog and test-script-generator for the scripts.
---

# Direct test automator

Takes a URL, page, user story, feature, screenshot, picture, or any mix of those and produces both:

1. A catalog at `test-case-generation/test-cases/<module>.json`
2. Playwright page objects and specs under `test-scripts`

Do not stop after the catalog. Do not write a spec for a case that is not in the catalog.

Design rules live in `agent/test-case-generator/SKILL.md` and `agent/test-case-generator/standards.md`. Automation rules live in `agent/test-script-generator/SKILL.md` and `agent/test-script-generator/standards.md`. This skill only decides how to read the source and then runs those two workflows back to back.

Repository rules are in `agent/agent/AGENTS.md`. Run every command from `test-scripts`.

## Inputs

Use what the user already gave. Ask only for a URL when nothing points at a page you can open.

| Source | How to use it |
|---|---|
| URL | Open it with `npm run tc:explore -- <url>` |
| Page name | Map it to a URL on https://rahulshettyacademy.com when the name is unambiguous. Otherwise ask for the URL |
| User story, feature, or acceptance criteria | Turn each testable rule into a requirement. Still explore the live page before writing locators |
| Screenshot or picture | Read the image. Record the visible labels, controls, and the flow it shows. Explore the URL when one is given |
| Existing notes or a file | Read the file and treat its rules as acceptance criteria |
| Several of the above | Use all of them. The live page decides locators. The story and the picture decide which flows matter |

A picture alone is not a site. If the user attaches a picture and no URL, ask for the URL before writing scripts. If the picture and the live page disagree, automate the live page and record the difference in `notes`.

Propose a module code of 2–8 uppercase letters when the user does not give one.

## Workflow

```
- [ ] 1. Read every source
- [ ] 2. Explore the live page
- [ ] 3. Design and validate the catalog
- [ ] 4. Automate the catalog
- [ ] 5. Run, triage, and publish traceability
```

### 1. Read every source

Read attached pictures and files before exploring. List the flows the user asked for. Ignore controls that the story, feature, or picture does not cover when the user named a scope. When they did not name a scope, cover the main journey on the page plus one negative path for each input.

### 2. Explore the live page

```bash
npm run tc:explore -- <url>
```

Only use locators, labels, and messages that the exploration or a hands-on pass observed. Never invent text, ids, or behaviour from a picture that the page does not show.

### 3. Design and validate the catalog

Follow `agent/test-case-generator/SKILL.md` from "Define requirements" through "Validate the catalog".

- Write `test-case-generation/test-cases/<module>.json`.
- `$schema` is `../../agent/test-case-generator/test-case.schema.json`.
- Keep the minimum coverage from that skill: one positive case, negative partitions, boundaries, state transitions, and one `@e2e` case for the critical journey.
- Set `automation.status` to `Automated` only for behaviour you are about to script. Leave ambiguous behaviour as `Candidate` with the question in `notes`, and do not script those cases.
- Run `npm run tc:validate` and fix every error before writing specs.

### 4. Automate the catalog

Follow `agent/test-script-generator/SKILL.md` "Automate".

- Reuse a page object when one exists. Otherwise add one under `test-scripts/src/pages/<area>/`.
- Register new page objects in `test-scripts/src/fixtures/test.ts`.
- Put data in `test-scripts/src/data/<area>.ts` and secrets in `test-scripts/env/.env`.
- Write `test-scripts/scripts/<area>/<feature>.spec.ts`.
- The test title starts with the `TC-<MODULE>-NNN` id. Tags match the catalog.
- Set `automation.spec` to `scripts/<area>/<feature>.spec.ts`.

### 5. Run, triage, and publish traceability

```bash
npm run test:scripts -- --grep "TC-<MODULE>" --project=chromium
npm run tc:coverage
```

Fix test defects. For a product defect, keep the expected assertion, add `test.fail()` with a `defect` annotation, set `defectId` and `notes` in the catalog, and tag the test `@known-defect`.

Never add `waitForTimeout`, `force: true`, or `test.only`.

## Output to the user

1. Which sources you used, and the URL you automated
2. The catalog table: id, title, priority, type, technique, automation status
3. The spec paths
4. Passed, failed, and known defects
5. `test-scripts/reports/html/index.html` and `test-scripts/reports/traceability.html`
