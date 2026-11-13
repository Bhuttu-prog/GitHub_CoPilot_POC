import { type Locator, type Page } from '@playwright/test';
import { RoutablePage } from '@pages/RoutablePage';
import { ProtoCommerceHeader } from '@components/ProtoCommerceHeader';

export class ShopPage extends RoutablePage {
  protected readonly path = '/angularpractice/shop';

  readonly header: ProtoCommerceHeader;
  readonly productCards: Locator;
  readonly productTitles: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new ProtoCommerceHeader(page);
    this.productCards = page.locator('app-card');
    this.productTitles = this.productCards.locator('.card-title');
  }

  productCard(productName: string): Locator {
    return this.productCards.filter({ has: this.page.getByRole('link', { name: productName, exact: true }) });
  }

  async addToCart(...productNames: string[]): Promise<void> {
    for (const productName of productNames) {
      await this.productCard(productName).getByRole('button', { name: 'Add' }).click();
    }
  }

  async productNames(): Promise<string[]> {
    await this.productTitles.first().waitFor();
    return (await this.productTitles.allInnerTexts()).map((name) => name.trim());
  }
}
