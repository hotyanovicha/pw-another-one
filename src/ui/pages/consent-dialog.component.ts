import { Page } from '@playwright/test';

export class ConsentDialog {
  private readonly button = this.page.getByRole('button', { name: 'Consent' });

  constructor(private page: Page) {}

  async acceptIfVisible(): Promise<void> {
    if (await this.button.isVisible({ timeout: 1500 }).catch(() => false)) {
      await this.button.click();
    }
  }
}