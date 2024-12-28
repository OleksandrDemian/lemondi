# :lemon: LemonDI Scanner module

LemonDI Core module (`@lemondi/core`) allows you to create components (`@Component`) and factories (`@Factory`) to automatically handle dependency injection.

## How to

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
  onStart() {
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
  @Instantiate({
    qualifiers: [Sequelize]
  })
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
