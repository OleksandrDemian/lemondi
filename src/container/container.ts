export type TInfo = {
  unique: Symbol;
  type: 'class' | 'function';
};

export type TFactoryComponentInfo = TInfo & {
  factoryClass: any;
  returnClass: any;
  instantiateFn: any;
  type: 'function';
}

export type TClassComponentInfo = TInfo & {
  Component: any;
  type: 'class';
};

export const componentUniqueSymbol = Symbol("__component_id__");

const registry: {
  identifier: TInfo;
  proxy: any;
}[] = [];

const registerClassComponent = ({ Component, unique, type }: TClassComponentInfo) => {
  const identifier: TInfo = { unique, type };

  Reflect.set(Component, componentUniqueSymbol, identifier);
  const obj = new Proxy({ current: undefined }, {
    get: (target, prop, receiver, ...args) => {
      if (!target.current) {
        target.current = new Component(...getDependencies(Component)); // todo: inject components
      }

      return Reflect.get(target.current, prop, receiver, ...args);
    }
  });

  registry.push({
    identifier,
    proxy: obj,
  });
};

const registerFactoryComponent = ({ factoryClass, instantiateFn, returnClass, type, unique }: TFactoryComponentInfo) => {
  const identifier: TInfo = { unique, type };
  Reflect.set(returnClass, componentUniqueSymbol, identifier);

  const obj = new Proxy({ current: undefined }, {
    get: (target, prop, receiver, ...args) => {
      if (!target.current) {
        target.current = instantiateFn(...getDependencies(factoryClass.prototype, instantiateFn.name)); // todo: inject components
      }

      return Reflect.get(target.current, prop, receiver, ...args);
    }
  });

  registry.push({
    identifier,
    proxy: obj,
  });
}

export const register = (props: TFactoryComponentInfo | TClassComponentInfo) => {
  if (props.type === "function") {
    registerFactoryComponent(props as TFactoryComponentInfo);
  } else if (props.type === "class") {
    registerClassComponent(props as TClassComponentInfo);
  }
};

export const getDependencies = <T>(ctor: any, prop?: any): any[] => {
  const paramTypes = Reflect.getMetadata("design:paramtypes", ctor, prop) || [];
  console.log("Param types", paramTypes, ctor, prop);
  return paramTypes.map((type: any) => {
    // You can extend this logic to resolve the dependency
    return getComponent(type);
  });
};

export const getComponent = <T> (base: new (...args: any) => T): T => {
  const component = registry.find((component) => {
    if (component.identifier.unique === base[componentUniqueSymbol].unique) {
      return true;
    }

    return false;
  });

  if (!component) {
    throw new Error("Impossible to find component");
  }

  return component.proxy;
};
