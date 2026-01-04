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

test('Basket: Remove product from cart', { tag: '@P1' }, async ({ newUserPages }) => {
	const { pages } = newUserPages;

	await pages.products.open();
	await pages.products.isLoaded();
	const firstProduct = await pages.products.addToCart(6);
	await pages.products.continueShopping();
	const secondProduct = await pages.products.addToCart(7);
	await pages.products.continueShopping();

	await pages.cart.open();
	await pages.cart.isLoaded();

	await pages.cart.assertCartIsCorrect([
		{ name: firstProduct.name, price: firstProduct.price, quantity: 1 },
		{ name: secondProduct.name, price: secondProduct.price, quantity: 1 },
	]);

	(await pages.cart.deleteProduct(firstProduct.name), await pages.cart.assertProductDeleted(firstProduct.name));
	(await pages.cart.deleteProduct(secondProduct.name), await pages.cart.assertProductDeleted(secondProduct.name));
	await pages.cart.assertCartEmpty();
});
