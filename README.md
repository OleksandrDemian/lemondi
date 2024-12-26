# @bframe

**@bframe** is a powerful and flexible Dependency Injection (DI) framework for TypeScript. It leverages decorators to simplify the setup and management of application components, enabling developers to easily create and manage complex applications.

**@bframe** consists of multiple modules that work together to help you build modular, scalable, and maintainable applications. These modules include:

- **`@bframe/core`**: The core DI system, providing essential functionality for managing components, their lifecycle, and events.
- **`@bframe/scanner`**: A decorator scanning utility that helps find and manage class and method decorators.

## Table of Contents

- [Installation](#installation)
- [Modules](#modules)
  - [Core Module](#core-module)
  - [Scanner Module](#scanner-module)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Installation

To install the full **@bframe** suite, you can install it as a monorepo or install individual modules. For example:

```bash
# To install all modules
npm install @bframe/core @bframe/scanner
```

## Modules

### Core module

The **`@bframe/core`** module provides the essential infrastructure for dependency injection in BFrame. It enables the definition of components, event listeners, and the automatic instantiation of services. You can easily integrate with external libraries, build and manage components, and configure app lifecycle events.

- **Key Features**:
  - Component management using decorators.
  - Seamless integration with external libraries through factory functions.
  - DI core system

### Scanner module

The **`@bframe/scanner`** module is responsible for scanning and managing decorators in your application. It provides utilities to find and manage class and method decorators, which are essential for DI frameworks. This module helps in discovering components and applying decorators to classes and methods in a dynamic way.

## Example app

**Configure typesctipt**

In order for the decorators to work properly you need to enable `experimentalDecorators` and `emitDecoratorMetadata`:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es2015",
    "outDir": "./dist",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

**Dependnecies**

In this example we will build a simple app that interacts with in memory sqlite. Install the following dependencies:

```bash
npm install @bframe/core sequelize sqlite3
```

**App code**

In this example we will have 1 external library (`sequelize`) to be shared across multiple services. Since we cannot decorate `Sequelize` with `@Component` we will use `@Factory` to instantiate it.

```typescript
import { Component, Factory, Instantiate, OnInit, start } from "@bframe/core";
import { Sequelize } from "sequelize";

@Factory()
class DatabaseFactory {
  // factories provide a convenient way to integrate with external libraries by instantiating components manually
  @Instantiate()
  createSequelizeInstance(): Sequelize { // explicit return type is required for factory instances to map injections
    // this method will run automatically and create a Sequelize instance
    // this instance will be injected in all components/factories
    return new Sequelize("sqlite::memory");
  }
  // you can inject other components in factory functions. For example:
  //   @Instantiate()
  //   createSequelizeInstance(config: Config): Sequelize {
  //      // config property is injected
  //   }
}

@Component() // mark car service as component. It will be instantiated automatically and injected when needed
class CarService {
  constructor(
    // db instance is injected from DatabaseFactory.createSequelizeInstance()
    private db: Sequelize, // private modifier means the instance is associated to the class, no need for this.db = db
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
    private db: Sequelize, // same Sequelize instance as in CarService
  ) { }

  async migrate() {
    await this.db.query(`CREATE TABLE users (id int, name VARCHAR)`);
  }
  // ... implement all the methods
}

@Component()
class App {
  constructor(
    private userService: UserService,
    private carService: CarService,
  ) { }

  @OnInit() // @OnInit decorator only works for components directly imported in `start` (`modules`)
  async onStart() {
    // create tables necessary for the test
    await Promise.all([
      this.carService.migrate(),
      this.userService.migrate(),
    ]);

    await this.carService.insertCar(0, "hello");
    const [cars] = await this.carService.getCars();
    console.log(cars); // prints [ { id: 0, model: 'hello' } ]
  }
}

// Bootstrap application
start({
  importFiles: [], // for this example we do not need to import project files
  modules: [App],  // entry point, classes listed here will be instantiated right away
});
```
