import { componentUniqueSymbol, register } from "../container/container";

export const Component = () => {
  return (target: any) => {
    const identifier = Symbol(target.name);

    register({
      unique: identifier,
      type: 'class',
      Component: target,
    });
  };
};
