import { test } from '@/ui/fixtures/index';
import { createContactUsUser } from '@/utils/person.factory';
import { TestFiles } from '@/utils/test-files';

test('Contact us: User submit form with valid data (all fields)', { tag: '@P1' }, async ({ pages }) => {
	await pages.home.open();
	await pages.home.isLoaded();
	await pages.header.openContactUsPage();
	await pages.contactUs.isLoaded();

	await pages.contactUs.assertTitleisDisplayed();
	await pages.contactUs.assertFormVisibleFields();

	const user = createContactUsUser();
	await pages.contactUs.enterName(user.name);
	await pages.contactUs.enterEmail(user.email);
	await pages.contactUs.enterSubject(user.subject);
	await pages.contactUs.enterMessage(user.message);
	await pages.contactUs.selectUploadFile(TestFiles.PDF.SAMPLE);
	await pages.contactUs.submitContactUsForm();
	await pages.contactUs.assertSuccessMessage();
});
