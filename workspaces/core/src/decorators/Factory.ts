import { register } from "../container/container";

export const Instantiate = () => {
  return (a, b, c) => {
    // empty
  }
}

export const Factory = () => {
  console.log("Factory annotation");
  return (target: any) => {
    // Loop over the instance methods of the class
    const instanceMethods = Object.getOwnPropertyNames(target.prototype).filter(
      (method) => method !== 'constructor'
    );
    console.log("Factory methods", instanceMethods);

    const factoryInstance = new target();
    instanceMethods.forEach((method) => {
      // Get the return type of each method
      // @ts-ignore
      const returnType = Reflect.getMetadata('design:returntype', target.prototype, method);
      console.log("Method return type " + method + " -> " + returnType);

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
