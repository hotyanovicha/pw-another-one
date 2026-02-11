import { expect, test } from '@/ui/fixtures/index';

test('Search products by keywords', { tag: '@P1' }, async ({ pages }) => {
	await pages.products.open();
	await pages.products.waitForLoad();

	await pages.products.assertSearchExist();
	await pages.products.searchProduct('Saree');
	await expect(pages.products.searchedProductsTitle).toBeVisible();
	await pages.products.assertSearchResults('Saree');
	const firstProduct = await pages.products.selectProduct(0);

	await pages.products.openProductPage(firstProduct.index);
	await pages.product.waitForLoad();
	await pages.product.assertProductInfo(firstProduct);

	await pages.product.goBack();
	await pages.products.assertSearchExist();
	await pages.products.searchProduct('Jeans');
	await pages.products.assertSearchResults('Jeans');

	await pages.products.searchProduct('NOTFOUND');
	await pages.products.assertSearchResultsEmpty();
});
