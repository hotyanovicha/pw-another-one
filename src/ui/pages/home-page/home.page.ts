import { BasePage } from '@/ui/pages/base.page';
import { step } from '@/utils/step.decorator';

export class HomePage extends BasePage {
	protected readonly uniqueElement = this.page.locator('.logo');

	private readonly signupLoginLink = this.page.getByRole('link', { name: 'Signup / Login' });

	@step()
	async open(): Promise<void> {
		await this.page.goto('/');
	}

	@step()
	async clickSignupLoginLink(): Promise<void> {
		await this.signupLoginLink.click();
	}
}
