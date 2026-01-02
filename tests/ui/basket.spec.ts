import { test } from '@/ui/fixtures/index';

test('Basket: Add multiple products to cart and verify', {tag: '@P1'}, async ({userPages}) => {
    //const { pages } = userPages;

    await userPages.products.open();
    await userPages.products.isLoaded()
    await userPages.products.assertProductsExist();
    await userPages.products.openProductPage();
    await userPages.product.isLoaded();
    await userPages.product.addToChart(3)
    await userPages.product.continueShopping()

});