const path = require("path");

function generatePackage (filePath) {
  const parsed = path.parse(filePath);
  return path.relative(process.cwd(), parsed.dir + '/' + parsed.name).replace(/\\/g, '/');
}

/**
 *
 * @param {TParsedImport[]} args
 * @returns {string}
 */
function stringifyArgsType (args) {
  return `[${args.map(t => `{ typeId: "${t.typeId}", isAsync: ${t.isAsync}`).join(", ")}]`;
}

function createIncrementalValue (start) {
  let index = start;
  return () => {
    index += 1;
    return index;
  }
}

function removePromiseAnnotation(inputStr) {
  // Regular expression to match the pattern "Promise<...>"
  const regex = /^Promise<(.*)>$/;

  // Apply the regular expression to the input string
  const match = inputStr.match(regex);

  // If there's a match, return the content inside the Promise<...>
  if (match) {
    return match[1];
  }

  // If no match, return the original string
  return inputStr;
}

function removeGenericImports(inputString) {
  // Regular expression to match the generic imports inside angle brackets
  const genericStart = inputString.indexOf("<");
  if (genericStart > -1) {
    return inputString.slice(0, genericStart);
  }
  return inputString;
}

function parseImportType(input) {
  const regex = /import\(["'](.*)["']\)\.(\w+)/;
  const match = input.match(regex);

  if (match) {
    return {
      importPath: match[1], // The path inside the import
      importType: match[2]  // The type after the dot
    };
  } else {
    throw new Error("Invalid input string format");
  }
}

/**
 * @param {any} pkgJson
 * @returns {string[]}
 */
function getDependencies (pkgJson) {
  const collection = [];
  const deps = Object.keys(pkgJson.dependencies || {});
  deps.forEach((d) => {
    collection.push({
      name: d,
      isDev: false,
    })
  });

  const devDeps = Object.keys(pkgJson.devDependencies || {});
  devDeps.forEach((d) => {
    collection.push({
      name: d,
      isDev: true,
    })
  });

  return collection;
}

module.exports = {
  generatePackage,
  stringifyArgsType,
  createIncrementalValue,
  removePromiseAnnotation,
  removeGenericImports,
  parseImportType,
  getDependencies,
}