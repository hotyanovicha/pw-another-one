import { BasePage } from './base.page';

export class HomePage extends BasePage {
  protected readonly uniqueElement = this.page.locator('.logo');

  private readonly signupLoginLink = this.page.getByRole('link', { name: 'Signup / Login' });

  async open(): Promise<this> {
    await this.page.goto('/');
    await this.isLoaded();
    return this;
  }

  async clickSignupLoginLink(): Promise<void> {
    await this.signupLoginLink.click();
  }
}