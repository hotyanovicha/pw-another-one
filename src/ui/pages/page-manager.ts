import { Page } from '@playwright/test';
import { HomePage } from '@/ui/pages/home.page';
import { LoginSignupPage } from '@/ui/pages/login-signup.page';
import { SignupPage } from '@/ui/pages/signup.page';
import { AccountCreatedPage } from '@/ui/pages/account-created.page';
import { ConsentDialog } from '@/ui/pages/consent-dialog.component';
import { HeaderComponent } from '@/ui/pages/header.component';


export class PageManager {
    private _home?: HomePage;
    private _loginSignupPage?: LoginSignupPage;
    private _signupPage?: SignupPage;
    private _accountCreatedPage?: AccountCreatedPage;
    private _consentDialog?: ConsentDialog;
    private _header?: HeaderComponent;
    constructor(private page: Page) {}

  get home(): HomePage {
    return this._home ??= new HomePage(this.page);
  }
  get loginSignupPage(): LoginSignupPage {
    return this._loginSignupPage ??= new LoginSignupPage(this.page);
  }
  get signupPage(): SignupPage {
    return this._signupPage ??= new SignupPage(this.page);
  }
  get accountCreatedPage(): AccountCreatedPage {
    return this._accountCreatedPage ??= new AccountCreatedPage(this.page);
  }
  get consentDialog(): ConsentDialog {
    return this._consentDialog ??= new ConsentDialog(this.page);
  }
  get header(): HeaderComponent {
    return this._header ??= new HeaderComponent(this.page);
  }
}