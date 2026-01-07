export const CREDIT_CARDS = {
	valid: {
		number: '4242424242424242',
		month: '12',
		year: '2029',
		cvv: '123',
	},
	invalid: {
		number: '4000000000000002',
		month: '12',
		year: '2024',
		cvv: '123',
	},
} as const;

export type CreditCard = (typeof CREDIT_CARDS)[keyof typeof CREDIT_CARDS];
export type CreditCardKey = keyof typeof CREDIT_CARDS;
