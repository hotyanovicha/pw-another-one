import { test } from '@/ui/api-fixtures/api-user.fixture';

test('should be logged in when user created via API', async ({ apiUserPage }) => {
	await apiUserPage.home.isLoaded();
});
