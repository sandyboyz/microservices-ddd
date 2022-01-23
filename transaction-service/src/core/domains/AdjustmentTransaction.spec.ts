import { AdjustmentTransaction } from "./AdjustmentTransaction";

test('Create AdjustmentTransaction Domain', () => {
    const adjustmenTransactionOrError = AdjustmentTransaction.create({
        quantity: 30,
        sku: 'PCS-NUTRISARI-001',
    });

    expect(adjustmenTransactionOrError.isSuccess).toBe(true);
})