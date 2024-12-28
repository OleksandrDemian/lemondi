import {FilesLoader} from "./filesLoader";
import {addComponentProto, getDependencies, instantiate, TComponentProto} from "./container/di";
import {addAppListener, triggerAppEvent} from "./container/appEvents";
import {assignClassId, findClassDecorators, findMethodDecorators, getClassId, scan, TCtor} from "@lemondi/scanner";
import {Component, OnAppEvent, OnInit} from "./decorators/Component";
import {Factory, Instantiate} from "./decorators/Factory";

export type TStartProps = {
  modules: any[],
  importFiles?: string[];
};

export const initComponents = async () => {
  const components = scan(Component);
  for (const component of components) {
    const [decorator] = findClassDecorators(component, Component);
    let qualifiers: (symbol | string)[] = [assignClassId(component)];
    if (decorator.decoratorProps) {
      for (const q of decorator.decoratorProps.qualifiers) {
        if (typeof q === "symbol" || typeof q === "string") {
          qualifiers.push(q);
        } else {
          qualifiers.push(assignClassId(q as TCtor));
        }
      }
    }

    const factory = ((): TComponentProto => {
      let value: any = undefined;
      let isReady: boolean;

      const init = async () => {
        value = await instantiate(component);
      }

      return {
        init,
        getValue: () => value,
        getIsReady: () => isReady,
      }
    })();

    addComponentProto(qualifiers, factory);

    for (const method of Reflect.ownKeys(component.prototype)) {
      const [appEventListener] = findMethodDecorators(component, method, OnAppEvent);
      if (appEventListener && appEventListener.decoratorProps?.subscribe) {
        if (!factory.getIsReady()) {
          await factory.init();
        }

        addAppListener({
          events: appEventListener.decoratorProps.subscribe,
          fn: (event) => {
            factory.getValue()[method](event);
          }
        });
      }
    }
  }
};

export async function initFactories () {
  const factories = scan(Factory);
  for (const f of factories) {
    const factoryInstance = await instantiate(f);

    for (const factoryComponent of Reflect.ownKeys(f.prototype)) {
      const [decorator] = findMethodDecorators(f, factoryComponent as string, Instantiate);
      if (decorator && decorator.decoratorProps) {
        let qualifiers: (symbol | string)[] = [];
        for (const q of decorator.decoratorProps.qualifiers) {
          if (typeof q === "symbol" || typeof q === "string") {
            qualifiers.push(q);
          } else {
            qualifiers.push(assignClassId(q as TCtor));
          }
        }

        const factory = (): TComponentProto => {
          let value: any = undefined;
          let isReady: boolean;

          const init = async () => {
            const deps = await getDependencies(f.prototype, factoryComponent);
            value = factoryInstance[factoryComponent](...deps);
          }

          return {
            init,
            getValue: () => value,
            getIsReady: () => isReady,
          }
        };

        addComponentProto(qualifiers, factory());
      }
    }
  }
}

export const start = (props: TStartProps) => {
  (async () => {
    const promises: Promise<any>[] = [];
    for(const path of props.importFiles) {
      promises.push(FilesLoader.importFiles(path));
    }

    await Promise.all(promises);

    await initComponents();
    await initFactories();

    triggerAppEvent("appLoaded");

    for (const module of props.modules) {
      const component = await instantiate(module);

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
