import { expect, Page } from '@playwright/test';
import { step } from '@/utils/step.decorator';

export class HeaderComponent {
	private readonly homeLink = this.page.getByRole('link', { name: 'Home' });
	private readonly userName = this.page.locator('a:has-text("Logged in as") b');
	private readonly cartLink = this.page.getByRole('link', { name: 'Cart' });
	private readonly logoutLink = this.page.getByRole('link', { name: 'Logout' });
	constructor(private page: Page) {}

	@step()
	async isLoaded() {
		await expect(this.homeLink).toBeVisible();
		return this;
	}

	@step()
	async openCartPage() {
		await this.cartLink.click();
	}

	@step()
	async assertUserName(name: string) {
		await expect(this.userName).toContainText(name);
	}

	@step()
	async assertUserLoggedIn() {
		await expect(this.userName).toBeVisible();
	}

	@step()
	async clickLogout() {
		await this.logoutLink.click();
	}

	@step()
	async assertUserLoggedOut() {
		await expect(this.userName).toHaveCount(0);
	}
}
