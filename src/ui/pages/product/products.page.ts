import { expect } from '@playwright/test';
import { BasePage } from '@/ui/pages/base.page';
import { step } from '@/utils/step.decorator';

export type ProductInfo = {
	name: string;
	price: number;
	index: number;
};

export class ProductsPage extends BasePage {
	protected readonly uniqueElement = this.page.getByRole('heading', { name: 'All Products' });

	private readonly viewProductLinks = this.page.locator('.choose a[href^="/product_details/"]');
	private readonly productCards = this.page.locator('.single-products');

	@step()
	async open(): Promise<void> {
		await this.page.goto('/products');
	}

	@step()
	async openProductPage(index?: number): Promise<void> {
		const count = await this.viewProductLinks.count();
		expect(count).toBeGreaterThan(0);
		let i = index;

		if (i === undefined) {
			expect(count).toBeGreaterThan(1);
			i = 1 + Math.floor(Math.random() * (count - 1));
		}
		await this.viewProductLinks.nth(i).click();
	}

	@step()
	async addToCart(index?: number): Promise<ProductInfo> {
		const count = await this.productCards.count();
		expect(count).toBeGreaterThan(0);
		let i = index;
		if (i === undefined) {
			expect(count).toBeGreaterThan(1);
			i = 1 + Math.floor(Math.random() * (count - 1));
		}
		const productCard = this.productCards.nth(i);
		await productCard.scrollIntoViewIfNeeded();
		await expect(productCard).toBeVisible();
		await productCard.hover();

		const addToCart = productCard.locator('.product-overlay a.add-to-cart');
		const productCardPriceText = (await productCard.locator('.product-overlay h2').innerText()).trim();
		const productCardPrice = Number(productCardPriceText.replace(/[^\d]/g, ''));
		const productCardName = await productCard.locator('.product-overlay p').innerText();
		await addToCart.click();
		return {
			name: productCardName,
			price: productCardPrice,
			index: i,
		};
	}
	@step()
	async assertProductsExist(): Promise<void> {
		const countProducts = await this.viewProductLinks.count();
		expect(countProducts).toBeGreaterThan(2);
	}
}
