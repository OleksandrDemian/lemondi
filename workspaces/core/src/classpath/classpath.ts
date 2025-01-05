/**
 * WORK IN PROGRESS
 */

import {ClassPathSymbols} from "./symbols";
import {assignDecoratorId} from "./utils";

export type TCtor = new (...args: any[]) => any;

export type TArgument = {
  typeId: string;
  isAsync: boolean;
};

export type TRegistryEntry = {
  id: string;
  ctor: TCtor,
}

export const ClassPath = (() => {
  const registry: TRegistryEntry[] = [];

  function register(entry: TRegistryEntry) {
    registry.push(entry);
  }

  function getClasses() {
    return registry;
  }

  return {
    register,
    getClasses,
  }
})();

export const LemonAssign = (() => {
  function createMethod (ctor: TCtor, method: string) {
    if (!ctor.prototype[ClassPathSymbols.METHODS]) {
      ctor.prototype[ClassPathSymbols.METHODS] = {};
    }

    if (!ctor.prototype[ClassPathSymbols.METHODS][method]) {
      ctor.prototype[ClassPathSymbols.METHODS][method] = {
        args: undefined,
        ret: undefined,
        decorators: [],
      };
    }
  }

  function ctorArgs (ctor: TCtor, args: TArgument[]) {
    ctor.prototype[ClassPathSymbols.CTOR_ARGUMENTS] = args;
  }

  function method(ctor: TCtor, method: string, args: TArgument[], ret: TArgument) {
    createMethod(ctor, method);

    ctor.prototype[ClassPathSymbols.METHODS][method].args = args;
    ctor.prototype[ClassPathSymbols.METHODS][method].ret = ret;
  }

  function classDecorator(ctor: TCtor, decorator: any, props: any) {
    const decoratorId = assignDecoratorId(decorator);

    if (!ctor.prototype[ClassPathSymbols.DECORATORS]) {
      ctor.prototype[ClassPathSymbols.DECORATORS] = [];
    }

    ctor.prototype[ClassPathSymbols.DECORATORS].push({
      ctor: decorator,
      id: decoratorId,
      props,
    });
  }

  function methodDecorator (ctor: TCtor, method: string, decorator: any, props: any) {
    const decoratorId = assignDecoratorId(decorator);
    createMethod(ctor, method);

    ctor.prototype[ClassPathSymbols.METHODS][method].decorators.push({
      id: decoratorId,
      ctor: decorator,
      props,
    })
  }

  return {
    ctorArgs,
    method,
    classDecorator,
    methodDecorator,
  };
})();

// @ts-ignore
global.ClassPath = ClassPath;
// @ts-ignore
global.LemonAssign = LemonAssign;
