export type TRouteProps = {
  isAbsolute?: boolean;
  path?: string;
};

export type TRequest<TBody = any> = {
  body: TBody;
};

export function Get (props?: TRouteProps) {
  return (target: any, key: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
  };
}

export function Post (props?: TRouteProps) {
  return (target: any, key: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
  };
}

export function Put (props?: TRouteProps) {
  return (target: any, key: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
  };
}
