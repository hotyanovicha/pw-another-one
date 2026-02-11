const getApiBaseUrl = () => {
	const baseUrl = process.env.BASE_URL || 'https://www.automationexercise.com';
	return baseUrl.replace('www.', '');
};

export const API_ENDPOINTS = {
	CREATE_ACCOUNT: `${getApiBaseUrl()}/api/createAccount`,
} as const;
