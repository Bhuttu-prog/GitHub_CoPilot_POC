import { type Locator, type Page } from '@playwright/test';
import { RoutablePage } from '@pages/RoutablePage';

export class GreenKartHomePage extends RoutablePage {
  protected readonly path = '/seleniumPractise/#/';

  readonly searchInput: Locator;
  readonly products: Locator;
  readonly productNames: Locator;
  readonly noResultsMessage: Locator;
  readonly cartItemCount: Locator;
  readonly cartTotalPrice: Locator;
  readonly cartIcon: Locator;
  readonly proceedToCheckoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByPlaceholder('Search for Vegetables and Fruits');
    this.products = page.locator('.products .product');
    this.productNames = this.products.locator('.product-name');
    this.noResultsMessage = page.getByRole('heading', { name: 'Sorry, no products matched your search!' });
    this.cartItemCount = page.locator('.cart-info tr').filter({ hasText: 'Items' }).locator('strong');
    this.cartTotalPrice = page.locator('.cart-info tr').filter({ hasText: 'Price' }).locator('strong');
    this.cartIcon = page.locator('a.cart-icon');
    this.proceedToCheckoutButton = page.getByRole('button', { name: 'PROCEED TO CHECKOUT' });
  }

  product(productName: string): Locator {
    return this.products.filter({ hasText: productName });
  }

  async search(keyword: string): Promise<void> {
    await this.searchInput.fill(keyword);
  }

  async unitPrice(productName: string): Promise<number> {
    return Number(await this.product(productName).locator('.product-price').innerText());
  }

  async addToCart(productName: string, quantity = 1): Promise<void> {
    const product = this.product(productName);
    await product.locator('input.quantity').fill(String(quantity));
    await product.getByRole('button', { name: 'ADD TO CART' }).click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.cartIcon.click();
    await this.proceedToCheckoutButton.click();
  }
}
