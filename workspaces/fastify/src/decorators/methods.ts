import { createMethodDecorator } from "@bframe/scanner";

export type TRouteProps = {
  isAbsolute?: boolean;
  path?: string;
};

export const Get = createMethodDecorator<TRouteProps>("Get");
export const Post = createMethodDecorator<TRouteProps>("Post");
export const Put = createMethodDecorator<TRouteProps>("Put");
export const Delete = createMethodDecorator<TRouteProps>("Delete");
export const Options = createMethodDecorator<TRouteProps>("Options");