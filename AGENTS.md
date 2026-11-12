# Agent instructions

This repository is a Playwright + TypeScript Page Object Model UI automation framework for https://rahulshettyacademy.com.

## Generating or automating UI test cases

Always follow the `ui-test-case-generator` skill: read `.cursor/skills/ui-test-case-generator/SKILL.md` and complete its workflow. The same skill is available at `.claude/skills/` and `.github/skills/`.

## Commands

| Purpose | Command |
|---|---|
| Install | `npm ci && npx playwright install --with-deps` |
| Explore a page | `npm run tc:explore -- <url>` |
| Validate test case catalogs | `npm run tc:validate` |
| Run smoke / regression | `npm run test:smoke` / `npm run test:regression` |
| Cross-browser run | `npm run test:cross-browser` |
| Traceability matrix | `npm run tc:coverage` |
| All quality gates | `npm run quality` |

## Rules

- Follow `.cursor/skills/ui-test-case-generator/standards.md` for test design, locators, page objects and specs.
- Import `test` and `expect` from `@fixtures/test`.
- Every spec title starts with its `TC-<MODULE>-NNN` ID from `test-cases/*.json`.
- Keep secrets in `.env` (see `.env.example`). Never commit them.
- Do not add comments, `waitForTimeout`, `force: true` or `test.only`.
