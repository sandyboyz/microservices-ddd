import joi from "joi";
import { Entity } from "../../shared/domain/Entity";
import { UniqueEntityID } from "../../shared/domain/UniqueEntityID";
import { Guard } from "../../shared/core/Guard";
import { Result } from "../../shared/core/Result";

export interface AdjustmentTransactionProps {
  sku: string;
  quantity: number;

  amount?: number;

  createdAt?: Date;
}

export class AdjustmentTransaction extends Entity<AdjustmentTransactionProps> {
  private static SCHEMA = joi
    .object<AdjustmentTransactionProps>({
      sku: joi.string().required(),
      quantity: joi.number().required(),
      amount: joi.number().optional(),

      createdAt: joi.date().optional(),
    })
    .required();

  get id(): UniqueEntityID {
    return this._id;
  }

  get sku(): string {
    return this.props.sku;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get amount(): number | undefined {
    return this.props.amount;
  }

  get createdAt(): Date {
    return this.props.createdAt!;
  }

  setAmount(amount: number): Result<void> {
    this.props.amount = amount;
    return Result.ok();
  }

  setSKU(sku: string): Result<void> {
    this.props.sku = sku;
    return Result.ok();
  }

  setQuantity(quantity: number): Result<void> {
    this.props.quantity = quantity;
    return Result.ok();
  }

  public static create(
    props: AdjustmentTransactionProps,
    id?: UniqueEntityID
  ): Result<AdjustmentTransaction> {
    const guardResult = Guard.againstSchema<AdjustmentTransactionProps>(
      this.SCHEMA,
      props
    );
    if (!guardResult.succeeded) {
      return Result.fail(guardResult.message!);
    } else {
      props = guardResult.value!;
      const adjustmentTransaction = new AdjustmentTransaction(
        {
          ...props,
          createdAt: props.createdAt ? props.createdAt : new Date(),
        },
        id
      );

      return Result.ok(adjustmentTransaction);
    }
  }
}
