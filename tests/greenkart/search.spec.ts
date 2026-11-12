import { test, expect } from '@fixtures/test';
import { searchScenarios } from '@data/greenKart';

test.describe('GreenKart product search', { tag: '@greenkart' }, () => {
  test.beforeEach(async ({ greenKartHomePage }) => {
    await greenKartHomePage.open();
    await expect(greenKartHomePage.products.first()).toBeVisible();
  });

  for (const { keyword, expected } of searchScenarios) {
    test(
      `TC-GKART-001 Search "${keyword}" shows only matching products`,
      { tag: ['@smoke', '@regression'] },
      async ({ greenKartHomePage }) => {
        await greenKartHomePage.search(keyword);

        await expect(greenKartHomePage.productNames).toHaveText([...expected]);
      },
    );
  }

  test(
    'TC-GKART-002 Search without matches shows the empty-state message',
    { tag: '@regression' },
    async ({ greenKartHomePage }) => {
      await greenKartHomePage.search('xyz');

      await expect(greenKartHomePage.noResultsMessage).toBeVisible();
      await expect(greenKartHomePage.products).toHaveCount(0);
    },
  );
});
