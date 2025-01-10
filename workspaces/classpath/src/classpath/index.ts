import {TClassInfo, TCtor} from "../types";
import {ClassUtils} from "../classUtils";

export const ClassPath = (() => {
  const registry: Record<string, TCtor> = {};

  function register(entry: TClassInfo) {
    ClassUtils.assignClassId(entry.ctor, entry.typeId);
    registry[entry.typeId] = entry.ctor;
  }

  function getClasses() {
    return Object.values(registry);
  }

  function getClassById (id: string): TCtor | undefined {
    return registry[id];
  }

  return {
    register,
    getClasses,
    getClassById,
  }
})();

// @ts-ignore
global.ClassPath = ClassPath;
