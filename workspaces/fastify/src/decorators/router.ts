import { getDependencies } from "@bframe/core";
import { registerRouter } from "../containers/routerContainer";
import { ROUTER_META } from "../const/const";

export type TRouterProps = {
  path?: string;
};

export function Router (props?: TRouterProps) {
  return (target: any) => {
    const deps = getDependencies(target);
    Reflect.defineMetadata(ROUTER_META, {
      path: props?.path ?? "",
    } satisfies TRouterProps, target.prototype);

    const router: any = Reflect.construct(target, deps);
    registerRouter(router);
  }
}
