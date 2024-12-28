import {
  createClassDecorator,
  createMethodDecorator, TCtor,
} from "@lemondi/scanner";

export const Component = createClassDecorator<{
  qualifiers: (TCtor | symbol | string)[];
}>("Component");
export const OnAppEvent = createMethodDecorator<{
  subscribe: string[],
}>("OnAppEvent");
export const OnInit = createMethodDecorator("OnInit");
