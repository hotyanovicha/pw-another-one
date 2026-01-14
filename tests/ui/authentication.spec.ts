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
	const { person } = newUserPages;

	await pages.home.open();
	await pages.home.isLoaded();
	await pages.consentDialog.acceptIfVisible();
	await pages.home.clickSignupLoginLink();
	await pages.loginSignupPage.isLoaded();
	await pages.loginSignupPage.login(person.email, person.password);
	await pages.header.isLoaded();
	await pages.header.assertUserName(person.name);
});

test('Authentication: Session termination and unauthorized access prevention', async ({ newUserPages }) => {
	const { person, newUser } = newUserPages;

	await newUser.home.isLoaded();
	await newUser.header.assertUserName(person.name);
	await newUser.products.open();
	await newUser.products.isLoaded();

	await newUser.header.clickLogout();
	await newUser.loginSignupPage.isLoaded();
	await newUser.header.assertUserLoggedOut();

	await newUser.products.open();
	await newUser.products.isLoaded();
	const firstProduct = await newUser.products.selectProduct();
	await newUser.products.addToCart(firstProduct.index);
	await newUser.cartModal.openCart();
	await newUser.cart.isLoaded();
	await newUser.cart.clickProceedCheckout();
	await newUser.checkoutModal.isLoaded();
	await newUser.checkoutModal.openRegisterLink();
	await newUser.loginSignupPage.isLoaded();
	await newUser.loginSignupPage.login(person.email, person.password);
	await newUser.header.assertUserName(person.name);
	await newUser.header.clickLogout();
	await newUser.loginSignupPage.isLoaded();
	await newUser.header.assertUserLoggedOut();
	await newUser.home.clickBack();
	await newUser.header.assertUserLoggedOut();
	await newUser.cart.open();
	await newUser.cart.isLoaded();
	await newUser.cart.clickProceedCheckout();
	await newUser.checkoutModal.isLoaded();
});

test('Authentication: User logout', { tag: '@P1' }, async ({ newUserPages }) => {
	const { newUser } = newUserPages;
	await newUser.header.clickLogout();
	await newUser.loginSignupPage.isLoaded();
	await newUser.header.assertUserLoggedOut();
});

test(
	'Authentication: Signin popup appears after proceed to checkout',
	{ tag: '@P2' },
	async ({ pages, newUserPages }) => {
		const { person: newUser } = newUserPages;

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
