import { TCtor, TDecoratedClass } from "./types";
import {assignClassId, getClassId} from "./utils";

const classesRegistry: TDecoratedClass[] = [];

export function registerClass (ctor: TCtor) {
  const existingClassId = getClassId(ctor);
  if (!existingClassId) {
    assignClassId(ctor);
    classesRegistry.push({
      ctor,
    });
  }
}

export function getRegisteredClasses (): TDecoratedClass[] {
  return classesRegistry;
}