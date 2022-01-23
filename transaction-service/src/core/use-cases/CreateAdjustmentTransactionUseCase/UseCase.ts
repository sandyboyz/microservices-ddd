import joi from "joi";
import { BaseUseCase } from "../../../shared/core/BaseUseCase";
import { Guard } from "../../../shared/core/Guard";
import { Either, left, Result, right } from "../../../shared/core/Result";
import { AppError } from "../../../shared/core/AppError";

import { CreateAdjustmentTransactionRequestDTO } from "./RequestDTO";
import { CreateAdjustmentTransactionResponseDTO } from "./ResponseDTO";
import { IAdjustmentTransactionRepository } from "../../repository/IAdjustmentTransactionRepository";
import { JSONAdjustmentTransactionSerializer } from "../../serializers/JSONAdjustmentTransactionSerializer";
import { CreateAdjustmentTransactionErrors } from ".";
import { AdjustmentTransaction } from "../../domains/AdjustmentTransaction";

type Response = Either<
  | AppError.UnexpectedError
  | CreateAdjustmentTransactionErrors.StockNotAvailable,
  Result<CreateAdjustmentTransactionResponseDTO>
>;

export type CreateAdjustmentTransactionResponse = Response;

export class CreateAdjustmentTransactionUseCase extends BaseUseCase<
  CreateAdjustmentTransactionRequestDTO,
  CreateAdjustmentTransactionResponse
> {
  private SCHEMA = joi.object<CreateAdjustmentTransactionRequestDTO>({
    sku: joi.string().required(),
    quantity: joi.number().required(),
  });

  constructor(
    protected transactionRepository: IAdjustmentTransactionRepository
  ) {
    super();
  }

  async execute(
    req: CreateAdjustmentTransactionRequestDTO
  ): Promise<CreateAdjustmentTransactionResponse> {
    const methodName = "execute";

    console.log({ methodName, message: "BEGIN" });

    const guardResult =
      Guard.againstSchema<CreateAdjustmentTransactionRequestDTO>(
        this.SCHEMA,
        req
      );
    if (!guardResult.succeeded) {
      return left(
        new AppError.ValidationError(guardResult.message!, guardResult.value)
      );
    }
    const dto = guardResult.value!;

    try {
      // Check if SKU Exists
      const transactionsExist = await this.transactionRepository.retrieveBySku(
        dto.sku
      );

      if (transactionsExist.length === 0) {
        return left(new CreateAdjustmentTransactionErrors.SKUNotFound(dto.sku));
      }

      const currentStock = transactionsExist.reduce(
        (sum, transaction) => sum + transaction.quantity,
        0
      );

      if (transactionsExist.length > 0 && currentStock + dto.quantity < 0) {
        return left(
          new CreateAdjustmentTransactionErrors.StockNotAvailable(dto.sku)
        );
      }

      const transactionOrError = AdjustmentTransaction.create({
        sku: dto.sku,
        quantity: dto.quantity,
      });

      if (transactionOrError.isFailure) {
        return left(new AppError.UnexpectedError(transactionOrError.error));
      }

      const transaction = transactionOrError.getValue();

      await this.transactionRepository.create(transaction);

      const transactionSerialize =
        JSONAdjustmentTransactionSerializer.serialize(transaction);

      const response: CreateAdjustmentTransactionResponseDTO = {
        data: transactionSerialize,
      };

      console.log({ methodName, message: "END" });

      return right(Result.ok<CreateAdjustmentTransactionResponseDTO>(response));
    } catch (err: unknown) {
      return left(new AppError.UnexpectedError(err as Error));
    }
  }
}
