import {Component, TComponentProps} from "./decorators/Component";
import {addComponentProto, getDependencies, instantiate, TComponentProto} from "./container/di";
import {Factory, Instantiate, TInstantiateProps} from "./decorators/Factory";
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

  const [component] = ClassUtils.getDecorators(c, Component);
  const props = component?.getProps() as TComponentProps | undefined;

  addComponentProto(
    factory,
    ClassUtils.getClassId(c),
    props?.qualifier,
    props?.isDefault,
  );
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

      const instantiateProps = decorator.getProps() as TInstantiateProps | undefined;

      addComponentProto(
        factory(),
        method.getReturnType().getTypeId(),
        instantiateProps?.qualifier,
        !!instantiateProps?.default,
      );
    }
  }
}

export const setup = async () => {
  const factories: TCtor[] = [];
  ClassPath.scan((c: TCtor) => {
    const [component] = ClassUtils.getDecorators(c, Component);

    if (component) {
      initComponent(c);
    }

    const [factory] = ClassUtils.getDecorators(c, Factory);
    if (factory) {
      factories.push(c);
    }
  });

  for (const factory of factories) {
    await initFactory(factory);
  }
};
