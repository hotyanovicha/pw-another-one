import { step } from '@/utils/step.decorator';
import { expect, Page } from '@playwright/test';

export class CategoryComponent {
	private categoryPanel = this.page.locator('.panel-group.category-products');
	private categories = this.page.locator('.panel-title a');

	constructor(private page: Page) {}

	@step()
	async selectCategoryOption(category: string, option: string): Promise<void> {
		await this.categories.filter({ hasText: new RegExp(`^\\s*${this.escapeRegExp(category)}\\s*$`) }).click();
		await this.page.locator(`#${category}`).locator(`li a:has-text("${option}")`).click();
	}

	@step()
	async assertCategoryPannelExist(): Promise<void> {
		await expect(this.categoryPanel).toBeVisible();
	}

	@step()
	async verifyCategoriesAndOptions(expectedCategories: Record<string, readonly string[]>): Promise<void> {
		for (const [category, options] of Object.entries(expectedCategories)) {
			const categoryLink = this.categories.filter({ hasText: new RegExp(`^\\s*${this.escapeRegExp(category)}\\s*$`) });

			await expect(categoryLink).toBeVisible();
			const href = await categoryLink.getAttribute('href');
			if (!href) throw new Error(`Category link for ${category} has no href`);

			const targetId = href.replace('#', '');
			const subCategoryPanel = this.page.locator(`#${targetId}`);

			if (!(await subCategoryPanel.isVisible())) {
				await categoryLink.click();
			}

			await expect(subCategoryPanel).toBeVisible();

			for (const option of options) {
				await expect(subCategoryPanel.locator(`li a:has-text("${option}")`)).toBeVisible();
			}
		}
	}
	private escapeRegExp(string: string): string {
		return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}
}
