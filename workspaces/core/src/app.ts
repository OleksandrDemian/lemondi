import { FilesLoader } from "./loadFiles/filesLoader";
import { initComponents } from "./decorators/Component";
import { initFactories } from "./decorators/Factory";

export type TStartProps = {
  onStart?: () => Promise<void>;
  importFiles?: string[];
}

export const start = (props: TStartProps) => {
  const promises: Promise<any>[] = [];
  for(const path of props.importFiles) {
    promises.push(FilesLoader.importFiles(path));
  }

  Promise.all(promises).then(() => {
    initComponents();
    initFactories();

    if (props.onStart) {
      props.onStart();
    }
  });
};
