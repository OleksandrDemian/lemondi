import { ROUTER_METHODS_PROP } from "../const/const";
import { TRouterMethod } from "../containers/types";

export type TRouteProps = {
  isAbsolute?: boolean;
  path?: string;
};

export type TRequest<TBody = any> = {
  body: TBody;
};

const createRouterMethod = (router: any, info: TRouterMethod) => {
  if (!router[ROUTER_METHODS_PROP]) {
    router[ROUTER_METHODS_PROP] = [];
  }

  router[ROUTER_METHODS_PROP].push(info);
};

export function Get (props?: TRouteProps) {
  return function (target: any, key: string | Symbol) {
    createRouterMethod(target, {
      method: "GET",
      path: props?.path ?? "/",
      isAbsolute: props?.isAbsolute,
      name: key,
    });
  };
}

export function Post (props?: TRouteProps) {
  return (target: any, key: string | Symbol) => {
    createRouterMethod(target, {
      method: "POST",
      path: props?.path ?? "/",
      isAbsolute: props?.isAbsolute,
      name: key,
    });
  };
}

export function Put (props?: TRouteProps) {
  return (target: any, key: string | Symbol) => {
    createRouterMethod(target, {
      method: "PUT",
      path: props?.path ?? "/",
      isAbsolute: props?.isAbsolute,
      name: key,
    });
  };
}

export function Delete (props?: TRouteProps) {
  return (target: any, key: string | Symbol) => {
    createRouterMethod(target, {
      method: "DELETE",
      path: props?.path ?? "/",
      isAbsolute: props?.isAbsolute,
      name: key,
    });
  };
}

export function Options (props?: TRouteProps) {
  return (target: any, key: string | Symbol) => {
    createRouterMethod(target, {
      method: "OPTIONS",
      path: props?.path ?? "/",
      isAbsolute: props?.isAbsolute,
      name: key,
    });
  };
}