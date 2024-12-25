import { FilesLoader } from "./filesLoader";
import { getComponent } from "./container/container";
import {initComponents, initFactories} from "./context";
import {triggerAppEvent} from "./appEvents";

export type TStartProps<T extends any[]> = {
  onStart?: (...instances: { [K in keyof T]: InstanceType<T[K]> }) => Promise<void>;
  require: [...T],
  importFiles?: string[];
};

export const start = <TModules extends any[]>(props: TStartProps<TModules>) => {
  (async () => {
    const promises: Promise<any>[] = [];
    for(const path of props.importFiles) {
      promises.push(FilesLoader.importFiles(path));
    }

    await Promise.all(promises);

    initComponents();
    initFactories();

    const instances: any = [];

    for (const module of props.require) {
      instances.push(getComponent(module));
    }

    triggerAppEvent("beforeStart");
    if (props.onStart) {
      await props.onStart(...instances);
    }
    triggerAppEvent("afterStart");
  })();
};
