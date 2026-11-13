import { type Locator, type Page } from '@playwright/test';
import { RoutablePage } from '@pages/RoutablePage';
import { type Credentials, type Occupation, type UserType } from '@data/users';

export class LoginPage extends RoutablePage {
  protected readonly path = '/loginpagePractise/';

  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly adminRadio: Locator;
  readonly userRadio: Locator;
  readonly occupationSelect: Locator;
  readonly termsCheckbox: Locator;
  readonly signInButton: Locator;
  readonly errorAlert: Locator;
  readonly limitedAccessModal: Locator;
  readonly modalOkayButton: Locator;
  readonly modalCancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByLabel('Username:');
    this.passwordInput = page.getByLabel('Password:');
    this.adminRadio = page.getByRole('radio', { name: 'Admin' });
    this.userRadio = page.getByRole('radio', { name: 'User' });
    this.occupationSelect = page.getByRole('combobox');
    this.termsCheckbox = page.getByRole('checkbox');
    this.signInButton = page.locator('#signInBtn');
    this.errorAlert = page.locator('.alert-danger');
    this.limitedAccessModal = page.locator('#myModal');
    this.modalOkayButton = page.getByRole('button', { name: 'Okay' });
    this.modalCancelButton = page.getByRole('button', { name: 'Cancel' });
  }

  async enterCredentials({ username, password }: Credentials): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
  }

  async selectUserType(userType: UserType): Promise<void> {
    if (userType === 'admin') {
      await this.adminRadio.check();
      return;
    }
    await this.userRadio.click();
    await this.modalOkayButton.click();
    await this.limitedAccessModal.waitFor({ state: 'hidden' });
  }

  async selectOccupation(occupation: Occupation): Promise<void> {
    await this.occupationSelect.selectOption({ label: occupation });
  }

  async acceptTerms(): Promise<void> {
    await this.termsCheckbox.check();
  }

  async signIn(): Promise<void> {
    await this.signInButton.click();
  }

  async loginAs(
    credentials: Credentials,
    { userType = 'admin', occupation = 'Student' }: { userType?: UserType; occupation?: Occupation } = {},
  ): Promise<void> {
    await this.enterCredentials(credentials);
    await this.selectUserType(userType);
    await this.selectOccupation(occupation);
    await this.acceptTerms();
    await this.signIn();
  }
}
