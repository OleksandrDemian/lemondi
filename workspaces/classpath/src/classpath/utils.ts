import { ClassPathSymbols } from "./symbols";

export function assignDecoratorId (decorator: any): symbol {
  if (!decorator.prototype[ClassPathSymbols.DECORATOR_ID]) {
    decorator.prototype[ClassPathSymbols.DECORATOR_ID] = Symbol();
  }

  return decorator.prototype[ClassPathSymbols.DECORATOR_ID];
}
