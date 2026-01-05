import { BasePage } from '@/ui/pages/base.page';
import { step } from '@/utils/step.decorator';
import { expect } from '@playwright/test';

export class ProductPage extends BasePage {
	protected readonly uniqueElement = this.page.locator('.product-details');

	private readonly addToCartBtn = this.page.getByRole('button', { name: 'Add to cart' });
	private readonly quantityInput = this.page.locator('#quantity');

	private readonly productInfo = this.page.locator('.product-information');
	private readonly productName = this.productInfo.locator('h2');
	private readonly productPriceText = this.productInfo.getByText(/^Rs\.\s*\d+/, { exact: false });

	@step()
	async addToCart(amount = 1): Promise<void> {
		await this.quantityInput.fill(String(amount));
		await this.addToCartBtn.click();
	}

	@step()
	async getProductInfo(): Promise<{
		Name: string;
		Price: number;
	}> {
		await expect(this.productInfo).toBeVisible();
		const name = (await this.productName.textContent())?.trim() ?? '';
		const priceRaw = (await this.productPriceText.first().textContent())?.trim() ?? '';
		const price = Number(priceRaw.replace(/[^\d]/g, ''));
		return { Name: name, Price: price };
	}
}
