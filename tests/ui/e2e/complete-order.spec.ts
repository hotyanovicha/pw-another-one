import { test } from '@/ui/fixtures/index';
import { CREDIT_CARDS } from '@/ui/test-data/constants/credit-card';

test('E2E: New User: Complete order with valid card', { tag: '@P1' }, async ({ newUserPages }) => {
	const { newUser, person } = newUserPages;

	await newUser.products.open();
	await newUser.products.isLoaded();

	const firstProduct = await newUser.products.selectProduct(0);
	await newUser.products.addToCart(firstProduct.index);
	await newUser.cartModal.continueShopping();
	const secondProduct = await newUser.products.selectProduct();
	await newUser.products.addToCart(secondProduct.index);
	await newUser.cartModal.openCart();

	const expectedCartItems = [
		{ name: firstProduct.name, price: firstProduct.price, quantity: 1 },
		{ name: secondProduct.name, price: secondProduct.price, quantity: 1 },
	];

	await newUser.cart.validateCartItems(expectedCartItems);

	await newUser.cart.clickProceedCheckout();
	await newUser.checkout.isLoaded();
	await newUser.checkout.assertAddress(person);
	const cartTotal = await newUser.checkout.validateCartItems(expectedCartItems);
	await newUser.checkout.assertCartTotal(cartTotal);
	await newUser.checkout.clickPlaceOrder();

	await newUser.payment.isLoaded();
	await newUser.payment.enterCreditCard(CREDIT_CARDS.valid, person);
	await newUser.payment.clickPayConfirm();

	await newUser.payment.assertOrderPlaced();
	const invoice = await newUser.payment.clickDownloadInvoice();
	await newUser.payment.assertInvoiceValid(invoice, { customer: person, amount: cartTotal });

	await newUser.payment.clickContinue();
	await newUser.home.isLoaded();
	await newUser.header.openCartPage();
	await newUser.cart.isLoaded();
	await newUser.cart.assertCartEmpty();
});
