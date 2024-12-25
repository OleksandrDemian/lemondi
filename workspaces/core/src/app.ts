import {instantiate} from "./container/container";
import { Scanner } from "./scan/scanner";
import {findClassDecorators, scan} from "@bframe/scanner";
import { AppInitializer } from "./decorators/AppInitializer";
import { initComponents } from "./decorators/Component";
import { initFactories } from "./decorators/Factory";

export interface IApp {
  onStart (): Promise<void>;
}

export const start = async () => {
  const [appComponent] = scan(AppInitializer);

  if (appComponent) {
    const [initDecorator] = findClassDecorators(appComponent, AppInitializer);
    const importPaths = initDecorator.decoratorProps.importFiles;
    for(const path of importPaths) {
      await Scanner.importFiles(path);
    }

    initComponents();
    initFactories();

    const instance = instantiate(appComponent);
    await instance?.onStart();
  } else {
    throw new Error("No app initializer");
  }
};
