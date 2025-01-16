export type TCtor = new (...args: any[]) => any;

export type TDecoratorCtor <T = any> = (args: T) => any;

export type TDecorator = {
  id: symbol;
  props: any;
  ctor: TDecoratorCtor;
};

export type TMethod = {
  args: TArgument[];
  ret: TArgument;
  decorators: TDecorator[];
  name: string;
};

export type TArgument = {
  typeId: string;
  isAsync?: boolean;
  isArray?: boolean;
  decorators: TDecorator[];
};

export type TBuildArgument = [string, number];

export type TClassInfo = {
  typeId: string;
  ctor: TCtor,
};

export type TDecoratorHandler<T = any> = {
  getCtor: () => TDecoratorCtor;
  getProps: () => T;
};

export type TArgHandler = {
  getDecorators: <T>(decorator: TDecoratorCtor<T>) => TDecoratorHandler<T>[],
  getTypeId: () => string;
  getIsAsync: () => boolean;
  getIsArray: () => boolean;
}

export type TMethodHandler = {
  getDecorators: <T>(decorator: TDecoratorCtor<T>) => TDecoratorHandler<T>[],
  getReturnType: () => TArgHandler,
  getName: () => string;
  getArguments: () => TArgHandler[];
};
