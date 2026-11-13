import { test, expect } from '@fixtures/test';
import { deliveryCountry, orderSuccessMessage } from '@data/protoCommerce';

test.describe('ProtoCommerce checkout', { tag: '@protocommerce' }, () => {
  test(
    'TC-PCOM-006 Customer completes an order end to end',
    { tag: ['@smoke', '@regression', '@e2e'] },
    async ({ authenticatedShopPage, cartPage, checkoutPage }) => {
      await test.step('Add a product and open the cart', async () => {
        await authenticatedShopPage.addToCart('iphone X');
        await authenticatedShopPage.header.openCart();
        await expect(cartPage.productNameCells).toHaveText(['iphone X']);
      });

      await test.step('Proceed to checkout and choose the delivery country', async () => {
        await cartPage.proceedToCheckout();
        await checkoutPage.selectCountry(deliveryCountry.searchText, deliveryCountry.country);
        await expect(checkoutPage.countryInput).toHaveValue(deliveryCountry.country);
      });

      await test.step('Accept terms and purchase', async () => {
        await checkoutPage.acceptTerms();
        await expect(checkoutPage.termsCheckbox).toBeChecked();
        await checkoutPage.purchase();
      });

      await expect(checkoutPage.successAlert).toContainText(orderSuccessMessage);
    },
  );

  test(
    'TC-PCOM-007 Delivery country suggestions match the partial text entered',
    { tag: '@regression' },
    async ({ authenticatedShopPage, cartPage, checkoutPage }) => {
      await authenticatedShopPage.addToCart('Blackberry');
      await authenticatedShopPage.header.openCart();
      await cartPage.proceedToCheckout();

      await checkoutPage.searchCountry('ind');

      await expect(checkoutPage.countrySuggestions).toHaveText(['India', 'Indonesia']);
    },
  );
});
