/**
 * WORK IN PROGRESS
 */

import {ClassPathSymbols} from "./symbols";
import {assignDecoratorId} from "./utils";

export type TCtor = new (...args: any[]) => any;

export type TDecorator = {
  id: symbol;
  props: any;
  ctor: TCtor;
};

export type TMethod = {
  args: TArgument[];
  ret: TArgument;
  decorators: TDecorator[];
};

export type TArgument = {
  typeId: string;
  isAsync: boolean;
  decorators: TDecorator[];
};

export type TRegistryEntry = {
  id: string;
  ctor: TCtor,
};

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
      } satisfies TMethod;
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
    } satisfies TDecorator);
  }

  function methodDecorator (ctor: TCtor, method: string, decorator: any, props: any) {
    const decoratorId = assignDecoratorId(decorator);
    createMethod(ctor, method);

    ctor.prototype[ClassPathSymbols.METHODS][method].decorators.push({
      id: decoratorId,
      ctor: decorator,
      props,
    } satisfies TDecorator);
  }

  function ctorArgDecorator (ctor: TCtor, argIndex: number, decorator: TCtor, props: any) {
    ctor.prototype[ClassPathSymbols.CTOR_ARGUMENTS][argIndex].decorators.push({
      ctor: decorator,
      props,
      id: assignDecoratorId(decorator),
    } satisfies TDecorator);
  }

  function methodArgDecorator (ctor: TCtor, method: string, argIndex: number, decorator: TCtor, props: any) {
    ctor.prototype[ClassPathSymbols.METHODS][method].args[argIndex].decorators.push({
      ctor: decorator,
      props,
      id: assignDecoratorId(decorator),
    } satisfies TDecorator);
  }

  return {
    ctorArgs,
    method,
    classDecorator,
    methodDecorator,
    ctorArgDecorator,
    methodArgDecorator,
  };
})();

// @ts-ignore
global.ClassPath = ClassPath;
// @ts-ignore
global.LemonAssign = LemonAssign;
