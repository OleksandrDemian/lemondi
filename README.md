# BFrame

BFrame is a powerful and flexible Dependency Injection (DI) framework for TypeScript. It leverages decorators to simplify the setup and management of application components, enabling developers to easily create and manage complex applications. The BFrame library provides core DI infrastructure, integrations with popular web frameworks like Fastify, and utilities for seamless component and event management.

BFrame consists of multiple modules that work together to help you build modular, scalable, and maintainable applications. These modules include:

- **`@bframe/core`**: The core DI system, providing essential functionality for managing components, their lifecycle, and events.
- **`@bframe/scanner`**: A decorator scanning utility that helps find and manage class and method decorators.
- **`@bframe/fastify`**: An integration module for Fastify, enabling route definition, server configuration, and HTTP request handling with DI support.

## Table of Contents

- [Installation](#installation)
- [Modules](#modules)
  - [Core Module](#core-module)
  - [Scanner Module](#scanner-module)
  - [Fastify Module](#fastify-module)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Installation

To install the full BFrame suite, you can install it as a monorepo or install individual modules. For example:

```bash
# To install all modules
npm install @bframe/core @bframe/scanner @bframe/fastify
```

Or, to install each module individually:

```bash
npm install @bframe/core
npm install @bframe/scanner
npm install @bframe/fastify
```

## Modules

### Core Module

The **`@bframe/core`** module provides the essential infrastructure for dependency injection in BFrame. It enables the definition of components, event listeners, and the automatic instantiation of services. You can easily integrate with external libraries, build and manage components, and configure app lifecycle events.

- **Key Features**:
  - Component management using decorators.
  - App lifecycle event handling (`beforeStart`, `afterStart`).
  - Seamless integration with external libraries through factory functions.
  - Utility functions for app startup and managing components.

- [Core Module Documentation](https://github.com/OleksandrDemian/bframe/tree/main/workspaces/core)

### Scanner Module

The **`@bframe/scanner`** module is responsible for scanning and managing decorators in your application. It provides utilities to find and manage class and method decorators, which are essential for DI frameworks. This module helps in discovering components and applying decorators to classes and methods in a dynamic way.

- **Key Features**:
  - Scans for class and method decorators.
  - Provides utilities to assign and get decorator IDs.
  - Enables scanning for decorated classes and methods automatically.

- [Scanner Module Documentation](https://github.com/OleksandrDemian/bframe/tree/main/workspaces/scanner)

### Fastify Module

The **`@bframe/fastify`** module integrates Fastify with the BFrame DI framework. It enables easy definition of HTTP routes, server configuration, and event handling in your Fastify application. The module automatically wires up routes from decorators and provides an easy-to-use API for managing Fastify servers with DI support.

- **Key Features**:
  - Define HTTP routes using decorators (`@Get`, `@Post`, `@Put`, `@Delete`, etc.).
  - Automatically generate routes based on scanned decorators.
  - Start a Fastify server with DI integration.
  - Access the active Fastify instance for custom configuration.

- [Fastify Module Documentation](https://github.com/OleksandrDemian/bframe/tree/main/workspaces/fastify)

## Usage

Below is a brief overview of how to use each module to create 3 components, inject LanguageService and start the app:

```typescript
import {Component, start} from '@bframe/core';

// define langauge service component
@Component()
class LanguagesService {
  sayHi(lang: string) {
    if (lang === "en") {
      console.log("Hi!");
    } else {
      console.log("Ciao!");
    }
  }
}

@Component()
class ItalianLanguage {
  // languageService is automatically injected. private modifier makes it available via `this.languageService` through the component
  constructor(private languageService: LanguagesService) { }
  sayHi() {
    return this.languageService.sayHi("it");
  }
}

@Component()
class EnglishLanguage {
  // languageService is automatically injected. private modifier makes it available via `this.languageService` through the component
  constructor(private languageService: LanguagesService) { }
  sayHi() {
    return this.languageService.sayHi("en");
  }
}

// start application
start({
  require: [ItalianLanguage, EnglishLanguage],  // Load ItalianLanguage and EnglishLanguage components at start time
  importFiles: [], // no need to import files in this test
  onStart: async (it, en) => {
    // app loaded, do stuff
    it.sayHi(); // Ciao!
    en.sayHi(); // Hi!
  }
});
```
