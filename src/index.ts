import "reflect-metadata";
import { componentUniqueSymbol, getDependencies } from "./container/container";
import { importFactories } from "./scan/project";
import { FACTORIES_PATH } from "./config/const";

export interface IApp {
  onStart (): Promise<void>;
}

export const start = async (app: new (...args: any[]) => IApp) => {
  const id = Symbol();
  Reflect.set(app, componentUniqueSymbol, id);

  await importFactories({
    factoriesDir: app[FACTORIES_PATH],
  });

  console.log("Instantiate app");
  const instance = Reflect.construct(app, getDependencies(app));
  instance.onStart();
};
