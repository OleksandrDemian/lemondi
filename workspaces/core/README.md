# BFrame Core Module (`@bframe/core`)

## Overview

`@bframe/core` is the central module of the **BFrame** library, providing the core infrastructure for Dependency Injection (DI). It supports component creation, lifecycle management, and event handling, making it easy to build and manage complex applications with a simple decorator-based DI approach. Additionally, it includes utilities for file management and app startup, enabling smooth integration with external libraries and project files.

This module is designed to work seamlessly with other BFrame modules like `@bframe/scanner` for decorator scanning and provides the necessary tools to create, load, and manage components in a DI container.

## Table of Contents

- [Installation](#installation)
- [API Documentation](#api-documentation)
    - [Types](#types)
    - [Functions](#functions)
    - [Annotations](#annotations)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Installation

To install the `@bframe/core` module, run the following command in your project directory:

```bash
npm install @bframe/core
```

Or if you're using Yarn:

```bash
yarn add @bframe/core
```

## API Documentation

### Functions

- **`start`**  
  The entry point of the app. This function loads the required components and files, then invokes the `onStart` callback (if provided).

    ```typescript
    start({
      require: [MyComponent, AnotherComponent],
      importFiles: ['./src/factories/**/*.ts'],
      onStart: async (myComponentInstance, anotherComponentInstance) => {
        // Perform initialization tasks with component instances
        // myComponentInstance, anotherComponentInstance are automatically typed based on `require` property
      }
    });
    ```

- **`getComponent<T>(componentClass: TCtor): InstanceType<T>`**  
  Retrieves an instance of a component. This function is used to get a component from the DI container. In most of the cases you should not need this function as components are injected automatically

    ```typescript
    const myComponent = getComponent(MyComponent);
    ```

### Annotations

- **`Component`**  
  Marks a class as a DI component. Classes marked with this decorator will be managed by the DI container and can be injected into other components.

    ```typescript
    import { Component } from '@bframe/core';

    @Component()
    class MyComponent {
      // Component logic
    }
  
    @Component()
    class ComponentWithDependencies {
      constructor(myComponent: MyComponent) {
        // myComponent is automatically injected
      }
    }
    ```

- **`Instantiate`**  
  This annotation is used inside a `Factory` to mark a function that creates a component. This allows you to create components from external libraries that does not rely on bframe DI.

    ```typescript
    import { Factory, Instantiate } from '@bframe/core';

    @Factory()
    export class DbFactory {
      @Instantiate()
      createDbInstance (
        config: AppConfiguration,
      ): Sequelize {
        // Sequelize does not use @Component decorator, but it is still possible to create an injectable component out of it by using factories 
        return new Sequelize({
          dialect: "postgres",
          database: config.db_database,
          username: config.db_user,
          password: config.db_password,
          host: config.db_host,
          port: config.db_port,
        });
      }
    }
    ```

- **`OnAppEvent`**  
  Marks a method as a listener for application lifecycle events. These events could include `beforeStart`, `afterStart`, etc., and allow components to react to different stages of the application lifecycle.

    ```typescript
    import { Component, OnAppEvent } from '@bframe/core';

    @Component()
    class MyComponent {
      
      @OnAppEvent('beforeStart')
      beforeStart() {
        console.log('Before app start');
      }

      @OnAppEvent('afterStart')
      afterStart() {
        console.log('After app start');
      }
    }
    ```

## Example Usage

Below is a simple example of how to use the `@bframe/core` module to create and manage components, listen for app events, and start an application.

### 1. Create a Component

First, we create a class and mark it as a `Component`:

```typescript
import { Component, OnAppEvent } from '@bframe/core';

@Component()
class MyComponent {

  @OnAppEvent('beforeStart')
  beforeStart() {
    console.log('MyComponent: Before app start');
  }

  @OnAppEvent('afterStart')
  afterStart() {
    console.log('MyComponent: After app start');
  }

  greet() {
    console.log('Hello from MyComponent!');
  }
}
```

### 2. Set Up App Start

Now, we set up the application to start by loading the required components and running the `onStart` callback:

```typescript
import { start } from '@bframe/core';

start({
  require: [MyComponent], // Load the component
  importFiles: ['./src/**/*.js'], // Import all JavaScript files from the `src` folder. Keep in mind that this runs in runtime, so there are no TS files
  onStart: async (myComponentInstance) => {
    myComponentInstance.greet();
  }
});
```
