import { expect } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../../utils/step.decorator';

export class LoginSignupPage extends BasePage {
  protected readonly uniqueElement = this.page.locator('.signup-form');

  private readonly newUserSignupHeading = this.uniqueElement.getByRole('heading', { name: 'New User Signup!' });
  private readonly nameInput = this.page.locator('[data-qa="signup-name"]');
  private readonly emailInput = this.page.locator('[data-qa="signup-email"]');
  private readonly signupButton = this.page.getByRole('button', { name: 'Signup' });

  private readonly loginEmailInput = this.page.locator('[data-qa="login-email"]');
  private readonly loginPasswordInput = this.page.locator('[data-qa="login-password"]');
  private readonly loginButton = this.page.getByRole('button', { name: 'Login' });


  @step()
  async isLoaded(): Promise<this> {
    await super.isLoaded();
    await expect.soft(this.newUserSignupHeading).toBeVisible();
    return this;
  }

  @step()
  async enterNameAndEmail(name: string, email: string): Promise<void> {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
  }

  @step()
  async clickSignupButton(): Promise<void> {
    await this.signupButton.click();
  }

  @step()
  async login(email: string, password: string): Promise<void> {
    await this.loginEmailInput.fill(email);
    await this.loginPasswordInput.fill(password);
    await this.loginButton.click();
  }
}