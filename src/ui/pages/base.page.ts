import { Page, Locator, expect } from '@playwright/test';
import { ConsentDialog } from './consent-dialog.component';
import { HeaderComponent } from './header.component';

export abstract class BasePage {
  protected abstract readonly uniqueElement: Locator;
  private readonly consentDialog: ConsentDialog;
  private readonly header: HeaderComponent;

  constructor(protected page: Page) {
    this.consentDialog = new ConsentDialog(this.page);
    this.header = new HeaderComponent(this.page);
  }

  async goto(url: string): Promise<this> {
    await this.page.goto(url);
    return this;
  }

  async isLoaded(): Promise<this> {
    await expect(this.uniqueElement).toBeVisible();
    return this;
  }

  async assertUrl(url: string): Promise<void> {
    await expect(this.page).toHaveURL(url);
  }
}