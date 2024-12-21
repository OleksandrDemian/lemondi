import { createClassDecorator } from "@bframe/scanner";

export const AppInitializer = createClassDecorator<{
  importFiles: string[];
}>("AppInitializer");
