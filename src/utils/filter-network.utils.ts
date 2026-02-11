import { BrowserContext } from '@playwright/test';

export async function blockGoogleAds(context: BrowserContext): Promise<void> {
	await context.route('**/*', (route) => {
		const url = route.request().url();

		let host = '';
		try {
			host = new URL(url).hostname;
		} catch {
			return route.continue();
		}

		if (host === 'googlesyndication.com' || host.endsWith('.googlesyndication.com')) {
			return route.abort();
		}

		return route.continue();
	});
}
