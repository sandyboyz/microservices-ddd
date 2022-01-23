import { Result } from "../../../shared/core/Result";
import { UseCaseError } from "../../../shared/core/UseCaseError";

export namespace RetrieveAdjustmentTransactionByIdErrors {
  export class AdjustmentTransactionNotFound extends Result<UseCaseError> {
    constructor(id: string) {
      super(false, {
        message: `AdjustmentTransaction ${id} was not found`,
      } as UseCaseError);
    }
  }
}
