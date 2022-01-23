import joi from "joi";
import { BaseUseCase } from "../../../shared/core/BaseUseCase";
import { Guard } from "../../../shared/core/Guard";
import { Either, left, Result, right } from "../../../shared/core/Result";
import { AppError } from "../../../shared/core/AppError";

import { InitialProductRequestDTO } from "./RequestDTO";
import { InitialProductResponseDTO } from "./ResponseDTO";
import { IProductRepository } from "../../repository/IProductRepository";
import { JSONProductSerializer } from "../../serializers/JSONProductSerializer";
import { EleveniaProvider } from "../../providers/EleveniaProvider";
import { TransactionProvider } from "../../providers/TransactionProvider";

type Response = Either<
  AppError.UnexpectedError,
  Result<InitialProductResponseDTO>
>;

export type InitialProductResponse = Response;

export class InitialProductUseCase extends BaseUseCase<
  InitialProductRequestDTO,
  InitialProductResponse
> {
  constructor(
    protected productRepository: IProductRepository,
    protected elevaniaProvider: EleveniaProvider,
    protected transactionProvider: TransactionProvider
  ) {
    super();
  }

  async execute(): Promise<InitialProductResponse> {
    const methodName = "execute";

    console.log({ methodName, message: "BEGIN" });

    try {
      // Retrieve Elevania
      const eleveniaProducts = await this.elevaniaProvider.getProducts();

      for (const product of eleveniaProducts) {
        const productExists = await this.productRepository.retrieveBySku(
          product.sku
        );

        if (productExists) {
          continue;
        }

        // Initial Stock to QTY
        await Promise.all([
          this.transactionProvider.insertTransaction(
            product.sku,
            product.stock!
          ),
          this.productRepository.create(product),
        ]);
      }

      const productSerialize = eleveniaProducts.map(
        JSONProductSerializer.serialize
      );

      const response: InitialProductResponseDTO = {
        data: productSerialize,
      };

      console.log({ methodName, message: "END" });

      return right(Result.ok<InitialProductResponseDTO>(response));
    } catch (err: unknown) {
      return left(new AppError.UnexpectedError(err as Error));
    }
  }
}
