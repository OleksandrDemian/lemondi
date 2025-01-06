import {ClassPathSymbols} from "./symbols";
import {assignDecoratorId} from "./utils";
import {TArgument, TCtor, TDecorator, TDecoratorCtor, TMethod} from "../types";

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

function methodDecorator (ctor: TCtor, method: string, decorator: TDecoratorCtor, props: any) {
  const decoratorId = assignDecoratorId(decorator);
  createMethod(ctor, method);

  ctor.prototype[ClassPathSymbols.METHODS][method].decorators.push({
    id: decoratorId,
    ctor: decorator,
    props,
  } satisfies TDecorator);
}

function ctorArgDecorator (ctor: TCtor, argIndex: number, decorator: TDecoratorCtor, props: any) {
  ctor.prototype[ClassPathSymbols.CTOR_ARGUMENTS][argIndex].decorators.push({
    ctor: decorator,
    props,
    id: assignDecoratorId(decorator),
  } satisfies TDecorator);
}

function methodArgDecorator (ctor: TCtor, method: string, argIndex: number, decorator: TDecoratorCtor, props: any) {
  ctor.prototype[ClassPathSymbols.METHODS][method].args[argIndex].decorators.push({
    ctor: decorator,
    props,
    id: assignDecoratorId(decorator),
  } satisfies TDecorator);
}

function getDecoratorHandler (decorator: TDecorator) {
  return {
    getCtor: () => decorator.ctor,
    getProps: () => decorator.props,
  }
}

function getArgHandler (arg: TArgument) {
  return {
    getDecorators: () => arg.decorators.map(getDecoratorHandler),
    getTypeId: () => arg.typeId,
    getIsAsync: () => arg.isAsync,
  }
}

function getMethodHandler (method: TMethod) {
  return {
    getDecorators: () => method.decorators.map(getDecoratorHandler),
    getReturnType: () => ({
      getTypeId: () => method.ret.typeId,
      getIsAsync: () => method.ret.isAsync,
    }),
    getArguments: () => method.args.map(getArgHandler),
  };
}

function getClassHandler (ctor: TCtor) {
  const getDecorators = (decorator: TDecoratorCtor): ReturnType<typeof getDecoratorHandler>[] => {
    const decorators = ctor.prototype[ClassPathSymbols.DECORATORS] as TDecorator[];
    if (decorators) {
      return decorators
        .filter((d) => d.ctor === decorator)
        .map(getDecoratorHandler)
        ;
    }

    return []
  };

  const getMethods = () =>
    Object.keys(ctor.prototype[ClassPathSymbols.METHODS])
      .map((m) =>
        getMethodHandler(ctor.prototype[ClassPathSymbols.METHODS][m]));

  const getConstructorArgs = () =>
    ctor.prototype[ClassPathSymbols.CTOR_ARGUMENTS].map(getArgHandler);

  return {
    getDecorators,
    getMethods,
    getConstructorArgs,
  };
}

export const ClassUtils = {
  ctorArgs,
  method,
  classDecorator,
  methodDecorator,
  ctorArgDecorator,
  methodArgDecorator,

  getClassHandler,
};

global.ClassUtils = ClassUtils;