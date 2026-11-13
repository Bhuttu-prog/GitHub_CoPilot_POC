import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';

export class GreenKartCartPage extends BasePage {
  readonly cartRows: Locator;
  readonly promoCodeInput: Locator;
  readonly applyPromoButton: Locator;
  readonly promoInfo: Locator;
  readonly totalAmount: Locator;
  readonly discountPercentage: Locator;
  readonly totalAfterDiscount: Locator;
  readonly placeOrderButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartRows = page.locator('#productCartTables tbody tr');
    this.promoCodeInput = page.getByPlaceholder('Enter promo code');
    this.applyPromoButton = page.getByRole('button', { name: 'Apply' });
    this.promoInfo = page.locator('.promoInfo');
    this.totalAmount = page.locator('.totAmt');
    this.discountPercentage = page.locator('.discountPerc');
    this.totalAfterDiscount = page.locator('.discountAmt');
    this.placeOrderButton = page.getByRole('button', { name: 'Place Order' });
  }

  async applyPromoCode(promoCode: string): Promise<void> {
    await this.promoCodeInput.fill(promoCode);
    await this.applyPromoButton.click();
    await this.promoInfo.waitFor({ timeout: 15_000 });
  }

  async totalAmountValue(): Promise<number> {
    return Number(await this.totalAmount.innerText());
  }

  async placeOrder(): Promise<void> {
    await this.placeOrderButton.click();
  }
}
