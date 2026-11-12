# Worked example: GreenKart promo codes

## Input

> **User story:** As a GreenKart customer I want to apply a promo code at checkout so that I pay a discounted price.
> **Acceptance criteria:** A valid code applies its discount. An invalid code is rejected and the price is unchanged.

## 1. Explore

```bash
npm run tc:explore -- https://rahulshettyacademy.com/seleniumPractise/#/cart
```

Observed: promo input `placeholder="Enter promo code"`, an `Apply` button, a `.promoInfo` message (`Code applied ..!` / `Invalid code ..!`), `.discountPerc` and `.discountAmt`.

## 2. Requirement

```json
{ "id": "REQ-GKART-03", "description": "A valid promo code applies its discount and an invalid code is rejected." }
```

## 3–4. Test cases (equivalence partitions: valid code, invalid code)

```json
{
  "id": "TC-GKART-005",
  "title": "Invalid promo code is rejected and no discount is applied",
  "requirementIds": ["REQ-GKART-03"],
  "priority": "P2",
  "severity": "Major",
  "type": "Negative",
  "technique": "Equivalence Partitioning",
  "tags": ["@regression", "@greenkart"],
  "preconditions": ["Cart contains a product and the cart page is open"],
  "testData": { "promoCode": "INVALID2026" },
  "steps": [{ "action": "Enter an invalid promo code and click Apply" }],
  "expectedResult": "'Invalid code ..!' is shown and the discount remains 0%.",
  "automation": { "status": "Automated", "spec": "tests/greenkart/checkout.spec.ts" }
}
```

## 6. Page object (`src/pages/greenkart/GreenKartCartPage.ts`)

```ts
export class GreenKartCartPage extends BasePage {
  readonly promoCodeInput: Locator;
  readonly applyPromoButton: Locator;
  readonly promoInfo: Locator;
  readonly discountPercentage: Locator;

  constructor(page: Page) {
    super(page);
    this.promoCodeInput = page.getByPlaceholder('Enter promo code');
    this.applyPromoButton = page.getByRole('button', { name: 'Apply' });
    this.promoInfo = page.locator('.promoInfo');
    this.discountPercentage = page.locator('.discountPerc');
  }

  async applyPromoCode(promoCode: string): Promise<void> {
    await this.promoCodeInput.fill(promoCode);
    await this.applyPromoButton.click();
    await this.promoInfo.waitFor({ timeout: 15_000 });
  }
}
```

## 6. Test data (`src/data/greenKart.ts`)

```ts
export const promoCodes = {
  valid: { code: 'rahulshettyacademy', discountPercentage: 10, message: 'Code applied ..!' },
  invalid: { code: 'INVALID2026', message: 'Invalid code ..!' },
} as const;
```

## 6. Spec (`tests/greenkart/checkout.spec.ts`)

```ts
import { test, expect } from '@fixtures/test';
import { greenKartProducts, promoCodes } from '@data/greenKart';

test('TC-GKART-005 Invalid promo code is rejected and no discount is applied', { tag: '@regression' }, async ({ greenKartHomePage, greenKartCartPage }) => {
  await greenKartHomePage.open();
  await greenKartHomePage.addToCart(greenKartProducts.brocolli);
  await greenKartHomePage.proceedToCheckout();

  await greenKartCartPage.applyPromoCode(promoCodes.invalid.code);

  await expect(greenKartCartPage.promoInfo).toHaveText(promoCodes.invalid.message);
  await expect(greenKartCartPage.discountPercentage).toHaveText('0%');
});
```

## Known product defect pattern

```ts
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

    await expect(authenticatedShopPage.header.checkoutButton).toContainText('( 1 )');
  },
);
```

The test stays green while the defect exists. It fails automatically once the defect is fixed, which tells you to remove `test.fail()`.
