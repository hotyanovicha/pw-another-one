import { toNumber } from './convert-data';
import { Locator } from '@playwright/test';

export function rowByName(rows: Locator, name: string): Locator {
	return rows.filter({ hasText: name }).first();
}

export async function getRowPrice(row: Locator): Promise<number> {
	const text = (await row.locator('td.cart_price p').innerText()).trim();
	return toNumber(text);
}

export async function getRowQuantity(row: Locator): Promise<number> {
	const text = (await row.locator('td.cart_quantity button.disabled').innerText()).trim();
	return toNumber(text);
}

export async function getRowLineTotal(row: Locator): Promise<number> {
	const text = (await row.locator('td.cart_total p.cart_total_price').innerText()).trim();
	return toNumber(text);
}
