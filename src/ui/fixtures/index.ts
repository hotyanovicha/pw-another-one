import { test as base } from '@playwright/test';
import type { BrowserContext } from '@playwright/test';
import { PageManager } from '../pages/page-manager';
import { createPerson, Person } from '@/utils/person.factory';

//text
type Fixtures = {
	pages: PageManager;
	userPages: PageManager;
	newUserPages: { newUser: PageManager; person: Person };
};

export const test = base.extend<Fixtures>({
	pages: async ({ page }, use) => {
		await blockGoogleAds(page.context());
		await use(new PageManager(page));
	},

	userPages: async ({ browser }, use, testInfo) => {
		const workerCount = Number(process.env.WORKERS_COUNT ?? 1);
		const userIndex = testInfo.workerIndex % workerCount;
		const storageState = `.auth/user-${userIndex}.json`;
		const context = await browser.newContext({ storageState });
		await blockGoogleAds(context);
		const page = await context.newPage();

		await use(new PageManager(page));
		await context.close();
	},

	newUserPages: async ({ browser }, use) => {
		const person = createPerson();

		const context = await browser.newContext();
		await blockGoogleAds(context);
		const page = await context.newPage();
		const newUser = new PageManager(page);

		await newUser.home.open();
		await newUser.consentDialog.acceptIfVisible();
		await newUser.home.clickSignupLoginLink();
		await newUser.loginSignupPage.isLoaded();
		await newUser.loginSignupPage.enterNameAndEmail(person.name, person.email);
		await newUser.loginSignupPage.clickSignupButton();
		await newUser.loginSignupPage.assertUrl('/signup');
		await newUser.signupPage.isLoaded();
		await newUser.signupPage.fillForm(person);
		await newUser.signupPage.clickCreateAccountButton();
		await newUser.accountCreatedPage.isLoaded();
		await newUser.accountCreatedPage.clickContinueButton();
		await newUser.header.isLoaded();
		await newUser.header.assertUserName(person.name);
		await use({ newUser, person });
		await context.close();
	},
});

export { expect } from '@playwright/test';

export async function blockGoogleAds(context: BrowserContext): Promise<void> {
	await context.route('**/*', (route) => {
		const url = route.request().url();

		let host = '';
		try {
			host = new URL(url).hostname;
		} catch {
			return route.continue();
		}

		if (host === 'googlesyndication.com' || host.endsWith('.googlesyndication.com')) {
			return route.abort();
		}

		return route.continue();
	});
}
