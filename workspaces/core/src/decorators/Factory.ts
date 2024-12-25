import {assignClassId, createClassDecorator, createMethodDecorator, findMethodDecorators, scan} from "@bframe/scanner";
import {addProxy, getDependencies, instantiate} from "../container/container";

export const Instantiate = createMethodDecorator("Instantiate");
export const Factory = createClassDecorator("Factory");

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
