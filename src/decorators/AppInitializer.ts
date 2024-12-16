import { DEFAULT_FACTORY_PATH, DEFAULT_ROUTES_PATH, FACTORIES_PATH, ROUTES_PATH } from "../config/const";

export type TAppInitilizerProps = {
  factoriesPath?: string;
  routesPath?: string;
};
export function AppInitializer (props?: TAppInitilizerProps) {
  return (target: any) => {
    const factoriesPath = props?.factoriesPath || DEFAULT_FACTORY_PATH;
    const routesPath = props?.routesPath || DEFAULT_ROUTES_PATH;
    Reflect.set(target, FACTORIES_PATH, factoriesPath);
    Reflect.set(target, ROUTES_PATH, routesPath);
  };
}
