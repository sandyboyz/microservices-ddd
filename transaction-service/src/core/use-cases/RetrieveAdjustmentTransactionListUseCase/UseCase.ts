import joi from "joi";
import { BaseUseCase } from "../../../shared/core/BaseUseCase";
import { Guard } from "../../../shared/core/Guard";
import { Either, left, Result, right } from "../../../shared/core/Result";
import { AppError } from "../../../shared/core/AppError";

import { RetrieveAdjustmentTransactionListRequestDTO } from "./RequestDTO";
import { RetrieveAdjustmentTransactionListResponseDTO } from "./ResponseDTO";
import { IAdjustmentTransactionRepository } from "../../repository/IAdjustmentTransactionRepository";
import { JSONAdjustmentTransactionSerializer } from "../../serializers/JSONAdjustmentTransactionSerializer";
import { ADJUSTMENT_TRANSACTION_LIMIT_DATA } from "../../repository/PostgresAdjustmentTransactionRepository";
import { ProductProvider } from "../../providers/ProductProviders";

type Response = Either<
  AppError.UnexpectedError,
  Result<RetrieveAdjustmentTransactionListResponseDTO>
>;

export type RetrieveAdjustmentTransactionListResponse = Response;

export class RetrieveAdjustmentTransactionListUseCase extends BaseUseCase<
  RetrieveAdjustmentTransactionListRequestDTO,
  RetrieveAdjustmentTransactionListResponse
> {
  private SCHEMA = joi.object<RetrieveAdjustmentTransactionListRequestDTO>({
    page: joi.number().min(1).required(),
  });

  constructor(
    protected transactionRepository: IAdjustmentTransactionRepository,
    protected productProvider: ProductProvider
  ) {
    super();
  }

  async execute(
    req: RetrieveAdjustmentTransactionListRequestDTO
  ): Promise<RetrieveAdjustmentTransactionListResponse> {
    const methodName = "execute";

    console.log({ methodName, message: "BEGIN" });

    const guardResult = Guard.againstSchema<RetrieveAdjustmentTransactionListRequestDTO>(
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
      const count = await this.transactionRepository.count();

      const transactions = await this.transactionRepository.retrieveAll(dto.page);

      for (const transaction of transactions) {
        const product = await this.productProvider.getProduct(transaction.sku);

        transaction.setAmount(transaction.quantity * product.price);
      }

      const transactionsSerialize = transactions.map(JSONAdjustmentTransactionSerializer.serialize);

      const response: RetrieveAdjustmentTransactionListResponseDTO = {
        totalData: count,
        page: dto.page,
        totalPage: Math.ceil(count / ADJUSTMENT_TRANSACTION_LIMIT_DATA),
        data: transactionsSerialize,
      };

      console.log({ methodName, message: "END" });

      return right(Result.ok<RetrieveAdjustmentTransactionListResponseDTO>(response));
    } catch (err: unknown) {
      return left(new AppError.UnexpectedError(err as Error));
    }
  }
}
