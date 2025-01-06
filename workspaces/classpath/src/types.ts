export type TCtor = new (...args: any[]) => any;

export type TDecoratorCtor = (args: any) => any;

export type TDecorator = {
  id: symbol;
  props: any;
  ctor: TDecoratorCtor;
};

export type TMethod = {
  args: TArgument[];
  ret: TArgument;
  decorators: TDecorator[];
};

export type TArgument = {
  typeId: string;
  isAsync: boolean;
  decorators: TDecorator[];
};

export type TRegistryEntry = {
  id: string;
  ctor: TCtor,
};
