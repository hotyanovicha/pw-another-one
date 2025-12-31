import { test as setup } from '@playwright/test';
import { PageManager } from '../src/ui/pages/page-manager';
import { getUserByIndex } from '../src/utils/users';

setup('authenticate', async ({ page }, testInfo) => {
  const user = getUserByIndex(testInfo.parallelIndex);
  const pages = new PageManager(page);

  await page.goto('/login');
  await pages.consentDialog.acceptIfVisible();
  await pages.loginSignupPage.login(user.email, user.password);
  await pages.header.isLoaded();

  await page.context().storageState({
    path: `.auth/user-${testInfo.parallelIndex}.json`,
  });
});
