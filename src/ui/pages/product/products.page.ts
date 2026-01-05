import { expect } from '@playwright/test';
import { BasePage } from '@/ui/pages/base.page';
import { step } from '@/utils/step.decorator';
import { ProductPage } from './product.page';

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

	/* Code Quality

  Duplicate logic (lines 24-31 & 39-44):
  // Same pattern repeated twice:
  let i = index;
  if (i === undefined) {
      expect(count).toBeGreaterThan(1);
      i = 1 + Math.floor(Math.random() * (count - 1));
  }
  Consider: Extract to private method private resolveIndex(count: number, index?: number): number

  addToCart does too many things:
  - Counts products
  - Resolves index
  - Scrolls & hovers
  - Extracts product name
  - Extracts price
  - Clicks add to cart
  - Returns data

  Consider: Split into getProductInfo(index) + addToCart(index) - one for data extraction, one for action

  Inline locators in method body:
  productCard.locator('.product-overlay a.add-to-cart')
  productCard.locator('.product-overlay h2')
  productCard.locator('.product-overlay p')
  These should be private locators at class level for maintainability

  Magic number 1:
  i = 1 + Math.floor(Math.random() * (count - 1));
  Why skip index 0? Add comment or extract to constant like SKIP_FIRST_PRODUCT = 1

  Missing JSDoc:
  /**
   * Opens product detail page
   * @param index - Product index. If undefined, selects random product (excluding first)
   */

	@step()
	async openProductPage(index?: number): Promise<ProductPage> {
		const count = await this.viewProductLinks.count();
		expect(count).toBeGreaterThan(0);
		let i = index;

		if (i === undefined) {
			expect(count).toBeGreaterThan(1);
			i = 1 + Math.floor(Math.random() * (count - 1));
		}
		await this.viewProductLinks.nth(i).click();
		return new ProductPage(this.page);
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
