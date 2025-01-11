import {TClassInfo, TCtor, TDecoratorCtor} from "../types";
import {ClassUtils} from "../classUtils";

export const ClassPath = (() => {
  const registry: Record<string, TCtor> = {};

  function register(entry: TClassInfo) {
    ClassUtils.assignClassId(entry.ctor, entry.typeId);
    registry[entry.typeId] = entry.ctor;
  }

  function scan(scanner: (ctor: TCtor) => void) {
    Object.values(registry).forEach(scanner);
  }

  function findDecoratedClasses (decorator: TDecoratorCtor) {
    const classes: TCtor[] = [];

    for (const key in registry) {
      const decorators = ClassUtils.getDecorators(registry[key], decorator);
      if (decorators && decorators.length > 0) {
        classes.push(registry[key]);
      }
    }

    return classes;
  }

  function getClassById (id: string): TCtor | undefined {
    return registry[id];
  }

  return {
    register,
    scan,
    getClassById,
    findDecoratedClasses,
  }
})();

// @ts-ignore
global.ClassPath = ClassPath;
