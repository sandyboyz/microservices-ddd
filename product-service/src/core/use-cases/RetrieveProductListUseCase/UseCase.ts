import joi from "joi";
import { BaseUseCase } from "../../../shared/core/BaseUseCase";
import { Guard } from "../../../shared/core/Guard";
import { Either, left, Result, right } from "../../../shared/core/Result";
import { AppError } from "../../../shared/core/AppError";

import { RetrieveProductListRequestDTO } from "./RequestDTO";
import { RetrieveProductListResponseDTO } from "./ResponseDTO";
import { IProductRepository } from "../../repository/IProductRepository";
import { JSONProductSerializer } from "../../serializers/JSONProductSerializer";
import { PRODUCT_LIMIT_DATA } from "../../repository/PostgresProductRepository";
import { TransactionProvider } from "../../providers/TransactionProvider";

type Response = Either<
  AppError.UnexpectedError,
  Result<RetrieveProductListResponseDTO>
>;

export type RetrieveProductListResponse = Response;

export class RetrieveProductListUseCase extends BaseUseCase<
  RetrieveProductListRequestDTO,
  RetrieveProductListResponse
> {
  private SCHEMA = joi.object<RetrieveProductListRequestDTO>({
    page: joi.number().min(1).required(),
  });

  constructor(
    protected productRepository: IProductRepository,
    protected transactionProvider: TransactionProvider
  ) {
    super();
  }

  async execute(
    req: RetrieveProductListRequestDTO
  ): Promise<RetrieveProductListResponse> {
    const methodName = "execute";

    console.log({ methodName, message: "BEGIN" });

    const guardResult = Guard.againstSchema<RetrieveProductListRequestDTO>(
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
      const count = await this.productRepository.count();

      const products = await this.productRepository.retrieveAll(dto.page);

      for (const product of products) {
        const transactions = await this.transactionProvider.getTransactions(
          product.sku
        );

        const stock = transactions.reduce(
          (sum, transaction) => sum + transaction.quantity,
          0
        );

        product.setStock(stock);
      }

      const productsSerialize = products.map(JSONProductSerializer.serialize);

      const response: RetrieveProductListResponseDTO = {
        totalData: count,
        page: dto.page,
        totalPage: Math.ceil(count / PRODUCT_LIMIT_DATA),
        data: productsSerialize,
      };

      console.log({ methodName, message: "END" });

      return right(Result.ok<RetrieveProductListResponseDTO>(response));
    } catch (err: unknown) {
      return left(new AppError.UnexpectedError(err as Error));
    }
  }
}
