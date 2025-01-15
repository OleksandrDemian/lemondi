import { Component, TComponentProps } from "./decorators/Component";
import { AppContext } from "./context/AppContext";
import { Factory, Instantiate, TInstantiateProps } from "./decorators/Factory";
import { ClassPath, ClassUtils, TCtor } from "@lemondi/classpath";

function initComponent (c: TCtor) {
  const [component] = ClassUtils.getDecorators(c, Component);
  const props = component?.getProps() as TComponentProps | undefined;

  AppContext.registerComponentFactory(
    () => AppContext.instantiate(c),
    ClassUtils.getClassId(c),
    props?.qualifier,
    !!props?.isDefault,
  );
}

async function initFactory (c: TCtor) {
  const factoryInstance = await AppContext.instantiate(c);

  const methods = ClassUtils.getMethods(c);
  for (const method of methods) {
    const [decorator] = method.getDecorators(Instantiate);
    if (decorator) {
      const instantiateProps = decorator.getProps() as TInstantiateProps | undefined;

      AppContext.registerComponentFactory(
        () => AppContext.instantiateMethod(factoryInstance, method),
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
