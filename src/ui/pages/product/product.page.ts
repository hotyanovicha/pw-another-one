import { BasePage } from '@/ui/pages/base.page';
import { step } from '@/utils/step.decorator';
import { expect } from '@playwright/test';
import { ProductInfo } from '@/ui/types/product.types';

export class ProductPage extends BasePage {
	protected readonly uniqueElement = this.page.locator('.product-details');

	private readonly addToCartBtn = this.page.getByRole('button', { name: 'Add to cart' });
	private readonly quantityInput = this.page.locator('#quantity');

	private readonly productInfo = this.page.locator('.product-information');
	private readonly productName = this.productInfo.locator('h2');
	private readonly productPriceText = this.productInfo.getByText(/^Rs\.\s*\d+/, { exact: false });
	private readonly productBrand = this.productInfo.locator('p', { hasText: 'Brand:' });

	@step()
	async addToCart(amount = 1): Promise<void> {
		await this.quantityInput.fill(String(amount));
		await this.addToCartBtn.click();
	}

	@step()
	async getProductInfo(): Promise<ProductInfo> {
		await expect(this.productInfo).toBeVisible();
		const name = (await this.productName.textContent())?.trim() ?? '';
		const priceRaw = (await this.productPriceText.first().textContent())?.trim() ?? '';
		const price = Number(priceRaw.replace(/[^\d]/g, ''));
		return { name: name, price: price, index: 0 };
	}

	@step()
	async assertProductInfo(productInfo: ProductInfo): Promise<void> {
		const opendCard = await this.getProductInfo();
		expect(opendCard.name).toBe(productInfo.name);
		expect(opendCard.price).toBe(productInfo.price);
	}

	@step()
	async getBrand(): Promise<string> {
		await expect(this.productBrand).toBeVisible();
		return (await this.productBrand.innerText()).replace('Brand:', '').trim();
	}
}
