import { expect } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginSignupPage extends BasePage {
  protected readonly uniqueElement = this.page.locator('.signup-form');
  
  private readonly newUserSignupHeading = this.uniqueElement.getByRole('heading', { name: 'New User Signup!' });
  private readonly nameInput = this.page.locator('[data-qa="signup-name"]');
  private readonly emailInput = this.page.locator('[data-qa="signup-email"]');
  private readonly signupButton = this.page.getByRole('button', { name: 'Signup' });


  async isLoaded(): Promise<this> {
    await super.isLoaded();
    await expect.soft(this.newUserSignupHeading).toBeVisible();
    return this;
  }

  async enterNameAndEmail(name: string, email: string): Promise<void> {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
  }

  async clickSignupButton(): Promise<void> {
    await this.signupButton.click();
}}