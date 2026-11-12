import { BasePage } from '@pages/BasePage';

export abstract class RoutablePage extends BasePage {
  protected abstract readonly path: string;

  async open(): Promise<void> {
    await this.page.goto(this.path, { waitUntil: 'domcontentloaded' });
  }
}
