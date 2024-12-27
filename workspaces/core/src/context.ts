import {assignClassId, findMethodDecorators, getClassId, scan} from "@lemondi/scanner";
import {addProxy, getDependencies, instantiate} from "./container/container";
import {Component, OnAppEvent} from "./decorators/Component";
import {Factory, Instantiate} from "./decorators/Factory";
import {addAppListener} from "./appEvents";

export const initComponents = () => {
  const components = scan(Component);
  for (const component of components) {
    const classId = getClassId(component);
    const proxy = new Proxy({ current: undefined }, {
      get: (target, prop, receiver, ...args) => {
        if (!target.current) {
          target.current = instantiate(component);
        }

        return Reflect.get(target.current, prop, receiver, ...args);
      }
    });

    addProxy(classId, proxy);

    for (const method of Reflect.ownKeys(component.prototype)) {
      const [appEventListener] = findMethodDecorators(component, method, OnAppEvent);
      if (appEventListener && appEventListener.decoratorProps?.subscribe) {
        addAppListener({
          events: appEventListener.decoratorProps.subscribe,
          fn: (event) => {
            proxy[method](event);
          }
        });
      }
    }
  }
};

export function initFactories () {
  const factories = scan(Factory);
  for (const f of factories) {
    const factoryInstance = instantiate(f);

    for (const factoryComponent of Reflect.ownKeys(f.prototype)) {
      const [decorator] = findMethodDecorators(f, factoryComponent as string, Instantiate);
      if (decorator) {
        const returnType = Reflect.getMetadata('design:returntype', f.prototype, factoryComponent);
        const returnClassId = assignClassId(returnType);
        const proxy = new Proxy({ current: undefined }, {
          get: (target, prop, receiver, ...args) => {
            if (!target.current) {
              target.current = factoryInstance[factoryComponent](...getDependencies(f.prototype, factoryComponent));
            }

            return Reflect.get(target.current, prop, receiver, ...args);
          }
        });

        addProxy(returnClassId, proxy);
      }
    }
  }
}
