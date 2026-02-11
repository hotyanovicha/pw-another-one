---
title: 'Doc: fixture index'
---
<SwmSnippet path="/src/ui/fixtures/index.ts" line="1">

---

doc updated.

```typescript
import { test as base } from '@playwright/test';
import { PageManager } from '../pages/page-manager';
import { createPerson, Person } from '@/utils/person.factory';
import { blockGoogleAds } from '@/utils/filter-network.utils';

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

```

---

</SwmSnippet>

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBcHctYW5vdGhlci1vbmUlM0ElM0Fob3R5YW5vdmljaGE=" repo-name="pw-another-one"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
