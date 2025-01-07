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
  name: string;
};

export type TArgument = {
  typeId: string;
  isAsync: boolean;
  decorators: TDecorator[];
};

export type TClassInfo = {
  id: string;
  ctor: TCtor,
};

export type TDecoratorHandler = {
  getCtor: () => TDecoratorCtor;
  getProps: () => any;
};

export type TArgHandler = {
  getDecorators: (decorator: TDecoratorCtor) => TDecoratorHandler[],
  getTypeId: () => string;
  getIsAsync: () => boolean;
}

export type TMethodHandler = {
  getDecorators: (decorator: TDecoratorCtor) => TDecoratorHandler[],
  getReturnType: () => {
    getTypeId: () => string;
    getIsAsync: () => boolean;
  },
  getName: () => string;
  getArguments: () => TArgHandler[];
};
