import { Page } from '@playwright/test';
import { HomePage } from '@/ui/pages/home-page/home.page';
import { LoginSignupPage } from '@/ui/pages/auth/login-signup.page';
import { SignupPage } from '@/ui/pages/auth/signup.page';
import { AccountCreatedPage } from '@/ui/pages/auth/account-created.page';
import { ConsentDialog } from '@/ui/pages/components/consent-dialog.component';
import { HeaderComponent } from '@/ui/pages/components/header.component';
import { ProductsPage } from '@/ui/pages/product/products.page';
import { ProductPage } from '@/ui/pages/product/product.page';
import { CartPage } from '@/ui/pages/cart/cart.page';
import { CartModal } from '@/ui/pages/components/cart-modal.component';
import { CheckoutPage } from '@/ui/pages/cart/checkout.page';
import { PaymentPage } from '@/ui/pages/cart/payment.page';
import { CheckoutModal } from '@/ui/pages/components/checkout-modal.component';
import { CategoryComponent } from '@/ui/pages/components/category.component';
import { BrandComponent } from '@/ui/pages/components/brand.component';

export class PageManager {
	private _home?: HomePage;
	private _loginSignupPage?: LoginSignupPage;
	private _signupPage?: SignupPage;
	private _accountCreatedPage?: AccountCreatedPage;
	private _consentDialog?: ConsentDialog;
	private _headerComponent?: HeaderComponent;
	private _productsPage?: ProductsPage;
	private _productPage?: ProductPage;
	private _cartPage?: CartPage;
	private _cartModal?: CartModal;
	private _checkoutPage?: CheckoutPage;
	private _paymentPage?: PaymentPage;
	private _checkoutModal?: CheckoutModal;
	private _categoryComponent?: CategoryComponent;
	private _brandComponent?: BrandComponent;

	constructor(private page: Page) {}

	get home(): HomePage {
		return (this._home ??= new HomePage(this.page));
	}
	get loginSignupPage(): LoginSignupPage {
		return (this._loginSignupPage ??= new LoginSignupPage(this.page));
	}
	get signupPage(): SignupPage {
		return (this._signupPage ??= new SignupPage(this.page));
	}
	get accountCreatedPage(): AccountCreatedPage {
		return (this._accountCreatedPage ??= new AccountCreatedPage(this.page));
	}
	get consentDialog(): ConsentDialog {
		return (this._consentDialog ??= new ConsentDialog(this.page));
	}
	get header(): HeaderComponent {
		return (this._headerComponent ??= new HeaderComponent(this.page));
	}
	get products(): ProductsPage {
		return (this._productsPage ??= new ProductsPage(this.page));
	}
	get product(): ProductPage {
		return (this._productPage ??= new ProductPage(this.page));
	}
	get cart(): CartPage {
		return (this._cartPage ??= new CartPage(this.page));
	}
	get cartModal(): CartModal {
		return (this._cartModal ??= new CartModal(this.page));
	}
	get checkout(): CheckoutPage {
		return (this._checkoutPage ??= new CheckoutPage(this.page));
	}
	get payment(): PaymentPage {
		return (this._paymentPage ??= new PaymentPage(this.page));
	}
	get checkoutModal(): CheckoutModal {
		return (this._checkoutModal ??= new CheckoutModal(this.page));
	}
	get categoryComponent(): CategoryComponent {
		return (this._categoryComponent ??= new CategoryComponent(this.page));
	}
	get brandComponent(): BrandComponent {
		return (this._brandComponent ??= new BrandComponent(this.page));
	}
}
