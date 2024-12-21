// WIP
const DecoratorTypeSymbol = Symbol("__type__");
const MethodsTypeSymbol = Symbol("__methods__");

type TCtor = new (...args: any) => any;

type TRegistryEntry = {
  ctor: TCtor; // ctor -> constructor
  decoratorId: Symbol;
  decoratorProps?: any;
};

const registry: TRegistryEntry[] = [];

function registerClass (decoratorId: Symbol, ctor: TCtor, decoratorProps?: any) {
  registry.push({
    ctor,
    decoratorId,
    decoratorProps,
  });
};

function registerMethod (target: any, key: string, decoratorId: Symbol, props?: any) {
  if (!target[MethodsTypeSymbol]) {
    target[MethodsTypeSymbol] = {};
  }

  if (!target[MethodsTypeSymbol][key]) {
    target[MethodsTypeSymbol][key] = {
      fnName: key,
      decorators: [],
    };
  }
  target[MethodsTypeSymbol][key].decorators.push({
    decoratorProps: props,
    decoratorId,
  });
}

function getDecoratorType (decorator: any) {
  return decorator.prototype[DecoratorTypeSymbol];
}

export function scan (component: any) {
  const searchFor = getDecoratorType(component);
  const result: TRegistryEntry[] = [];
  for (const entry of registry) {
    if (entry.decoratorId === searchFor) {
      result.push(entry);
    }
  }

  return result;
}

export function scanComponent (component: any) {
  const methods = component.prototype[MethodsTypeSymbol];
  return methods;
}

function createComponentDecorator <T = never> (name: string) {
  const decoratorId = Symbol(name);
  function component (props?: T): ClassDecorator {
    return (target: any) => {
      registerClass(decoratorId, target, props);
    }
  }
  component.prototype[DecoratorTypeSymbol] = decoratorId;

  return component;
}

export const CustomDecorator = createComponentDecorator<{ name: string }>("CustomDecorator");
export const TestDecorator = createComponentDecorator("TestDecorator");

function createMethodDecorator <T = never>(name: string) {
  const decoratorId = Symbol(name);

  function method (props?: T): MethodDecorator {
    return (target: any, key: string) => {
      registerMethod(target, key, decoratorId, props);
    }
  }
  method.prototype[DecoratorTypeSymbol] = decoratorId;

  return method;
}

export const MethodTest = createMethodDecorator<{ isTest: boolean }>("MethodTest");
export const MethodPath = createMethodDecorator<{ path: string }>("MethodTest");
