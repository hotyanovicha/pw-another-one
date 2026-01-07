import { expect } from '@playwright/test';
import { BasePage } from '@/ui/pages/base.page';
import { step } from '@/utils/step.decorator';
import { CartItem } from '@/ui/types/cart.types';
import { rowByName, getRowPrice, getRowQuantity, getRowLineTotal } from '@/utils/table';

export class CartPage extends BasePage {
	protected readonly uniqueElement = this.page.locator('section#cart_items');
	private readonly rows = this.page.locator('#cart_info_table tbody tr');
	private readonly productNameLink = this.page.locator('td.cart_description a');
	private readonly proceedBtn = this.page.locator('a.check_out');

	private readonly emptyCart = this.page.locator('#empty_cart p', { hasText: 'Cart is empty!' });

	@step()
	async open(): Promise<void> {
		await this.page.goto('/view_cart');
	}

	@step()
	async deleteProduct(productName: string): Promise<void> {
		await this.page
			.getByRole('row', { name: `${productName}` })
			.locator('.cart_quantity_delete')
			.click();
	}

	@step()
	async clickProceedCheckout(): Promise<void> {
		await this.proceedBtn.click();
	}

	@step()
	async assertProductDeleted(productName: string): Promise<void> {
		await expect
			.poll(async () => await rowByName(this.rows, this.productNameLink, productName).count(), {
				timeout: 5000,
				message: `Expected "${productName}" to be removed from cart`,
			})
			.toBe(0);
	}

	@step()
	async assertCartEmpty(): Promise<void> {
		await expect(this.emptyCart).toBeVisible();
	}

	@step()
	async assertCartIsCorrect(expected: CartItem[]): Promise<void> {
		await expect(this.rows.first()).toBeVisible();
		await expect(this.rows).toHaveCount(expected.length);

		for (const item of expected) {
			const row = rowByName(this.rows, this.productNameLink, item.name);
			await expect(row).toBeVisible();

			const uiPrice = await getRowPrice(row);
			const uiQty = await getRowQuantity(row);
			const uiLineTotal = await getRowLineTotal(row);

			expect.soft(uiPrice, { message: `Price for "${item.name}" should be ${item.price}` }).toBe(item.price);
			expect.soft(uiQty, { message: `Quantity for "${item.name}" should be ${item.quantity}` }).toBe(item.quantity);
			expect
				.soft(uiLineTotal, { message: `Line total for "${item.name}" should be ${item.price * item.quantity}` })
				.toBe(item.price * item.quantity);
		}
	}
}
