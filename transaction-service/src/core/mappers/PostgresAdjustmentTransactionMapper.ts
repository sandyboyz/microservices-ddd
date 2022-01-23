import { StaticImplements } from "../../shared/decorators/StaticImplements";
import { Mapper } from "../../shared/core/Mapper";
import { UniqueEntityID } from "../../shared/domain/UniqueEntityID";
import { AdjustmentTransaction } from "../domains/AdjustmentTransaction";

export interface PostgresAdjustmentTransactionProps {
  id: string;

  sku: string;
  qty: number;

  created_at?: Date;
}

@StaticImplements<
  Mapper<AdjustmentTransaction, PostgresAdjustmentTransactionProps>
>()
export class PostgresAdjustmentTransactionMapper {
  public static toDomain(
    props: PostgresAdjustmentTransactionProps
  ): AdjustmentTransaction {
    const adjustmentTransactionOrError = AdjustmentTransaction.create(
      {
        sku: props.sku,
        quantity: props.qty,
        createdAt: props.created_at,
      },
      new UniqueEntityID(props.id)
    );

    if (adjustmentTransactionOrError.isFailure) {
      throw adjustmentTransactionOrError.errorValue();
    } else {
      return adjustmentTransactionOrError.getValue();
    }
  }

  public static toPersistence(
    domain: AdjustmentTransaction
  ): PostgresAdjustmentTransactionProps {
    return {
      id: domain.id.toString(),

      sku: domain.sku,
      qty: domain.quantity,

      created_at: domain.createdAt,
    };
  }
}
