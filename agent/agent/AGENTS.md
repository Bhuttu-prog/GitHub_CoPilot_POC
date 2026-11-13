# Agent instructions

This repository is a Playwright + TypeScript Page Object Model UI automation framework for https://rahulshettyacademy.com.

Work is split into these areas:

- `agent/test-case-generator` designs test case catalogs in `test-case-generation/test-cases`.
- `agent/test-script-generator` automates those catalogs as Playwright scripts in `test-scripts`.
- `agent/direct-test-automator` does both in one pass from a URL, page, story, feature, or picture.
- `test-scripts` is the project you install and run.

## Generating test cases

Follow `agent/test-case-generator/SKILL.md` and `agent/test-case-generator/standards.md`. Write catalogs only under `test-case-generation/test-cases`.

## Generating test scripts

Follow `agent/test-script-generator/SKILL.md` and `agent/test-script-generator/standards.md`. Write page objects under `test-scripts/src` and specs under `test-scripts/scripts`.

## Automating directly from a source

When the user supplies a URL, page, story, feature, screenshot, or picture and wants runnable tests, follow `agent/direct-test-automator/SKILL.md`. It writes the catalog first, then the scripts.

The same skills are linked from `.cursor/skills/`, `.claude/skills/` and `.github/skills/`.

## Commands

Run these from `test-scripts`.

| Purpose | Command |
|---|---|
| Install | `npm ci && npx playwright install --with-deps` |
| Explore a page | `npm run tc:explore -- <url>` |
| Validate test case catalogs | `npm run tc:validate` |
| Run test scripts | `npm run test:scripts` |
| Run smoke / regression | `npm run test:smoke` / `npm run test:regression` |
| Cross-browser run | `npm run test:cross-browser` |
| Traceability matrix | `npm run tc:coverage` |
| All quality gates | `npm run quality` |

## Rules

- Import `test` and `expect` from `@fixtures/test`.
- Every spec title starts with its `TC-<MODULE>-NNN` ID from `test-case-generation/test-cases/*.json`.
- Keep secrets in `test-scripts/env/.env` (see `test-scripts/env/.env.example`). Never commit them.
- Do not add comments, `waitForTimeout`, `force: true` or `test.only`.
