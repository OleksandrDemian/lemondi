import "reflect-metadata";

import {Component, FilesLoader, OnInit, start} from "@lemondi/core";
import {UsersService} from "./services/users";
import {User} from "./models/user.entity";

@Component()
class App {
  constructor(
    private usersService: UsersService,
  ) { }

  // @OnInit decorator only works for components directly imported in `start`
  // @OnInit decorator tells the system to execute this method after the component is instantiated
  @OnInit()
  async onStart() {
    // create a new entry
    const user = User.fromJson({
      lastName: "Last",
      firstName: "First",
    });

    // save user in DB
    await this.usersService.save(user);

    // fetch user from DB
    const users = await this.usersService.find();
    console.log(users); // will print data fetched from DB
  }
}

// start method is required to start the app
start({
  importFiles: [
    // since there is no need to reference factories in the code, we need to tell our DI system to import those files to make sure they are accessible
    FilesLoader.buildPath(__dirname, "factories", "**", "*.js"),
  ],
  modules: [App], // The entry point; classes listed here will be instantiated automatically
});
