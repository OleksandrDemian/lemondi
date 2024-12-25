# BFrame Scanner Module (`@bframe/scanner`)

## Overview

`@bframe/scanner` is a module of the **BFrame** library that provides functionality for scanning classes and their methods for decorators. It enables developers to easily find, manage, and assign decorators to classes and methods, which is essential for implementing Dependency Injection (DI) in a TypeScript application. This module is part of a larger monorepo that aims to create a simple, decorator-based DI framework.

## Table of Contents

- [Installation](#installation)
- [API Documentation](#api-documentation)
    - [Types](#types)
    - [Functions](#functions)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Installation

To install the `@bframe/scanner` module, run the following command in your project directory:

```bash
npm install @bframe/scanner
```

Or if you're using Yarn:

```bash
yarn add @bframe/scanner
```

## API Documentation

### Types

- **`TCtor`**  
  Type representing a class constructor.

    ```typescript
    type TCtor = new (...args: any[]) => any;
    ```

- **`TCreateClassDecorator<TProps>`**  
  Type for creating class decorators. This type represents a function that returns a class decorator with properties of type `TProps`.

    ```typescript
    type TCreateClassDecorator<T = any> = (args?: T) => ClassDecorator;
    ```

- **`TCreateMethodDecorator<TProps>`**  
  Type for creating method decorators. This type represents a function that returns a method decorator with properties of type `TProps`.

    ```typescript
    type TCreateMethodDecorator<T = any> = (args?: T) => MethodDecorator;
    ```

- **`TClassDecorator<TProps>`**  
  Type representing class decorators with properties of type `TProps`.

    ```typescript
    type TClassDecorator<TProps> = {
      decoratorId: symbol;
      decoratorProps: TProps;
    };
    ```

- **`TMethodDecorator<TProps>`**  
  Type representing method decorators with properties of type `TProps`.

    ```typescript
    type TMethodDecorator<TProps> = {
      decoratorId: symbol;
      decoratorProps: TProps;
    };
    ```

### Functions

- **`findClassDecorators<TProps>(ctor: TCtor, decorator: TCreateClassDecorator<TProps>): TClassDecorator<TProps>[]`**  
  Finds all class decorators for the provided constructor function (`ctor`) that match the provided decorator function.

    ```typescript
    const decorators = findClassDecorators(MyClass, MyClassDecorator);
    ```

- **`findMethodDecorators<TProps>(ctor: TCtor, method: string | symbol, decorator: TCreateMethodDecorator<TProps>): TMethodDecorator<TProps>[]`**  
  Finds all method decorators for the given class constructor and method name or symbol that match the provided decorator function.

    ```typescript
    const decorators = findMethodDecorators(MyClass, 'myMethod', myMethodDecorator);
    ```

- **`getDecoratorId(decorator: TCreateClassDecorator<any> | TCreateMethodDecorator<any>): symbol`**  
  Retrieves the unique identifier for the provided class or method decorator.

    ```typescript
    const decoratorId = getDecoratorId(myClassDecorator);
    ```

- **`scan<TProps>(decorator: TCreateClassDecorator<TProps>): TCtor[]`**  
  Scans for all classes that have been decorated with the provided class decorator.

    ```typescript
    const decoratedClasses = scan(myClassDecorator);
    ```

- **`createMethodDecorator<T = never>(name: string): TCreateMethodDecorator<T>`**  
  Creates a new method decorator with a given name and optional properties of type `T`.

    ```typescript
    const myMethodDecorator = createMethodDecorator('myMethod');
    ```

- **`createClassDecorator<T = void>(name: string): TCreateClassDecorator<T>`**  
  Creates a new class decorator with a given name and optional properties of type `T`.

    ```typescript
    const myClassDecorator = createClassDecorator('MyClassDecorator');
    ```

- **`assignClassId(ctor: TCtor): symbol`**  
  Assigns a unique identifier to a class constructor. This ID can be used for DI purposes.

    ```typescript
    const classId = assignClassId(MyClass);
    ```

- **`getClassId(ctor: TCtor): symbol`**  
  Retrieves the unique identifier assigned to a class constructor.

    ```typescript
    const classId = getClassId(MyClass);
    ```

### Example Usage

Below is an example of how to use the `@bframe/scanner` module in a TypeScript application.

#### 1. Create Decorators

First, let's create a class decorator and a method decorator using `createClassDecorator` and `createMethodDecorator`.

```typescript
import { createClassDecorator, createMethodDecorator } from '@bframe/scanner';

// Create a class decorator
const MyClassDecorator = createClassDecorator<{ description: string }>('MyClassDecorator');

// Create a method decorator
const MyMethodDecorator = createMethodDecorator<{ log: boolean }>('MyMethodDecorator');
```

#### 2. Apply Decorators

Now, apply these decorators to your classes and methods.

```typescript
@MyClassDecorator({ description: 'This is a decorated class' })
class MyClass {
  
  @MyMethodDecorator({ log: true })
  myMethod() {
    console.log('Method called');
  }
}
```

#### 3. Scan for Decorators

You can now scan for classes and methods that have been decorated with the custom decorators.

```typescript
import { scan, findClassDecorators, findMethodDecorators } from '@bframe/scanner';

const decoratedClasses = scan(MyClassDecorator);
console.log(decoratedClasses); // Output: [ MyClass ]

const methodDecorators = findMethodDecorators(MyClass, 'myMethod', MyMethodDecorator);
console.log(methodDecorators); // Output: [ MyMethodDecorator { log: true } ]
```

#### 4. Get Decorator IDs

You can also get the unique IDs of decorators to use for identification or DI purposes.

```typescript
const classDecoratorId = getDecoratorId(MyClassDecorator);
console.log(classDecoratorId);

const methodDecoratorId = getDecoratorId(MyMethodDecorator);
console.log(methodDecoratorId);
```
