import {TCtor} from "@lemondi/scanner";

const QualifiedSymbol = Symbol("Qualified");

type TQualifiersMap = {
  [key: number]: string | symbol;
};

export const getMethodParamQualifier = (ctor: TCtor, property: string | symbol, i: number): string | symbol | undefined => {
  const qualifiers: TQualifiersMap = Reflect.getOwnMetadata(QualifiedSymbol, ctor, property);
  if (qualifiers) {
    return qualifiers[i];
  }

  return undefined;
};

export const setMethodParamQualifier = (ctor: TCtor, property: string | symbol, i: number, value: string | symbol) => {
  const qualifiers: TQualifiersMap = Reflect.getOwnMetadata(QualifiedSymbol, ctor, property) || {};
  qualifiers[i] = value;
  Reflect.defineMetadata(QualifiedSymbol, qualifiers, ctor, property);
};
