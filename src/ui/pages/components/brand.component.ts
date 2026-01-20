import { step } from '@/utils/step.decorator';

import { expect, Page } from '@playwright/test';

export class BrandComponent {
	private brandPanel = this.page.locator('.brands_products');
	private brandNames = this.page.locator('.brands-name');

	constructor(private page: Page) {}

	@step()
	async selectBrand(brand: string): Promise<void> {
		await this.brandNames.getByRole('link', { name: brand }).click();
	}

	@step()
	async assertBrandPanelExists(): Promise<void> {
		await expect(this.brandPanel).toBeVisible();
	}

	@step()
	async verifyBrandsList(brands: Record<string, string>): Promise<void> {
		for (const brand of Object.values(brands)) {
			const brandItem = this.brandNames.getByRole('link', { name: brand });
			await expect(brandItem).toBeVisible();
		}
	}
}
