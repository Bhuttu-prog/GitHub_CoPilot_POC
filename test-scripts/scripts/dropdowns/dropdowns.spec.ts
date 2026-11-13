import { test, expect } from '@fixtures/test';
import { cities, countrySuggestions, currencies, passengers, tripDateOpacity } from '@data/dropdowns';

test.describe('Dropdowns practice', { tag: '@dropdowns' }, () => {
  test.beforeEach(async ({ dropdownsPage }) => {
    await dropdownsPage.open();
  });

  test(
    'TC-DROP-001 Static currency dropdown keeps USD selected',
    { tag: ['@smoke', '@regression'] },
    async ({ dropdownsPage }) => {
      await dropdownsPage.selectCurrency('USD');

      await expect(dropdownsPage.currencySelect).toHaveValue('USD');
    },
  );

  test(
    'TC-DROP-002 Currency dropdown lists Select, INR, AED and USD',
    { tag: '@regression' },
    async ({ dropdownsPage }) => {
      await expect(dropdownsPage.currencySelect.locator('option')).toHaveText([...currencies]);
    },
  );

  test(
    'TC-DROP-003 Country autosuggest selects India from a partial name',
    { tag: ['@smoke', '@regression'] },
    async ({ dropdownsPage }) => {
      await dropdownsPage.searchCountry(countrySuggestions.searchText);

      await expect(dropdownsPage.countrySuggestions).toHaveText([...countrySuggestions.matches]);

      await dropdownsPage.countrySuggestions.getByText(countrySuggestions.country, { exact: true }).click();

      await expect(dropdownsPage.countryInput).toHaveValue(countrySuggestions.country);
    },
  );

  test('TC-DROP-004 Unknown country text shows no suggestions', { tag: '@regression' }, async ({ dropdownsPage }) => {
    await dropdownsPage.searchCountry(countrySuggestions.unknown);

    await expect(dropdownsPage.countrySuggestions).toHaveCount(0);
  });

  test(
    'TC-DROP-005 Adding adults and a child updates the passenger summary',
    { tag: ['@smoke', '@regression'] },
    async ({ dropdownsPage }) => {
      await expect(dropdownsPage.passengerSummary).toHaveText('1 Adult');

      await dropdownsPage.addPassengers(passengers.addedAdults, passengers.addedChildren);

      await expect(dropdownsPage.passengerSummary).toHaveText(passengers.summary);
      await expect(dropdownsPage.passengerOptions).toBeHidden();
    },
  );

  test('TC-DROP-006 Adult passenger count stops at nine', { tag: '@regression' }, async ({ dropdownsPage }) => {
    const adults = await dropdownsPage.increaseAdultsToMaximum();

    expect(adults).toBe(passengers.maximumAdults);
    await expect(dropdownsPage.increaseAdult).toHaveClass(/pax-disabled/);
  });

  test('TC-DROP-007 Adult passenger count cannot go below one', { tag: '@regression' }, async ({ dropdownsPage }) => {
    await dropdownsPage.openPassengerSelector();

    await expect(dropdownsPage.adultCount).toHaveText(String(passengers.minimumAdults));
    await expect(dropdownsPage.decreaseAdult).toHaveClass(/pax-disabled/);
  });

  test(
    'TC-DROP-008 Arrival cities exclude the selected departure city',
    { tag: ['@smoke', '@regression'] },
    async ({ dropdownsPage }) => {
      await dropdownsPage.selectDepartureCity(cities.departure);

      await expect(dropdownsPage.departureInput).toHaveValue(cities.departure);
      await expect(dropdownsPage.arrivalOptions.getByRole('link', { name: cities.departure, exact: true })).toHaveCount(
        0,
      );

      await dropdownsPage.selectArrivalCity(cities.arrival);

      await expect(dropdownsPage.arrivalInput).toHaveValue(cities.arrival);
    },
  );

  test('TC-DROP-009 Round trip makes the return date available', { tag: '@regression' }, async ({ dropdownsPage }) => {
    await dropdownsPage.roundTripRadio.check();

    await expect(dropdownsPage.roundTripRadio).toBeChecked();
    await expect(dropdownsPage.returnDate).toHaveAttribute(
      'style',
      new RegExp(`opacity:\\s*${tripDateOpacity.active}`),
    );
  });

  test('TC-DROP-010 One way keeps the return date inactive', { tag: '@regression' }, async ({ dropdownsPage }) => {
    await expect(dropdownsPage.oneWayRadio).toBeChecked();
    await expect(dropdownsPage.returnDate).toHaveAttribute(
      'style',
      new RegExp(`opacity:\\s*${tripDateOpacity.inactive}`),
    );
  });

  test(
    'TC-DROP-011 Selecting a second discount clears the first',
    { tag: '@regression' },
    async ({ dropdownsPage }) => {
      await dropdownsPage.familyAndFriendsDiscount.check();
      await dropdownsPage.seniorCitizenDiscount.check();

      await expect(dropdownsPage.seniorCitizenDiscount).toBeChecked();
      await expect(dropdownsPage.familyAndFriendsDiscount).not.toBeChecked();
    },
  );
});
