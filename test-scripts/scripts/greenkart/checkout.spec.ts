import { test, expect } from '@fixtures/test';
import { greenKartMessages, greenKartProducts, promoCodes } from '@data/greenKart';

test.describe('GreenKart cart and checkout', { tag: '@greenkart' }, () => {
  test.beforeEach(async ({ greenKartHomePage }) => {
    await greenKartHomePage.open();
  });

  test(
    'TC-GKART-003 Adding a product with quantity updates the cart summary',
    { tag: ['@smoke', '@regression'] },
    async ({ greenKartHomePage }) => {
      const quantity = 3;
      const unitPrice = await greenKartHomePage.unitPrice(greenKartProducts.tomato);

      await greenKartHomePage.addToCart(greenKartProducts.tomato, quantity);

      await expect(greenKartHomePage.cartItemCount).toHaveText('1');
      await expect(greenKartHomePage.cartTotalPrice).toHaveText(String(unitPrice * quantity));
    },
  );

  test(
    'TC-GKART-004 Valid promo code applies a 10% discount',
    { tag: '@regression' },
    async ({ greenKartHomePage, greenKartCartPage }) => {
      await greenKartHomePage.addToCart(greenKartProducts.tomato, 3);
      await greenKartHomePage.proceedToCheckout();
      const totalAmount = await greenKartCartPage.totalAmountValue();

      await greenKartCartPage.applyPromoCode(promoCodes.valid.code);

      await expect(greenKartCartPage.promoInfo).toHaveText(promoCodes.valid.message);
      await expect(greenKartCartPage.discountPercentage).toHaveText(`${promoCodes.valid.discountPercentage}%`);
      await expect(greenKartCartPage.totalAfterDiscount).toHaveText(
        String(totalAmount * (1 - promoCodes.valid.discountPercentage / 100)),
      );
    },
  );

  test(
    'TC-GKART-005 Invalid promo code is rejected and no discount is applied',
    { tag: '@regression' },
    async ({ greenKartHomePage, greenKartCartPage }) => {
      await greenKartHomePage.addToCart(greenKartProducts.brocolli);
      await greenKartHomePage.proceedToCheckout();

      await greenKartCartPage.applyPromoCode(promoCodes.invalid.code);

      await expect(greenKartCartPage.promoInfo).toHaveText(promoCodes.invalid.message);
      await expect(greenKartCartPage.discountPercentage).toHaveText('0%');
    },
  );

  test(
    'TC-GKART-006 Proceeding without accepting terms shows a mandatory error',
    { tag: '@regression' },
    async ({ greenKartHomePage, greenKartCartPage, greenKartCountryPage }) => {
      await greenKartHomePage.addToCart(greenKartProducts.cashews);
      await greenKartHomePage.proceedToCheckout();
      await greenKartCartPage.placeOrder();

      await greenKartCountryPage.selectCountry('India');
      await greenKartCountryPage.proceed();

      await expect(greenKartCountryPage.termsError).toHaveText(greenKartMessages.termsRequired);
    },
  );

  test(
    'TC-GKART-007 Customer places an order end to end',
    { tag: ['@smoke', '@regression', '@e2e'] },
    async ({ page, greenKartHomePage, greenKartCartPage, greenKartCountryPage }) => {
      await test.step('Add products to the cart', async () => {
        await greenKartHomePage.addToCart(greenKartProducts.tomato, 2);
        await greenKartHomePage.addToCart(greenKartProducts.cashews);
        await expect(greenKartHomePage.cartItemCount).toHaveText('2');
      });

      await test.step('Review the cart and place the order', async () => {
        await greenKartHomePage.proceedToCheckout();
        await expect(greenKartCartPage.cartRows).toHaveCount(2);
        await greenKartCartPage.placeOrder();
      });

      await test.step('Choose a country, accept terms and proceed', async () => {
        await greenKartCountryPage.selectCountry('India');
        await greenKartCountryPage.acceptTerms();
        await greenKartCountryPage.proceed();
      });

      await expect(greenKartCountryPage.orderConfirmation).toBeVisible();
      await expect(page).toHaveURL(/#\/country/);
    },
  );
});
