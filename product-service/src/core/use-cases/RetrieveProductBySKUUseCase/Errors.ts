import { Result } from "../../../shared/core/Result";
import { UseCaseError } from "../../../shared/core/UseCaseError";

export namespace RetrieveProductBySKUErrors {
  export class ProductNotFound extends Result<UseCaseError> {
    constructor(sku: string) {
      super(false, {
        message: `Product sku ${sku} was not found`,
      } as UseCaseError);
    }
  }
}
