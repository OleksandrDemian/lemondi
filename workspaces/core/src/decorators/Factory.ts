import { assignClassId, createClassDecorator, createMethodDecorator, getDecoratorId, scan, scanClass } from "@bframe/scanner";
import { addProxy, getDependencies } from "../container/container";

export const Instantiate = createMethodDecorator("Instantiate");
export const Factory = createClassDecorator("Factory");

const InsatntiateDecoratorId = getDecoratorId(Instantiate);

export function initFactories () {
  const factories = scan(Factory);
  for (const f of factories) {
    const components = scanClass(f.ctor);
    const factoryInstance = new f.ctor();

    for (const c of components) {
      if (!c || !c.decorators) {
        return;
      }

      const isInstantiator = c.decorators?.find((d) => d.decoratorId === InsatntiateDecoratorId);
      if (isInstantiator) {
        console.log("Instantiate from " + f.ctor.name, c.name);
        const returnType = Reflect.getMetadata('design:returntype', f.ctor.prototype, c.name);
        const returnClassId = assignClassId(returnType);
        const proxy = new Proxy({ current: undefined }, {
          get: (target, prop, receiver, ...args) => {
            if (!target.current) {
              target.current = factoryInstance[c.name](...getDependencies(f.ctor.prototype, c.name));
            }
      
            return Reflect.get(target.current, prop, receiver, ...args);
          }
        });

        addProxy(returnClassId, proxy);
      }
    }
  }
}
