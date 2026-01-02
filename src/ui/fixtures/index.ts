import { test as base } from '@playwright/test';
import { PageManager } from '../pages/page-manager';
import { createPerson, Person } from '../../utils/person.factory';

type Fixtures = {
	pages: PageManager;
	userPages: PageManager;
	newUserPages: { pages: PageManager; user: Person };
};

export const test = base.extend<Fixtures>({
	pages: async ({ page }, use) => {
		await use(new PageManager(page));
	},

	userPages: async ({ browser }, use, testInfo) => {
		const storageState = `.auth/user-${testInfo.parallelIndex}.json`;
		const context = await browser.newContext({ storageState });
		const page = await context.newPage();

		await use(new PageManager(page));
		await context.close();
	},

	newUserPages: async ({ browser }, use) => {
		const user = createPerson();

		const context = await browser.newContext();
		const page = await context.newPage();
		const pages = new PageManager(page);

		await pages.home.open();
		await pages.consentDialog.acceptIfVisible();
		await pages.home.clickSignupLoginLink();
		await pages.loginSignupPage.isLoaded();
		await pages.loginSignupPage.enterNameAndEmail(user.name, user.email);
		await pages.loginSignupPage.clickSignupButton();
		await pages.loginSignupPage.assertUrl('/signup');
		await pages.signupPage.isLoaded();
		await pages.signupPage.fillForm(user);
		await pages.signupPage.clickCreateAccountButton();
		await pages.accountCreatedPage.isLoaded();
		await pages.accountCreatedPage.clickContinueButton();
		await pages.header.isLoaded();
		await pages.header.assertUserName(user.name);
		await use({ pages, user });
		await context.close();
	},
});

export { expect } from '@playwright/test';
