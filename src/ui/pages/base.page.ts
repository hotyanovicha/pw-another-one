import { Page, Locator, expect } from '@playwright/test';
import { step } from '@/utils/step.decorator';

export abstract class BasePage {
	protected abstract readonly uniqueElement: Locator;

	constructor(protected page: Page) {}

	@step()
	async goto(url: string) {
		await this.page.goto(url);
		return this;
	}

	@step()
	async isLoaded() {
		await expect(this.uniqueElement).toBeVisible();
		return this;
	}

	@step()
	async assertUrl(url: string) {
		await expect(this.page).toHaveURL(url);
	}

	@step()
	async clickBack() {
		await this.page.goBack();
	}

	@step()
	async assertElementVisible(locator: Locator) {
		await expect(locator).toBeVisible();
	}
}
