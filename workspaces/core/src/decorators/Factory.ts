export function Factory(): ClassDecorator {
  return () => {}
}

export function Instantiate(props?: {
  qualifiers: (symbol | string)[];
}): MethodDecorator {
  return () => {};
}
