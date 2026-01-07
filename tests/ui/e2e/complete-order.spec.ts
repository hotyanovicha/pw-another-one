import { test } from '@/ui/fixtures/index';
import { CREDIT_CARDS } from '@/ui/test-data/constants/credit-card';

test('E2E: New User: Complete order with valid card', { tag: '@P1' }, async ({ newUserPages }) => {
	const { pages, user } = newUserPages;

	await pages.products.open();
	await pages.products.isLoaded();

	const firstProduct = await pages.products.selectProduct(0);
	await pages.products.addToCart(firstProduct.index);
	await pages.cartModal.continueShopping();
	const secondProduct = await pages.products.selectProduct();
	await pages.products.addToCart(secondProduct.index);
	await pages.cartModal.openCart();

	await pages.cart.validateCartItems([
		{ name: firstProduct.name, price: firstProduct.price, quantity: 1 },
		{ name: secondProduct.name, price: secondProduct.price, quantity: 1 },
	]);

	await pages.cart.clickProceedCheckout();
	await pages.checkout.isLoaded();
	await pages.checkout.assertAddress(user);
	const cartTotal = await pages.checkout.validateCartItems([
		{ name: firstProduct.name, price: firstProduct.price, quantity: 1 },
		{ name: secondProduct.name, price: secondProduct.price, quantity: 1 },
	]);
	await pages.checkout.assertCartTotal(cartTotal);
	await pages.checkout.clickPlaceOrder();

	await pages.payment.isLoaded();
	await pages.payment.enterCreditCard(CREDIT_CARDS.valid);
	await pages.payment.clickPayConfirm();

	await pages.payment.assertOrderPlaced();
	const invoice = await pages.payment.clickDownloadInvoice();
	const fullUserName = `${user.firstName} ${user.lastName}`;
	await pages.payment.assertInvoiceValid(invoice, { customer: fullUserName, amount: cartTotal });

	await pages.payment.clickContinue();
	await pages.home.isLoaded();
	await pages.header.openCartPage();
	await pages.cart.isLoaded();
	await pages.cart.assertCartEmpty();
});
