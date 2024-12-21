import { getDependencies } from "./container/container";
import { Scanner } from "./scan/scanner";
import { scan } from "@bframe/scanner";
import { AppInitializer } from "./decorators/AppInitializer";
import { initComponents } from "./decorators/Component";
import { initFactories } from "./decorators/Factory";

export interface IApp {
  onStart (): Promise<void>;
}

export const start = async () => {
  const [appComponent] = scan(AppInitializer);

  if (appComponent) {
    const importPaths = appComponent.decoratorProps.importFiles;
    for(const path of importPaths) {
      await Scanner.importFiles(path);
    }

    initComponents();
    initFactories();

    console.log("Instantiate app");

    const instance = Reflect.construct(appComponent.ctor, getDependencies(appComponent.ctor));
    instance.onStart();
  } else {
    throw new Error("No app initializer");
  }
};
