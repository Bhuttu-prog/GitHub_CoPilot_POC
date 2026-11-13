import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';

export class GreenKartCountryPage extends BasePage {
  readonly countrySelect: Locator;
  readonly termsCheckbox: Locator;
  readonly proceedButton: Locator;
  readonly termsError: Locator;
  readonly orderConfirmation: Locator;

  constructor(page: Page) {
    super(page);
    this.countrySelect = page.getByRole('combobox');
    this.termsCheckbox = page.locator('input.chkAgree');
    this.proceedButton = page.getByRole('button', { name: 'Proceed' });
    this.termsError = page.locator('.errorAlert');
    this.orderConfirmation = page.getByText('Thank you, your order has been placed successfully');
  }

  async selectCountry(country: string): Promise<void> {
    await this.countrySelect.selectOption(country);
  }

  async acceptTerms(): Promise<void> {
    await this.termsCheckbox.check();
  }

  async proceed(): Promise<void> {
    await this.proceedButton.click();
  }
}
