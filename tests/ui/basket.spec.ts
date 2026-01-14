import { test } from '@/ui/fixtures/index';
import { ProductInfo } from '@/ui/types/product.types';
import { PageManager } from '@/ui/pages/page-manager';

test(
	'Basket: Add products with different quantities and verify prices, quantities, line totals',
	{ tag: '@P1' },
	async ({ newUserPages }) => {
		const { newUser } = newUserPages;

		await newUser.products.open();
		await newUser.products.isLoaded();
		await newUser.products.assertProductsExist();
		await newUser.products.openProductPage(0);
		await newUser.product.isLoaded();
		const firstProduct = await newUser.product.getProductInfo();
		await newUser.product.addToCart(3);
		await newUser.cartModal.continueShopping();
		await newUser.product.clickBack();
		await newUser.products.openProductPage();
		await newUser.product.isLoaded();
		const secondProduct = await newUser.product.getProductInfo();
		await newUser.product.addToCart(1);
		await newUser.cartModal.openCart();
		await newUser.cart.isLoaded();
		await newUser.cart.validateCartItems([
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
		const { newUser } = newUserPages;
		cartWithProducts = newUser;

		await newUser.products.open();
		await newUser.products.isLoaded();
		firstProduct = await newUser.products.selectProduct(0);
		await newUser.products.addToCart(firstProduct.index);
		await newUser.cartModal.continueShopping();
		secondProduct = await newUser.products.selectProduct();
		await newUser.products.addToCart(secondProduct.index);
		await newUser.cartModal.continueShopping();

		await newUser.cart.open();
		await newUser.cart.isLoaded();

		await newUser.cart.validateCartItems([
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
