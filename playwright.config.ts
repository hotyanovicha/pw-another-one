import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

/* Load environment variables from env folder */
const ENV = process.env.ENV_NAME || 'dev';
dotenvExpand.expand(
	dotenv.config({
		path: `env/env.${ENV}`,
		quiet: true,
	})
);

export default defineConfig({
	testDir: './tests',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: process.env.WORKERS_COUNT ? Number(process.env.WORKERS_COUNT) : undefined,
	reporter: process.env.CI ? [['list'], ['html']] : 'list',
	timeout: 45 * 1000,
	use: {
		baseURL: process.env.BASE_URL,
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
		trace: 'retain-on-failure',
		testIdAttribute: 'data-qa',
	},

	projects: [
		{
			name: 'setup',
			testDir: './tests/ui-setup',
			testMatch: /.*\.setup\.ts/,
		},
		{
			name: 'chromium-ui',
			testDir: './tests/ui',
			use: { ...devices['Desktop Chrome'] },
			dependencies: ['setup'],
		},
		{
			name: 'chromium-api',
			testDir: './tests/ui-api',
			use: { ...devices['Desktop Chrome'] },
			dependencies: [],
		},
	],
});
