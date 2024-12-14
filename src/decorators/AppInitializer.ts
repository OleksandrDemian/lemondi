import { DEFAULT_FACTORY_PATH, FACTORIES_PATH } from "../config/const";

export type TAppInitilizerProps = {
  factoriesPath?: string;
};
export function AppInitializer (props?: TAppInitilizerProps) {
  return (target: any) => {
    const factoriesPath = props?.factoriesPath || DEFAULT_FACTORY_PATH;
    Reflect.set(target, FACTORIES_PATH, factoriesPath);
  };
}
