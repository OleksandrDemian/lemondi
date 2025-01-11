import {ClassUtils, TArgHandler} from "@lemondi/classpath";
import {Qualifier} from "../decorators/Qualifier";

export type TComponentProto = {
  getValue: () => any;
  getIsReady: () => boolean;
  init: () => Promise<any>;
};

export type TDiComponent = {
  proto: TComponentProto;
  qualifier?: symbol | string;
  isDefault: boolean;
  type: string;
};

const diComponents: TDiComponent[] = [];

export const addComponentProto = (proto: TComponentProto, type: string, qualifier: string | symbol | undefined, isDefault: boolean) => {
  diComponents.push({
    proto,
    qualifier,
    isDefault,
    type,
  } satisfies TDiComponent);
};

export const getDependencies = async (args: TArgHandler[]): Promise<any[]> => {
  const components = args.map((type) => {
    // You can extend this logic to resolve the dependency
    if (type.getTypeId() === "") {
      return undefined;
    }

    const [qualifier] = type.getDecorators(Qualifier);
    return getComponent(type.getTypeId(), qualifier?.getProps());
  });

  return Promise.all(components);
};

export const getComponent = async <T> (typeId: string | symbol, qualifier?: symbol | string): Promise<T> => {
  if (!typeId || typeId === "unsupported" || typeId === "") {
    throw new Error(`Cannot inject "unsupported" type. Please check build logs to determine where unsupported id was generated`);
  }

  const query: TDiComponent[] = diComponents.filter((component) => {
    if (component.type === typeId) {
      if (qualifier && qualifier !== component.qualifier) {
        return false;
      }

      return true;
    }

    return false;
  });

  let proto: TComponentProto = undefined;

  if(query.length === 1) {
    proto = query[0].proto;
  } else if (query.length > 1) {
    const d = query.filter((q) => q.isDefault);
    if (d.length === 1) {
      proto = d[0].proto;
    } else {
      throw new Error("Multiple components found for " + typeId.toString() + (qualifier ? " and " + qualifier.toString() : ""));
    }
  } else {
    throw new Error("No components found for " + typeId.toString() + (qualifier ? " and " + qualifier.toString() : ""));
  }

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
