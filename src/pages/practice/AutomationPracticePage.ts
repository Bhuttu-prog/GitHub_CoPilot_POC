import { type Locator, type Page } from '@playwright/test';
import { RoutablePage } from '@pages/RoutablePage';
import { parseAmount } from '@utils/currency';

export type DialogResponse = 'accept' | 'dismiss';
export type DialogDetails = { type: string; message: string };

export class AutomationPracticePage extends RoutablePage {
  protected readonly path = '/AutomationPractice/';

  readonly countryAutocomplete: Locator;
  readonly autocompleteOptions: Locator;
  readonly dropdown: Locator;
  readonly openWindowButton: Locator;
  readonly nameInput: Locator;
  readonly alertButton: Locator;
  readonly confirmButton: Locator;
  readonly hideButton: Locator;
  readonly showButton: Locator;
  readonly toggleableTextbox: Locator;
  readonly employeeAmountCells: Locator;
  readonly totalAmountCollected: Locator;
  readonly mouseHoverButton: Locator;
  readonly mouseHoverTopLink: Locator;

  constructor(page: Page) {
    super(page);
    this.countryAutocomplete = page.getByPlaceholder('Type to Select Countries');
    this.autocompleteOptions = page.locator('.ui-autocomplete .ui-menu-item');
    this.dropdown = page.locator('#dropdown-class-example');
    this.openWindowButton = page.getByRole('button', { name: 'Open Window' });
    this.nameInput = page.getByPlaceholder('Enter Your Name');
    this.alertButton = page.getByRole('button', { name: 'Alert' });
    this.confirmButton = page.getByRole('button', { name: 'Confirm' });
    this.hideButton = page.getByRole('button', { name: 'Hide' });
    this.showButton = page.getByRole('button', { name: 'Show' });
    this.toggleableTextbox = page.getByPlaceholder('Hide/Show Example');
    this.employeeAmountCells = page.locator('.tableFixHead tbody td:nth-child(4)');
    this.totalAmountCollected = page.locator('.totalAmount');
    this.mouseHoverButton = page.getByRole('button', { name: 'Mouse Hover' });
    this.mouseHoverTopLink = page.locator('.mouse-hover-content').getByRole('link', { name: 'Top' });
  }

  radioButton(value: string): Locator {
    return this.page.locator(`input[name="radioButton"][value="${value}"]`);
  }

  checkbox(value: string): Locator {
    return this.page.locator(`#checkbox-example input[value="${value}"]`);
  }

  async selectCountryFromSuggestions(searchText: string, country: string): Promise<void> {
    await this.countryAutocomplete.pressSequentially(searchText);
    await this.autocompleteOptions.getByText(country, { exact: true }).click();
  }

  async triggerAlert(name: string): Promise<DialogDetails> {
    await this.nameInput.fill(name);
    return this.respondToDialog(this.alertButton, 'accept');
  }

  async triggerConfirm(name: string, response: DialogResponse): Promise<DialogDetails> {
    await this.nameInput.fill(name);
    return this.respondToDialog(this.confirmButton, response);
  }

  async openNewWindow(): Promise<Page> {
    const popupPromise = this.page.waitForEvent('popup');
    await this.openWindowButton.click();
    return popupPromise;
  }

  async employeeAmounts(): Promise<number[]> {
    return (await this.employeeAmountCells.allInnerTexts()).map(parseAmount);
  }

  async totalAmountCollectedValue(): Promise<number> {
    return parseAmount(await this.totalAmountCollected.innerText());
  }

  private async respondToDialog(trigger: Locator, response: DialogResponse): Promise<DialogDetails> {
    const dialogDetails = new Promise<DialogDetails>((resolve) => {
      this.page.once('dialog', async (dialog) => {
        resolve({ type: dialog.type(), message: dialog.message() });
        await dialog[response]();
      });
    });
    await trigger.click();
    return dialogDetails;
  }
}
