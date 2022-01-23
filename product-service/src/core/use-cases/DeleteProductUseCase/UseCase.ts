import joi from "joi";
import { BaseUseCase } from "../../../shared/core/BaseUseCase";
import { Guard } from "../../../shared/core/Guard";
import { Either, left, Result, right } from "../../../shared/core/Result";
import { AppError } from "../../../shared/core/AppError";

import { DeleteProductRequestDTO } from "./RequestDTO";
import { DeleteProductResponseDTO } from "./ResponseDTO";
import { IProductRepository } from "../../repository/IProductRepository";
import { JSONProductSerializer } from "../../serializers/JSONProductSerializer";
import { UniqueEntityID } from "../../../shared/domain/UniqueEntityID";
import { DeleteProductErrors } from ".";
import { TransactionProvider } from "../../providers/TransactionProvider";

type Response = Either<
  AppError.UnexpectedError | DeleteProductErrors.ProductNotFound,
  Result<DeleteProductResponseDTO>
>;

export type DeleteProductResponse = Response;

export class DeleteProductUseCase extends BaseUseCase<
  DeleteProductRequestDTO,
  DeleteProductResponse
> {
  private SCHEMA = joi.object<DeleteProductRequestDTO>({
    id: joi.string().uuid().required()
  });

  constructor(protected productRepository: IProductRepository, protected transactionProvider: TransactionProvider) {
    super();
  }

  async execute(req: DeleteProductRequestDTO): Promise<DeleteProductResponse> {
    const methodName = "execute";

    console.log({ methodName, message: "BEGIN" });

    const guardResult = Guard.againstSchema<DeleteProductRequestDTO>(
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
      const productExists = await this.productRepository.retrieveById(
        new UniqueEntityID(dto.id)
      );

      if (!productExists) {
        return left(new DeleteProductErrors.ProductNotFound(dto.id));
      }

      await this.transactionProvider.deleteTransactionBySKU(productExists.sku);
      await this.productRepository.delete(productExists);

      const productSerialize = JSONProductSerializer.serialize(productExists);

      const response: DeleteProductResponseDTO = {
        data: productSerialize,
      };

      console.log({ methodName, message: "END" });

      return right(Result.ok<DeleteProductResponseDTO>(response));
    } catch (err: unknown) {
      return left(new AppError.UnexpectedError(err as Error));
    }
  }
}
