import { platform } from "os";
import { join } from "path";
import { async as glob } from "fast-glob";
import { readTsConfig } from "./tsconfig";

const getOsPattern = (path: string) => {
  if (platform() === "win32") {
    return path.replace(/\\/g,'/');
  }

  return path;
}

export const importRoutes = () => {

};

export const importFactories = async ({ factoriesDir }: { factoriesDir: string }) => {
  const tsConfig = readTsConfig();
  const cwd = process.cwd();
  const pattern = getOsPattern(join(tsConfig.compilerOptions.outDir, factoriesDir, "**", "*.js"));
  console.log("Import factories using the following pattern: " + pattern);
  const files = await glob(pattern, {
    ignore: ["**/*.util.*"],
    cwd,
  });
  for (const filePath of files) {
    console.log("Import factory: " + filePath);
    await import(join(cwd, filePath));
  }
  console.log("Factories imported");
};
