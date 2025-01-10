const path = require("path");

const PRIMITIVE_TYPES = [
  "string", // isString
  "number", // isNumber
  "bigint", // isBigInt
  "boolean", // isBoolean
  "undefined", // isUndefined
  "symbol", //
  "null", // isNull
];

/**
 * @type {string[]}
 */
const PRIMITIVE_TYPES_CHECKS = [
  "isString",
  "isNumber",
  "isBigInt",
  "isBoolean",
  "isUndefined",
  "isNull",
];

/**
 * @param {string} filePath
 * @param {string|undefined} currentFile
 * @returns {string}
 */
function getInProjectFilePath (filePath, currentFile) {
  let finalPath = filePath;
  if (currentFile) {
    const parsed = path.parse(currentFile);
    finalPath = path.resolve(parsed.dir, finalPath);
  }

  const parsed = path.parse(finalPath);
  return path.relative(process.cwd(), parsed.dir + '/' + parsed.name).replace(/\\/g, '/');
}

/**
 * @param {string} path
 * @returns {string}
 */
function tokenizePath (path) {
  // Get the platform-specific separator
  return path.replace(/[\\\/]/g, '#');
}

/**
 * @param {TInjectionToken} arg
 * @returns {string}
 */
function stringifyArgType (arg) {
  return `{ typeId: "${arg.token}", ${arg.isAsync ? 'isAsync: true' : ''}}`;
}

/**
 * @param {TInjectionToken[]} args
 * @returns {string}
 */
function stringifyArgsType (args) {
  return `[${args.map(stringifyArgType).join(", ")}]`;
}

function createIncrementalValue (start) {
  let index = start;
  return () => {
    index += 1;
    return index;
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

/**
 * @param {import("ts-morph").Type} type
 * @returns {boolean}
 */
function isPrimitiveType (type) {
  return PRIMITIVE_TYPES_CHECKS.some(check => type[check]());
}

/**
 * @param {import("ts-morph").SourceFile} file
 * @returns {Record<string, string>}
 */
function getImportsPaths(file) {
  const imports = file.getImportDeclarations();
  const map = {};

  for (const i of imports) {
    const path = i.getModuleSpecifierValue();
    const namedImports = i.getNamedImports();

    for (const n of namedImports) {
      map[n.getName()] = path;
    }

    // todo: handle default imports
  }

  return map;
}

module.exports = {
  getInProjectFilePath,
  stringifyArgsType,
  createIncrementalValue,
  getDependencies,
  tokenizePath,
  isPrimitiveType,
  getImportsPaths,
  stringifyArgType,
}