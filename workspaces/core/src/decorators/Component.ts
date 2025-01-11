export type TComponentProps = {
  qualifier?: symbol | string;
  isDefault?: boolean;
};
export function Component (props?: TComponentProps): ClassDecorator {
  return () => {};
}

export function OnInit (): MethodDecorator {
  return () => {};
}
