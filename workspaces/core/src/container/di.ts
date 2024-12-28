import {getClassId} from "@lemondi/scanner";

export type TComponentProto = {
  getValue: () => any;
  getIsReady: () => boolean;
  init: () => Promise<any>;
};

const diComponents: Record<symbol, TComponentProto> = {};

export const addComponentProto = (id: symbol, proto: TComponentProto) => {
  console.log("Register proto", id);
  diComponents[id] = proto;
};

export const getDependencies = async (ctor: any, prop?: any): Promise<any[]> => {
  const paramTypes = Reflect.getMetadata("design:paramtypes", ctor, prop) || [];
  const components = paramTypes.map((type: any) => {
    // You can extend this logic to resolve the dependency
    return getComponent(type);
  });

  return Promise.all(components);
};

export const getComponent = async <T> (base: new (...args: any) => T): Promise<T> => {
  const classId = getClassId(base);
  const proto = diComponents[classId];

  if (proto.getIsReady()) {
    return proto.getValue();
  }

  await proto.init();
  return proto.getValue() as T;
};

export const instantiate = async <T>(ctor: new (...args: any) => T) => {
  console.log("Instantiate", ctor.name);
  return Reflect.construct(ctor, await getDependencies(ctor));
};
