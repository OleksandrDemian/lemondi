import * as fs from "fs";
import { join } from "path";

export type TTSConfig = {
  compilerOptions: {
    outDir: string;
  }
};

let config: TTSConfig | undefined = undefined;

export const readTsConfig = (): TTSConfig => {
  try {
    const tsConfig = fs.readFileSync(join(process.cwd(), "tsconfig.json"), "utf-8");
    config = JSON.parse(tsConfig);
  } catch (e) {
    config = {
      compilerOptions: {
        outDir: "dist",
      },
    };
  }

  return config;
};
