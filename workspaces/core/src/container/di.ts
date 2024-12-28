import {getClassId} from "@lemondi/scanner";
import {getMethodParamQualifier} from "../helpers/qualifier";

export type TComponentProto = {
  getValue: () => any;
  getIsReady: () => boolean;
  init: () => Promise<any>;
};

export type TDiComponent = {
  proto: TComponentProto;
  qualifiers: (symbol | string)[];
};

const diComponents: TDiComponent[] = [];

export const addComponentProto = (qualifiers: (symbol | string)[], proto: TComponentProto) => {
  diComponents.push({
    proto,
    qualifiers,
  });
};

export const getDependencies = async (ctor: any, prop?: any): Promise<any[]> => {
  const paramTypes = Reflect.getMetadata("design:paramtypes", ctor, prop) || [];
  const components = paramTypes.map((type: any, i: number) => {
    // You can extend this logic to resolve the dependency
    const qualifier = getMethodParamQualifier(ctor, prop, i);
    return getComponent(type, qualifier);
  });

  return Promise.all(components);
};

export const getComponent = async <T> (base: new (...args: any) => T, qualifier?: symbol | string): Promise<T> => {
  const classId = getClassId(base);
  const query: TDiComponent[] = diComponents.filter((component) => {
    if (!classId || component.qualifiers.includes(classId)) {
      if (qualifier) {
        return component.qualifiers.includes(qualifier);
      } else {
        return true;
      }
    }

    return false;
  });

  if (query.length > 1) {
    throw new Error("Multiple components found for " + base.name + (qualifier ? " and " + qualifier.toString() : ""));
  } else if (query.length < 1) {
    throw new Error("No components found for " + base.name + (qualifier ? " and " + qualifier.toString() : ""));
  }

  const proto = query[0].proto;
  if (proto.getIsReady()) {
    return proto.getValue();
  }

  await proto.init();
  return proto.getValue() as T;
};

export const instantiate = async <T>(ctor: new (...args: any) => T) => {
  return Reflect.construct(ctor, await getDependencies(ctor));
};
