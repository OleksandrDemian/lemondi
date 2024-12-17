import { ROUTER_METHODS_PROP } from "../config/const";
import { TRouterMethod } from "./types";

const routers: any[] = []

export const registerRouter = (router: any) => {
  routers.push(router);
};

export const iterateRouters = (iterator: (routerInstance: any, routerMethods: TRouterMethod[]) => void) => {
  for (const router of routers) {
    const methods = Reflect.get(router, ROUTER_METHODS_PROP) as TRouterMethod[];
    iterator(router, methods);
  }
}
