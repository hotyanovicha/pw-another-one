import { test } from '@/ui/fixtures/index';

test('Search products by keywords', async ({ pages }) => {
	await pages.products.open();
	await pages.products.isLoaded();

	await pages.products.assertSearchExist();
	await pages.products.searchProduct('Saree');
	await pages.products.assertElementVisible(pages.products.searchedProductsTitle);
	await pages.products.assertSearchResults('Saree');
	const firstProduct = await pages.products.selectProduct(0);

	await pages.products.openProductPage(firstProduct.index);
	await pages.product.isLoaded();
	await pages.product.getProductInfo();

	await pages.product.clickBack();
	await pages.products.assertSearchExist();
	await pages.products.searchProduct('Jeans');
	await pages.products.assertSearchResults('Jeans');

	await pages.products.searchProduct('NOTFOUND');
	await pages.products.assertSearchResultsEmpty();
});
