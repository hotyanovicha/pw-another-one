import { expect } from '@playwright/test';
import { BasePage } from '@/ui/pages/base.page';
import { step } from '@/utils/step.decorator';
import { rowByName } from '@/utils/table';
import { OrderTable } from '../components/order-table.component';
import { CartItem } from '@/ui/types/cart.types';

export class CartPage extends BasePage {
	protected readonly uniqueElement = this.page.locator('section#cart_items');
	private readonly rows = this.page
		.locator('#cart_info_table tbody tr')
		.filter({ has: this.page.locator('.cart_description a') });
	private readonly proceedBtn = this.page.locator('a.check_out');

	private readonly emptyCart = this.page.locator('#empty_cart p', { hasText: 'Cart is empty!' });

	private readonly orderTable = new OrderTable(this.rows);

	@step()
	async open() {
		await this.page.goto('/view_cart');
	}

	@step()
	async deleteProduct(productName: string) {
		await this.page
			.getByRole('row', { name: `${productName}` })
			.locator('.cart_quantity_delete')
			.click();
	}

	@step()
	async clickProceedCheckout() {
		await this.proceedBtn.click();
	}

	@step()
	async assertProductDeleted(productName: string) {
		await expect
			.poll(async () => await rowByName(this.rows, productName).count(), {
				timeout: 5000,
				message: `Expected "${productName}" to be removed from cart`,
			})
			.toBe(0);
	}

	@step()
	async assertCartEmpty() {
		await expect(this.emptyCart).toBeVisible();
	}

	@step()
	async validateCartItems(expected: CartItem[]) {
		return await this.orderTable.validateCartItems(expected);
	}
}
