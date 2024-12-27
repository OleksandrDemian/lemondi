# :lemon: LemonDI

**LemonDI** is a decorator-based Dependency Injection (DI) 💉 framework for TypeScript. By leveraging decorators, it simplifies the setup and management of application components, allowing developers to easily create and manage complex applications.

The framework consists of the following modules:

- **`@lemondi/core`**: The core DI system that provides essential functionality for managing components, their lifecycle, and events.
- **`@lemondi/scanner`**: A utility that scans and manages class and method decorators, helping you organize and manage your decorators effectively.

## :page_with_curl: Table of Contents

- [Installation](#inbox_tray-installation)
- [Modules](#blue_book-modules)
  - [Core Module](#syringe-core-module)
  - [Scanner Module](#mag-scanner-module)
- [Example](#pencil2-example-app-basics)
- [Caveats](#warning-caveats)

## :inbox_tray: Installation

You can install the full **@lemondi** suite as a monorepo or install individual modules. For example:

```bash
# To install all modules
npm install @lemondi/core @lemondi/scanner
```

## :blue_book: Modules

### :syringe: Core Module

The **`@lemondi/core`** module is the backbone of the LemonDI framework, providing all the essential infrastructure for dependency injection. It enables you to define components, manage event listeners, and automatically instantiate services. You can seamlessly integrate with external libraries, build and manage components, and configure app lifecycle events.

- **Key Features**:
  - Component management using decorators.
  - Seamless integration with external libraries through factory functions.
  - A powerful DI core system that simplifies complex applications.

### :mag: Scanner Module

The **`@lemondi/scanner`** module is responsible for scanning and managing decorators in your application. It provides utilities for discovering and managing class and method decorators, which are essential in DI frameworks. This module helps in applying decorators to classes and methods dynamically, improving modularity and flexibility.

## :pencil2: Example App: Basics

### **Configure TypeScript**

To ensure decorators work properly, you need to enable `experimentalDecorators` and `emitDecoratorMetadata` in your TypeScript configuration:

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

### **NPM Packages**

In this example, we'll build a simple app that interacts with an in-memory SQLite database. First, install the necessary dependencies:

```bash
npm install @lemondi/core sequelize sqlite3 tsc
```

### **App Code**

In this example, we'll use one external library (`sequelize`) shared across multiple services. Since `Sequelize` can't be directly decorated with `@Component`, we'll use `@Factory` to instantiate it.

```typescript
import { Component, Factory, Instantiate, OnInit, start } from "@lemondi/core";
import { Sequelize } from "sequelize";

@Factory()
class DatabaseFactory {
  // Factories allow you to integrate external libraries by manually instantiating components
  @Instantiate()
  createSequelizeInstance(): Sequelize { 
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

Once the app is ready, you can build it with the TypeScript compiler (TSC) and run it using Node.js. Assuming the code is in `src/app.ts`, execute the following commands:

```bash
tsc && node ./dist/app.js
```

## :warning: Caveats

### :no_entry_sign: Types and Interfaces Are Not Supported

Currently, the implementation relies on TypeScript and `reflect-metadata`, which means type information is erased during the build process. As a result, it isn't possible to retain `type` or `interface` data in the runtime.

However, there's a plan to eventually remove the `reflect-metadata` library and transition to a custom build system that extracts the necessary information before building the app. This change will provide better support for DI in LemonDI.

In the meantime, you can work around this limitation by wrapping types and interfaces in classes. For instance, to inject a Fastify configuration object (which is an interface), you can create a wrapper class:

```typescript
import Fastify, { FastifyInstance, FastifyListenOptions } from "fastify";
import { Component } from "@lemondi/core";

@Component()
export class FastifyListenConfig {
  config: FastifyListenOptions;

  constructor() {
    this.config = {
      port: process.env.PORT, // or inject environment configuration in constructor
    };
  }

  get() {
    return this.config;
  }
}

@Component()
export class FastifyService {
  server: FastifyInstance;

  constructor(
    private config: FastifyListenConfig,
  ) {
    this.server = Fastify();
  }

  start() {
    this.server.listen(this.config.get());
  }
}

@Component()
class App {
  constructor(
    private fastifyService: FastifyService,
  ) { }

  @OnInit()
  async onStart() {
    this.fastifyService.start();
  }
}

// Bootstrap application
start({
  importFiles: [], // No additional files are needed for this example
  modules: [App],   // The entry point for instantiating classes
});
```
