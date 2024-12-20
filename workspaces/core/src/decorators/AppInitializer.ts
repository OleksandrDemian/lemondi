import { IMPORT_FILES } from "../config/const";

export type TAppInitilizerProps = {
  importFiles: string[];
};
export function AppInitializer (props?: TAppInitilizerProps) {
  return (target: any) => {
    Reflect.set(target, IMPORT_FILES, props.importFiles || []);
  };
}
