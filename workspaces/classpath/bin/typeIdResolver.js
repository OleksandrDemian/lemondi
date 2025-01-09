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
const path = require("path");

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

  /**
   * @param {string} path
   * @returns {string | undefined}
   */
  function getExternalImport (path) {
    if (path) {
      const dep = deps.find((d) => d.name === path);
      if (dep) {
        return dep.name;
      }
    }

    return undefined;
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
   *
   * @param {import("ts-morph").Type} type
   * @param {boolean} isAsync
   * @returns {{name: string, isAsync: boolean}}
   */
  function getType (type, isAsync = false) {
    const symbol = type.getSymbol();
    let name = "";

    if (symbol) {
      name = symbol.getName();
      if (name === "__type") {
        name = type.getAliasSymbol().getName();
      }

      if (name === "Promise") {
        return getType(type.getTypeArguments()[0], true);
      }
    }

    return {
      name,
      isAsync,
    };
  }

  /**
   * @param {import("ts-morph").SourceFile} file
   * @param {import("ts-morph").ClassDeclaration} ctor
   */
  function createInjectionTokenResolver (file, ctor) {
    const imports = getImportsPaths(file);

    /**
     * @param {import("ts-morph").Type} type
     * @param {string} ext
     */
    function tryGetExternalImportRelativePath (type, ext) {
      try {
        const source = type.getSymbol().getDeclarations()[0].getSourceFile();
        const filePath = `${source.getDirectoryPath()}/${source.getBaseNameWithoutExtension()}`;
        return filePath.split(`node_modules/${ext}`)[1];
      } catch (e) {
        return undefined;
      }
    }

    /**
     * @param {import("ts-morph").Type} type
     */
    function getTypeInjectionToken(type) {
      const { isAsync, name } = getType(type);
      const ext = getExternalImport(imports[name]);
      let token;

      if (!name) {
        token = ""
      } else if (isPrimitiveType(name)) {
        token = name;
      } else if (ext) {
        token = `${ext}${tryGetExternalImportRelativePath(type, ext) || ''}#${name}`;
      } else if (name === "this") {
        token = `${pkgName}#${resolvePath(file.getFilePath())}#${ctor.getName()}`;
      } else if (imports[name]) {
        token = `${pkgName}#${resolvePath(imports[name])}#${name}`;
      } else {
        // current file
        token = `${pkgName}#${resolvePath(file.getFilePath())}#${name}`;
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

      return getTypeInjectionToken(method.getReturnType());
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

          return getTypeInjectionToken(p.getType());
        }
      );
    }

    /**
     * @param {import("ts-morph").ClassDeclaration} ctor
     */
    function getConstructorInjectionTokens (ctor) {
      /**
       * @type {ParameterDeclaration[]}
       */
      const parameters = ctor.getConstructors()[0]?.getParameters() || [];
      return parameters.map(
        (p) => {
          if (!p.getStructure().type) {
            return SKIP_TOKEN;
          }

          return getTypeInjectionToken(p.getType());
        }
      );
    }

    return {
      getConstructorInjectionTokens,
      getTypeInjectionToken,
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
