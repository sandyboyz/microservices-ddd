import joi from "joi";
import { BaseUseCase } from "../../../shared/core/BaseUseCase";
import { Guard } from "../../../shared/core/Guard";
import { Either, left, Result, right } from "../../../shared/core/Result";
import { AppError } from "../../../shared/core/AppError";

import { UpdateProductRequestDTO } from "./RequestDTO";
import { UpdateProductResponseDTO } from "./ResponseDTO";
import { IProductRepository } from "../../repository/IProductRepository";
import { JSONProductSerializer } from "../../serializers/JSONProductSerializer";

import { UniqueEntityID } from "../../../shared/domain/UniqueEntityID";
import { UpdateProductErrors } from ".";

type Response = Either<
  | AppError.UnexpectedError
  | UpdateProductErrors.SkuAlreadyExists
  | UpdateProductErrors.ProductNotFound,
  Result<UpdateProductResponseDTO>
>;

export type UpdateProductResponse = Response;

export class UpdateProductUseCase extends BaseUseCase<
  UpdateProductRequestDTO,
  UpdateProductResponse
> {
  private SCHEMA = joi.object<UpdateProductRequestDTO>({
    id: joi.string().uuid().required(),
    name: joi.string().required(),
    sku: joi.string().required(),
    image: joi.string().required(),
    price: joi.number().required(),
    description: joi.string().optional().default(""),
  });

  constructor(protected productRepository: IProductRepository) {
    super();
  }

  async execute(req: UpdateProductRequestDTO): Promise<UpdateProductResponse> {
    const methodName = "execute";

    console.log({ methodName, message: "BEGIN" });

    const guardResult = Guard.againstSchema<UpdateProductRequestDTO>(
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
        return left(new UpdateProductErrors.ProductNotFound(dto.id));
      }

      if (dto.name) {
        productExists.setName(dto.name);
      }

      if (dto.sku) {
        const productSKUExists = await this.productRepository.retrieveBySku(
          dto.sku
        );

        if (productSKUExists && productSKUExists.id.toValue() !== dto.id) {
          return left(new UpdateProductErrors.SkuAlreadyExists(dto.sku));
        }

        productExists.setSku(dto.sku);
      }

      if (dto.image) {
        productExists.setImage(dto.image);
      }

      if (dto.price) {
        productExists.setPrice(dto.price);
      }

      if (dto.description) {
        productExists.setDescription(dto.description);
      }

      await this.productRepository.update(productExists);

      const productSerialize = JSONProductSerializer.serialize(productExists);

      const response: UpdateProductResponseDTO = {
        data: productSerialize,
      };

      console.log({ methodName, message: "END" });

      return right(Result.ok<UpdateProductResponseDTO>(response));
    } catch (err: unknown) {
      return left(new AppError.UnexpectedError(err as Error));
    }
  }
}
