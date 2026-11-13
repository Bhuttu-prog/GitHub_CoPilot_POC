import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { parseAmount } from '@utils/currency';

export class CartPage extends BasePage {
  readonly productRows: Locator;
  readonly productNameCells: Locator;
  readonly grandTotal: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.productRows = page.locator('tbody tr').filter({ has: page.locator('.media') });
    this.productNameCells = this.productRows.locator('h4.media-heading');
    this.grandTotal = page.locator('td.text-right h3 strong');
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
    this.continueShoppingButton = page.getByRole('button', { name: 'Continue Shopping' });
  }

  productRow(productName: string): Locator {
    return this.productRows.filter({ has: this.page.getByRole('link', { name: productName, exact: true }) });
  }

  async lineTotals(): Promise<number[]> {
    const totals = await this.productRows.locator('td:nth-child(4)').allInnerTexts();
    return totals.map(parseAmount);
  }

  async grandTotalAmount(): Promise<number> {
    return parseAmount(await this.grandTotal.innerText());
  }

  async removeProduct(productName: string): Promise<void> {
    await this.productRow(productName).getByRole('button', { name: 'Remove' }).click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
