import { test } from '../../src/ui/fixtures';
import { PageManager } from '../../src/ui/pages/page-manager';
import { createPerson } from '../../src/utils/person.factory';


test('TC01: User Registration with complete profile', async ({ pages }: { pages: PageManager }) => {
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