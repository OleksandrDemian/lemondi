const { Type } = require("ts-morph");
const path = require("path");

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

function removeGenericImports(inputString) {
  // Regular expression to match the generic imports inside angle brackets
  const genericStart = inputString.indexOf("<");
  if (genericStart > -1) {
    return inputString.slice(0, genericStart);
  }
  return inputString;
}

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

      typeString = removeGenericImports(typeString);
      const isImport = typeString.startsWith("import");
      if (isImport) {
        const { importPath, importType } = parseImportType(typeString);
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

module.exports = {
  generatePackage,
  stringifyArgsType,
  createIncrementalValue,
  removePromiseAnnotation,
  typeToString,
  parseImportType,
}