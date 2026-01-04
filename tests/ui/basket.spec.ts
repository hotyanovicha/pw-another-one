import { test } from '@/ui/fixtures/index';

test('Basket: Add multiple products to cart and verify', { tag: '@P1' }, async ({ newUserPages }) => {
	const { pages } = newUserPages;

	await pages.products.open();
	await pages.products.isLoaded();
	await pages.products.assertProductsExist();
	await pages.products.openProductPage(0);
	await pages.product.isLoaded();
	const firstProduct = await pages.product.getProductInfo();
	await pages.product.addToCart(3);
	await pages.product.continueShopping();
	await pages.product.clickBack();
	await pages.products.openProductPage();
	await pages.product.isLoaded();
	const secondProduct = await pages.product.getProductInfo();
	await pages.product.addToCart(1);
	await pages.product.openCart();
	await pages.cart.isLoaded();
	await pages.cart.assertCartIsCorrect([
		{ name: firstProduct.Name, price: firstProduct.Price, quantity: 3 },
		{ name: secondProduct.Name, price: secondProduct.Price, quantity: 1 },
	]);
});

test('Basket: Remove product from cart', { tag: '@P1' }, async ({ userPages }) => {
	//const { pages } = userPages;

	await userPages.products.open();
	await userPages.products.isLoaded();
	const firstProduct = await userPages.products.addToCart(10);
	await userPages.products.continueShopping();
	const secondProduct = await userPages.products.addToCart(11);
	await userPages.products.continueShopping();

	await userPages.cart.open();
	await userPages.cart.isLoaded();

	await userPages.cart.assertCartIsCorrect([
		{ name: firstProduct.name, price: firstProduct.price, quantity: 1 },
		{ name: secondProduct.name, price: secondProduct.price, quantity: 1 },
	]);
});
