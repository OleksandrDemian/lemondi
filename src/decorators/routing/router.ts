import { getDependencies } from "../../container/container";

export type TRouterProps = {
  isAbsolute?: boolean;
};

export function Router (props?: TRouterProps) {
  return (target: any) => {
    // todo
    const deps = getDependencies(target);
    Reflect.construct(target, deps);
    console.log("Router created: " + target.name);
  }
}
