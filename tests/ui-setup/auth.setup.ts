import { test as setup } from '@playwright/test';
import fs from 'fs';
import { PageManager } from '@/ui/pages/page-manager';
import { getUserByIndex } from '@/utils/users';
const WORKERS_COUNT = Number(process.env.WORKERS_COUNT ?? 1);

for (let i = 0; i < WORKERS_COUNT; i++) {
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
