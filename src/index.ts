import "reflect-metadata";
import { componentUniqueSymbol, getDependencies } from "./container/container";
import { importFactories, importRoutes } from "./scan/project";
import { FACTORIES_PATH, ROUTES_PATH } from "./config/const";

export interface IApp {
  onStart (): Promise<void>;
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
  instance.onStart();
};
