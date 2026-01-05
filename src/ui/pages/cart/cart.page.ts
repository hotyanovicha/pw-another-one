import { expect, Locator } from '@playwright/test';
import { BasePage } from '@/ui/pages/base.page';
import { step } from '@/utils/step.decorator';

type CartItem = {
	name: string;
	price: number;
	quantity: number;
};

export class CartPage extends BasePage {
	protected readonly uniqueElement = this.page.locator('section#cart_items');
	private readonly rows = this.page.locator('#cart_info_table tbody tr');

	private readonly emptyCart = this.page.locator('#empty_cart p', { hasText: 'Cart is empty!' });

	@step()
	async open(): Promise<void> {
		await this.page.goto('/view_cart');
	}

	@step()
	async deleteProduct(productname: string): Promise<void> {
		await this.page
			.getByRole('row', { name: `${productname}` })
			.locator('.cart_quantity_delete')
			.click();
	}

	@step()
	async assertProductDeleted(productname: string): Promise<void> {
		await expect
			.poll(async () => await this.rowByName(productname).count(), {
				timeout: 5000,
				message: `Expected "${productname}" to be removed from cart`,
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
			const row = this.rowByName(item.name);
			await expect(row).toBeVisible();

			const uiPrice = await this.getRowPrice(row);
			const uiQty = await this.getRowQuantity(row);
			const uiLineTotal = await this.getRowLineTotal(row);

			expect.soft(uiPrice, { message: `Price for "${item.name}" should be ${item.price}` }).toBe(item.price);
			expect.soft(uiQty, { message: `Quantity for "${item.name}" should be ${item.quantity}` }).toBe(item.quantity);
			expect
				.soft(uiLineTotal, { message: `Line total for "${item.name}" should be ${item.price * item.quantity}` })
				.toBe(item.price * item.quantity);
		}
	}

	private rowByName(name: string): Locator {
		return this.rows.filter({ has: this.page.locator('td.cart_description a', { hasText: name }) }).first();
	}

	private async getRowPrice(row: Locator): Promise<number> {
		const text = (await row.locator('td.cart_price p').innerText()).trim();
		return this.toNumber(text);
	}

	private async getRowQuantity(row: Locator): Promise<number> {
		const text = (await row.locator('td.cart_quantity button.disabled').innerText()).trim();
		return this.toNumber(text);
	}

	private async getRowLineTotal(row: Locator): Promise<number> {
		const text = (await row.locator('td.cart_total p.cart_total_price').innerText()).trim();
		return this.toNumber(text);
	}

	private toNumber(text: string): number {
		return Number(text.replace(/[^\d]/g, '')) || 0;
	}
}
