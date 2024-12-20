import { platform } from "os";
import { join } from "path";
import { async as glob } from "fast-glob";

const getOsPattern = (path: string) => {
  if (platform() === "win32") {
    return path.replace(/\\/g,'/');
  }

  return path;
}

export const importFactories = async ({ factoriesDir }: { factoriesDir: string }) => {
  const pattern = getOsPattern(join(factoriesDir, "**", "*.js"));
  console.log("Import factories using the following pattern: " + pattern);
  const files = await glob(pattern, {
    ignore: ["**/*.util.*"],
  });
  for (const filePath of files) {
    console.log("Import factory: " + filePath);
    await require(filePath);
  }
  console.log("Factories imported");
};
