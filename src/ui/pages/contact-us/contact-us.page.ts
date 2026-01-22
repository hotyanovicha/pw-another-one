import { BasePage } from '@/ui/pages/base.page';
import { step } from '@/utils/step.decorator';
import { expect } from '@playwright/test';

export class ContactUs extends BasePage {
	protected readonly uniqueElement = this.page.getByRole('heading', { name: 'Contact Us' });
	private readonly getInTouchTitle = this.page.getByRole('heading', { name: 'Get In Touch' });
	private readonly nameField = this.page.getByTestId('name');
	private readonly emailField = this.page.getByTestId('email');
	private readonly subjectField = this.page.getByTestId('subject');
	private readonly messageField = this.page.getByTestId('message');
	private readonly fileUpload = this.page.getByRole('button', { name: 'Choose File' });
	private readonly submitButton = this.page.getByTestId('submit-button');

	@step()
	async assertTitleisDisplayed(): Promise<void> {
		await expect(this.getInTouchTitle).toHaveText('Get In Touch');
	}

	@step()
	async assertFormVisibleFields(): Promise<void> {
		await expect.soft(this.nameField).toBeVisible();
		await expect.soft(this.emailField).toBeVisible();
		await expect.soft(this.subjectField).toBeVisible();
		await expect.soft(this.messageField).toBeVisible();
		await expect.soft(this.fileUpload).toBeVisible();
		await expect.soft(this.submitButton).toBeVisible();
	}
}
