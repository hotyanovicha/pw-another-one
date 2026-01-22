import { test } from '@/ui/fixtures/index';

test('Contact us: User submit form with valid data (all fields)', { tag: '@P1' }, async ({ pages }) => {
	await pages.home.open();
	await pages.home.isLoaded();
	await pages.header.openContactUsPage();
	await pages.contactUs.isLoaded();

	await pages.contactUs.assertTitleisDisplayed();
	await pages.contactUs.assertFormVisibleFields();
});
