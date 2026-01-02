import { Locator, expect } from "@playwright/test";
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
    async openProductPage(index=0): Promise<void> {
        await this.viewProductLinks.nth(index).click()
    }

    @step()
    async assertProductsExist(): Promise<void> {
        const countProducts = await this.viewProductLinks.count()
        expect(countProducts).toBeGreaterThan(2);
    }


}