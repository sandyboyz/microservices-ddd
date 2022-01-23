import { Result } from "../../../shared/core/Result";
import { UseCaseError } from "../../../shared/core/UseCaseError";

export namespace UpdateProductErrors {
  export class SkuAlreadyExists extends Result<UseCaseError> {
    constructor(sku: string) {
      super(false, {
        message: `SKU ${sku} was already exists`,
      } as UseCaseError);
    }
  }

  export class ProductNotFound extends Result<UseCaseError> {
    constructor(id: string) {
      super(false, {
        message: `Product ${id} was not found`,
      } as UseCaseError);
    }
  }
}
