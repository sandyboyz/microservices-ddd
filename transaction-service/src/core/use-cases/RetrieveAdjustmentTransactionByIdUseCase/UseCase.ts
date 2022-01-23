import joi from "joi";
import { BaseUseCase } from "../../../shared/core/BaseUseCase";
import { Guard } from "../../../shared/core/Guard";
import { Either, left, Result, right } from "../../../shared/core/Result";
import { AppError } from "../../../shared/core/AppError";

import { RetrieveAdjustmentTransactionByIdRequestDTO } from "./RequestDTO";
import { RetrieveAdjustmentTransactionByIdResponseDTO } from "./ResponseDTO";
import { IAdjustmentTransactionRepository } from "../../repository/IAdjustmentTransactionRepository";
import { JSONAdjustmentTransactionSerializer } from "../../serializers/JSONAdjustmentTransactionSerializer";
import { ProductProvider } from "../../providers/ProductProviders";
import { UniqueEntityID } from "../../../shared/domain/UniqueEntityID";
import { RetrieveAdjustmentTransactionByIdErrors } from ".";

type Response = Either<
  | AppError.UnexpectedError
  | RetrieveAdjustmentTransactionByIdErrors.AdjustmentTransactionNotFound,
  Result<RetrieveAdjustmentTransactionByIdResponseDTO>
>;

export type RetrieveAdjustmentTransactionByIdResponse = Response;

export class RetrieveAdjustmentTransactionByIdUseCase extends BaseUseCase<
  RetrieveAdjustmentTransactionByIdRequestDTO,
  RetrieveAdjustmentTransactionByIdResponse
> {
  private SCHEMA = joi.object<RetrieveAdjustmentTransactionByIdRequestDTO>({
    id: joi.string().uuid().required(),
  });

  constructor(
    protected transactionRepository: IAdjustmentTransactionRepository,
    protected productProvider: ProductProvider
  ) {
    super();
  }

  async execute(
    req: RetrieveAdjustmentTransactionByIdRequestDTO
  ): Promise<RetrieveAdjustmentTransactionByIdResponse> {
    const methodName = "execute";

    console.log({ methodName, message: "BEGIN" });

    const guardResult =
      Guard.againstSchema<RetrieveAdjustmentTransactionByIdRequestDTO>(
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
          new RetrieveAdjustmentTransactionByIdErrors.AdjustmentTransactionNotFound(
            dto.id
          )
        );
      }

      const product = await this.productProvider.getProduct(transaction.sku);
      transaction.setAmount(transaction.quantity * product.price);

      const transactionSerialize =
        JSONAdjustmentTransactionSerializer.serialize(transaction);

      const response: RetrieveAdjustmentTransactionByIdResponseDTO = {
        data: transactionSerialize,
      };

      console.log({ methodName, message: "END" });

      return right(
        Result.ok<RetrieveAdjustmentTransactionByIdResponseDTO>(response)
      );
    } catch (err: unknown) {
      return left(new AppError.UnexpectedError(err as Error));
    }
  }
}
