import { test, expect } from '@fixtures/test';
import { accessibilityBaseline } from '@data/accessibilityBaseline';

const pagesUnderTest = [
  {
    testCaseId: 'TC-A11Y-001',
    pageName: 'Login Page Practise',
    path: '/loginpagePractise/',
    readySelector: '#signInBtn',
  },
  { testCaseId: 'TC-A11Y-002', pageName: 'GreenKart home', path: '/seleniumPractise/#/', readySelector: '.product' },
  {
    testCaseId: 'TC-A11Y-003',
    pageName: 'Automation Practice',
    path: '/AutomationPractice/',
    readySelector: '.totalAmount',
  },
];

test.describe('WCAG 2.1 A/AA accessibility regression', { tag: '@a11y' }, () => {
  for (const { testCaseId, pageName, path, readySelector } of pagesUnderTest) {
    test(
      `${testCaseId} ${pageName} introduces no new WCAG A/AA violations`,
      { tag: '@regression' },
      async ({ page, scanAccessibility }) => {
        const knownViolations = accessibilityBaseline[path] ?? [];
        await page.goto(path, { waitUntil: 'domcontentloaded' });
        await expect(page.locator(readySelector).first()).toBeVisible();

        const { violations } = await scanAccessibility();
        const newViolations = violations.filter(({ id }) => !knownViolations.includes(id));

        test.info().annotations.push({
          type: 'accessibility',
          description: `${violations.length} violated rule(s) found, ${knownViolations.length} tracked in the baseline`,
        });
        expect(newViolations.map(({ id, impact, help }) => ({ id, impact, help }))).toEqual([]);
      },
    );
  }
});
