import { getRegisteredClasses } from "./classesRegistry";
import {TCreateClassDecorator, TCtor} from "./types";
import {findClassDecorators} from "./decorators";

export function scan <TProps>(decorator: TCreateClassDecorator<TProps>): TCtor[] {
  const result: TCtor[] = [];
  const classes = getRegisteredClasses();
  for (const entry of classes) {
    if (findClassDecorators(entry.ctor, decorator).length > 0) {
      result.push(entry.ctor);
    }
  }

  return result;
}
