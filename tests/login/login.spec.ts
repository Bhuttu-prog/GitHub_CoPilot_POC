import { test, expect } from '@fixtures/test';
import { loginMessages, users } from '@data/users';

test.describe('Login Page Practise', { tag: '@login' }, () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test(
    'TC-LOGIN-001 Admin signs in with valid credentials and lands on the shop',
    { tag: ['@smoke', '@regression'] },
    async ({ page, loginPage }) => {
      await loginPage.loginAs(users.valid);

      await expect(page).toHaveURL(/\/angularpractice\/shop$/);
      await expect(page.getByRole('heading', { name: 'Shop Name' })).toBeVisible();
    },
  );

  test(
    'TC-LOGIN-002 User role signs in after confirming the limited-access modal',
    { tag: '@regression' },
    async ({ page, loginPage }) => {
      await test.step('Choose the User role and confirm the modal', async () => {
        await loginPage.enterCredentials(users.valid);
        await loginPage.selectUserType('user');
        await expect(loginPage.userRadio).toBeChecked();
      });

      await test.step('Complete sign-in as a Consultant', async () => {
        await loginPage.selectOccupation('Consultant');
        await loginPage.acceptTerms();
        await loginPage.signIn();
      });

      await expect(page).toHaveURL(/\/angularpractice\/shop$/);
    },
  );

  test(
    'TC-LOGIN-003 Valid username with an invalid password is rejected',
    { tag: ['@smoke', '@regression'] },
    async ({ page, loginPage }) => {
      await loginPage.loginAs(users.invalidPassword);

      await expect(loginPage.errorAlert).toHaveText(loginMessages.incorrect);
      await expect(page).toHaveURL(/loginpagePractise/);
    },
  );

  test(
    'TC-LOGIN-004 Unknown username with a valid password is rejected',
    { tag: '@regression' },
    async ({ page, loginPage }) => {
      await loginPage.loginAs(users.unknownUser);

      await expect(loginPage.errorAlert).toHaveText(loginMessages.incorrect);
      await expect(page).toHaveURL(/loginpagePractise/);
    },
  );

  test(
    'TC-LOGIN-005 Empty username and password show a validation message',
    { tag: '@regression' },
    async ({ loginPage }) => {
      await loginPage.signIn();

      await expect(loginPage.errorAlert).toHaveText(loginMessages.empty);
    },
  );

  test(
    'TC-LOGIN-006 Retired password shows guidance to use the new password',
    { tag: '@regression' },
    async ({ loginPage }) => {
      await loginPage.loginAs(users.retiredPassword);

      await expect(loginPage.errorAlert).toContainText(loginMessages.retiredPassword);
    },
  );

  test(
    'TC-LOGIN-007 Cancelling the limited-access modal keeps the Admin role selected',
    { tag: '@regression' },
    async ({ loginPage }) => {
      await loginPage.userRadio.click();
      await expect(loginPage.limitedAccessModal).toBeVisible();

      await loginPage.modalCancelButton.click();

      await expect(loginPage.limitedAccessModal).toBeHidden();
      await expect(loginPage.adminRadio).toBeChecked();
    },
  );

  test(
    'TC-LOGIN-008 Occupation dropdown offers Student, Teacher and Consultant',
    { tag: '@regression' },
    async ({ loginPage }) => {
      await expect(loginPage.occupationSelect.locator('option')).toHaveText(['Student', 'Teacher', 'Consultant']);
      await expect(loginPage.occupationSelect).toHaveValue('stud');
    },
  );

  test('TC-LOGIN-009 Password field masks the entered characters', { tag: '@regression' }, async ({ loginPage }) => {
    await loginPage.passwordInput.fill(users.valid.password);

    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });

  test(
    'TC-LOGIN-010 Sign In button shows a progress state while credentials are verified',
    { tag: '@regression' },
    async ({ loginPage }) => {
      await loginPage.enterCredentials(users.invalidPassword);
      await loginPage.signIn();

      await expect(loginPage.signInButton).toHaveValue('Signing ..');
      await expect(loginPage.signInButton).toHaveValue('Sign In');
    },
  );
});
