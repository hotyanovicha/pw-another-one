import { test as base } from '@playwright/test';
import { PageManager } from '@/ui/pages/page-manager';
import { createPerson } from '@/utils/person.factory';
import { API_ENDPOINTS } from '@/ui/test-data/constants/api.constants';
import { createRegistrationFormData } from '@/utils/registration.utils';
import { blockGoogleAds } from '@/utils/filter-network.utils';

type ApiFixtures = {
	pages: PageManager;
	apiUserPage: PageManager;
};

export const test = base.extend<ApiFixtures>({
	pages: async ({ page }, use) => {
		await blockGoogleAds(page.context());
		await use(new PageManager(page));
	},
	apiUserPage: async ({ request, page }, use) => {
		const person = createPerson();
		const formData = createRegistrationFormData(person);

		const response = await request.post(API_ENDPOINTS.CREATE_ACCOUNT, {
			form: formData,
		});
		if (!response.ok()) throw new Error(`Failed to create user: ${response.status()}`);

		const pm = new PageManager(page);
		await pm.home.open();
		await pm.consentDialog.acceptIfVisible();
		await pm.home.clickSignupLoginLink();
		await pm.loginSignupPage.waitForLoad();
		await pm.loginSignupPage.login(person.email, person.password);

		await use(pm);
	},
});

export { expect } from '@playwright/test';
