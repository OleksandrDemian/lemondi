import { createClassDecorator, getClassId, scan } from "@bframe/scanner";
import { addProxy, getDependencies } from "../container/container";

export const Component = createClassDecorator("Component");

export const initComponents = () => {
  const components = scan(Component);
  for (const component of components) {
    const classId = getClassId(component.ctor);
    const proxy = new Proxy({ current: undefined }, {
      get: (target, prop, receiver, ...args) => {
        if (!target.current) {
          target.current = new component.ctor(...getDependencies(component.ctor));
        }
  
        return Reflect.get(target.current, prop, receiver, ...args);
      }
    });

    addProxy(classId, proxy);
  }
};
