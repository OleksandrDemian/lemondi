/**
 * TODO: refactor this shit
 */
const { Type } = require("ts-morph");
const {
  removePromiseAnnotation,
  getFilePath,
  parseImportType,
  removeGenericImports, pathToPackage, isPrimitiveType,
} = require("./utils");

const TypeIdResolver = (() => {
  let deps = [];
  let projectRoot = "";
  let pkgName = "";
  let currentClass = "";

  function setDeps (newDeps) {
    deps = newDeps;
  }

  function setProjectRoot (newProjectRoot) {
    projectRoot = newProjectRoot;
  }

  function setPkgName (newPkgName) {
    pkgName = newPkgName;
  }

  function setCurrentClass (newCurrentClass) {
    // todo: this will definitely cause issue, find a better way
    currentClass = newCurrentClass;
  }
  /**
   * @param {string} path
   * @returns {string | undefined}
   */
  function getExternalImport (path) {
    for (const p of deps) {
      if (path.includes(`node_modules/${p.name}`)) {
        return p.name;
      }
    }

    return undefined;
  }

  /**
   * @param {string} currentFile
   * @param {Type} type
   * @returns {TParsedImport}
   */
  function typeToString (currentFile, type) {
    if (type.isUnionOrIntersection()) {
      console.warn(`Failed to create id for ${type.getText()}. The provided type is intersection or union`);
      return {
        typeId: "unsupported",
        isAsync: false,
      };
    } else {
      let typeString = type.getText();
      const isAsync = typeString.startsWith("Promise");
      if (type.isObject()) {
        if (isAsync) {
          typeString = removePromiseAnnotation(typeString);
        }

        typeString = removeGenericImports(typeString);
        const isImport = typeString.startsWith("import");
        if (isImport) {
          const ext = getExternalImport(typeString);
          const { importPath, importType } = parseImportType(typeString);
          return {
            typeId: `${ext ? ext : pathToPackage(getFilePath(importPath))}#${importType}`,
            isAsync,
          };
        }

        const isExplicit = typeString.includes("{");
        if (isExplicit) {
          return {
            typeId: "unsupported",
            isAsync,
          };
        }

        const isThis = typeString === "this";
        if (isThis) {
          // self reference
          return {
            typeId: `${pkgName}#${pathToPackage(getFilePath(currentFile))}#${currentClass}`,
            isAsync,
          };
        }

        if (isPrimitiveType(typeString)) {
          return {
            typeId: typeString,
            isAsync,
          };
        }

        // is locally declared
        return {
          typeId: `${pkgName}#${pathToPackage(getFilePath(currentFile))}#${typeString}`,
          isAsync,
        };
      } else {
        return {
          typeId: type.getText(),
          isAsync,
        };
      }
    }
  }

  return {
    setDeps,
    typeToString,
    setProjectRoot,
    setPkgName,
    setCurrentClass,
  }
})();

module.exports = {
  TypeIdResolver,
};
