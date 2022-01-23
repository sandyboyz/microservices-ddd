import { Result } from "../../../shared/core/Result";
import { UseCaseError } from "../../../shared/core/UseCaseError";

export namespace UpdateAdjustmentTransactionErrors {
  export class SkuAlreadyExists extends Result<UseCaseError> {
    constructor(sku: string) {
      super(false, {
        message: `SKU ${sku} was already exists`,
      } as UseCaseError);
    }
  }

  export class AdjustmentTransactionNotFound extends Result<UseCaseError> {
    constructor(id: string) {
      super(false, {
        message: `AdjustmentTransaction ${id} was not found`,
      } as UseCaseError);
    }
  }
}
