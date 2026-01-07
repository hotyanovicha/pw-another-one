import { rowByName } from '@/utils/table';
import { expect, Locator } from '@playwright/test';
import { step } from '@/utils/step.decorator';
import { CartItem } from '@/ui/types/cart.types';
import { getRowPrice, getRowQuantity, getRowLineTotal } from '@/utils/table';

export class OrderTable {
	constructor(private rows: Locator) {}

	@step()
	async validateCartItems(expected: CartItem[]): Promise<number> {
		await expect(this.rows.first()).toBeVisible();
		await expect(this.rows).toHaveCount(expected.length);
		let cartTotal = 0;

		for (const item of expected) {
			const row = rowByName(this.rows, item.name);
			await expect(row).toBeVisible();

			const uiPrice = await getRowPrice(row);
			const uiQty = await getRowQuantity(row);
			const uiLineTotal = await getRowLineTotal(row);

			expect.soft(uiPrice, { message: `Price for "${item.name}" should be ${item.price}` }).toBe(item.price);
			expect.soft(uiQty, { message: `Quantity for "${item.name}" should be ${item.quantity}` }).toBe(item.quantity);
			expect
				.soft(uiLineTotal, { message: `Line total for "${item.name}" should be ${item.price * item.quantity}` })
				.toBe(item.price * item.quantity);

			cartTotal += uiLineTotal;
		}
		return cartTotal;
	}
}
