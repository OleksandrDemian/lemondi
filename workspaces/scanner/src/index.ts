// WIP
const DecoratorTypeSymbol = Symbol("__type__");
const MethodsTypeSymbol = Symbol("__methods__");
const ClassIdSymbol = Symbol("__class_id__");

type TCtor = new (...args: any) => any;

type TRegistryEntry = {
  ctor: TCtor; // ctor = constructor
  decoratorId: symbol;
  decoratorProps?: any;
};

const registry: TRegistryEntry[] = [];

function registerClass (decoratorId: symbol, ctor: TCtor, decoratorProps?: any) {
  assignClassId(ctor);
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

export function assignClassId (ctor: any) {
  if (ctor.prototype[ClassIdSymbol] != undefined) {
    return ctor.prototype[ClassIdSymbol];
  }

  const classId = Symbol(ctor.name);
  ctor.prototype[ClassIdSymbol] = classId;
  return classId;
}

export function getDecoratorId (decorator: any) {
  return decorator.prototype[DecoratorTypeSymbol];
}

export function scan (decorator: any) {
  const searchFor = getDecoratorId(decorator);
  const result: TRegistryEntry[] = [];
  for (const entry of registry) {
    if (entry.decoratorId === searchFor) {
      result.push(entry);
    }
  }

  return result;
}

export type TScanClassResult = {
  type: 'fn' | 'prop' | 'constructor';
  decorators: { decoratorId: symbol; decoratorProps: any }[];
  name: string;
};
export function scanClass (component: any): TScanClassResult[] {
  const result: TScanClassResult[] = [];
  for (const prop of Reflect.ownKeys(component.prototype)) {
    if (prop === "constructor") {
      result.push({
        type: "constructor",
        decorators: [],
        name: prop as string,
      });
    } else if (typeof component.prototype[prop] === "function") {
      const decorators = component.prototype[MethodsTypeSymbol][prop].decorators || [];
      result.push({
        type: "fn",
        decorators,
        name: prop as string,
      });
    } else {
      result.push({
        type: "prop",
        name: prop as string,
        decorators: [],
      });
    }
  }
  
  return result;
}

export function createClassDecorator <T = never> (name: string) {
  const decoratorId = Symbol(name);
  function component (props?: T): ClassDecorator {
    return (target: any) => {
      registerClass(decoratorId, target, props);
    }
  }
  component.prototype[DecoratorTypeSymbol] = decoratorId;

  return component;
}

export function createMethodDecorator <T = never>(name: string) {
  const decoratorId = Symbol(name);

  function method (props?: T): MethodDecorator {
    return (target: any, key: string) => {
      registerMethod(target, key, decoratorId, props);
    }
  }
  method.prototype[DecoratorTypeSymbol] = decoratorId;

  return method;
}

export function getClassId (ctor: TCtor): symbol {
  return ctor.prototype[ClassIdSymbol];
}
