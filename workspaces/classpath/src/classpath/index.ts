import {TRegistryEntry} from "../types";

export const ClassPath = (() => {
  const registry: TRegistryEntry[] = [];

  function register(entry: TRegistryEntry) {
    registry.push(entry);
  }

  function getClasses() {
    return registry;
  }

  return {
    register,
    getClasses,
  }
})();

// @ts-ignore
global.ClassPath = ClassPath;
