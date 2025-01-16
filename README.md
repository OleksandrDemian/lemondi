# :lemon: LemonDI Core module

LemonDI Core module (`@lemondi/core`) allows you to create components (`@Component`) and factories (`@Factory`) to automatically handle dependency injection.

## :construction: Work in progress

This project is in a very early stage

## Who needs yet another dependency injection framework?

There are a lot of great typescript DI frameworks out there (`NestJS`, `InversifyJS`, `TypeDI`, `TSyringe`), they are all great but they all have 1 huge disadvantage: by default the injection only works for classes.
If you have a component that is not a class (ex: type or interface) than you have to manually work with injection tokens, which is ok, but not great.
This is because they all relly on `reflect-metadata` library, which only emits types for classes, otherwise it fallbacks to Object.
The goal of LemonDI (more specifically `@lemondi/classpath`) is to provide more metadata when building the project to have better DI framework without having to relly on manual injection tokens.
Moreover, long-term it will be possible to inject components automatically based on extended classes or implemented interfaces.

## Examples

IMPORTANT: in order for the injection system to work you have to build the app using `@lemondi/classpath`:

Installation:

```bash
npm install @lemondi/core @lemondi/classpath
```

Package json build command:

```json
{
  "name": "example-app",
  "version": "0.0.0",
  "scripts": {
    "build:lemon": "lemondi"
  },
  "dependencies": {
    "@lemondi/core": "0.0.0-alpha.13",
    "@lemondi/classpath": "0.0.0-alpha.13"
  }
}
```

`lemondi` command is similar to `tsc` (in fact, it is an extension of default typescript compiler). Use it instead of `tsc` to build your app. It will generate all the metadata required by `@lemondi/core` library for data injection.

tsconfig.json

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es2015",
    "outDir": "./dist",
    "experimentalDecorators": true
  }
}
```

### Create basic app

```typescript
import {Component, OnInit, start} from "@lemondi/core";

@Component()
class Main {
  constructor() {
    console.log("Class instantiated");
  }

  @OnInit()
  onStart() {
    console.log("App started");
  }
}

start({
  importFiles: [], // No extra files are needed for this example
  modules: [Main],
});
```

### Inject class

This is possible with most Typescript DI framework: inject a class component 

```typescript
import {Component, OnInit, start} from "@lemondi/core";

@Component()
class Config {
  messageA = "Hello A!";
  messageB = "Hello B!";
}

@Component()
class ServiceA {
  constructor(
    private config: Config,
  ) { }

  start() {
    console.log(this.config.messageA);
  }
}

@Component()
class ServiceB {
  constructor(
    private config: Config,
  ) { }

  start() {
    console.log(this.config.messageB);
  }
}

@Component()
class App {
  constructor(
    private a: ServiceA,
    private b: ServiceB,
  ) { }

  @OnInit()
  onStart() { // on init can be async
    this.a.start();
    this.b.start();
  }
}

start({
  importFiles: [], // No extra files are needed for this example
  modules: [App],
});
```

### Use Factory to instantiate external library

In this example you can already see a small quality-of-life improvement. In facto you don't have to create custom
Injection Token to identify Sequelize instance (which comes from external library), instead `@lemondi/core` will figure
out on it's own the type based on function return (keep in mind you have to explicitly declare return type).

```typescript
import { Component, Factory, Instantiate, OnInit, start } from "@lemondi/core";
import { Sequelize } from "sequelize";

@Factory()
class DatabaseFactory {
  // Factories allow you to integrate external libraries by manually instantiating components
  @Instantiate() // this will automatically inherit instance type
  createSequelizeInstance(): Sequelize { // explicit return type is required
    // This method will automatically run to create a Sequelize instance
    return new Sequelize("sqlite::memory");
  }
}

@Component() // Marks CarService as a component that will be automatically instantiated
class CarService {
  constructor(
    // The Sequelize instance is injected from DatabaseFactory.createSequelizeInstance()
    private db: Sequelize, 
  ) { }

  async migrate() {
    await this.db.query(`CREATE TABLE cars (id int, model VARCHAR)`);
  }

  getCars () {
    return this.db.query("SELECT * FROM cars");
  }

  insertCar(id: number, model: string) {
    return this.db.query(`INSERT INTO cars VALUES (${id}, '${model}')`);
  }
}

@Component()
class UserService {
  constructor(
    private db: Sequelize, // Same Sequelize instance as in CarService
  ) { }

  async migrate() {
    await this.db.query(`CREATE TABLE users (id int, name VARCHAR)`);
  }
  // ... other methods for user management
}

@Component()
class App {
  constructor(
    private userService: UserService,
    private carService: CarService,
  ) { }

  @OnInit() // @OnInit decorator only works for components directly imported in `start`
  async onStart() {
    // Create necessary tables
    await Promise.all([
      this.carService.migrate(),
      this.userService.migrate(),
    ]);

    // Insert a car record and log it
    await this.carService.insertCar(0, "hello");
    const [cars] = await this.carService.getCars();
    console.log(cars); // prints [ { id: 0, model: 'hello' } ]
  }
}

// Bootstrap application
start({
  importFiles: [], // No extra files are needed for this example
  modules: [App],  // The entry point; classes listed here will be instantiated automatically
});
```

### Inject based on interface

:construction: Bear in mind that interfaces injection doesn't work for external libraries not built with `@lemondi/classpath`.

This example i not possible in other Typescript DI frameworks. In fact they will require you to create a custom token
in order to inject using interface.

`@lemondi` instead figures out that the only object implementing Animal is Dog and will inject it. You may wonder what
happens when you have multiple components implementing the same interface? Go to the next section (Qualifiers) to find
out! 

```typescript
import {Component, OnInit, start} from "@lemondi/core";

interface Animal {
  makeNoise(): void;
}

@Component()
class Dog implements Animal { // same works for extended classes
  makeNoise() {
    console.log("Bark");
  }
}

@Component()
class App {
  constructor(
    private animal: Animal, // app context will automatically find out that the only animal is Dog and inject it
  ) { }

  @OnInit()
  onInit () {
    this.animal.makeNoise(); // "Bark"
  }
}

start({
  importFiles: [], // No extra files are needed for this example
  modules: [App],  // The entry point; classes listed here will be instantiated automatically
});
```

### Qualifiers

In this example we have 2 sequelize database instances. In order to differentiate them we can use `@Qualifier` decorator
to give names to the instances. It is also possible to mark instance as default, so it will be used automatically if no
qualifiers provided.

```typescript
import {Component, Factory, Instantiate, Qualifier, start} from "@lemondi/core";
import {Sequelize} from "sequelize";

@Factory()
class DatabaseFactory {
  @Instantiate({
    default: true, // if no qualifier provided, this instance will be used
  })
  sequelizeA(): Sequelize {
    return new Sequelize("sqlite::memory");
  }

  @Instantiate({
    qualifier: "B",
  })
  sequelizeB(): Sequelize {
    return new Sequelize("sqlite::memory");
  }
}

@Component()
class App {
  constructor(
    a: Sequelize, // sequelizeA() will be injected by default
    @Qualifier("B")
    b: Sequelize, // sequelizeB() will be injected because of qualifier
  ) { }
}

start({
  importFiles: [], // No extra files are needed for this example
  modules: [App],  // The entry point; classes listed here will be instantiated automatically
});
```