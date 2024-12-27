# LemonDI Fastify Module (`@lemondi/fastify`)

## Overview

`@lemondi/fastify` is an integration module of the **LemonDI** library that brings Fastify web framework support into the LemonDI Dependency Injection (DI) ecosystem. With this module, you can easily define routes, handle HTTP requests using decorators, and start a Fastify server with seamless DI integration.

This module allows developers to use the power of Fastify to build fast and scalable web servers while benefiting from LemonDI's decorator-based DI approach.

## Table of Contents

- [Installation](#installation)
- [API Documentation](#api-documentation)
    - [Types](#types)
    - [Functions](#functions)
    - [Annotations](#annotations)
    - [Classes](#classes)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Installation

To install the `@lemondi/fastify` module, run the following command in your project directory:

```bash
npm install @lemondi/fastify
```

Or if you're using Yarn:

```bash
yarn add @lemondi/fastify
```

## API Documentation

### Annotations

- **`Router`**  
  This decorator is used to mark a class as a Fastify router. It indicates that the class contains HTTP route handlers for Fastify.

    ```typescript
    import { Router } from '@lemondi/fastify';

    @Router({
      path: "/api/users"
    })
    class UsersRouter {
      // Route handlers go here
    }
    ```

- **`Get`**  
  Marks a method as handling `GET` requests. It optionally accepts an object with a `path` for the route and an `isAbsolute` flag to specify whether the path is absolute.

    ```typescript
    import { Get } from '@lemondi/fastify';

    @Router({
      path: "/api/users"
    })
    class MyRouter {

      @Get()
      async getUsers() {
        return { users: [] };
      }
    }
    ```

- **`Post`**  
  Marks a method as handling `POST` requests.

    ```typescript
    import { Post } from '@lemondi/fastify';

    @Router({
      path: "/api/users"
    })
    class MyRouter {

      @Post()
      async createUser() {
        return { message: 'User created' };
      }
    }
    ```

- **`Put`**  
  Marks a method as handling `PUT` requests.

    ```typescript
    import { Put } from '@lemondi/fastify';

    @Router({
      path: "/api/users"
    })
    class MyRouter {

      @Put({ path: '/:id' })
      async updateUser() {
        return { message: 'User updated' };
      }
    }
    ```

- **`Delete`**  
  Marks a method as handling `DELETE` requests.

    ```typescript
    import { Delete } from '@lemondi/fastify';

    @Router({
      path: "/api/users"
    })
    class MyRouter {

      @Delete({ path: '/:id' })
      async deleteUser() {
        return { message: 'User deleted' };
      }
    }
    ```

- **`Options`**  
  Marks a method as handling `OPTIONS` requests. This is typically used for CORS pre-flight requests or other custom handling.

    ```typescript
    import { Options } from '@lemondi/fastify';

    @Router({
      path: "/api/users"
    })
    class MyRouter {

      @Options()
      async handleOptions() {
        return { message: 'OPTIONS request handled' };
      }
    }
    ```

### Classes

- **`FastifyModule`**  
  The core module responsible for bootstrapping the Fastify server and routing. It includes methods to generate routes, start the Fastify server, and access the Fastify instance.

  #### `FastifyModule.buildRoutes`
  Automatically generates routes based on decorators applied to the router classes and methods. This helps in organizing the routes into modular components.

  #### `FastifyModule.start`
  Starts the Fastify server, accepting a `FastifyListenOptions` object for configuring the server.

  #### `FastifyModule.getFastifyInstance`
  Returns the active Fastify instance. This is helpful for directly accessing Fastify methods or performing additional configuration after the app has started.

- **`ModuleConfiguration`**  
  This class allows customization of the Fastify instance. You can extend this class to modify settings such as `ignoreTrailingSlash` and `logger`.

  ```typescript
  @Factory()
  export class FastifyConfig {
    @Instantiate()
    getFastifyConfig (): ModuleConfiguration {
      const config = new ModuleConfiguration();
      config.ignoreTrailingSlash = false;
      config.logger = true;
      return config;
    }
  }
  ```

## Example Usage

### 1. Define Routes Using Decorators

In this example, we define a simple set of routes using LemonDI decorators:

```typescript
import { FastifyReply, FastifyRequest } from "fastify";
import {
  Get,
  Post,
  Router,
} from "@lemondi/fastify";
import { UsersService } from "../services/users";
import { TUserCreation } from "../models/users";

@Router({
  path: "/api/users"
})
export default class UsersRouter {
  constructor (
    private usersService: UsersService,
  ) { }

  @Get({
    path: "/users",
    isAbsolute: true, // this path will ignore router path
  })
  viewUsers (req: FastifyRequest, res: FastifyReply) {
    res.type("html");
    return `
      <html>
        <button>Hello</button>
      </html>
    `;
  }

  @Get()
  getUsers () {
    return this.usersService.getUsers();
  }

  @Post()
  createUser (req: FastifyRequest) {
    const body = JSON.parse(req.body as string) as TUserCreation;
    return this.usersService.createUser(body);
  }
}
```

### 2. Configure and Start the Fastify Server

Next, we configure and start the Fastify server:

```typescript
import {
  FilesLoader,
  start,
} from "@lemondi/core";
import {FastifyModule} from "@lemondi/fastify";
import {AppConfiguration} from "./configuration/configuration";
import {Sequelize} from "sequelize";

start({
  importFiles: [
    FilesLoader.buildPath(__dirname, "factories", "**", "*.js"),
    FilesLoader.buildPath(__dirname, "routes", "**", "*.js"),
    FilesLoader.buildPath(__dirname, "configuration", "**", "*.js"),
  ],
  require: [AppConfiguration, Sequelize, FastifyModule],
  onStart: async (config, sequelize, fastify)=> {
    await sequelize.authenticate();
    console.log("Database connected");

    await fastify.buildRoutes().listen({
      port: config.server_port,
    });
    console.log("Listening on " + config.server_port);
  }
});
```

### 3. Customize Fastify Configuration

You can customize Fastify's configuration by exporting a custom configuration class:

```typescript
import {Factory, Instantiate} from "@lemondi/core";
import {FastifyModule, ModuleConfiguration} from "@lemondi/fastify";

@Factory()
export class FastifyConfig {
  @Instantiate()
  getFastifyConfig (): ModuleConfiguration {
    const config = new ModuleConfiguration();
    config.ignoreTrailingSlash = false;
    config.logger = true;

    return config;
  }
}
```
