import { BasePage } from '@/ui/pages/base.page';
import { CreditCard } from '@/ui/test-data/constants/credit-card';
import { step } from '@/utils/step.decorator';
import { expect, Download } from '@playwright/test';
import { Person } from '@/utils/person.factory';
import { promises as fs } from 'fs';

export class PaymentPage extends BasePage {
	protected readonly uniqueElement = this.page.getByRole('heading', { name: 'Payment' });

	private readonly cardName = this.page.getByTestId('name-on-card');
	private readonly cardNumber = this.page.getByTestId('card-number');
	private readonly cardCvc = this.page.getByTestId('cvc');
	private readonly cardExpiryMonth = this.page.getByTestId('expiry-month');
	private readonly cardExpiryYear = this.page.getByTestId('expiry-year');

	private readonly payBtn = this.page.getByRole('button', { name: 'Pay and Confirm Order' });
	private readonly orderPlacedTitle = this.page.getByTestId('order-placed').locator('b');
	private readonly orderPlacedMsg = this.page.getByText('Congratulations! Your order has been confirmed!');
	private readonly continueBtn = this.page.getByTestId('continue-button');
	private readonly downloadInvoice = this.page.getByRole('link', { name: 'Download Invoice' });

	@step()
	async enterCreditCard(card: CreditCard, user: Person) {
		await this.cardName.fill(`${user.firstName} ${user.lastName}`);
		await this.cardNumber.fill(card.number);
		await this.cardCvc.fill(card.cvv);
		await this.cardExpiryMonth.fill(card.month);
		await this.cardExpiryYear.fill(card.year);
	}

	@step()
	async clickPayConfirm() {
		await this.payBtn.click();
	}

	@step()
	async clickDownloadInvoice() {
		const [download] = await Promise.all([this.page.waitForEvent('download'), this.downloadInvoice.click()]);
		return download;
	}

	@step()
	async clickContinue() {
		await this.continueBtn.click();
	}

	@step()
	async assertOrderPlaced() {
		await expect.soft(this.orderPlacedTitle).toHaveText(/order placed!/i);
		await expect.soft(this.orderPlacedMsg).toBeVisible();
	}

	@step()
	async assertInvoiceValid(download: Download, expected: { customer: Person; amount: number }) {
		const filePath = await download.path();
		expect(filePath).toBeTruthy();

		const content = await fs.readFile(filePath!, 'utf-8');
		expect.soft(content).toContain(`${expected.customer.firstName} ${expected.customer.lastName}`);
		expect.soft(content).toContain(expected.amount.toString());
	}
}
