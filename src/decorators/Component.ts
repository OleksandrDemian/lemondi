import { componentUniqueSymbol, register } from "../container/container";

export const Component = () => {
  return (target: any) => {
    console.log("Register component " + target.name);
    const identifier = Symbol();
    Reflect.set(target, componentUniqueSymbol, identifier);

    register({
      unique: identifier,
    }, target);
  };
};
