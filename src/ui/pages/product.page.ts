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

	private readonly cartModal = this.page.locator('#cartModal');
	private readonly continueShoppingBtn = this.cartModal.getByRole('button', { name: 'Continue Shopping' });
	private readonly viewCartLnk = this.cartModal.getByRole('link', { name: 'View Cart' });

	@step()
	async addToCart(amount = 1): Promise<void> {
		await this.quantityInput.fill(String(amount));
		await this.addToCartBtn.click();
		await expect.soft(this.cartModal).toBeVisible();
	}
	@step()
	async openCart(): Promise<void> {
		await expect(this.cartModal).toBeVisible();
		await this.viewCartLnk.click();
	}
	@step()
	async continueShopping(): Promise<void> {
		await expect(this.cartModal).toBeVisible();
		await this.continueShoppingBtn.click();
		await expect(this.cartModal).toBeHidden();
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
