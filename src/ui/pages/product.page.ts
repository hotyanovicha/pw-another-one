import { BasePage } from '@/ui/pages/base.page';
import { step } from '@/utils/step.decorator';
import { expect } from '@playwright/test';

export class ProductPage extends BasePage {
    protected readonly uniqueElement = this.page.locator('.product-details');

    private readonly addToCartBtn = this.page.getByRole('button', { name: 'Add to cart' })
    private readonly quantityInput = this.page.locator('#quantity')

    private readonly cartModal = this.page.locator('#cartModal');
    private readonly continueShoppingBtn = this.page.getByRole('button', {name: 'Continue Shopping'});

    @step()
    async addToChart(amount = 1): Promise<void> {
        await this.quantityInput.fill(String(amount))
        await this.addToCartBtn.click()
    }

    @step()
    async continueShopping(): Promise<void> {
        await expect(this.cartModal).toBeVisible()
        await this.continueShoppingBtn.click()
        await expect(this.cartModal).toBeHidden()
    }

}