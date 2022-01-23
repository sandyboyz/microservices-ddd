import joi from "joi";
import { BaseUseCase } from "../../../shared/core/BaseUseCase";
import { Guard } from "../../../shared/core/Guard";
import { Either, left, Result, right } from "../../../shared/core/Result";
import { AppError } from "../../../shared/core/AppError";

import { RetrieveProductByIdRequestDTO } from "./RequestDTO";
import { RetrieveProductByIdResponseDTO } from "./ResponseDTO";
import { IProductRepository } from "../../repository/IProductRepository";
import { JSONProductSerializer } from "../../serializers/JSONProductSerializer";
import { TransactionProvider } from "../../providers/TransactionProvider";
import { RetrieveProductByIdErrors } from ".";
import { UniqueEntityID } from "../../../shared/domain/UniqueEntityID";

type Response = Either<
  AppError.UnexpectedError | RetrieveProductByIdErrors.ProductNotFound,
  Result<RetrieveProductByIdResponseDTO>
>;

export type RetrieveProductByIdResponse = Response;

export class RetrieveProductByIdUseCase extends BaseUseCase<
  RetrieveProductByIdRequestDTO,
  RetrieveProductByIdResponse
> {
  private SCHEMA = joi.object<RetrieveProductByIdRequestDTO>({
    id: joi.string().uuid().required(),
  });

  constructor(
    protected productRepository: IProductRepository,
    protected transactionProvider: TransactionProvider
  ) {
    super();
  }

  async execute(
    req: RetrieveProductByIdRequestDTO
  ): Promise<RetrieveProductByIdResponse> {
    const methodName = "execute";

    console.log({ methodName, message: "BEGIN" });

    const guardResult = Guard.againstSchema<RetrieveProductByIdRequestDTO>(
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
      const product = await this.productRepository.retrieveById(
        new UniqueEntityID(dto.id)
      );

      if (!product) {
        return left(new RetrieveProductByIdErrors.ProductNotFound(dto.id));
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

      const response: RetrieveProductByIdResponseDTO = {
        data: productSerialize,
      };

      console.log({ methodName, message: "END" });

      return right(Result.ok<RetrieveProductByIdResponseDTO>(response));
    } catch (err: unknown) {
      return left(new AppError.UnexpectedError(err as Error));
    }
  }
}
