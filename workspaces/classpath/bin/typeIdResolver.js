/**
 * TODO: refactor this shit
 */
const { Type } = require("ts-morph");
const {
  removePromiseAnnotation,
  parseImportType,
  removeGenericImports,
  isPrimitiveType,
  getInProjectFilePath,
  tokenizePath,
} = require("./utils");

const SKIP_TOKEN = {
  isAsync: false,
  token: "",
};

const TypeIdResolver = (() => {
  let deps = [];
  let projectRoot = "";
  let pkgName = "";
  let projectConfig;

  function setDeps (newDeps) {
    deps = newDeps;
  }

  function setProjectRoot (newProjectRoot) {
    projectRoot = newProjectRoot;
    try {
      projectConfig = require(`${newProjectRoot}/lemonconf.js`)();
    } catch(e) {
      projectConfig = undefined;
    }
  }

  function setPkgName (newPkgName) {
    pkgName = newPkgName;
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
   * @param {Type} type
   * @returns {TParsedImport}
   */
  function parseType (type) {
    if (type.isUnionOrIntersection()) {
      console.warn(`Failed to create id for ${type.getText()}. The provided type is intersection or union`);
      return {
        importPath: "",
        name: "",
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
          const { importPath, importType } = parseImportType(typeString);
          return {
            importPath: importPath,
            name: importType,
            isAsync,
          };
        }

        const isExplicit = typeString.includes("{");
        if (isExplicit) {
          return {
            importPath: "",
            name: "",
            isAsync,
          };
        }

        const isThis = typeString === "this";
        if (isThis) {
          // self reference
          return {
            importPath: "",
            name: "this",
            isAsync,
          };
        }

        if (isPrimitiveType(typeString)) {
          return {
            importPath: "",
            name: typeString,
            isAsync,
          };
        }

        // is locally declared
        return {
          importPath: ".",
          name: typeString,
          isAsync,
        };
      } else {
        return {
          importPath: "",
          typeId: type.getText(),
          isAsync,
        };
      }
    }
  }

  /**
   * @param {string} path
   * @returns {string}
   */
  function resolvePath (path) {
    let actualPath = path;
    if (projectConfig?.resolveInjectionTokenPath) {
      actualPath = projectConfig.resolveInjectionTokenPath(path);
    }

    return tokenizePath(getInProjectFilePath(actualPath));
  }

  /**
   * IT = Injection token
   *
   * @param {import("ts-morph").SourceFile} file
   * @param {import("ts-morph").ClassDeclaration} ctor
   */
  function createInjectionTokenResolver (file, ctor) {
    /**
     * @param {import("ts-morph").Type} type
     */
    function getInjectionToken(type) {
      const { importPath, name, isAsync } = parseType(type);
      const ext = getExternalImport(importPath);
      let token;

      if (!name) {
        token = ""
      } else if (isPrimitiveType(name)) {
        token = name;
      } else if (ext) {
        token = `${ext}#${name}`;
      } else if (name === "this") {
        token = `${pkgName}#${resolvePath(file.getFilePath())}#${ctor.getName()}`;
      } else {
        if (importPath === ".") {
          token = `${pkgName}#${resolvePath(file.getFilePath())}#${name}`;
        } else {
          token = `${pkgName}#${resolvePath(importPath)}#${name}`;
        }
      }

      return {
        isAsync,
        token,
      }
    }

    /**
     * @param {import("ts-morph").MethodDeclaration} method
     */
    function getMethodReturnInjectionToken (method) {
      if (!method.getStructure().returnType) {
        return SKIP_TOKEN;
      }

      return getInjectionToken(method.getReturnType());
    }

    /**
     * @param {import("ts-morph").MethodDeclaration} method
     */
    function getMethodArgumentsInjectionTokens (method) {
      return method.getParameters().map(
        (p) => {
          if (!p.getStructure().type) {
            return SKIP_TOKEN;
          }

          return getInjectionToken(p.getType());
        }
      );
    }

    return {
      getInjectionToken,
      getMethodReturnInjectionToken,
      getMethodArgumentsInjectionTokens,
    }
  }

  return {
    setDeps,
    setProjectRoot,
    setPkgName,
    createInjectionTokenResolver,
  }
})();

module.exports = {
  TypeIdResolver,
};
