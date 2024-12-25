import {TClassDecorator, TCreateClassDecorator, TCreateMethodDecorator, TCtor, TMethodDecorator} from "./types";
import {ClassDecoratorsSymbol, ClassMethodsDecoratorsSymbol} from "./symbols";
import {getDecoratorId} from "./utils";

export  function decorateClass <TProps>(ctor: TCtor, decoratorId: symbol, decoratorProps: TProps) {
  if (!ctor.prototype[ClassDecoratorsSymbol]) {
    ctor.prototype[ClassDecoratorsSymbol] = [];
  }

  ctor.prototype[ClassDecoratorsSymbol].push({
    decoratorId,
    decoratorProps,
  } satisfies TClassDecorator<TProps>);
}

export function decorateMethod <TProps>(ctor: TCtor, methodName: string, decoratorId: symbol, decoratorProps: TProps) {
  if (!ctor[ClassMethodsDecoratorsSymbol]) {
    ctor[ClassMethodsDecoratorsSymbol] = {};
  }

  if (!ctor[ClassMethodsDecoratorsSymbol][methodName]) {
    ctor[ClassMethodsDecoratorsSymbol][methodName] = {
      decorators: [],
    };
  }

  ctor[ClassMethodsDecoratorsSymbol][methodName].decorators.push({
    decoratorId,
    decoratorProps,
  } satisfies TMethodDecorator<TProps>);
}

export function getClassDecorators (ctor: TCtor): TClassDecorator<any>[] {
  return ctor.prototype[ClassDecoratorsSymbol] as TClassDecorator<any>[] || [];
}

export function getMethodDecorators (ctor: TCtor, method: string | symbol): TMethodDecorator<any>[] {
  if (ctor.prototype[ClassMethodsDecoratorsSymbol]?.[method]?.decorators) {
    return ctor.prototype[ClassMethodsDecoratorsSymbol][method].decorators as TMethodDecorator<any>[];
  }
  return [];
}

export function findClassDecorators <TProps>(ctor: TCtor, decorator: TCreateClassDecorator<TProps>): TClassDecorator<TProps>[] {
  const decoratorId = getDecoratorId(decorator);
  const classDecorators = getClassDecorators(ctor);
  return classDecorators.filter((d) => d.decoratorId === decoratorId);
}

export function findMethodDecorators <TProps>(ctor: TCtor, method: string | symbol, decorator: TCreateMethodDecorator<TProps>): TMethodDecorator<TProps>[] {
  const decoratorId = getDecoratorId(decorator);
  const methodDecorators = getMethodDecorators(ctor, method);
  return methodDecorators.filter((d) => d.decoratorId === decoratorId);
}
