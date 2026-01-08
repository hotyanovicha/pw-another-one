import { test } from '@/ui/fixtures/index';
import { createPerson } from '@/utils/person.factory';

test('Authentication: User Registration with complete profile', { tag: '@P1' }, async ({ pages }) => {
	const user = createPerson();

	await pages.home.open();
	await pages.home.isLoaded();
	await pages.consentDialog.acceptIfVisible();

	await pages.home.clickSignupLoginLink();
	await pages.loginSignupPage.isLoaded();

	await pages.loginSignupPage.enterNameAndEmail(user.name, user.email);
	await pages.loginSignupPage.clickSignupButton();

	await pages.loginSignupPage.assertUrl('/signup');
	await pages.signupPage.isLoaded();
	await pages.signupPage.fillForm(user);

	await pages.signupPage.clickCreateAccountButton();
	await pages.accountCreatedPage.isLoaded();

	await pages.accountCreatedPage.clickContinueButton();
	await pages.header.isLoaded();
	await pages.header.assertUserName(user.name);
});

test('Authentication: Login with Registered User', { tag: '@P1' }, async ({ pages, newUserPages }) => {
	const { user: newUser } = newUserPages;

	await pages.home.open();
	await pages.home.isLoaded();
	await pages.consentDialog.acceptIfVisible();
	await pages.home.clickSignupLoginLink();
	await pages.loginSignupPage.isLoaded();
	await pages.loginSignupPage.login(newUser.email, newUser.password);
	await pages.header.isLoaded();
	await pages.header.assertUserName(newUser.name);
});

test('Authentication: User logout', { tag: '@P1' }, async ({ newUserPages }) => {
	await newUserPages.pages.header.clickLogout();
	await newUserPages.pages.loginSignupPage.isLoaded();
	await newUserPages.pages.header.assertUserLoggedOut();
});

test(
	'Authentication: Sigin popup appears after proceed to checkout',
	{ tag: '@P2' },
	async ({ pages, newUserPages }) => {
		const { user: newUser } = newUserPages;

		await pages.products.open();
		await pages.products.isLoaded();
		const firstProduct = await pages.products.selectProduct();
		await pages.products.addToCart(firstProduct.index);
		await pages.cartModal.openCart();
		await pages.cart.isLoaded();
		await pages.cart.clickProceedCheckout();
		await pages.checkoutModal.isLoaded();
		await pages.checkoutModal.openRegisterLink();
		await pages.loginSignupPage.isLoaded();
		await pages.loginSignupPage.login(newUser.email, newUser.password);
		await pages.header.assertUserName(newUser.name);
		await pages.header.clickLogout();
		await pages.loginSignupPage.isLoaded();
		await pages.header.assertUserLoggedOut();
		await pages.home.clickBack();
		await pages.header.assertUserLoggedOut();
		await pages.cart.open();
		await pages.cart.isLoaded();
		await pages.cart.clickProceedCheckout();
		await pages.checkoutModal.isLoaded();
	}
);
