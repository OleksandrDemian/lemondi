import "reflect-metadata";
import { componentUniqueSymbol, getDependencies } from "./container/container";
import { importFactories, importRoutes } from "./scan/project";
import { FACTORIES_PATH, ROUTER_META, ROUTES_PATH } from "./config/const";
import { iterateRouters } from "./container/routerContainer";
import { TRouterProps } from "./decorators/routing/router";
import { TRouterMethod } from "./container/types";

export interface IApp {
  onStart (): Promise<void>;
  registerRouter?: (routerInstance: any, routerMeta: TRouterProps, routes: TRouterMethod[]) => void;
}

export const start = async (app: new (...args: any[]) => IApp) => {
  const id = Symbol();
  Reflect.set(app, componentUniqueSymbol, id);

  await importFactories({
    factoriesDir: app[FACTORIES_PATH],
  });
  await importRoutes({
     routesDir: app[ROUTES_PATH],
  });

  console.log("Instantiate app");
  const instance = Reflect.construct(app, getDependencies(app));

  iterateRouters((router, routes) => {
    const meta = Reflect.getMetadata(ROUTER_META, router) as TRouterProps;
    instance.registerRouter(router, meta, routes || []);
  });

  instance.onStart();
};
