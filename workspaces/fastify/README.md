# LemonDI Fastify Module (`@lemondi/fastify`)

## Overview

`@lemondi/fastify` is an integration module of the **LemonDI** library that brings Fastify web framework support into the LemonDI Dependency Injection (DI) ecosystem. With this module, you can easily define routes, handle HTTP requests using decorators, and start a Fastify server with seamless DI integration.

This module allows developers to use the power of Fastify to build fast and scalable web servers while benefiting from LemonDI's decorator-based DI approach.

## Installation

To install the `@lemondi/fastify` module, run the following command in your project directory:

```bash
npm install @lemondi/classpath @lemondi/core @lemondi/fastify
```

Or if you're using Yarn:

```bash
yarn add @lemondi/classpath @lemondi/core @lemondi/fastify
```

## Example Usage with Sequelize

### 1. Create service component

```typescript
// src/services/users.ts
import {Component} from "@lemondi/core";
import { DataTypes, Sequelize } from "sequelize";

@Component()
export class UsersService {
  async getUsers() {
    return [
      {
        id: 0,
        name: "Lemonhope"
      },
      {
        id: 1,
        name: "Earl of Lemongrab"
      },
    ];
  }
}
```

### 2. Define Router Using Decorators

```typescript
// src/routes/users.ts
import { FastifyReply, FastifyRequest } from "fastify";
import {
  Route,
  Router,
} from "@lemondi/fastify";
import { UsersService } from "../services/users";

@Router({
  path: "/api/users"
})
export default class UsersRouter {
  constructor (
    private usersService: UsersService,
  ) { }

  @Route({
    path: "/",
    method: "GET"
  })
  getUsers () {
    return this.usersService.getUsers();
  }
}
```

### 3. Configure and Start the Fastify Server

Next, we configure and start the Fastify server:

```typescript
import {
  FilesLoader,
  start,
} from "@lemondi/core";
import {FastifyModule, FastifyModuleConfig} from "@lemondi/fastify";
import {Sequelize} from "sequelize";

@Factory()
export class FastifyConfig {
  @Instantiate()
  getFastifyModuleConfig(): FastifyModuleConfig { // explicit return type is required
    return {
      // instanceConfig property will be used when creating new fastify instance 
      instanceConfig: {
        ignoreTrailingSlash: true,
        logger: true,
      },
      // listenConfig property will be used when fastify.listen method is called
      listenConfig: {
        port: appConfig.server_port,
      },
    };
  }
}

// start the application
start({
  importFiles: [
    // import routers
    FilesLoader.buildPath(__dirname, "routes", "**", "*.js"), // use .js, it will import from build directory
    // import services
    FilesLoader.buildPath(__dirname, "services", "**", "*.js"),
  ],
  require: [FastifyModule],
});
```
