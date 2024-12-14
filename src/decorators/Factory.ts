import { getComponent, register } from "../container/container";

export const Instantiate = () => {
  return (a, b, c) => {
    // empty
  }
}

export const Factory = () => {
  return (target: any) => {
    // Loop over the instance methods of the class
    const instanceMethods = Object.getOwnPropertyNames(target.prototype).filter(
      (method) => method !== 'constructor'
    );

    const factoryInstance = new target();
    instanceMethods.forEach((method) => {
      // Get the return type of each method
      const returnType = Reflect.getMetadata('design:returntype', target.prototype, method);

      // todo validate return type
      if (returnType) {
        register({
          type: "function",
          factoryClass: target,
          instantiateFn: factoryInstance[method],
          returnClass: returnType,
          unique: Symbol(target.name + "->" + method)
        });
      }
    });
  };
}
