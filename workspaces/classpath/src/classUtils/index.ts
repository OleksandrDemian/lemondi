import {ClassPathSymbols} from "./symbols";
import {assignDecoratorId} from "./utils";
import {
  TArgHandler,
  TArgument,
  TCtor,
  TDecorator,
  TDecoratorCtor,
  TDecoratorHandler,
  TMethod,
  TMethodHandler
} from "../types";

function createMethod (ctor: TCtor, method: string) {
  if (!ctor.prototype[ClassPathSymbols.METHODS]) {
    ctor.prototype[ClassPathSymbols.METHODS] = {};
  }

  if (!ctor.prototype[ClassPathSymbols.METHODS][method]) {
    ctor.prototype[ClassPathSymbols.METHODS][method] = {
      args: undefined,
      ret: undefined,
      decorators: [],
      name: method,
    } satisfies TMethod;
  }
}

function createArgument (arg: TArgument): TArgument {
  return {
    typeId: arg.typeId,
    decorators: arg.decorators || [],
    isAsync: !!arg.isAsync,
  };
}

function ctorArgs (ctor: TCtor, args: TArgument[]) {
  ctor.prototype[ClassPathSymbols.CTOR_ARGUMENTS] = args.map(createArgument);
}

function assignClassId (ctor: TCtor, id: string) {
  ctor.prototype[ClassPathSymbols.CLASS_ID] = id;
}

function method(ctor: TCtor, method: string, args: TArgument[], ret: TArgument) {
  createMethod(ctor, method);

  ctor.prototype[ClassPathSymbols.METHODS][method].args = args.map(createArgument);
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

function extend (ctor: TCtor, interfaces: { typeId: string }[]) {
  ctor.prototype[ClassPathSymbols.INTERFACES] = interfaces.map((i) => i.typeId);
}

function interfaces (ctor: TCtor, extTypeId: string) {
  ctor.prototype[ClassPathSymbols.EXTENDS] = extTypeId;
}

function getDecoratorHandler (decorator: TDecorator): TDecoratorHandler {
  return {
    getCtor: () => decorator.ctor,
    getProps: () => decorator.props,
  }
}

function getArgHandler (arg: TArgument): TArgHandler {
  return {
    getDecorators: (decorator: TDecoratorCtor) => arg.decorators
      .filter(d => d.ctor === decorator)
      .map(getDecoratorHandler),
    getTypeId: () => arg.typeId,
    getIsAsync: () => arg.isAsync,
  }
}

function getMethodHandler (method: TMethod): TMethodHandler {
  return {
    getDecorators: (decorator: TDecoratorCtor) => method.decorators
      .filter(d => d.ctor === decorator)
      .map(getDecoratorHandler),
    getReturnType: () => ({
      getTypeId: () => method.ret.typeId,
      getIsAsync: () => method.ret.isAsync,
    }),
    getName: () => method.name,
    getArguments: () => method.args.map(getArgHandler),
  };
}

function getDecorators (ctor: TCtor, decorator: TDecoratorCtor): TDecoratorHandler[] {
  const decorators = ctor.prototype[ClassPathSymbols.DECORATORS] as TDecorator[];
  if (decorators) {
    return decorators
      .filter((d) => d.ctor === decorator)
      .map(getDecoratorHandler);
  }

  return [];
}

function getMethods (ctor: TCtor): TMethodHandler[] {
  return Object.keys(ctor.prototype[ClassPathSymbols.METHODS])
    .map((m) =>
      getMethodHandler(ctor.prototype[ClassPathSymbols.METHODS][m]));
}

function getConstructorArgs (ctor: TCtor): TArgHandler[] {
  return ctor.prototype[ClassPathSymbols.CTOR_ARGUMENTS].map(getArgHandler);
}

function getClassId (ctor: TCtor): string | undefined {
  return ctor.prototype[ClassPathSymbols.CLASS_ID];
}

function getExtendsTypeId (ctor: TCtor): string | undefined {
  return ctor.prototype[ClassPathSymbols.EXTENDS];
}

function getInterfacesTypeId (ctor: TCtor): string[] {
  return ctor.prototype[ClassPathSymbols.INTERFACES] || [];
}

export const ClassUtils = {
  R: {
    ctorArgs,
    method,
    classDecorator,
    methodDecorator,
    ctorArgDecorator,
    methodArgDecorator,
    extend,
    interfaces,
  },

  assignClassId,
  getDecorators,
  getMethods,
  getConstructorArgs,
  getClassId,
  getExtendsTypeId,
  getInterfacesTypeId,
};

global.ClassUtils = ClassUtils;