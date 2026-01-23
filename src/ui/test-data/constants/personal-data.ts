export const GENDER_TITLES = ['Mr.', 'Mrs.'] as const;
export type GenderTitle = (typeof GENDER_TITLES)[number];

export const COUNTRIES = [
	'United States',
	'Canada',
	'India',
	'Australia',
	'New Zealand',
	'Israel',
	'Singapore',
] as const;
export type Country = (typeof COUNTRIES)[number];
