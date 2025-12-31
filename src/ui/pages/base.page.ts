import { Page, Locator, expect } from '@playwright/test';
import { step } from '../../utils/step.decorator';

export abstract class BasePage {
  protected abstract readonly uniqueElement: Locator;

  constructor(protected page: Page) {}

  @step()
  async goto(url: string): Promise<this> {
    await this.page.goto(url);
    return this;
  }

  @step()
  async isLoaded(): Promise<this> {
    await expect(this.uniqueElement).toBeVisible();
    return this;
  }

  @step()
  async assertUrl(url: string): Promise<void> {
    await expect(this.page).toHaveURL(url);
  }
}