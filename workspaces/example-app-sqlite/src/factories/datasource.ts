import {Factory, FilesLoader, Instantiate} from "@lemondi/core";
import {DataSource} from "typeorm";

// Decorate class with Factory to indicate that it provides components as functions
@Factory()
export class DataSourceFactory {

  // Instantiate decorator indicates that this function creates a component.
  // This component will automatically map the types/ids provided in 'qualifies' property
  @Instantiate({
    qualifiers: [DataSource] // here we tell DI  that this function instantiates typeorm Datasource
  })
  // note that this component is async, if it is used as a dependency in other components the execution will be delayed until it is instantiated
  async createDatasource() {
    // create DataSource instance
    const ds = new DataSource({
      type: "sqlite", // use sqlite for simplicity, but this works perfectly with any other DB
      database: ":memory:",
      synchronize: true, // execute create tables at start time
      // entities to be loaded
      entities: [FilesLoader.buildPath(__dirname, "..", "models", "*.entity.{js,ts}")],
    });

    // the typeorm datasource needs to be initialized before usage
    await ds.initialize();
    return ds;
  }

}
