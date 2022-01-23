import joi from "joi";
import { BaseUseCase } from "../../../shared/core/BaseUseCase";
import { Guard } from "../../../shared/core/Guard";
import { Either, left, Result, right } from "../../../shared/core/Result";
import { AppError } from "../../../shared/core/AppError";

import { RetrieveAdjustmentTransactionBySKURequestDTO } from "./RequestDTO";
import { RetrieveAdjustmentTransactionBySKUResponseDTO } from "./ResponseDTO";
import { IAdjustmentTransactionRepository } from "../../repository/IAdjustmentTransactionRepository";
import { JSONAdjustmentTransactionSerializer } from "../../serializers/JSONAdjustmentTransactionSerializer";
import { ProductProvider } from "../../providers/ProductProviders";
import { UniqueEntityID } from "../../../shared/domain/UniqueEntityID";
import { RetrieveAdjustmentTransactionBySKUErrors } from ".";

type Response = Either<
  | AppError.UnexpectedError
  | RetrieveAdjustmentTransactionBySKUErrors.AdjustmentTransactionNotFound,
  Result<RetrieveAdjustmentTransactionBySKUResponseDTO>
>;

export type RetrieveAdjustmentTransactionBySKUResponse = Response;

export class RetrieveAdjustmentTransactionBySKUUseCase extends BaseUseCase<
  RetrieveAdjustmentTransactionBySKURequestDTO,
  RetrieveAdjustmentTransactionBySKUResponse
> {
  private SCHEMA = joi.object<RetrieveAdjustmentTransactionBySKURequestDTO>({
    sku: joi.string().required(),
  });

  constructor(
    protected transactionRepository: IAdjustmentTransactionRepository
  ) {
    super();
  }

  async execute(
    req: RetrieveAdjustmentTransactionBySKURequestDTO
  ): Promise<RetrieveAdjustmentTransactionBySKUResponse> {
    const methodName = "execute";

    console.log({ methodName, message: "BEGIN" });

    const guardResult =
      Guard.againstSchema<RetrieveAdjustmentTransactionBySKURequestDTO>(
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
      const transactions = await this.transactionRepository.retrieveBySku(
        dto.sku
      );

      const transactionSerialize = transactions.map(
        JSONAdjustmentTransactionSerializer.serialize
      );

      const response: RetrieveAdjustmentTransactionBySKUResponseDTO = {
        data: transactionSerialize,
      };

      console.log({ methodName, message: "END" });

      return right(
        Result.ok<RetrieveAdjustmentTransactionBySKUResponseDTO>(response)
      );
    } catch (err: unknown) {
      return left(new AppError.UnexpectedError(err as Error));
    }
  }
}
