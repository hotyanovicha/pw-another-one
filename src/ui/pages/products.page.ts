import { expect } from "@playwright/test";
import { BasePage } from "@/ui/pages/base.page";
import { step } from '@/utils/step.decorator';

export class ProductsPage extends BasePage {
    protected readonly uniqueElement = this.page.getByRole('heading', { name: 'All Products' });

    private readonly viewProductLinks = this.page.locator('.choose a[href^="/product_details/"]');

    @step()
    async open(): Promise<void> {
        await this.page.goto('/products');
    }

    @step()
    async openProductPage(index?: number): Promise<void> {
        const count = await this.viewProductLinks.count()
        expect(count).toBeGreaterThan(0);
        let i = index;

        if (i === undefined) {
          expect(count).toBeGreaterThan(1);
          i = 1 + Math.floor(Math.random() * (count - 1));
        }
        await this.viewProductLinks.nth(i).click()
    }

    @step()
    async assertProductsExist(): Promise<void> {
        const countProducts = await this.viewProductLinks.count()
        expect(countProducts).toBeGreaterThan(2);
    }


}