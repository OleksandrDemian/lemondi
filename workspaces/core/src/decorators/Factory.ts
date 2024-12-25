import {createClassDecorator, createMethodDecorator} from "@bframe/scanner";

export const Instantiate = createMethodDecorator("Instantiate");
export const Factory = createClassDecorator("Factory");
