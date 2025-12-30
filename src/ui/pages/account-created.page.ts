import { expect } from '@playwright/test';
import { BasePage } from './base.page';

export class AccountCreatedPage extends BasePage {
    protected readonly uniqueElement = this.page.locator('[data-qa="account-created"]');
    private readonly continueButton = this.page.locator('[data-qa="continue-button"]');
    

    async isLoaded(): Promise<this> {
        await super.isLoaded();
        await expect.soft(this.uniqueElement).toHaveText('Account Created!');
        return this;
    }

    async clickContinueButton(): Promise<void> {
        await this.continueButton.click();
    }
}