import { ClassPathSymbols } from "./symbols";
import {TDecoratorCtor} from "../types";

export function assignDecoratorId (decorator: TDecoratorCtor): symbol {
  if (!decorator.prototype[ClassPathSymbols.DECORATOR_ID]) {
    decorator.prototype[ClassPathSymbols.DECORATOR_ID] = Symbol();
  }

  return decorator.prototype[ClassPathSymbols.DECORATOR_ID];
}
