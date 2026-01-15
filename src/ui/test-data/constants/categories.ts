export const CATEGORIES = {
	WOMEN: 'Women',
	MEN: 'Men',
	KIDS: 'Kids',
} as const;

export const CATEGORY_PRODUCTS = {
	[CATEGORIES.WOMEN]: ['Dress', 'Tops', 'Saree'],
	[CATEGORIES.MEN]: ['Tshirts', 'Jeans'],
	[CATEGORIES.KIDS]: ['Dress', 'Tops & Shirts'],
} as const;
