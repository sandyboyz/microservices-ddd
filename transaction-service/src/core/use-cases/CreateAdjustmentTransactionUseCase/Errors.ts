import { Result } from "../../../shared/core/Result";
import { UseCaseError } from "../../../shared/core/UseCaseError";

export namespace CreateAdjustmentTransactionErrors {
  export class StockNotAvailable extends Result<UseCaseError> {
    constructor(sku: string) {
      super(false, {
        message: `SKU ${sku} stock was not available`,
      } as UseCaseError);
    }
  }

  export class SKUNotFound extends Result<UseCaseError> {
    constructor(sku: string) {
      super(false, {
        message: `SKU ${sku} was not available`,
      } as UseCaseError);
    }
  }
}
