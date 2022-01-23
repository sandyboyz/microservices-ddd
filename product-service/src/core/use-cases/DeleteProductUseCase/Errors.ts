import { Result } from "../../../shared/core/Result";
import { UseCaseError } from "../../../shared/core/UseCaseError";

export namespace DeleteProductErrors {


  export class ProductNotFound extends Result<UseCaseError> {
    constructor(id: string) {
      super(false, {
        message: `Product ${id} was not found`,
      } as UseCaseError);
    }
  }
}
