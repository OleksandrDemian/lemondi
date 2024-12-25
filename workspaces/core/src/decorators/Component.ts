import { createClassDecorator, getClassId, scan } from "@bframe/scanner";
import {addProxy, getDependencies, instantiate} from "../container/container";

export const Component = createClassDecorator("Component");

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
  }
};
