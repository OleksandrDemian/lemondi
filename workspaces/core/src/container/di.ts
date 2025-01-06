import {ClassUtils, TArgHandler} from "@lemondi/classpath";

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

export const getDependencies = async (args: TArgHandler[]): Promise<any[]> => {
  const components = args.map((type) => {
    // You can extend this logic to resolve the dependency
    return getComponent(type.getTypeId());
  });

  return Promise.all(components);
};

export const getComponent = async <T> (classId: string | symbol, qualifier?: symbol | string): Promise<T> => {
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
    throw new Error("Multiple components found for " + classId.toString() + (qualifier ? " and " + qualifier.toString() : ""));
  } else if (query.length < 1) {
    throw new Error("No components found for " + classId.toString() + (qualifier ? " and " + qualifier.toString() : ""));
  }

  const proto = query[0].proto;
  if (proto.getIsReady()) {
    return proto.getValue();
  }

  await proto.init();
  return proto.getValue() as T;
};

export const instantiate = async <T>(ctor: new (...args: any) => T) => {
  return Reflect.construct(
    ctor,
    await getDependencies(
      ClassUtils.getConstructorArgs(ctor),
    ));
};
