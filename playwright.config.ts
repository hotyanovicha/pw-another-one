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

export const AUTH_USER_COUNT = 5;

export default defineConfig({
	testDir: './tests',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: process.env.CI ? 5 : undefined,
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
			testMatch: /.*\.setup\.ts/,
		},
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
			dependencies: ['setup'],
		},
	],
});
