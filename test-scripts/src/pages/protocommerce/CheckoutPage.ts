import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';

export class CheckoutPage extends BasePage {
  readonly countryInput: Locator;
  readonly countrySuggestions: Locator;
  readonly termsCheckbox: Locator;
  readonly termsLabel: Locator;
  readonly purchaseButton: Locator;
  readonly successAlert: Locator;

  constructor(page: Page) {
    super(page);
    this.countryInput = page.getByLabel('Please choose your delivery location');
    this.countrySuggestions = page.locator('.suggestions li');
    this.termsCheckbox = page.locator('#checkbox2');
    this.termsLabel = page.locator('label[for="checkbox2"]');
    this.purchaseButton = page.getByRole('button', { name: 'Purchase' });
    this.successAlert = page.locator('.alert-success');
  }

  async searchCountry(searchText: string): Promise<void> {
    await this.countryInput.pressSequentially(searchText);
    await this.countrySuggestions.first().waitFor();
  }

  async selectCountry(searchText: string, country: string): Promise<void> {
    await this.searchCountry(searchText);
    await this.countrySuggestions.getByText(country, { exact: true }).click();
  }

  async acceptTerms(): Promise<void> {
    await this.termsLabel.click({ position: { x: 5, y: 5 } });
  }

  async purchase(): Promise<void> {
    await this.purchaseButton.click();
  }
}
