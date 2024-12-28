import {Component} from "@lemondi/core";
import {DataSource, Repository} from "typeorm";
import {User} from "../models/user.entity";

// This class is marked as component, it will automatically map itself during the dependency injection step
@Component()
export class UsersService {
  private repository: Repository<User>;

  // The component constructor is where the dependency injection happens
  // For each argument, the DI system will look for a component and provide it (the components are instantiated automatically when needed)
  constructor(
    // Here we tell DI system that we need DataSource instance (which is exported from our factory)
    // It is completely transparent for us that the DataSource component is async
    dataSource: DataSource,
  ) {
    this.repository = dataSource.getRepository(User);
  }

  save(user: User) {
    return this.repository.save(user);
  }

  find() {
    return this.repository.find();
  }
}