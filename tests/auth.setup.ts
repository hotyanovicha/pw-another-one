import { test as setup } from '@playwright/test';
import fs from 'fs';
import { PageManager } from '@/ui/pages/page-manager';
import { getUserByIndex } from '@/utils/users';
import config from '../playwright.config';

const WORKER_COUNT = Number(config.workers) || 1;

for (let i = 0; i < WORKER_COUNT; i++) {
	setup(`authenticate user ${i}`, async ({ page }) => {
		fs.mkdirSync('.auth', { recursive: true });

		const user = getUserByIndex(i);
		const pages = new PageManager(page);

		await page.goto('/login');
		await pages.consentDialog.acceptIfVisible();
		await pages.loginSignupPage.login(user.email, user.password);
		await pages.header.isLoaded();

		await page.context().storageState({
			path: `.auth/user-${i}.json`,
		});
	});
}
