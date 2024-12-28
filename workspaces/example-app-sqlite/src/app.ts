import {Component, Factory, Instantiate, OnInit, start} from "@lemondi/core";
import { Sequelize } from "sequelize";

@Factory()
class DatabaseFactory {
  // factories provide a convenient way to integrate with external libraries by instantiating components manually
  @Instantiate({
    qualifiers: [Sequelize] // use this instance when Sequelize is requested
  })
  createSequelizeInstance() { // explicit return type is required for factory instances to map injections
    // you can inject other components in factory functions. For example:
    //   @Instantiate()
    //   createSequelizeInstance(config: Config): Sequelize {
    //      // config property is injected
    //   }
    // this method will run automatically and create a Sequelize instance
    // this instance will be injected in all components/factories
    return new Sequelize("sqlite::memory");
  }
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
