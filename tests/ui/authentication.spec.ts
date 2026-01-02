import { test } from '@/ui/fixtures';
import { PageManager } from '@/ui/pages/page-manager'
import { createPerson, Person } from '@/utils/person.factory';


test('Authentication: User Registration with complete profile', { tag: '@P1' }, async ({ pages }: { pages: PageManager }) => {
    const user = createPerson();

    await pages.home.open();
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


test('Authentication: Login with Registered User', { tag: '@P1' }, async ({pages, newUser}: {pages: PageManager, newUser: Person}) => {
    await pages.home.open();
    await pages.consentDialog.acceptIfVisible();
    await pages.home.clickSignupLoginLink();
    await pages.loginSignupPage.isLoaded();
    await pages.loginSignupPage.login(newUser.email, newUser.password);
    await pages.header.isLoaded();
    await pages.header.assertUserName(newUser.name);
});