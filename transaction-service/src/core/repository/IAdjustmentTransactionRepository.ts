import { UniqueEntityID } from "../../shared/domain/UniqueEntityID";
import { AdjustmentTransaction } from "../domains/AdjustmentTransaction";

export interface IAdjustmentTransactionRepository {
  retrieveAll(page: number): Promise<AdjustmentTransaction[]>;
  retrieveById(id: UniqueEntityID): Promise<AdjustmentTransaction | undefined>;
  retrieveBySku(sku: string): Promise<AdjustmentTransaction[]>;
  create(adjustmentTransaction: AdjustmentTransaction): Promise<void>;
  update(adjustmentTransaction: AdjustmentTransaction): Promise<void>;
  delete(adjustmentTransaction: AdjustmentTransaction): Promise<void>;
  deleteBySku(sku: string): Promise<void>;
  count(): Promise<number>;
}
