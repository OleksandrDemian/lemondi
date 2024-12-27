import {
  createClassDecorator,
  createMethodDecorator,
} from "@lemondi/scanner";

export const Component = createClassDecorator("Component");
export const OnAppEvent = createMethodDecorator<{
  subscribe: string[],
}>("OnAppEvent");
export const OnInit = createMethodDecorator("OnInit");
