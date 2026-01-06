import { test } from '@/ui/fixtures/index';

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

	await pages.cart.assertCartIsCorrect([
		{ name: firstProduct.name, price: firstProduct.price, quantity: 1 },
		{ name: secondProduct.name, price: secondProduct.price, quantity: 1 },
	]);

	await pages.cart.clickProceedCheckout();
	await pages.checkout.isLoaded();
	await pages.checkout.assertAddress(user);
	await pages.checkout.assertOrderProducts([
		{ name: firstProduct.name, price: firstProduct.price, quantity: 1 },
		{ name: secondProduct.name, price: secondProduct.price, quantity: 1 },
	]);
	await pages.checkout.clickPlaceOrder();

	/*await pages.payment.isLoaded();
    await pages.payment.enterCreditCard(CREDIT_CARDS.valid);
    await pages.payment.clickPayConfirm();

    await pages.payment.assertOrderPlaced();
    await pages.payment.downloadInvoice();
    await pages.payment.assertInvoiceValid();

    await pages.payment.clickContinue();
    await pages.home.isLoaded();
    await pages.header.openCartPage();
    await pages.cart.isLoaded()
    await pages.cart.assertCartEmpty();
    */
});
