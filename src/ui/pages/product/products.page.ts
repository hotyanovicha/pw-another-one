import { expect } from '@playwright/test';
import { BasePage } from '@/ui/pages/base.page';
import { step } from '@/utils/step.decorator';
import { ProductPage } from './product.page';
import { ProductInfo } from '@/ui/types/product.types';

export class ProductsPage extends BasePage {
	protected readonly uniqueElement = this.page.getByRole('heading', { name: 'All Products' });

	private readonly viewProductLinks = this.page.locator('.choose a[href^="/product_details/"]');
	private readonly productCards = this.page.locator('.single-products');

	private readonly productOverlay = '.product-overlay';
	private readonly productPrice = `${this.productOverlay} h2`;
	private readonly productName = `${this.productOverlay} p`;
	private readonly addToCartButton = `${this.productOverlay} a.add-to-cart`;

	private readonly searchField = this.page.locator('#search_product');
	public readonly searchedProductsTitle = this.page.getByRole('heading', { name: 'Searched Products' });
	private readonly searchBtn = this.page.locator('#submit_search');

	@step()
	async open() {
		await this.page.goto('/products');
	}

	@step()
	async openProductPage(index?: number): Promise<ProductPage> {
		const count = await this.viewProductLinks.count();
		expect(count).toBeGreaterThan(0);

		const i = this.resolveIndex(count, index);

		await this.viewProductLinks.nth(i).click();
		return new ProductPage(this.page);
	}

	@step()
	async selectProduct(index?: number): Promise<ProductInfo> {
		const count = await this.productCards.count();
		expect(count).toBeGreaterThan(0);

		const i = this.resolveIndex(count, index);
		const productCard = this.productCards.nth(i);

		await productCard.scrollIntoViewIfNeeded();
		await expect(productCard).toBeVisible();
		await productCard.hover();

		const name = await productCard.locator(this.productName).innerText();
		const priceText = (await productCard.locator(this.productPrice).innerText()).trim();
		const price = Number(priceText.replace(/[^\d]/g, ''));

		return {
			name: name,
			price: price,
			index: i,
		};
	}

	@step()
	async addToCart(index: number) {
		const selectedProduct = this.productCards.nth(index);
		const addToCartBtn = selectedProduct.locator(this.addToCartButton);
		await addToCartBtn.click();
	}

	@step()
	async searchProduct(keyword?: string) {
		await this.searchField.fill(keyword ?? '');
		await this.searchBtn.click();
	}

	@step()
	async assertSearchExist() {
		await expect(this.searchField).toBeVisible();
	}

	@step()
	async assertProductsExist() {
		const countProducts = await this.viewProductLinks.count();
		expect(countProducts).toBeGreaterThan(2);
	}

	@step()
	async assertSearchResultsEmpty() {
		await expect(this.searchedProductsTitle).toBeVisible();
		const countProducts = await this.productCards.all();
		expect(countProducts.length).toBe(0);
	}

	@step()
	async assertSearchResults(keyword: string) {
		const products = await this.productCards.all();
		expect(products.length).toBeGreaterThan(0);
		for (const product of products) {
			const productName = await product.locator(this.productName).innerText();
			expect(productName.toLowerCase()).toContain(keyword.toLowerCase());
		}
	}

	private resolveIndex(count: number, index?: number): number {
		if (index !== undefined) {
			return index;
		}
		expect(count).toBeGreaterThan(1);
		return 1 + Math.floor(Math.random() * (count - 1));
	}
}
