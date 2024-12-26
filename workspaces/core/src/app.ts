import { FilesLoader } from "./filesLoader";
import {instantiate} from "./container/container";
import {initComponents, initFactories} from "./context";
import {triggerAppEvent} from "./appEvents";
import {findMethodDecorators} from "@bframe/scanner";
import {OnInit} from "./decorators/Component";

export type TStartProps = {
  modules: any[],
  importFiles?: string[];
};

export const start = (props: TStartProps) => {
  (async () => {
    const promises: Promise<any>[] = [];
    for(const path of props.importFiles) {
      promises.push(FilesLoader.importFiles(path));
    }

    await Promise.all(promises);

    initComponents();
    initFactories();

    triggerAppEvent("appLoaded");

    for (const module of props.modules) {
      const component = instantiate(module);

      for (const prop of Reflect.ownKeys(module.prototype)) {
        const [onInit] = findMethodDecorators(module, prop, OnInit);

        if (onInit) {
          await Promise.resolve(component[prop]());
        }
      }
    }

    triggerAppEvent("appStarted");
  })();
};
