const { Type } = require("ts-morph");
const {
  removePromiseAnnotation,
  generatePackage,
  parseImportType,
  removeGenericImports,
} = require("./utils");

const TypeIdResolver = (() => {
  let deps = [];
  let projectRoot = "";

  function setDeps (newDeps) {
    deps = newDeps;
  }

  function setProjectRoot (newProjectRoot) {
    projectRoot = newProjectRoot;
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
            typeId: `${ext ? ext : generatePackage(importPath)}#${importType}`,
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

        // is locally declared
        return {
          typeId: currentFile + "#" + typeString,
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
  }
})();

module.exports = {
  TypeIdResolver,
};
