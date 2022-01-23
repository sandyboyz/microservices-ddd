import joi from "joi";
import { BaseUseCase } from "../../../shared/core/BaseUseCase";
import { Guard } from "../../../shared/core/Guard";
import { Either, left, Result, right } from "../../../shared/core/Result";
import { AppError } from "../../../shared/core/AppError";

import { RetrieveProductBySKURequestDTO } from "./RequestDTO";
import { RetrieveProductBySKUResponseDTO } from "./ResponseDTO";
import { IProductRepository } from "../../repository/IProductRepository";
import { JSONProductSerializer } from "../../serializers/JSONProductSerializer";
import { TransactionProvider } from "../../providers/TransactionProvider";
import { RetrieveProductBySKUErrors } from ".";

type Response = Either<
  AppError.UnexpectedError | RetrieveProductBySKUErrors.ProductNotFound,
  Result<RetrieveProductBySKUResponseDTO>
>;

export type RetrieveProductBySKUResponse = Response;

export class RetrieveProductBySKUUseCase extends BaseUseCase<
  RetrieveProductBySKURequestDTO,
  RetrieveProductBySKUResponse
> {
  private SCHEMA = joi.object<RetrieveProductBySKURequestDTO>({
    sku: joi.string().required(),
  });

  constructor(
    protected productRepository: IProductRepository,
    protected transactionProvider: TransactionProvider
  ) {
    super();
  }

  async execute(
    req: RetrieveProductBySKURequestDTO
  ): Promise<RetrieveProductBySKUResponse> {
    const methodName = "execute";

    console.log({ methodName, message: "BEGIN" });

    const guardResult = Guard.againstSchema<RetrieveProductBySKURequestDTO>(
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
      const product = await this.productRepository.retrieveBySku(dto.sku);

      if (!product) {
        return left(new RetrieveProductBySKUErrors.ProductNotFound(dto.sku));
      }

      const transactions = await this.transactionProvider.getTransactions(
        product.sku
      );
      const stock = transactions.reduce(
        (sum, transaction) => transaction.quantity + sum,
        0
      );
      product.setStock(stock);

      const productSerialize =
        JSONProductSerializer.serializeWithoutDescription(product);

      const response: RetrieveProductBySKUResponseDTO = {
        data: productSerialize,
      };

      console.log({ methodName, message: "END" });

      return right(Result.ok<RetrieveProductBySKUResponseDTO>(response));
    } catch (err: unknown) {
      return left(new AppError.UnexpectedError(err as Error));
    }
  }
}
