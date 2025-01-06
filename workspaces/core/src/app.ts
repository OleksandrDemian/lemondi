import { FilesLoader } from "./filesLoader";
import { instantiate} from "./container/di";
import { OnInit } from "./decorators/Component";
import {setup} from "./setup";
import {ClassUtils, TCtor} from "@lemondi/classpath";

export type TStartProps = {
  modules: TCtor[],
  importFiles?: string[];
};

export const start = (props: TStartProps) => {
  (async () => {
    const promises: Promise<any>[] = [];
    for(const path of props.importFiles) {
      promises.push(FilesLoader.importFiles(path));
    }

    await Promise.all(promises);

    await setup();

    for (const module of props.modules) {
      const component = await instantiate(module);
      const methods = ClassUtils.getMethods(module);

      for (const method of methods) {
        const [onInit] = method.getDecorators(OnInit);

        if (onInit) {
          await Promise.resolve(component[method.getName()]());
        }
      }
    }
  })();
};
