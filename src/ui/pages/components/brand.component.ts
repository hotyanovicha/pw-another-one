import { step } from "@/utils/step.decorator";
import { T } from "@faker-js/faker/dist/airline-DF6RqYmq";
import { expect, Page } from "@playwright/test";

export class BrandComponent {
    
    private brandPanel = this.page.locator('.brands_products')
    private brandNames = this.page.locator('.brands-name')

    constructor (private page: Page) {}

    @step()
    async selectBrand(brand: string): Promise<string> {
       await this.brandNames.getByRole('link', {name: brand})
       return brand;
    }

    @step()
    async assertBrandPannelExists() {
        await expect(this.brandPanel).toBeVisible();
    }

    @step()
    async verifyBrandsList(brands: Record<string, string>) {
        for (const brand of Object.values(brands)){
            const brandItem = this.brandNames.getByRole('link', {name: brand})
            await expect(brandItem).toBeVisible()
        }
    }

}
