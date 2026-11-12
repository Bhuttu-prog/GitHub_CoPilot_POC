import { test, expect } from '@fixtures/test';

test.describe('Automation Practice form controls', { tag: '@practice' }, () => {
  test.beforeEach(async ({ practicePage }) => {
    await practicePage.open();
  });

  test(
    'TC-PRAC-001 Radio buttons allow only one selection at a time',
    { tag: ['@smoke', '@regression'] },
    async ({ practicePage }) => {
      await practicePage.radioButton('radio1').check();
      await practicePage.radioButton('radio3').check();

      await expect(practicePage.radioButton('radio3')).toBeChecked();
      await expect(practicePage.radioButton('radio1')).not.toBeChecked();
      await expect(practicePage.radioButton('radio2')).not.toBeChecked();
    },
  );

  test(
    'TC-PRAC-002 Country autocomplete selects a suggested country',
    { tag: '@regression' },
    async ({ practicePage }) => {
      await practicePage.selectCountryFromSuggestions('ind', 'India');

      await expect(practicePage.countryAutocomplete).toHaveValue('India');
    },
  );

  test('TC-PRAC-003 Static dropdown selects the chosen option', { tag: '@regression' }, async ({ practicePage }) => {
    await expect(practicePage.dropdown).toHaveValue('');

    await practicePage.dropdown.selectOption({ label: 'Option2' });

    await expect(practicePage.dropdown).toHaveValue('option2');
  });

  test(
    'TC-PRAC-004 Checkboxes can be checked and unchecked independently',
    { tag: '@regression' },
    async ({ practicePage }) => {
      await practicePage.checkbox('option1').check();
      await practicePage.checkbox('option3').check();
      await practicePage.checkbox('option1').uncheck();

      await expect(practicePage.checkbox('option1')).not.toBeChecked();
      await expect(practicePage.checkbox('option2')).not.toBeChecked();
      await expect(practicePage.checkbox('option3')).toBeChecked();
    },
  );

  test(
    'TC-PRAC-008 Hide and Show buttons toggle the textbox visibility',
    { tag: '@regression' },
    async ({ practicePage }) => {
      await practicePage.hideButton.click();
      await expect(practicePage.toggleableTextbox).toBeHidden();

      await practicePage.showButton.click();
      await expect(practicePage.toggleableTextbox).toBeVisible();
    },
  );

  test(
    'TC-PRAC-010 Hovering the Mouse Hover button reveals the menu links',
    { tag: '@regression' },
    async ({ practicePage }) => {
      await expect(practicePage.mouseHoverTopLink).toBeHidden();

      await practicePage.mouseHoverButton.hover();

      await expect(practicePage.mouseHoverTopLink).toBeVisible();
    },
  );
});
