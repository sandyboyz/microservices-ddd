import { Schema } from "joi";



export interface IGuardResult<T> {
  succeeded: boolean;
  value?: T;
  message?: string;
}

export interface IGuardArgument {
  argument: any;
  argumentName: string;
}

export type GuardArgumentCollection = IGuardArgument[];

export class Guard {
  public static combine<T>(guardResults: IGuardResult<T>[]): IGuardResult<T> {
    for (let result of guardResults) {
      if (result.succeeded === false) return result;
    }

    return { succeeded: true };
  }

  /**
   *
   * @param schema
   * @param value
   */
  public static againstSchema<T>(schema: Schema, value: any): IGuardResult<T> {
    const result = schema.validate(value, { abortEarly: false });
    if (result.error) {
      return {
        succeeded: false,
        message: result.error.message,
      };
    } else {
      return { succeeded: true, value: result.value as T };
    }
  }

 
}
