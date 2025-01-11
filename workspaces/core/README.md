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

**Make sure to install the same version of core and classpath as it relies on Symbols, so both packages should reference the same library code**

Package json build command:

```json
{
  "name": "example-app",
  "version": "0.0.0",
  "scripts": {
    "build:lemon": "lemondi"
  },
  "dependencies": {
    "@lemondi/core": "0.0.0-alpha.11",
    "@lemondi/classpath": "0.0.0-alpha.11"
  }
}
```

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
class Main {
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
  modules: [Main],
});
```

### Use Factory to instantiate external library

```typescript
import { Component, Factory, Instantiate, OnInit, start } from "@lemondi/core";
import { Sequelize } from "sequelize";

@Factory()
class DatabaseFactory {
  // Factories allow you to integrate external libraries by manually instantiating components
  @Instantiate() // this will automatically inherit instance type
  createSequelizeInstance() { // explicit return type is required, only classes can be used as factory types
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
