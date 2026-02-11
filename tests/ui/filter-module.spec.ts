import { test } from '@/ui/fixtures/index';
import { BRANDS } from '@/ui/test-data/constants/brands';
import { CATEGORIES, CATEGORY_PRODUCTS } from '@/ui/test-data/constants/categories';

test('Filter products by categories and brands', { tag: '@P1' }, async ({ pages }) => {
	await pages.home.open();
	await pages.home.waitForLoad();

	await pages.categoryComponent.assertCategoryPanelExists();
	await pages.categoryComponent.verifyCategoriesAndOptions(CATEGORY_PRODUCTS);

	await pages.categoryComponent.selectCategoryOption(CATEGORIES.WOMEN, CATEGORY_PRODUCTS[CATEGORIES.WOMEN][0]);
	await pages.products.assertCategoryTitle(CATEGORIES.WOMEN, CATEGORY_PRODUCTS[CATEGORIES.WOMEN][0]);
	await pages.products.assertSearchResults(CATEGORY_PRODUCTS[CATEGORIES.WOMEN][0]);

	await pages.categoryComponent.selectCategoryOption(CATEGORIES.MEN, CATEGORY_PRODUCTS[CATEGORIES.MEN][1]);
	await pages.products.assertCategoryTitle(CATEGORIES.MEN, CATEGORY_PRODUCTS[CATEGORIES.MEN][1]);
	await pages.products.assertSearchResults(CATEGORY_PRODUCTS[CATEGORIES.MEN][1]);

	await pages.brandComponent.assertBrandPanelExists();
	await pages.brandComponent.verifyBrandsList(BRANDS);

	await pages.brandComponent.selectBrand(BRANDS.POLO);
	await pages.products.assertBrandTitle(BRANDS.POLO);
	await pages.products.assertProductsBrand(BRANDS.POLO);

	await pages.brandComponent.selectBrand(BRANDS.BABYHUG);
	await pages.products.assertBrandTitle(BRANDS.BABYHUG);
	await pages.products.assertProductsBrand(BRANDS.BABYHUG);
});
