import {registerClass} from "./classesRegistry";
import {ClassIdSymbol, DecoratorTypeSymbol} from "./symbols";
import {TCreateClassDecorator, TCreateMethodDecorator, TCtor} from "./types";
import {decorateClass, decorateMethod} from "./decorators";

export function createClassDecorator <T = void> (name: string): TCreateClassDecorator<T> {
  const decoratorId = Symbol(name);
  function component (props?: T): ClassDecorator {
    return (target: any) => {
      registerClass(target); // register class if needed (if the class already has id it won't be registered)
      decorateClass(target, decoratorId, props);
    }
  }
  component.prototype[DecoratorTypeSymbol] = decoratorId;

  return component;
}

export function createMethodDecorator <T = never>(name: string): TCreateMethodDecorator<T> {
  const decoratorId = Symbol(name);

  function method (props?: T): MethodDecorator {
    return (target: any, key: string) => {
      decorateMethod(target, key, decoratorId, props);
    }
  }
  method.prototype[DecoratorTypeSymbol] = decoratorId;

  return method;
}

export function getDecoratorId (decorator: TCreateClassDecorator<any> | TCreateMethodDecorator<any>) {
  return decorator.prototype[DecoratorTypeSymbol];
}

export function getClassId (ctor: TCtor): symbol {
  return ctor.prototype[ClassIdSymbol];
}

export function assignClassId (ctor: TCtor) {
  if (ctor.prototype[ClassIdSymbol] != undefined) {
    return ctor.prototype[ClassIdSymbol];
  }

  const classId = Symbol(ctor.name);
  ctor.prototype[ClassIdSymbol] = classId;
  return classId;
}
