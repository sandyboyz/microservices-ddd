import { AdjustmentTransaction } from "../domains/AdjustmentTransaction";

export interface JSONAdjustmentTransactionProps {
  id: string;
  sku: string;
  quantity: number;
  amount?: number;
  createdAt: Date;
}

export class JSONAdjustmentTransactionSerializer {
  public static serialize(
    adjustmentTransaction: AdjustmentTransaction
  ): JSONAdjustmentTransactionProps {
    return {
      id: adjustmentTransaction.id.toString(),
      sku: adjustmentTransaction.sku,
      quantity: adjustmentTransaction.quantity,
      amount: adjustmentTransaction.amount,

      createdAt: adjustmentTransaction.createdAt,
    };
  }
}
