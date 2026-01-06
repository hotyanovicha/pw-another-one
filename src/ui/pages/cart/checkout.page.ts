import { BasePage } from '@/ui/pages/base.page';
import { step } from '@/utils/step.decorator';
import { Person } from '@/utils/person.factory';
import { expect, Locator } from '@playwright/test';

type CartItem = {
	name: string;
	price: number;
	quantity: number;
};

export class CheckoutPage extends BasePage {
	public readonly uniqueElement = this.page.locator('h2.heading', { hasText: 'Address Details' });

	private readonly address_delivery = this.page.locator('#address_delivery');
	private readonly address_invoice = this.page.locator('#address_invoice');

	private readonly rows = this.page.locator('#cart_info tbody tr');
	private readonly totalText = this.page.locator('.cart_total_price');

	private readonly placeOrderBtn = this.page.locator('a.btn.btn-success', { hasText: 'Place Order' });

	@step()
	async assertAddress(user: Person): Promise<void> {
		const userData = user;
		const fullName = userData.title + ' ' + userData.firstName + ' ' + userData.lastName;
		const fullAddress = userData.city + ' ' + userData.state + ' ' + userData.zipcode;

		await expect.soft(this.address_delivery.getByText(fullName)).toBeVisible();
		await expect.soft(this.address_delivery.getByText(userData.company)).toBeVisible();
		await expect.soft(this.address_delivery.getByText(userData.address1)).toBeVisible();
		await expect.soft(this.address_delivery.getByText(userData.address2)).toBeVisible();
		await expect.soft(this.address_delivery.getByText(fullAddress)).toBeVisible();
		await expect.soft(this.address_delivery.getByText(userData.country)).toBeVisible();
		await expect.soft(this.address_delivery.getByText(userData.mobile)).toBeVisible();

		await expect.soft(this.address_invoice.getByText(fullName)).toBeVisible();
		await expect.soft(this.address_invoice.getByText(userData.company)).toBeVisible();
		await expect.soft(this.address_invoice.getByText(userData.address1)).toBeVisible();
		await expect.soft(this.address_invoice.getByText(userData.address2)).toBeVisible();
		await expect.soft(this.address_invoice.getByText(fullAddress)).toBeVisible();
		await expect.soft(this.address_invoice.getByText(userData.country)).toBeVisible();
		await expect.soft(this.address_invoice.getByText(userData.mobile)).toBeVisible();
	}

	@step()
	async assertOrderProducts(expected: CartItem[]): Promise<void> {
		await expect(this.rows.first()).toBeVisible();
		await expect(this.rows).toHaveCount(expected.length);
		let cartTotal = 0;

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

			cartTotal += uiLineTotal;
		}
		const totalCart = (await this.totalText.innerText()).trim();
		expect.soft(this.toNumber(totalCart), { message: `Total cart amount should be ${cartTotal}` }).toBe(cartTotal);
	}

	@step()
	async clickPlaceOrder(): Promise<void> {
		await this.placeOrderBtn.click();
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
