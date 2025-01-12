#! /usr/bin/env node

const { Project } = require("ts-morph");
const {
  createIncrementalValue,
  stringifyArgsType,
  getDependencies,
  stringifyArgType,
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
      const constructorTypes = resolver.getConstructorInjectionTokens(ctor);
      const interfaces = resolver.getInterfacesInjectionTokens(ctor);
      const ext = resolver.getExtendsInjectionToken(ctor);

      statements.push(`ClassPath.register({ typeId: "${resolver.getTypeInjectionToken(ctor.getType()).token}", ctor: ${ctor.getName()} })`);
      statements.push(`ClassUtils.R.ctorArgs(${ctor.getName()}, ${stringifyArgsType(constructorTypes)});`);
      if (ext) {
        statements.push(`ClassUtils.R.extend(${ctor.getName()}, ${stringifyArgType(ext)})`);
      }

      if (interfaces.length > 0) {
        statements.push(`ClassUtils.R.interfaces(${ctor.getName()}, ${stringifyArgsType(interfaces)});`);
      }

      /**
       * @type {ParameterDeclaration[]}
       */
      const parameters = ctor.getConstructors()[0]?.getParameters() || [];
      for (let i = 0; i < parameters.length; i++) {
        const p = parameters[i];
        const decorators = p.getDecorators();
        for (let j = 0; j < decorators.length; j++) {
          const decorator = decorators[j];
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

          statements.push(`ClassUtils.R.ctorArgDecorator(${ctor.getName()}, ${i}, ${decorator.getName()}, ${propsVarName})`);
        }
      }

      const methods = ctor.getMethods();
      for (const method of methods) {
        const args = resolver.getMethodArgumentsInjectionTokens(method);
        const ret = resolver.getMethodReturnInjectionToken(method);

        statements.push(`ClassUtils.R.method(${ctor.getName()}, "${method.getName()}", ${stringifyArgsType(args)}, ${stringifyArgType(ret)};`);

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

          statements.push(`ClassUtils.R.methodDecorator(${ctor.getName()}, "${method.getName()}", ${decorator.getName()}, ${propsVarName})`);
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

            statements.push(`ClassUtils.R.methodArgDecorator(${ctor.getName()}, "${method.getName()}", ${i}, ${decorator.getName()}, ${propsVarName})`);
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

        statements.push(`ClassUtils.R.classDecorator(${ctor.getName()}, ${decorator.getName()}, ${propsVarName})`);
      }

      try {
        const nextIndex = createIncrementalValue(ctor.getChildIndex());
        statements.forEach((s) => {
          file.insertStatements(nextIndex(), s);
        });
      } catch(e) {
        console.log(e);
      }
    }
  }

  await project.emit();
}

run();
