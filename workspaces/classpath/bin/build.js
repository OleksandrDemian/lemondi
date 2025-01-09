#! /usr/bin/env node

const { Project } = require("ts-morph");
const {
  createIncrementalValue,
  stringifyArgsType,
  getDependencies,
} = require("./utils");
const fs = require("fs");
const {TypeIdResolver} = require("./typeIdResolver");

const getProgressiveNumber = createIncrementalValue(0);

async function run () {
  // initialize
  const project = new Project({
    tsConfigFilePath: "./tsconfig.json",
  });

  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"));
  TypeIdResolver.setDeps(getDependencies(packageJson));
  TypeIdResolver.setPkgName(packageJson.name);
  TypeIdResolver.setProjectRoot(process.cwd());

  // add source files
  const files = project.getSourceFiles();
  for (const file of files) {
    const classes = file.getClasses();

    for (const ctor of classes) {
      const statements = [];
      const resolver = TypeIdResolver.createInjectionTokenResolver(file, ctor);

      /**
       * @type {ParameterDeclaration[]}
       */
      const parameters = ctor.getConstructors()[0]?.getParameters() || [];
      const constructorTypes = [];
      for (const p of parameters) {
        constructorTypes.push(resolver.getInjectionToken(p.getType()));
      }

      statements.push(`ClassPath.register({ id: "${resolver.getInjectionToken(ctor.getType()).token}", ctor: ${ctor.getName()} })`);
      statements.push(`ClassUtils.ctorArgs(${ctor.getName()}, ${stringifyArgsType(constructorTypes)});`);

      for (const p of parameters) {
        const decorators = p.getDecorators();
        for (let i = 0; i < decorators.length; i++) {
          const decorator = decorators[i];
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

          statements.push(`ClassUtils.ctorArgDecorator(${ctor.getName()}, ${i}, ${decorator.getName()}, ${propsVarName})`);
        }
      }

      const methods = ctor.getMethods();
      for (const method of methods) {
        const args = resolver.getMethodArgumentsInjectionTokens(method);
        const ret = resolver.getMethodReturnInjectionToken(method);

        statements.push(`ClassUtils.method(${ctor.getName()}, "${method.getName()}", ${stringifyArgsType(args)}, { typeId: "${ret.token}", isAsync: ${ret.isAsync} };`);

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

          statements.push(`ClassUtils.methodDecorator(${ctor.getName()}, "${method.getName()}", ${decorator.getName()}, ${propsVarName})`);
        }

        const parameters = method.getParameters();
        for (let i = 0; i < parameters.length; i++) {
          const parameter = parameters[i];
          const decorators = parameter.getDecorators();
          for (let i = 0; i < decorators.length; i++) {
            const decorator = decorators[i];
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

            statements.push(`ClassUtils.methodArgDecorator(${ctor.getName()}, "${method.getName()}", ${i}, ${decorator.getName()}, ${propsVarName})`);
          }
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

        statements.push(`ClassUtils.classDecorator(${ctor.getName()}, ${decorator.getName()}, ${propsVarName})`);
      }

      const nextIndex = createIncrementalValue(ctor.getChildIndex());
      statements.forEach((s) => {
        file.insertStatements(nextIndex(), s);
      });
    }
  }

  await project.emit();
}

run();
