export function StaticImplements<T>(): <U extends T>(constructor: U) => void {
  // tslint:disable:no-unused-expression
  return <U extends T>(constructor: U) => {
    constructor;
  };
}
