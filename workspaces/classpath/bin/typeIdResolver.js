/**
 * TODO: refactor this shit and add some comments, I don't know what is going here anymore
 */
const {
  isPrimitiveType,
  getInProjectFilePath,
  tokenizePath,
  getImportsPaths,
} = require("./utils");

const SKIP_TOKEN = {
  isAsync: false,
  token: "",
};

/**
 *
 * @param {import("ts-morph").Type} type
 * @param {boolean} isAsync
 * @returns {{name: string, isAsync: boolean, actualType: import("ts-morph").Type}}
 */
function getType (type, isAsync = false) {
  const text = type.getText();
  if (isPrimitiveType(type)) {
    return {
      name: type.getText(),
      actualType: type,
      isAsync,
    };
  }

  const symbol = type.getSymbol();
  let name = "";

  if (symbol) {
    name = symbol.getName();
    if (name === "__type") {
      if (!type.getAliasSymbol()) {
        console.warn("Explicit types are not mapped. Found type: " + type.getText());
      } else {
        name = type.getAliasSymbol().getName();
      }
    }

    if (name === "Promise") {
      return getType(type.getTypeArguments()[0], true);
    }
  } else {
    const aliasSymbol = type.getAliasSymbol();
    if (aliasSymbol) {
      return {
        name: aliasSymbol.getName(),
        actualType: type,
        isAsync,
      };
    }
  }

  return {
    name,
    actualType: type,
    isAsync,
  };
}

module.exports.TypeIdResolver = (() => {
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
   * @param {string} entity
   * @param {string} fromPackage
   * @returns {string}
   */
  function overridePath ({ path, entity, fromPackage }) {
    if (projectConfig?.overridePath) {
      return projectConfig.overridePath({
        path,
        entity,
        fromPackage,
      });
    }

    return path;
  }

  /**
   * @param {import("ts-morph").Type} type
   * @param {string} ext
   * @param {string} entity
   */
  function tryGetExternalImportRelativePath (type, ext, entity) {
    try {
      const source = type.getSymbol().getDeclarations()[0].getSourceFile();
      const filePath = `${source.getDirectoryPath()}/${source.getBaseNameWithoutExtension()}`;
      return overridePath({
        path: filePath,
        entity,
        fromPackage: ext,
      }).split(`node_modules/${ext}`)[1];
    } catch (e) {
      return undefined;
    }
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
   *
   * @param {string} path
   * @param {string} entity
   * @param {string|undefined} currentFilePath
   * @returns {string}
   */
  function resolvePath ({ path, entity, currentFilePath }) {
    return tokenizePath(overridePath({
      path: getInProjectFilePath(path, currentFilePath),
      entity
    }));
  }

  /**
   * @param {import("ts-morph").SourceFile} file
   * @param {import("ts-morph").ClassDeclaration} ctor
   */
  function createInjectionTokenResolver (file, ctor) {
    const imports = getImportsPaths(file);

    /**
     * @param {import("ts-morph").Type} type
     * @returns {TInjectionToken}
     */
    function getTypeInjectionToken(type) {
      const { isAsync, name, actualType } = getType(type);
      const ext = getExternalImport(imports[name]);
      let token;

      if (!name) {
        token = ""
      } else if (isPrimitiveType(actualType)) {
        token = name;
      } else if (ext) {
        token = `${ext}${tokenizePath(tryGetExternalImportRelativePath(actualType, ext, name) || '')}#${name}`;
      } else if (name === "this") {
        token = `${pkgName}#${resolvePath({
          path: file.getFilePath(),
          currentFilePath: file.getFilePath(),
          entity: ctor.getName(),
        })}#${ctor.getName()}`;
      } else if (imports[name]) {
        token = `${pkgName}#${resolvePath({
          path: imports[name],
          currentFilePath: file.getFilePath(),
          entity: name,
        })}#${name}`;
      } else {
        // current file
        token = `${pkgName}#${resolvePath({
          path: file.getFilePath(),
          currentFilePath: file.getFilePath(),
          entity: name,
        })}#${name}`;
      }

      return {
        isAsync,
        token,
      }
    }

    /**
     * @param {import("ts-morph").MethodDeclaration} method
     * @returns {TInjectionToken}
     */
    function getMethodReturnInjectionToken (method) {
      if (!method.getStructure().returnType) {
        return SKIP_TOKEN;
      }

      return getTypeInjectionToken(method.getReturnType());
    }

    /**
     * @param {import("ts-morph").MethodDeclaration} method
     * @returns {TInjectionToken[]}
     */
    function getMethodArgumentsInjectionTokens (method) {
      const name = method.getName();
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
     * @returns {TInjectionToken[]}
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

    /**
     * @param {import("ts-morph").ClassDeclaration} ctor
     * @returns {TInjectionToken[]}
     */
    function getInterfacesInjectionTokens (ctor) {
      const interfaces = ctor.getImplements();
      return interfaces.map((i) => getTypeInjectionToken(i.getType()));
    }

    /**
     * @param {import("ts-morph").ClassDeclaration} ctor
     * @returns {TInjectionToken|undefined}
     */
    function getExtendsInjectionToken (ctor) {
      const ext = ctor.getExtends();
      if (ext) {
        return getTypeInjectionToken(ext.getType());
      }

      return undefined;
    }

    return {
      getConstructorInjectionTokens,
      getTypeInjectionToken,
      getMethodReturnInjectionToken,
      getMethodArgumentsInjectionTokens,
      getInterfacesInjectionTokens,
      getExtendsInjectionToken,
    }
  }

  return {
    setDeps,
    setProjectRoot,
    setPkgName,

    createInjectionTokenResolver,
  }
})();
