import joi from "joi";
import { BaseUseCase } from "../../../shared/core/BaseUseCase";
import { Guard } from "../../../shared/core/Guard";
import { Either, left, Result, right } from "../../../shared/core/Result";
import { AppError } from "../../../shared/core/AppError";

import { DeleteAdjustmentTransactionBySKURequestDTO } from "./RequestDTO";
import { DeleteAdjustmentTransactionBySKUResponseDTO } from "./ResponseDTO";
import { IAdjustmentTransactionRepository } from "../../repository/IAdjustmentTransactionRepository";
import { JSONAdjustmentTransactionSerializer } from "../../serializers/JSONAdjustmentTransactionSerializer";
import { UniqueEntityID } from "../../../shared/domain/UniqueEntityID";
import { DeleteAdjustmentTransactionBySKUErrors } from ".";

type Response = Either<
  AppError.UnexpectedError | DeleteAdjustmentTransactionBySKUErrors.AdjustmentTransactionNotFound,
  Result<DeleteAdjustmentTransactionBySKUResponseDTO>
>;

export type DeleteAdjustmentTransactionBySKUResponse = Response;

export class DeleteAdjustmentTransactionBySKUUseCase extends BaseUseCase<
  DeleteAdjustmentTransactionBySKURequestDTO,
  DeleteAdjustmentTransactionBySKUResponse
> {
  private SCHEMA = joi.object<DeleteAdjustmentTransactionBySKURequestDTO>({
    sku: joi.string().required()
  });

  constructor(protected transactionRepository: IAdjustmentTransactionRepository) {
    super();
  }

  async execute(req: DeleteAdjustmentTransactionBySKURequestDTO): Promise<DeleteAdjustmentTransactionBySKUResponse> {
    const methodName = "execute";

    console.log({ methodName, message: "BEGIN" });

    const guardResult = Guard.againstSchema<DeleteAdjustmentTransactionBySKURequestDTO>(
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
      const transactionsExists = await this.transactionRepository.retrieveBySku(
        dto.sku
      );

      await this.transactionRepository.deleteBySku(dto.sku);

      const transactionSerialize = transactionsExists.map(JSONAdjustmentTransactionSerializer.serialize);

      const response: DeleteAdjustmentTransactionBySKUResponseDTO = {
        data: transactionSerialize,
      };

      console.log({ methodName, message: "END" });

      return right(Result.ok<DeleteAdjustmentTransactionBySKUResponseDTO>(response));
    } catch (err: unknown) {
      return left(new AppError.UnexpectedError(err as Error));
    }
  }
}
