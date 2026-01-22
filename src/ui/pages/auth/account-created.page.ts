import { expect } from '@playwright/test';
import { BasePage } from '@/ui/pages/base.page';
import { step } from '@/utils/step.decorator';

export class AccountCreatedPage extends BasePage {
	protected readonly uniqueElement = this.page.locator('[data-qa="account-created"]');
	private readonly continueButton = this.page.locator('[data-qa="continue-button"]');

	@step()
	async assertSuccessMessage(): Promise<void> {
		await expect.soft(this.uniqueElement).toHaveText('Account Created!');
	}

	@step()
	async clickContinueButton(): Promise<void> {
		await this.continueButton.click();
	}
}
