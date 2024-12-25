export type TCtor = new (...args: any) => any;

export type TDecoratedClass = {
  ctor: TCtor; // ctor = constructor
};

export type TClassDecorator<TProps> = {
  decoratorId: symbol;
  decoratorProps: TProps;
};

export type TMethodDecorator<TProps> = {
  decoratorId: symbol;
  decoratorProps: TProps;
};

export type TCreateClassDecorator<T = any> = (args?: T) => ClassDecorator;
export type TCreateMethodDecorator<T = any> = (args?: T) => MethodDecorator;
