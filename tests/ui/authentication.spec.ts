import { test } from '@/ui/fixtures/index';
import { createPerson } from '@/utils/person.factory';

test('Authentication: User Registration with complete profile', { tag: '@P1' }, async ({ pages }) => {
	const user = createPerson();

	await pages.home.open();
	await pages.home.waitForLoad();
	await pages.consentDialog.acceptIfVisible();

	await pages.home.clickSignupLoginLink();
	await pages.loginSignupPage.waitForLoad();

	await pages.loginSignupPage.enterNameAndEmail(user.name, user.email);
	await pages.loginSignupPage.clickSignupButton();

	await pages.loginSignupPage.assertUrl('/signup');
	await pages.signupPage.waitForLoad();
	await pages.signupPage.fillForm(user);

	await pages.signupPage.clickCreateAccountButton();
	await pages.accountCreatedPage.waitForLoad();

	await pages.accountCreatedPage.clickContinueButton();
	await pages.header.isLoaded();
	await pages.header.assertUserName(user.name);
});

test('Authentication: Login with Registered User', { tag: '@P1' }, async ({ userPages }) => {
	await userPages.home.open();
	await userPages.home.waitForLoad();
	await userPages.header.assertUserLoggedIn();
});

test('Authentication: User can logout', { tag: '@P1' }, async ({ newUserPages }) => {
	const { newUser, person } = newUserPages;
	await newUser.home.waitForLoad();
	await newUser.header.assertUserName(person.name);

	await newUser.header.clickLogout();
	await newUser.loginSignupPage.waitForLoad();
	await newUser.header.assertUserLoggedOut();
});

test('Authentication: User can re-login from checkout modal', { tag: '@P1' }, async ({ newUserPages }) => {
	const { newUser, person } = newUserPages;

	await newUser.header.clickLogout();
	await newUser.header.assertUserLoggedOut();

	await newUser.products.open();
	await newUser.products.waitForLoad();
	const firstProduct = await newUser.products.selectProduct();
	await newUser.products.addToCart(firstProduct.index);

	await newUser.cartModal.openCart();
	await newUser.cart.waitForLoad();
	await newUser.cart.clickProceedCheckout();

	await newUser.checkoutModal.isLoaded();
	await newUser.checkoutModal.openRegisterLink();
	await newUser.loginSignupPage.waitForLoad();

	await newUser.loginSignupPage.login(person.email, person.password);

	await newUser.header.assertUserName(person.name);
});
