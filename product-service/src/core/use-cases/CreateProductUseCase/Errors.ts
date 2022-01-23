import { Result } from "../../../shared/core/Result";
import { UseCaseError } from "../../../shared/core/UseCaseError";

export namespace CreateProductErrors {
  export class SkuAlreadyExists extends Result<UseCaseError> {
    constructor(sku: string) {
      super(false, {
        message: `SKU ${sku} was already exists`,
      } as UseCaseError);
    }
  }
}
