import { AdjustmentTransaction } from "../domains/AdjustmentTransaction";
import { PostgresAdjustmentTransactionMapper } from "../mappers/PostgresAdjustmentTransactionMapper";
import { Client } from "pg";
import { IAdjustmentTransactionRepository } from "./IAdjustmentTransactionRepository";
import { UniqueEntityID } from "../../shared/domain/UniqueEntityID";

export const ADJUSTMENT_TRANSACTION_LIMIT_DATA = 10;

export class PostgresAdjustmentTransactionRepository
  implements IAdjustmentTransactionRepository
{
  constructor(private client: Client) {}

  async retrieveAll(page = 1): Promise<AdjustmentTransaction[]> {
    const methodName = `retrieveAll`;

    console.log({ methodName, message: "BEGIN" });

    const result = await this.client.query(
      "SELECT * FROM adjustment_transactions LIMIT $1 OFFSET $2",
      [
        ADJUSTMENT_TRANSACTION_LIMIT_DATA,
        (page - 1) * ADJUSTMENT_TRANSACTION_LIMIT_DATA,
      ]
    );

    let adjustmentTransactions: AdjustmentTransaction[] = [];

    if (result) {
      adjustmentTransactions = result.rows.map(
        PostgresAdjustmentTransactionMapper.toDomain
      );
    }

    console.log({ methodName, message: "END" });

    return adjustmentTransactions;
  }

  async count(): Promise<number> {
    const methodName = `count`;

    console.log({ methodName, message: "BEGIN" });

    const result = await this.client.query(
      "SELECT COUNT(*) FROM adjustment_transactions"
    );

    let count: number = 0;

    if (result.rows.length > 0) {
      count = result.rows[0].count;
    }

    console.log({ methodName, message: "END" });

    return count;
  }

  async retrieveById(
    id: UniqueEntityID
  ): Promise<AdjustmentTransaction | undefined> {
    const methodName = `retrieveById`;

    console.log({ methodName, message: "BEGIN" });

    const result = await this.client.query(
      "SELECT * FROM adjustment_transactions WHERE id = $1",
      [id.toString()]
    );

    let adjustmentTransaction: AdjustmentTransaction | undefined;

    if (result.rows.length > 0) {
      adjustmentTransaction = PostgresAdjustmentTransactionMapper.toDomain(
        result.rows[0]
      );
    }

    console.log({ methodName, message: "END" });

    return adjustmentTransaction;
  }

  async retrieveBySku(sku: string): Promise<AdjustmentTransaction[]> {
    const methodName = `retrieveBySku`;

    console.log({ methodName, message: "BEGIN" });

    const result = await this.client.query(
      "SELECT * FROM adjustment_transactions WHERE sku = $1",
      [sku]
    );

    let adjustmentTransaction: AdjustmentTransaction[] = [];

    if (result.rows.length > 0) {
      adjustmentTransaction = result.rows.map(
        PostgresAdjustmentTransactionMapper.toDomain
      );
    }

    console.log({ methodName, message: "END" });

    return adjustmentTransaction;
  }

  async create(adjustmentTransaction: AdjustmentTransaction): Promise<void> {
    const methodName = `create`;

    console.log({ methodName, message: "BEGIN" });

    const props = PostgresAdjustmentTransactionMapper.toPersistence(
      adjustmentTransaction
    );

    await this.client.query(
      "INSERT INTO adjustment_transactions(id, sku, qty) VALUES($1, $2, $3)",
      [props.id, props.sku, props.qty]
    );

    console.log({ methodName, message: "END" });
  }

  async update(adjustmentTransaction: AdjustmentTransaction): Promise<void> {
    const methodName = `update`;

    console.log({ methodName, message: "BEGIN" });

    const props = PostgresAdjustmentTransactionMapper.toPersistence(
      adjustmentTransaction
    );

    await this.client.query(
      "UPDATE adjustment_transactions SET sku = $1, qty = $2 WHERE id = $3",
      [props.sku, props.qty, props.id]
    );

    console.log({ methodName, message: "END" });
  }

  async delete(adjustmentTransaction: AdjustmentTransaction): Promise<void> {
    const methodName = `delete`;

    console.log({ methodName, message: "BEGIN" });

    const props = PostgresAdjustmentTransactionMapper.toPersistence(
      adjustmentTransaction
    );

    await this.client.query(
      "DELETE FROM adjustment_transactions WHERE id = $1",
      [props.id]
    );

    console.log({ methodName, message: "END" });
  }

  async deleteBySku(sku: string): Promise<void> {
    const methodName = `deleteBySku`;

    console.log({ methodName, message: "BEGIN" });

    await this.client.query(
      "DELETE FROM adjustment_transactions WHERE sku = $1",
      [sku]
    );

    console.log({ methodName, message: "END" });
  }
}