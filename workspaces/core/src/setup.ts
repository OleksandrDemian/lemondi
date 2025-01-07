import {Component} from "./decorators/Component";
import {addComponentProto, getDependencies, instantiate, TComponentProto} from "./container/di";
import {Factory, Instantiate} from "./decorators/Factory";
import {ClassPath, ClassUtils, TCtor} from "@lemondi/classpath";

function initComponent (c: TCtor) {
  // todo: qualifiers
  const factory = ((): TComponentProto => {
    let value: any = undefined;
    let isReady: boolean;

    const init = async () => {
      value = await instantiate(c);
    }

    return {
      init,
      getValue: () => value,
      getIsReady: () => isReady,
    }
  })();

  addComponentProto([ClassUtils.getClassId(c)], factory);
}

async function initFactory (c: TCtor) {
  const factoryInstance = await instantiate(c);

  const methods = ClassUtils.getMethods(c);
  for (const method of methods) {
    const [decorator] = method.getDecorators(Instantiate);
    if (decorator) {
      // TODO: qualifiers
      const factory = (): TComponentProto => {
        let value: any = undefined;
        let isReady: boolean;

        const init = async () => {
          const deps = await getDependencies(
            method.getArguments(),
          );
          value = factoryInstance[method.getName()](...deps);
        }

        return {
          init,
          getValue: () => value,
          getIsReady: () => isReady,
        }
      };

      addComponentProto([method.getReturnType().getTypeId()], factory());
    }
  }
}

export const setup = async () => {
  const classes = ClassPath.getClasses();
  for (const c of classes) {
    const [component] = ClassUtils.getDecorators(c, Component);

    if (component) {
      initComponent(c);
    }

    const [factory] = ClassUtils.getDecorators(c, Factory);
    if (factory) {
      await initFactory(c);
    }
  }
};
