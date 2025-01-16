import {ClassPath, ClassUtils, TArgHandler, TMethodHandler} from "@lemondi/classpath";
import {Qualifier} from "../decorators/Qualifier";

export type TComponentFactoryInit = () => Promise<any>;

export type TComponentFactory = {
  getValue: () => any;
  getIsReady: () => boolean;
  init: TComponentFactoryInit;
};

type TComponentFactoryEntry = {
  proto: TComponentFactory;
  qualifier?: symbol | string;
  isDefault: boolean;
  type: string;
};

const factories: TComponentFactoryEntry[] = [];

const _cacheExtraTypes: Record<string, string[]> = {};
const extractAllTypes = (typeId: string) => {
  if (_cacheExtraTypes[typeId]) {
    return _cacheExtraTypes[typeId];
  }

  const allTypes = [typeId];
  const c = ClassPath.getClassById(typeId);
  if (c) {
    const interfaces = ClassUtils.getInterfacesTypeId(c);
    const ext = ClassUtils.getExtendsTypeId(c);

    if (ext) {
      allTypes.push(ext);
    }

    if (interfaces.length > 0) {
      allTypes.push(...interfaces);
    }
  }

  _cacheExtraTypes[typeId] = allTypes;
  return allTypes;
};

const createFactory = (factory: TComponentFactoryInit): TComponentFactory => {
  let value: any = undefined;
  let isReady: boolean;

  async function init () {
    value = await factory();
  }

  return {
    init,
    getValue: () => value,
    getIsReady: () => isReady,
  }
};

const registerComponentFactory = (factory: TComponentFactoryInit, type: string, qualifier: string | symbol | undefined, isDefault: boolean) => {
  factories.push({
    proto: createFactory(factory),
    qualifier,
    isDefault,
    type,
  } satisfies TComponentFactoryEntry);
};

export const getDependencies = async (args: TArgHandler[]): Promise<any[]> => {
  const components = args.map((type) => {
    if (type.getTypeId() === "") {
      return undefined;
    }

    if (type.getIsArray()) {
      console.warn("Arrays binding is not currently supported");
      return undefined;
    }

    const [qualifier] = type.getDecorators(Qualifier);
    ClassPath.getClassById(type.getTypeId());
    return getComponent(type.getTypeId(), qualifier?.getProps());
  });

  return Promise.all(components);
};

const getComponent = async <T> (typeId: string, qualifier?: symbol | string): Promise<T> => {
  if (!typeId || typeId === "unsupported" || typeId === "") {
    throw new Error(`Cannot inject "unsupported" type. Please check build logs to determine where unsupported id was generated`);
  }

  const candidates: TComponentFactoryEntry[] = factories.filter((component) => {
    const types = extractAllTypes(component.type);

    if (types.includes(typeId)) {
      if (qualifier && qualifier !== component.qualifier) {
        return false;
      }

      return true;
    }

    return false;
  });

  let proto: TComponentFactory = undefined;

  if(candidates.length === 1) {
    proto = candidates[0].proto;
  } else if (candidates.length > 1) {
    const d = candidates.filter((q) => q.isDefault);
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

const instantiate = async <T>(ctor: new (...args: any) => T) => {
  return Reflect.construct(
    ctor,
    await getDependencies(
      ClassUtils.getConstructorArgs(ctor),
    ));
};

const instantiateMethod = async (host: any, method: TMethodHandler) => {
  const deps = await getDependencies(
    method.getArguments(),
  );

  return host[method.getName()](...deps);
};

export const AppContext = {
  registerComponentFactory: registerComponentFactory,
  instantiate: instantiate,
  instantiateMethod: instantiateMethod,
};
