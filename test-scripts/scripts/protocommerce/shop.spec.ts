import { test, expect } from '@fixtures/test';
import { protoCommerceProducts } from '@data/protoCommerce';
import { sum } from '@utils/currency';

test.describe('ProtoCommerce shop and cart', { tag: '@protocommerce' }, () => {
  test(
    'TC-PCOM-001 Shop lists the complete product catalogue',
    { tag: '@regression' },
    async ({ authenticatedShopPage }) => {
      expect(await authenticatedShopPage.productNames()).toEqual([...protoCommerceProducts]);
    },
  );

  test(
    'TC-PCOM-002 Adding products increments the checkout counter',
    { tag: ['@smoke', '@regression'] },
    async ({ authenticatedShopPage }) => {
      const { header } = authenticatedShopPage;
      await expect(header.checkoutButton).toContainText('( 0 )');

      await authenticatedShopPage.addToCart('iphone X', 'Blackberry');

      await expect(header.checkoutButton).toContainText('( 2 )');
    },
  );

  test(
    'TC-PCOM-003 Cart contains exactly the products that were added',
    { tag: ['@smoke', '@regression'] },
    async ({ authenticatedShopPage, cartPage }) => {
      const selectedProducts = ['Samsung Note 8', 'Nokia Edge'];
      await authenticatedShopPage.addToCart(...selectedProducts);

      await authenticatedShopPage.header.openCart();

      await expect(cartPage.productNameCells).toHaveText(selectedProducts);
    },
  );

  test(
    'TC-PCOM-004 Cart grand total equals the sum of line totals',
    { tag: '@regression' },
    async ({ authenticatedShopPage, cartPage }) => {
      await authenticatedShopPage.addToCart('iphone X', 'Samsung Note 8', 'Nokia Edge');
      await authenticatedShopPage.header.openCart();
      await expect(cartPage.productRows).toHaveCount(3);

      const lineTotals = await cartPage.lineTotals();

      expect(await cartPage.grandTotalAmount()).toBe(sum(lineTotals));
    },
  );

  test(
    'TC-PCOM-005 Removing a product deletes its row from the cart',
    { tag: '@regression' },
    async ({ authenticatedShopPage, cartPage }) => {
      await authenticatedShopPage.addToCart('iphone X', 'Blackberry');
      await authenticatedShopPage.header.openCart();

      await cartPage.removeProduct('iphone X');

      await expect(cartPage.productNameCells).toHaveText(['Blackberry']);
    },
  );

  test(
    'TC-PCOM-008 Continue Shopping returns to the catalogue and keeps the cart',
    {
      tag: ['@regression', '@known-defect'],
      annotation: { type: 'defect', description: 'DEF-PCOM-001 Cart counter resets to 0 after Continue Shopping' },
    },
    async ({ authenticatedShopPage, cartPage }) => {
      test.fail();
      await authenticatedShopPage.addToCart('Nokia Edge');
      await authenticatedShopPage.header.openCart();

      await cartPage.continueShoppingButton.click();

      await expect(authenticatedShopPage.productCards).toHaveCount(protoCommerceProducts.length);
      await expect(authenticatedShopPage.header.checkoutButton).toContainText('( 1 )');
    },
  );
});
