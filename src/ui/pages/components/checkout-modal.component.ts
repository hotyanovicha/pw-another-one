import { expect, Page } from '@playwright/test';
import { step } from '@/utils/step.decorator';

export class CheckoutModal {
	private readonly registerLink = this.page.getByRole('link', { name: 'Register / Login' });

	constructor(private page: Page) {}

	@step()
	async waitForLoad(): Promise<this> {
		await expect(this.registerLink).toBeVisible();
		return this;
	}

	@step()
	async openRegisterLink(): Promise<void> {
		await this.registerLink.click();
	}
}
