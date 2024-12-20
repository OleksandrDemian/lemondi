import { platform } from "os";
import { async as glob } from "fast-glob";
import { join } from "path";

const getOsPattern = (path: string) => {
  if (platform() === "win32") {
    return path.replace(/\\/g,'/');
  }

  return path;
}

export const Scanner = (() => {
  async function importFiles (pattern: string) {
    console.log("Import files using the following pattern: " + getOsPattern(pattern));
    const files = await glob(getOsPattern(pattern), {
      ignore: ["**/*.util.*"],
    });
    for (const filePath of files) {
      console.log("Import file: " + filePath);
      await require(filePath);
    }
    console.log("Files imported");
  }

  function buildPath (...args: string[]) {
    return join(...args);
  }

  return {
    importFiles,
    buildPath,
  };
})();
