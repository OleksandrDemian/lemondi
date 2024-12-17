import { isAbsolute } from "path";
import { ROUTER_METHODS_PROP } from "../../config/const";
import { TRouterMethod } from "../../container/types";

export type TRouteProps = {
  isAbsolute?: boolean;
  path?: string;
};

export type TRequest<TBody = any> = {
  body: TBody;
};

// for type safety
const createRouterMethod = (info: TRouterMethod) => info;

export function Get (props?: TRouteProps): MethodDecorator {
  return function (target, key, descriptor: TypedPropertyDescriptor<any>) {
    if (!target[ROUTER_METHODS_PROP]) {
      target[ROUTER_METHODS_PROP] = [];
    }

    target[ROUTER_METHODS_PROP].push(createRouterMethod({
      method: "GET",
      path: props?.path ?? "/",
      isAbsolute: props?.isAbsolute,
      name: key,
    }));
  };
}

export function Post (props?: TRouteProps): MethodDecorator {
  return (target, key, descriptor) => {
  };
}

export function Put (props?: TRouteProps): MethodDecorator {
  return (target, key, descriptor) => {
  };
}
