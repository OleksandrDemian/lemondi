# :lemon: LemonDI Scanner module

LemonDI Scanner module (`@lemondi/scanner`) allows you to create decorators and scan them.

## How to

### Class decorators

```typescript
import {createClassDecorator, findClassDecorators, scan} from "@lemondi/scanner";

const ClassDecorator = createClassDecorator<{
  // decorator properties
  propertyName: string;
}>("ClassDecorator");

@ClassDecorator({
  propertyName: "Hello world",
})
class TestClass { }

// Scan registry for classes annotated with @ClassDecorator. Returns array of classes
const decoratedClasses = scan(ClassDecorator); // returns [TestClass]
const [decorator] = findClassDecorators(decoratedClasses[0], ClassDecorator); // returns [ClassMethodsDecoratorsSymbol]
console.log(decorator.decoratorProps); // { propertyName: "Hello world }
```

### Method decorators

```typescript
import {
  createClassDecorator,
  createMethodDecorator,
  findClassDecorators,
  findMethodDecorators,
  scan
} from "@lemondi/scanner";

const ClassDecorator = createClassDecorator<{
  // decorator properties
  propertyName: string;
}>("ClassDecorator");
const MethodDecorator = createMethodDecorator<{
  property: string;
}>("MethodDecorator");

@ClassDecorator({
  propertyName: "Hello world",
})
class TestClass {
  @MethodDecorator({
    property: "Prop name"
  })
  method() { }
}

// scan classes
const decoratedClasses = scan(ClassDecorator); // returns [TestClass]
for (const ctor of decoratedClasses) {
  for (const key of Reflect.ownKeys(ctor.prototype)) {
    const [decorator] = findMethodDecorators(ctor, key, MethodDecorator);
    if (decorator) {
      console.log(key, decorator.decoratorProps); // "method" { property: "Porp name" }
    }
  }
}
```
