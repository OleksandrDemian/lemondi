import {createClassDecorator, createMethodDecorator, TCtor} from "@lemondi/scanner";

export const Instantiate = createMethodDecorator<{
  qualifiers: (TCtor | symbol | string)[];
}>("Instantiate");
export const Factory = createClassDecorator("Factory");
