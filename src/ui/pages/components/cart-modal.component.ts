import { Page, expect } from '@playwright/test';
import { step } from '@/utils/step.decorator';

export class CartModal {
	private readonly cartModal = this.page.locator('#cartModal');
	private readonly continueShoppingBtn = this.cartModal.getByRole('button', { name: 'Continue Shopping' });
	private readonly viewCartLnk = this.cartModal.getByRole('link', { name: 'View Cart' });

	constructor(private page: Page) {}

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
}
