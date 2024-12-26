// Import TypeScript API
const ts = require('typescript');
const path = require('path');
const fs = require('fs');

function collectClassInformation () {
  const info = {
    name: "",
    id: "", // path
    extends: "",
    implements: [
      "",
      "",
    ],
    decorators: [
      {
        decoratorId: "",
        decoratorParams: "", // json string
      }
    ],
    constructor: {
      arguments: [
        "", // list of ids
      ],
    },
    methods: [
      {
        name: "",
        arguments: [
          "", // list of ids
        ],
        returnType: "", // id of type/class
      }
    ]
  };
}

function isFactory (node) {
  if (node.kind === 263) {
    for (const mod of node.modifiers) {
      if (mod.kind === 170 && mod.expression.expression.escapedText === "Factory") {
        return true;
      }
    }
  }

  return false;
}

function isInstantiate (member) {
  if (member.kind === 174) {
    for (const mod of member.modifiers) {
      if (mod.kind === 170 && mod.expression.expression.escapedText === "Instantiate") {
        return true;
      }
    }
  }

  return false;
}

function getInstantiateType (member) {
  if (member.type.kind === 183) {
    return member.type.typeName.escapedText;
  }

  throw new Error("Invalid factory instantiate type. " + member.name.escapedText + " should only return 1 type");
}

function getFactoryComponents (node) {
  const components = [];
  for (const member of node.members) {
    if (isInstantiate(member)) {
      components.push(member);
    }
  }

  return components;
}

// Transformer function
function factoryInstantiateTransformer() {
  return (context) => {
    return (sourceFile) => {
      const visit = (node) => {
        if (isFactory(node)) {
          const components = getFactoryComponents(node);
          for (const component of components) {

          }
        }

        // Check if the node is a class declaration
        // if (ts.isClassDeclaration(node) && node.decorators) {
        //   // Check for the @Factory decorator
        //   node.decorators.forEach(decorator => {
        //     if (ts.isCallExpression(decorator.expression) && ts.isIdentifier(decorator.expression.expression)) {
        //       if (decorator.expression.expression.text === 'Factory') {
        //         // Look for methods with the @Instantiate decorator in this class
        //         node.members.forEach(member => {
        //           if (ts.isMethodDeclaration(member) && member.decorators) {
        //             member.decorators.forEach(decorator => {
        //               if (ts.isCallExpression(decorator.expression) && ts.isIdentifier(decorator.expression.expression)) {
        //                 if (decorator.expression.expression.text === 'Instantiate') {
        //                   // Transform the @Instantiate decorator to include the type of the method
        //                   const methodType = ts.getSignatureDeclaration(node, member);
        //                   if (methodType) {
        //                     const returnType = methodType.getReturnType();
        //                     const typeArgs = [returnType];
        //
        //                     // Modify the decorator to include the return type as a type argument
        //                     const newDecoratorExpression = ts.updateCall(
        //                       decorator.expression,
        //                       decorator.expression.expression,
        //                       undefined,
        //                       typeArgs
        //                     );
        //                     decorator.expression = newDecoratorExpression;
        //                     console.log("Updated ", member);
        //                   }
        //                 }
        //               }
        //             });
        //           }
        //         });
        //       }
        //     }
        //   });
        // }

        return ts.visitEachChild(node, visit, context);
      };

      return ts.visitNode(sourceFile, visit);
    };
  };
}

// Get the TypeScript configuration from tsconfig.json if available
function readTsConfig(configFileName = 'tsconfig.json') {
  const configPath = path.resolve(configFileName);

  if (fs.existsSync(configPath)) {
    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
    const parsedConfig = ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      path.dirname(configPath)
    );
    return parsedConfig;
  }
  return null;
}

// Function to compile a file or set of files (similar to tsc)
function compile() {
  // Read tsconfig if present
  const config = readTsConfig();

  if (config) {
    // Create a program from tsconfig
    const program = ts.createProgram(config.fileNames, config.options);

    const transformers = {
      before: [factoryInstantiateTransformer()],
    };

    // Set up the compiler host and handle the outputs
    const result = program.emit(undefined, undefined, undefined, undefined, transformers);

    // Check for any errors
    const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(result.diagnostics);

    if (allDiagnostics.length > 0) {
      allDiagnostics.forEach(diagnostic => {
        const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        const {line, character} = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        console.error(`Error at ${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
      });
      process.exit(1); // Exit with error code if there are compilation errors
    } else {
      console.log("Compilation successful!");
    }
  } else {
    console.error("tsconfig.json not found!");
    process.exit(1); // Exit with error code if tsconfig is not found
  }
}

// Run the compile function
compile();
