import { BasePage } from '@/ui/pages/base.page';
import { step } from '@/utils/step.decorator';
import { Person } from '@/utils/person.factory';
import { expect, Locator } from '@playwright/test';
import { toNumber } from '@/utils/convert-data';
import { OrderTable } from '../components/order-table.component';
import { CartItem } from '@/ui/types/cart.types';

export class CheckoutPage extends BasePage {
	protected readonly uniqueElement = this.page.locator('h2.heading', { hasText: 'Address Details' });

	private readonly addressDelivery = this.page.locator('#address_delivery');
	private readonly addressInvoice = this.page.locator('#address_invoice');

	private readonly rows = this.page
		.locator('#cart_info tbody tr[id]')
		.filter({ has: this.page.locator('.cart_description a') });
	private readonly totalText = this.page
		.locator('#cart_info tbody tr')
		.filter({ hasText: 'Total Amount' })
		.locator('.cart_total_price');

	private readonly placeOrderBtn = this.page.getByRole('link', { name: 'Place Order' });

	private readonly orderTable = new OrderTable(this.rows);

	@step()
	async assertAddress(user: Person) {
		await this.assertAddressBlock(this.addressDelivery, user);
		await this.assertAddressBlock(this.addressInvoice, user);
	}

	@step()
	async clickPlaceOrder() {
		await this.placeOrderBtn.click();
	}

	@step()
	async validateCartItems(expected: CartItem[]) {
		return await this.orderTable.validateCartItems(expected);
	}

	@step()
	async assertCartTotal(expected: number) {
		expect
			.soft(toNumber(await this.totalText.innerText()), { message: `Total cart amount should be ${expected}` })
			.toBe(expected);
	}

	private async assertAddressBlock(block: Locator, user: Person) {
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
}
