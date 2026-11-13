import { type Locator, type Page } from '@playwright/test';
import { RoutablePage } from '@pages/RoutablePage';

export class DropdownsPage extends RoutablePage {
  protected readonly path = '/dropdownsPractise/';

  readonly currencySelect: Locator;
  readonly countryInput: Locator;
  readonly countrySuggestions: Locator;
  readonly passengerSummary: Locator;
  readonly passengerOptions: Locator;
  readonly adultCount: Locator;
  readonly increaseAdult: Locator;
  readonly decreaseAdult: Locator;
  readonly increaseChild: Locator;
  readonly doneButton: Locator;
  readonly oneWayRadio: Locator;
  readonly roundTripRadio: Locator;
  readonly returnDate: Locator;
  readonly departureInput: Locator;
  readonly departureOptions: Locator;
  readonly arrivalOptions: Locator;
  readonly arrivalInput: Locator;
  readonly familyAndFriendsDiscount: Locator;
  readonly seniorCitizenDiscount: Locator;

  constructor(page: Page) {
    super(page);
    this.currencySelect = page.locator('#ctl00_mainContent_DropDownListCurrency');
    this.countryInput = page.getByRole('group', { name: 'Country' }).getByPlaceholder('Type to Select');
    this.countrySuggestions = page.locator('.ui-menu-item');
    this.passengerSummary = page.locator('#divpaxinfo');
    this.passengerOptions = page.locator('#divpaxOptions');
    this.adultCount = page.locator('#spanAudlt');
    this.increaseAdult = page.locator('#hrefIncAdt');
    this.decreaseAdult = page.locator('#hrefDecAdt');
    this.increaseChild = page.locator('#hrefIncChd');
    this.doneButton = page.locator('#btnclosepaxoption');
    this.oneWayRadio = page.locator('#ctl00_mainContent_rbtnl_Trip_0');
    this.roundTripRadio = page.locator('#ctl00_mainContent_rbtnl_Trip_1');
    this.returnDate = page.locator('#Div1');
    this.departureInput = page.locator('#ctl00_mainContent_ddl_originStation1_CTXT');
    this.departureOptions = page.locator('#glsctl00_mainContent_ddl_originStation1_CTNR');
    this.arrivalOptions = page.locator('#glsctl00_mainContent_ddl_destinationStation1_CTNR');
    this.arrivalInput = page.locator('#ctl00_mainContent_ddl_destinationStation1_CTXT');
    this.familyAndFriendsDiscount = page.locator('#ctl00_mainContent_chk_friendsandfamily');
    this.seniorCitizenDiscount = page.locator('#ctl00_mainContent_chk_SeniorCitizenDiscount');
  }

  async selectCurrency(currency: string): Promise<void> {
    await this.currencySelect.selectOption({ label: currency });
  }

  async searchCountry(searchText: string): Promise<void> {
    await this.countryInput.pressSequentially(searchText);
  }

  async selectCountry(searchText: string, country: string): Promise<void> {
    await this.searchCountry(searchText);
    await this.countrySuggestions.getByText(country, { exact: true }).click();
  }

  async openPassengerSelector(): Promise<void> {
    await this.passengerSummary.click();
    await this.increaseAdult.waitFor({ state: 'visible' });
  }

  async addPassengers(adults: number, children: number): Promise<void> {
    await this.openPassengerSelector();
    for (let count = 0; count < adults; count += 1) {
      await this.increaseAdult.click();
    }
    for (let count = 0; count < children; count += 1) {
      await this.increaseChild.click();
    }
    await this.doneButton.click();
  }

  async increaseAdultsToMaximum(): Promise<number> {
    await this.openPassengerSelector();
    while (!(await this.increaseAdult.getAttribute('class'))?.includes('pax-disabled')) {
      await this.increaseAdult.click();
    }
    return Number(await this.adultCount.innerText());
  }

  async selectDepartureCity(city: string): Promise<void> {
    await this.departureInput.click();
    await this.departureOptions.getByRole('link', { name: city, exact: true }).click();
  }

  async selectArrivalCity(city: string): Promise<void> {
    await this.arrivalOptions.getByRole('link', { name: city, exact: true }).click();
  }
}
