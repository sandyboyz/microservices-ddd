import { UseCase } from "./UseCase";

export abstract class BaseUseCase<IRequest, IResponse>
  implements UseCase<IRequest, IResponse>
{
  abstract execute(request: IRequest): Promise<IResponse> | IResponse;
}
