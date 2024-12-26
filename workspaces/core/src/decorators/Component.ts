import {
  createClassDecorator,
  createMethodDecorator,
  findClassDecorators,
  findMethodDecorators,
  getClassId,
  scan
} from "@bframe/scanner";
import {addProxy, getDependencies, instantiate} from "../container/container";

export const Component = createClassDecorator("Component");
export const OnAppEvent = createMethodDecorator<{
  subscribe: string[],
}>("OnAppEvent");
export const OnInit = createMethodDecorator("OnInit");
