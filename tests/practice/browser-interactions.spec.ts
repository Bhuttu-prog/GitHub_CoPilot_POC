import { test, expect } from '@fixtures/test';
import { sum } from '@utils/currency';

test.describe('Automation Practice browser interactions', { tag: '@practice' }, () => {
  test.beforeEach(async ({ practicePage }) => {
    await practicePage.open();
  });

  test(
    'TC-PRAC-005 Alert greets the user by the entered name',
    { tag: ['@smoke', '@regression'] },
    async ({ practicePage }) => {
      const dialog = await practicePage.triggerAlert('Diksha');

      expect(dialog.type).toBe('alert');
      expect(dialog.message).toBe('Hello Diksha, share this practice page and share your knowledge');
    },
  );

  test(
    'TC-PRAC-006 Confirm dialog asks the named user to confirm and can be dismissed',
    { tag: '@regression' },
    async ({ practicePage }) => {
      const dialog = await practicePage.triggerConfirm('Diksha', 'dismiss');

      expect(dialog.type).toBe('confirm');
      expect(dialog.message).toBe('Hello Diksha, Are you sure you want to confirm?');
    },
  );

  test(
    'TC-PRAC-007 Open Window launches the QAClick Academy site in a new window',
    { tag: '@regression' },
    async ({ page, practicePage }) => {
      const popup = await practicePage.openNewWindow();

      await expect(popup).toHaveURL(/qaclickacademy\.com/);
      await expect(page).toHaveURL(/AutomationPractice/);
    },
  );

  test(
    'TC-PRAC-009 Fixed-header table amounts add up to the total collected',
    { tag: ['@smoke', '@regression'] },
    async ({ practicePage }) => {
      const amounts = await practicePage.employeeAmounts();

      expect(amounts.length).toBeGreaterThan(0);
      expect(await practicePage.totalAmountCollectedValue()).toBe(sum(amounts));
    },
  );
});
