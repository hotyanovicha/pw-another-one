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

test('Authentication: User logout', async ({ newUserPages }) => {
	const { user: newUser } = newUserPages;

	await newUserPages.pages.home.isLoaded();
	await newUserPages.pages.header.assertUserName(newUser.name);
	await newUserPages.pages.products.open();
	await newUserPages.pages.products.isLoaded();

	await newUserPages.pages.header.clickLogout();
	await newUserPages.pages.loginSignupPage.isLoaded();
	await newUserPages.pages.header.assertUserLoggedOut();

	await newUserPages.pages.products.open();
	await newUserPages.pages.products.isLoaded();
	const firstProduct = await newUserPages.pages.products.selectProduct();
	await newUserPages.pages.products.addToCart(firstProduct.index);
	await newUserPages.pages.cartModal.openCart();
	await newUserPages.pages.cart.isLoaded();
	await newUserPages.pages.cart.clickProceedCheckout();
	await newUserPages.pages.checkoutModal.isLoaded();
	await newUserPages.pages.checkoutModal.assertRegisterLink();

	await newUserPages.pages.checkoutModal.openRegisterLink();
	await newUserPages.pages.loginSignupPage.isLoaded();
	await newUserPages.pages.loginSignupPage.login(newUser.email, newUser.password);
	await newUserPages.pages.header.assertUserName(newUser.name);
	await newUserPages.pages.header.clickLogout();
	await newUserPages.pages.loginSignupPage.isLoaded();
	await newUserPages.pages.header.assertUserLoggedOut();
	await newUserPages.pages.home.clickBack();
	await newUserPages.pages.header.assertUserLoggedOut();
	await newUserPages.pages.cart.open();
	await newUserPages.pages.cart.isLoaded();
	await newUserPages.pages.cart.clickProceedCheckout();
	await newUserPages.pages.checkoutModal.isLoaded();
});
