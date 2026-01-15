import { test } from '@/ui/fixtures/index';
import { CATEGORY_PRODUCTS } from '@/ui/test-data/constants/categories';

test('Filter products by category', { tag: '@P1' }, async ({ pages }) => {
	await pages.home.open();
	await pages.home.isLoaded();

	await pages.categoryComponent.assertCategoryPannelExist();
	await pages.categoryComponent.verifyCategoriesAndOptions(CATEGORY_PRODUCTS);
});
