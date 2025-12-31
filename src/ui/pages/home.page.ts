import { BasePage } from './base.page';
import { step } from '../../utils/step.decorator';

export class HomePage extends BasePage {
  protected readonly uniqueElement = this.page.locator('.logo');

  private readonly signupLoginLink = this.page.getByRole('link', { name: 'Signup / Login' });

  @step()
  async open(): Promise<this> {
    await this.page.goto('/');
    await this.isLoaded();
    return this;
  }

  @step()
  async clickSignupLoginLink(): Promise<void> {
    await this.signupLoginLink.click();
  }
}