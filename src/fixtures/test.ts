import { test as base, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { LoginPage } from '@pages/login/LoginPage';
import { ShopPage } from '@pages/protocommerce/ShopPage';
import { CartPage } from '@pages/protocommerce/CartPage';
import { CheckoutPage } from '@pages/protocommerce/CheckoutPage';
import { GreenKartHomePage } from '@pages/greenkart/GreenKartHomePage';
import { GreenKartCartPage } from '@pages/greenkart/GreenKartCartPage';
import { GreenKartCountryPage } from '@pages/greenkart/GreenKartCountryPage';
import { AutomationPracticePage } from '@pages/practice/AutomationPracticePage';
import { DropdownsPage } from '@pages/dropdowns/DropdownsPage';
import { users } from '@data/users';

type AccessibilityScan = (options?: {
  include?: string;
  disableRules?: string[];
}) => Promise<Awaited<ReturnType<AxeBuilder['analyze']>>>;

type PageFixtures = {
  loginPage: LoginPage;
  shopPage: ShopPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  authenticatedShopPage: ShopPage;
  greenKartHomePage: GreenKartHomePage;
  greenKartCartPage: GreenKartCartPage;
  greenKartCountryPage: GreenKartCountryPage;
  practicePage: AutomationPracticePage;
  dropdownsPage: DropdownsPage;
  scanAccessibility: AccessibilityScan;
};

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  shopPage: async ({ page }, use) => {
    await use(new ShopPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  authenticatedShopPage: async ({ page, loginPage, shopPage }, use) => {
    await loginPage.open();
    await loginPage.loginAs(users.valid);
    await page.waitForURL('**/angularpractice/shop', { waitUntil: 'domcontentloaded' });
    await use(shopPage);
  },
  greenKartHomePage: async ({ page }, use) => {
    await use(new GreenKartHomePage(page));
  },
  greenKartCartPage: async ({ page }, use) => {
    await use(new GreenKartCartPage(page));
  },
  greenKartCountryPage: async ({ page }, use) => {
    await use(new GreenKartCountryPage(page));
  },
  practicePage: async ({ page }, use) => {
    await use(new AutomationPracticePage(page));
  },
  dropdownsPage: async ({ page }, use) => {
    await use(new DropdownsPage(page));
  },
  scanAccessibility: async ({ page }, use, testInfo) => {
    await use(async ({ include, disableRules = [] } = {}) => {
      const builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).disableRules(disableRules);
      const results = await (include ? builder.include(include) : builder).analyze();
      await testInfo.attach('accessibility-scan-results', {
        body: JSON.stringify(results.violations, null, 2),
        contentType: 'application/json',
      });
      return results;
    });
  },
});

export { expect };
