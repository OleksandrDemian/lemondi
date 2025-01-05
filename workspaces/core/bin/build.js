const { Project, Type } = require("ts-morph");
const path = require("path");

/**
 * @typedef {Object} TParsedImport
 * @property {string} typeId
 * @property {boolean} isAsync
 */

function generatePackage (filePath) {
  const parsed = path.parse(filePath);
  return parsed.dir + '/' + parsed.name;
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

const getProgressiveNumber = createIncrementalValue(0);

/**
 * @param {string} pkg
 * @param {Type} type
 * @returns {TParsedImport}
 */
function typeToString (pkg, type) {
  if (type.isUnionOrIntersection()) {
    return {
      typeId: "not-mapped",
      isAsync: false,
    };
  } else {
    let typeString = type.getText();
    const isAsync = typeString.startsWith("Promise");
    if (type.isObject()) {
      if (isAsync) {
        typeString = removePromiseAnnotation(typeString);
      }

      const isImport = typeString.startsWith("import");
      if (isImport) {
        const { importPath, importType } = parseImportType(type.getText());
        return {
          typeId: generatePackage(importPath) + "." + importType,
          isAsync,
        };
      }

      const isExplicit = typeString.includes("{");
      if (isExplicit) {
        return {
          typeId: "object",
          isAsync,
        };
      }

      // is locally declared
      return {
        typeId: pkg + "." + typeString,
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

async function run () {
  // initialize
  const project = new Project({
    tsConfigFilePath: "./tsconfig.json",
  });

  // add source files
  project.addSourceFilesAtPaths("../src/**/*.ts");
  const files = project.getSourceFiles();
  for (const file of files) {
    const classes = file.getClasses();
    for (const ctor of classes) {
      const pkg = generatePackage(file.getFilePath());

      const parameters = ctor.getConstructors()[0]?.getParameters() || [];
      const constructorTypes = [];
      for (const p of parameters) {
        constructorTypes.push(typeToString(pkg, p.getType()));
      }

      const nextIndex = createIncrementalValue(ctor.getChildIndex());

      file.insertStatements(
        nextIndex(),
        `ClassPath.register({ id: "${pkg}.${ctor.getName()}", ctor: ${ctor.getName()} })`,
      );
      file.insertStatements(
        nextIndex(),
        `LemonAssign.ctorArgs(${ctor.getName()}, ${stringifyArgsType(constructorTypes)});`,
      );

      const methods = ctor.getMethods();
      for (const method of methods) {
        const ret = typeToString(pkg, method.getReturnType());
        const args = method.getParameters().map(
          (p) => typeToString(pkg, p.getType()),
        );

        file.insertStatements(
          nextIndex(),
          `LemonAssign.method(${ctor.getName()}, "${method.getName()}", ${stringifyArgsType(args)}, { typeId: "${ret.typeId}", isAsync: ${ret.isAsync} };`,
        );

        const methodDecorators = method.getDecorators();
        for (const decorator of methodDecorators) {
          const props = decorator.getArguments()[0];
          let propsVarName;

          if (props) {
            propsVarName = "prop" + getProgressiveNumber();
            file.insertVariableStatement(ctor.getChildIndex(), {
              declarationKind: "const",
              declarations: [{
                name: propsVarName,
                initializer: props.getText(),
              }],
            });

            props.replaceWithText(propsVarName);
          }

          file.insertStatements(
            nextIndex(),
            `LemonAssign.methodDecorator(${ctor.getName()}, "${method.getName()}", ${decorator.getName()}, ${propsVarName})`,
          );
        }
      }

      const classDecorators = ctor.getDecorators();
      for (const decorator of classDecorators) {
        const props = decorator.getArguments()[0];
        let propsVarName;
        if (props) {
          propsVarName = "prop" + getProgressiveNumber();
          file.insertVariableStatement(ctor.getChildIndex(), {
            declarationKind: "const",
            declarations: [{
              name: propsVarName,
              initializer: props.getText(),
            }],
          });

          props.replaceWithText(propsVarName);
        }

        file.insertStatements(
          nextIndex(),
          `LemonAssign.classDecorator(${ctor.getName()}, ${decorator.getName()}, ${propsVarName})`,
        );
      }
    }
  }

  // await project.save();
  await project.emit();
}

run();
