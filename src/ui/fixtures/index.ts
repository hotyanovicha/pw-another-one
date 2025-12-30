import { test as base } from '@playwright/test';
import { PageManager } from '../pages/page-manager';

type Fixtures = {
  pages: PageManager;
};

export const test = base.extend<Fixtures>({
  pages: async ({ page }, use) => {
    await use(new PageManager(page));
  },
});

export { expect } from '@playwright/test';