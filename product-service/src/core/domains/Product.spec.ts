import { Product } from "./Product";

test('Create Product Domain', () => {
    const productOrError = Product.create({
        name: 'Nutrisari',
        image: 'https://www.nutrisari.co.id/assets/images/logo.png',
        price: 40000,
        sku: 'PCS-NUTRISARI-001',
    });

    expect(productOrError.isSuccess).toBe(true);
})