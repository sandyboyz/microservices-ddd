import joi from "joi";
import { BaseUseCase } from "../../../shared/core/BaseUseCase";
import { Guard } from "../../../shared/core/Guard";
import { Either, left, Result, right } from "../../../shared/core/Result";
import { AppError } from "../../../shared/core/AppError";

import { UpdateAdjustmentTransactionRequestDTO } from "./RequestDTO";
import { UpdateAdjustmentTransactionResponseDTO } from "./ResponseDTO";
import { IAdjustmentTransactionRepository } from "../../repository/IAdjustmentTransactionRepository";
import { JSONAdjustmentTransactionSerializer } from "../../serializers/JSONAdjustmentTransactionSerializer";

import { UniqueEntityID } from "../../../shared/domain/UniqueEntityID";
import { UpdateAdjustmentTransactionErrors } from ".";

type Response = Either<
  | AppError.UnexpectedError
  | UpdateAdjustmentTransactionErrors.SkuAlreadyExists
  | UpdateAdjustmentTransactionErrors.AdjustmentTransactionNotFound,
  Result<UpdateAdjustmentTransactionResponseDTO>
>;

export type UpdateAdjustmentTransactionResponse = Response;

export class UpdateAdjustmentTransactionUseCase extends BaseUseCase<
  UpdateAdjustmentTransactionRequestDTO,
  UpdateAdjustmentTransactionResponse
> {
  private SCHEMA = joi.object<UpdateAdjustmentTransactionRequestDTO>({
    id: joi.string().uuid().required(),

    sku: joi.string().required(),
    quantity: joi.number().required(),
  });

  constructor(protected transactionRepository: IAdjustmentTransactionRepository) {
    super();
  }

  async execute(
    req: UpdateAdjustmentTransactionRequestDTO
  ): Promise<UpdateAdjustmentTransactionResponse> {
    const methodName = "execute";

    console.log({ methodName, message: "BEGIN" });

    const guardResult =
      Guard.againstSchema<UpdateAdjustmentTransactionRequestDTO>(
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
      const transaction = await this.transactionRepository.retrieveById(
        new UniqueEntityID(dto.id)
      );

      if (!transaction) {
        return left(
          new UpdateAdjustmentTransactionErrors.AdjustmentTransactionNotFound(
            dto.id
          )
        );
      }

      if (dto.sku) {
        transaction.setSKU(dto.sku);
      }

      if (dto.quantity) {
        transaction.setQuantity(dto.quantity);
      }

      await this.transactionRepository.update(transaction);

      const transactionSerialize =
        JSONAdjustmentTransactionSerializer.serialize(transaction);

      const response: UpdateAdjustmentTransactionResponseDTO = {
        data: transactionSerialize,
      };

      console.log({ methodName, message: "END" });

      return right(Result.ok<UpdateAdjustmentTransactionResponseDTO>(response));
    } catch (err: unknown) {
      return left(new AppError.UnexpectedError(err as Error));
    }
  }
}
