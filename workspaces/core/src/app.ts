import { componentUniqueSymbol, getDependencies } from "./container/container";
import { Scanner } from "./scan/scanner";
import { IMPORT_FILES } from "./config/const";

export interface IApp {
  onStart (): Promise<void>;
}

export const start = async (app: new (...args: any[]) => IApp) => {
  const id = Symbol();
  Reflect.set(app, componentUniqueSymbol, id);

  const importPaths = app[IMPORT_FILES] as string[];
  for(const path of importPaths) {
    await Scanner.importFiles(path);
  }

  console.log("Instantiate app");
  const instance = Reflect.construct(app, getDependencies(app));
  instance.onStart();
};
