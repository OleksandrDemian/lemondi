import "reflect-metadata";

export type ComponentIdentifier = {
  unique: Symbol;
};

export const componentUniqueSymbol = Symbol("component-id");

const registry: { identifier: ComponentIdentifier; proxy: any }[] = [];

export const register = (identifier: ComponentIdentifier, Component: any) => {
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

export const getComponent = <T> (base: new (...args: any) => T): T => {
  const component = registry.find((component) => {
    if (component.identifier.unique === base[componentUniqueSymbol]) {
      return true;
    }

    return false;
  });

  if (!component) {
    throw new Error("Impossible to find component");
  }

  return component.proxy;
};

export const getDependencies = <T>(ctor: new (...args: any[]) => T): any[] => {
  const paramTypes = Reflect.getMetadata("design:paramtypes", ctor) || [];
  return paramTypes.map((type: any) => {
    // You can extend this logic to resolve the dependency
    return getComponent(type);
  });
};
