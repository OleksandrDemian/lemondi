import {createClassDecorator, createMethodDecorator} from "@lemondi/scanner";

export const Instantiate = createMethodDecorator("Instantiate");
export const Factory = createClassDecorator("Factory");
