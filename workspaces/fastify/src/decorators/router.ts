import { createClassDecorator } from "@lemondi/scanner";

export type TRouterProps = {
  path: string;
};

export const Router = createClassDecorator<TRouterProps>("Router");
