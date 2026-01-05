import { test } from '@/ui/fixtures/index';
import { ProductInfo } from '@/ui/pages/product/products.page';

test('Basket: Add multiple products to cart and verify', { tag: '@P1' }, async ({ newUserPages }) => {
	const { pages } = newUserPages;

	await pages.products.open();
	await pages.products.isLoaded();
	await pages.products.assertProductsExist();
	await pages.products.openProductPage(0);
	await pages.product.isLoaded();
	const firstProduct = await pages.product.getProductInfo();
	await pages.product.addToCart(3);
	await pages.cartModal.continueShopping();
	await pages.product.clickBack();
	await pages.products.openProductPage();
	await pages.product.isLoaded();
	const secondProduct = await pages.product.getProductInfo();
	await pages.product.addToCart(1);
	await pages.cartModal.openCart();
	await pages.cart.isLoaded();
	await pages.cart.assertCartIsCorrect([
		{ name: firstProduct.Name, price: firstProduct.Price, quantity: 3 },
		{ name: secondProduct.Name, price: secondProduct.Price, quantity: 1 },
	]);
});

test.describe('Basket', () => {
	let firstProduct: ProductInfo;
	let secondProduct: ProductInfo;
	let cartPage: any;

	test.beforeEach(async ({ newUserPages }) => {
		const { pages } = newUserPages;
		cartPage = pages;

		await pages.products.open();
		await pages.products.isLoaded();
		firstProduct = await pages.products.addToCart(0);
		await pages.cartModal.continueShopping();
		secondProduct = await pages.products.addToCart();
		await pages.cartModal.continueShopping();

		await pages.cart.open();
		await pages.cart.isLoaded();

		await pages.cart.assertCartIsCorrect([
			{ name: firstProduct.name, price: firstProduct.price, quantity: 1 },
			{ name: secondProduct.name, price: secondProduct.price, quantity: 1 },
		]);
	});

	test('Basket: Remove product from cart', { tag: '@P1' }, async () => {
		await cartPage.cart.deleteProduct(firstProduct.name);
		await cartPage.cart.assertProductDeleted(firstProduct.name);
		await cartPage.cart.deleteProduct(secondProduct.name);
		await cartPage.cart.assertProductDeleted(secondProduct.name);
		await cartPage.cart.assertCartEmpty();
	});
});
