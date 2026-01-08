import { test } from '@/ui/fixtures/index';
import { ProductInfo } from '@/ui/types/product.types';
import { PageManager } from '@/ui/pages/page-manager';

test(
	'Basket: Add products with different quantities and verify prices, quantities, line totals',
	{ tag: '@P1' },
	async ({ newUserPages }) => {
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
		await pages.cart.validateCartItems([
			{ name: firstProduct.name, price: firstProduct.price, quantity: 3 },
			{ name: secondProduct.name, price: secondProduct.price, quantity: 1 },
		]);
	}
);

test.describe('Basket', () => {
	let firstProduct: ProductInfo;
	let secondProduct: ProductInfo;
	let cartWithProducts: PageManager;

	test.beforeEach(async ({ newUserPages }) => {
		const { pages } = newUserPages;
		cartWithProducts = pages;

		await pages.products.open();
		await pages.products.isLoaded();
		firstProduct = await pages.products.selectProduct(0);
		await pages.products.addToCart(firstProduct.index);
		await pages.cartModal.continueShopping();
		secondProduct = await pages.products.selectProduct();
		await pages.products.addToCart(secondProduct.index);
		await pages.cartModal.continueShopping();

		await pages.cart.open();
		await pages.cart.isLoaded();

		await pages.cart.validateCartItems([
			{ name: firstProduct.name, price: firstProduct.price, quantity: 1 },
			{ name: secondProduct.name, price: secondProduct.price, quantity: 1 },
		]);
	});

	test('Basket: Remove product from cart', { tag: '@P1' }, async () => {
		await cartWithProducts.cart.deleteProduct(firstProduct.name);
		await cartWithProducts.cart.assertProductDeleted(firstProduct.name);
		await cartWithProducts.cart.deleteProduct(secondProduct.name);
		await cartWithProducts.cart.assertProductDeleted(secondProduct.name);
		await cartWithProducts.cart.assertCartEmpty();
	});
});
