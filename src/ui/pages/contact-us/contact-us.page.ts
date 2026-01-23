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
	private readonly fileUpload = this.page.locator('input[name="upload_file"]');
	private readonly submitButton = this.page.getByTestId('submit-button');
	private readonly successMessage = this.page.locator('.status.alert.alert-success');

	@step()
	async enterName(name: string): Promise<void> {
		await this.nameField.fill(name);
	}

	@step()
	async enterEmail(email: string): Promise<void> {
		await this.emailField.fill(email);
	}

	@step()
	async enterSubject(subject: string): Promise<void> {
		await this.subjectField.fill(subject);
	}

	@step()
	async enterMessage(message: string): Promise<void> {
		await this.messageField.fill(message);
	}

	@step()
	async selectUploadFile(filePath: string): Promise<void> {
		await this.fileUpload.setInputFiles(filePath);
	}

	@step()
	async submitContactUsForm(): Promise<void> {
		this.page.once('dialog', (dialog) => {
			dialog.accept();
		});
		await this.submitButton.click();
	}

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
		await expect.soft(this.fileUpload).toBeAttached();
		await expect.soft(this.submitButton).toBeVisible();
	}

	@step()
	async assertSuccessMessage(): Promise<void> {
		await expect(this.successMessage).toBeVisible();
		await expect(this.successMessage).toHaveText('Success! Your details have been submitted successfully.');
	}
}
