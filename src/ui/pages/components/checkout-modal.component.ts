import { expect, Page } from '@playwright/test';
import { step } from '@/utils/step.decorator';

export class CheckoutModal {
	private readonly registerLnk = this.page.getByRole('link', { name: 'Register / Login' });

	constructor(private page: Page) {}

	@step()
	async isLoaded(): Promise<this> {
		await expect(this.registerLnk).toBeVisible();
		return this;
	}

	@step()
	async openRegisterLink(): Promise<void> {
		await this.registerLnk.click();
	}
}
