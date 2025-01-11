export function Factory(): ClassDecorator {
  return () => {}
}

export type TInstantiateProps = {
  qualifier?: symbol | string;
  default?: boolean;
};
export function Instantiate(props?: TInstantiateProps): MethodDecorator {
  return () => {};
}
