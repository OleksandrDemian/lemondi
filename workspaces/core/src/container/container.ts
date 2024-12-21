import { getClassId } from "@bframe/scanner";

export type TInfo = {
  unique: Symbol;
  type: 'class' | 'function';
};

const proxies: Record<symbol, any> = {};

export const addProxy = (id: symbol, proxy: any) => {
  console.log("Register proxy: ", id);
  proxies[id] = proxy;
};

export const getDependencies = <T>(ctor: any, prop?: any): any[] => {
  const paramTypes = Reflect.getMetadata("design:paramtypes", ctor, prop) || [];
  return paramTypes.map((type: any) => {
    // You can extend this logic to resolve the dependency
    return getComponent(type);
  });
};

export const getComponent = <T> (base: new (...args: any) => T): T => {
  const classId = getClassId(base);
  const proxy = proxies[classId];

  if (proxy) {
    return proxy;
  }

  const newProxy = new Proxy({ current: undefined }, {
    get: (target, prop, receiver, ...args) => {
      if (!target.current) {
        target.current = new base(...getDependencies(base));
      }

      return Reflect.get(target.current, prop, receiver, ...args);
    }
  });
  addProxy(classId, newProxy);
  return newProxy as T;
};
