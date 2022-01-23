import joi from "joi";
import { BaseUseCase } from "../../../shared/core/BaseUseCase";
import { Guard } from "../../../shared/core/Guard";
import { Either, left, Result, right } from "../../../shared/core/Result";
import { AppError } from "../../../shared/core/AppError";

import { CreateProductRequestDTO } from "./RequestDTO";
import { CreateProductResponseDTO } from "./ResponseDTO";
import { IProductRepository } from "../../repository/IProductRepository";
import { JSONProductSerializer } from "../../serializers/JSONProductSerializer";
import { CreateProductErrors } from ".";
import { Product } from "../../domains/Product";

type Response = Either<
  AppError.UnexpectedError | CreateProductErrors.SkuAlreadyExists,
  Result<CreateProductResponseDTO>
>;

export type CreateProductResponse = Response;

export class CreateProductUseCase extends BaseUseCase<
  CreateProductRequestDTO,
  CreateProductResponse
> {
  private SCHEMA = joi.object<CreateProductRequestDTO>({
    name: joi.string().required(),
    sku: joi.string().required(),
    image: joi.string().required(),
    price: joi.number().required(),
    description: joi.string().optional().default(""),
  });

  constructor(protected productRepository: IProductRepository) {
    super();
  }

  async execute(req: CreateProductRequestDTO): Promise<CreateProductResponse> {
    const methodName = "execute";

    console.log({ methodName, message: "BEGIN" });

    const guardResult = Guard.againstSchema<CreateProductRequestDTO>(
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
      // Check if SKU Exists
      const productExists = await this.productRepository.retrieveBySku(dto.sku);

      if (productExists) {
        return left(new CreateProductErrors.SkuAlreadyExists(dto.sku));
      }

      const productOrError = Product.create({
        name: dto.name,
        sku: dto.sku,
        image: dto.image,
        price: dto.price,
        description: dto.description,
      });

      if (productOrError.isFailure) {
        return left(new AppError.UnexpectedError(productOrError.error));
      }

      const product = productOrError.getValue();

      await this.productRepository.create(product);

      const productSerialize = JSONProductSerializer.serialize(product);

      const response: CreateProductResponseDTO = {
        data: productSerialize,
      };

      console.log({ methodName, message: "END" });

      return right(Result.ok<CreateProductResponseDTO>(response));
    } catch (err: unknown) {
      return left(new AppError.UnexpectedError(err as Error));
    }
  }
}
