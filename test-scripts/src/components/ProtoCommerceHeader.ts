import { type Locator, type Page } from '@playwright/test';

export class ProtoCommerceHeader {
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.checkoutButton = page.locator('a.btn-primary', { hasText: 'Checkout' });
  }

  async openCart(): Promise<void> {
    await this.checkoutButton.click();
  }
}
