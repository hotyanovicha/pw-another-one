import { expect } from '@playwright/test';
import { BasePage } from '@/ui/pages/base.page';
import { Person } from '@/utils/person.factory';
import { step } from '@/utils/step.decorator';

export class SignupPage extends BasePage {
    protected readonly uniqueElement = this.page.locator('.login-form');
    private readonly name = this.page.locator('#name');
    private readonly password = this.page.locator('#password');
    private readonly days = this.page.locator('#days');
    private readonly months = this.page.locator('#months');
    private readonly years = this.page.locator('#years');
    private readonly newsletter = this.page.locator('#newsletter');
    private readonly optin = this.page.locator('#optin');
    private readonly firstName = this.page.locator('#first_name');
    private readonly lastName = this.page.locator('#last_name');
    private readonly company = this.page.locator('#company');
    private readonly address = this.page.locator('#address1');
    private readonly address2 = this.page.locator('#address2');
    private readonly country = this.page.locator('#country');
    private readonly state = this.page.locator('#state');
    private readonly city = this.page.locator('#city');
    private readonly zipcode = this.page.locator('#zipcode');
    private readonly mobile = this.page.locator('#mobile_number');
    private readonly createAccountButton = this.page.getByRole('button', { name: 'Create Account' });

    @step()
    async isLoaded(): Promise<this> {
        await super.isLoaded();
        await expect.soft(this.uniqueElement.getByRole('heading', { name: 'Enter Account Information' })).toBeVisible();
        return this;
    }

    @step()
    async fillForm(user: Person): Promise<void> {
        await this.page.getByRole('radio', { name: user.title }).click();
        await this.name.fill(user.name);
        await this.password.fill(user.password);
        await this.days.selectOption(user.day);
        await this.months.selectOption(user.month);
        await this.years.selectOption(user.year);
        await this.newsletter.check();
        await this.optin.check();
        await this.firstName.fill(user.firstName);
        await this.lastName.fill(user.lastName);
        await this.company.fill(user.company);
        await this.address.fill(user.address1);
        await this.address2.fill(user.address2);
        await this.country.selectOption(user.country);
        await this.state.fill(user.state);
        await this.city.fill(user.city);
        await this.zipcode.fill(user.zipcode);
        await this.mobile.fill(user.mobile);
    }

    @step()
    async clickCreateAccountButton(): Promise<void> {
        await this.createAccountButton.click();
    }
}