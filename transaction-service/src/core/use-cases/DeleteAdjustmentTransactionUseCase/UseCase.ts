import joi from "joi";
import { BaseUseCase } from "../../../shared/core/BaseUseCase";
import { Guard } from "../../../shared/core/Guard";
import { Either, left, Result, right } from "../../../shared/core/Result";
import { AppError } from "../../../shared/core/AppError";

import { DeleteAdjustmentTransactionRequestDTO } from "./RequestDTO";
import { DeleteAdjustmentTransactionResponseDTO } from "./ResponseDTO";
import { IAdjustmentTransactionRepository } from "../../repository/IAdjustmentTransactionRepository";
import { JSONAdjustmentTransactionSerializer } from "../../serializers/JSONAdjustmentTransactionSerializer";
import { UniqueEntityID } from "../../../shared/domain/UniqueEntityID";
import { DeleteAdjustmentTransactionErrors } from ".";

type Response = Either<
  AppError.UnexpectedError | DeleteAdjustmentTransactionErrors.AdjustmentTransactionNotFound,
  Result<DeleteAdjustmentTransactionResponseDTO>
>;

export type DeleteAdjustmentTransactionResponse = Response;

export class DeleteAdjustmentTransactionUseCase extends BaseUseCase<
  DeleteAdjustmentTransactionRequestDTO,
  DeleteAdjustmentTransactionResponse
> {
  private SCHEMA = joi.object<DeleteAdjustmentTransactionRequestDTO>({
    id: joi.string().uuid().required()
  });

  constructor(protected transactionRepository: IAdjustmentTransactionRepository) {
    super();
  }

  async execute(req: DeleteAdjustmentTransactionRequestDTO): Promise<DeleteAdjustmentTransactionResponse> {
    const methodName = "execute";

    console.log({ methodName, message: "BEGIN" });

    const guardResult = Guard.againstSchema<DeleteAdjustmentTransactionRequestDTO>(
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
      const transactionExists = await this.transactionRepository.retrieveById(
        new UniqueEntityID(dto.id)
      );

      if (!transactionExists) {
        return left(new DeleteAdjustmentTransactionErrors.AdjustmentTransactionNotFound(dto.id));
      }

      await this.transactionRepository.delete(transactionExists);

      const transactionSerialize = JSONAdjustmentTransactionSerializer.serialize(transactionExists);

      const response: DeleteAdjustmentTransactionResponseDTO = {
        data: transactionSerialize,
      };

      console.log({ methodName, message: "END" });

      return right(Result.ok<DeleteAdjustmentTransactionResponseDTO>(response));
    } catch (err: unknown) {
      return left(new AppError.UnexpectedError(err as Error));
    }
  }
}
