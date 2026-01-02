import { expect, Page } from '@playwright/test';
import { step } from '@/utils/step.decorator';

export class HeaderComponent {
	private readonly homeLink = this.page.getByRole('link', { name: 'Home' });
	private readonly userName = this.page.locator('a:has-text("Logged in as") b');

	constructor(private page: Page) {}

	@step()
	async isLoaded(): Promise<this> {
		await expect(this.homeLink).toBeVisible();
		return this;
	}

	@step()
	async assertUserName(name: string): Promise<void> {
		await expect(this.userName).toHaveText(name);
	}
}
