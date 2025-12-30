import { expect, Page } from '@playwright/test';

export class HeaderComponent {
  private readonly homeLink = this.page.getByRole('link', { name: 'Home' });
  private readonly userName = this.page.locator('a:has-text("Logged in as") b');

  constructor(private page: Page) {}

  async isLoaded(): Promise<this> {
    await expect(this.homeLink).toBeVisible();
    return this;
  }

  async assertUserName(name: string): Promise<void> {
    await expect(this.userName).toHaveText(name);
  }
}