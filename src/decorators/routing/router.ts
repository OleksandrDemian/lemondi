import { ROUTER_META } from "../../config/const";
import { getDependencies } from "../../container/container";
import { registerRouter } from "../../container/routerContainer";

export type TRouterProps = {
  isAbsolute?: boolean;
  path?: string;
};

export function Router (props?: TRouterProps) {
  return (target: any) => {
    const deps = getDependencies(target);
    Reflect.defineMetadata(ROUTER_META, {
      isAbsolute: props?.isAbsolute,
      path: props?.path ?? "",
    } satisfies TRouterProps, target.prototype);

    const router: any = Reflect.construct(target, deps);
    registerRouter(router);
  }
}
