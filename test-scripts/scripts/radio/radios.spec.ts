import { test, expect } from '@fixtures/test';

const radioValues = ['radio1', 'radio2', 'radio3'] as const;

test.describe('Radio Button Example', { tag: '@radio' }, () => {
  test.beforeEach(async ({ practicePage }) => {
    await practicePage.open();
  });

  test(
    'TC-RADIO-001 Radio group starts with three options and none selected',
    { tag: ['@smoke', '@regression'] },
    async ({ practicePage }) => {
      await expect(practicePage.radioGroup.locator('legend')).toHaveText('Radio Button Example');
      await expect(practicePage.radioGroup.locator('label')).toHaveText(['Radio1', 'Radio2', 'Radio3']);

      for (const value of radioValues) {
        await expect(practicePage.radioButton(value)).not.toBeChecked();
      }
    },
  );

  test(
    'TC-RADIO-002 Selecting another radio clears the previous selection',
    { tag: ['@smoke', '@regression'] },
    async ({ practicePage }) => {
      await practicePage.radioButton('radio1').check();
      await expect(practicePage.radioButton('radio1')).toBeChecked();

      await practicePage.radioButton('radio2').check();

      await expect(practicePage.radioButton('radio2')).toBeChecked();
      await expect(practicePage.radioButton('radio1')).not.toBeChecked();

      await practicePage.radioButton('radio3').check();

      await expect(practicePage.radioButton('radio3')).toBeChecked();
      await expect(practicePage.radioButton('radio1')).not.toBeChecked();
      await expect(practicePage.radioButton('radio2')).not.toBeChecked();
    },
  );

  test(
    'TC-RADIO-003 Clicking the selected radio keeps that radio selected',
    { tag: '@regression' },
    async ({ practicePage }) => {
      await practicePage.radioButton('radio3').check();

      await practicePage.radioButton('radio3').click();

      await expect(practicePage.radioButton('radio3')).toBeChecked();
      await expect(practicePage.radioButton('radio1')).not.toBeChecked();
      await expect(practicePage.radioButton('radio2')).not.toBeChecked();
    },
  );
});
