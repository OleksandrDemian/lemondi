import { createClassDecorator } from "@bframe/scanner";

export type TRouterProps = {
  path: string;
};

export const Router = createClassDecorator<TRouterProps>("Router");
