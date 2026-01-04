import { test as setup } from '@playwright/test';
import fs from 'fs';
import { PageManager } from '@/ui/pages/page-manager';
import { getUserByIndex } from '@/utils/users';

setup('authenticate', async ({ page }, testInfo) => {
	fs.mkdirSync('.auth', { recursive: true });

	const user = getUserByIndex(testInfo.workerIndex);
	const pages = new PageManager(page);

	await page.goto('/login');
	await pages.consentDialog.acceptIfVisible();
	await pages.loginSignupPage.login(user.email, user.password);
	await pages.header.isLoaded();

	await page.context().storageState({
		path: `.auth/user-${testInfo.workerIndex}.json`,
	});
});
