import { BasePage } from '@/ui/pages/base.page';
import { step } from '@/utils/step.decorator';
import { Person } from '@/utils/person.factory';
import { expect, Locator } from '@playwright/test';
import { CartItem } from '@/ui/types/cart.types';
import { toNumber } from '@/utils/convert-data';
import { rowByName, getRowPrice, getRowQuantity, getRowLineTotal } from '@/utils/table';

export class CheckoutPage extends BasePage {
	protected readonly uniqueElement = this.page.locator('h2.heading', { hasText: 'Address Details' });

	private readonly address_delivery = this.page.locator('#address_delivery');
	private readonly address_invoice = this.page.locator('#address_invoice');

	private readonly rows = this.page
		.locator('#cart_info tbody tr[id]')
		.filter({ has: this.page.locator('.cart_product') });
	private readonly totalText = this.page
		.locator('#cart_info tbody tr')
		.filter({ hasText: 'Total Amount' })
		.locator('.cart_total_price');

	private readonly productNameLink = this.page.locator('td.cart_description a');

	private readonly placeOrderBtn = this.page.getByRole('link', { name: 'Place Order' });

	@step()
	async assertAddress(user: Person): Promise<void> {
		await this.assertAddressBlock(this.address_delivery, user);
		await this.assertAddressBlock(this.address_invoice, user);
	}

	@step()
	async validateCartItems(expected: CartItem[]): Promise<number> {
		await expect(this.rows.first()).toBeVisible();
		await expect(this.rows).toHaveCount(expected.length);
		let cartTotal = 0;

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

			cartTotal += uiLineTotal;
		}
		return cartTotal;
	}

	@step()
	async clickPlaceOrder(): Promise<void> {
		await this.placeOrderBtn.click();
	}

	private async assertAddressBlock(block: Locator, user: Person): Promise<void> {
		const fullName = `${user.title} ${user.firstName} ${user.lastName}`;
		const fullAddress = `${user.city} ${user.state} ${user.zipcode}`;

		await expect.soft(block.getByText(fullName)).toBeVisible();
		await expect.soft(block.getByText(user.company)).toBeVisible();
		await expect.soft(block.getByText(user.address1)).toBeVisible();
		await expect.soft(block.getByText(user.address2)).toBeVisible();
		await expect.soft(block.getByText(fullAddress)).toBeVisible();
		await expect.soft(block.getByText(user.country)).toBeVisible();
		await expect.soft(block.getByText(user.mobile)).toBeVisible();
	}

	@step()
	async assertCartTotal(expected: number): Promise<void> {
		expect
			.soft(toNumber(await this.totalText.innerText()), { message: `Total cart amount should be ${expected}` })
			.toBe(expected);
	}
}
