export function toNumber(text: string): number {
	return Number(text.replace(/[^\d]/g, '')) || 0;
}
