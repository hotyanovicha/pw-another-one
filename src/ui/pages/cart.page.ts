import { expect, Locator } from "@playwright/test";
import { BasePage } from "@/ui/pages/base.page";
import { step } from '@/utils/step.decorator';

type CartItem = {
    name: string;
    price: number;
    quantity: number;
}

export class CartPage extends BasePage {
    protected readonly uniqueElement = this.page.locator('section#cart_items');
    private readonly rows = this.page.locator('#cart_info_table tbody tr');
  
    @step()
    async assertCartIsCorrect(expected: CartItem[]): Promise<void> {
      await expect(this.rows.first()).toBeVisible();
      await expect(this.rows).toHaveCount(expected.length);
  
      for (const item of expected) {
        const row = this.rowByName(item.name);
        await expect(row).toBeVisible();
  
        const uiPrice = await this.getRowPrice(row);
        const uiQty = await this.getRowQuantity(row);
        const uiLineTotal = await this.getRowLineTotal(row);
  
        expect(uiPrice,).toBe(item.price);
        expect(uiQty).toBe(item.quantity);
        expect(uiLineTotal).toBe(item.price * item.quantity);
      }
    }
  
    private rowByName(name: string): Locator {
      return this.rows
        .filter({ has: this.page.locator('td.cart_description a', { hasText: name }) })
        .first();
    }
  
    private async getRowPrice(row: Locator): Promise<number> {
      const text = (await row.locator('td.cart_price p').innerText()).trim();
      return this.toNumber(text);
    }
  
    private async getRowQuantity(row: Locator): Promise<number> {
      const text = (await row.locator('td.cart_quantity button.disabled').innerText()).trim();
      return this.toNumber(text);
    }
  
    private async getRowLineTotal(row: Locator): Promise<number> {
      const text = (await row.locator('td.cart_total p.cart_total_price').innerText()).trim();
      return this.toNumber(text);
    }
  
    private toNumber(text: string): number {
      return Number(text.replace(/[^\d]/g, '')) || 0;
    }
}