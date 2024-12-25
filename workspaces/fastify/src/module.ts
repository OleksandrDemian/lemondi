import { Component, instantiate } from "@bframe/core";
import Fastify, { FastifyListenOptions, HTTPMethods } from 'fastify';
import { Router } from "./decorators/router";
import {findClassDecorators, findMethodDecorators, getDecoratorId, scan, TCtor} from "@bframe/scanner";
import { Delete, Get, Options, Post, Put, TRouteProps } from "./decorators/methods";

const DecoratorsToHttpMethodMap: Record<symbol, HTTPMethods> = {
  [getDecoratorId(Get)]: "GET",
  [getDecoratorId(Post)]: "POST",
  [getDecoratorId(Put)]: "PUT",
  [getDecoratorId(Delete)]: "DELETE",
  [getDecoratorId(Options)]: "OPTIONS",
}

const RouteDecorators = [
  Get,
  Post,
  Put,
  Delete,
  Options,
];

export class ModuleConfiguration {
  logger: boolean;
  ignoreTrailingSlash: boolean;
}

@Component()
export class FastifyModule {
  constructor (
    private config: ModuleConfiguration,
  ) { }

  start(opts?: FastifyListenOptions) {
    const fastify = Fastify(this.config);
    const routers = scan(Router);

    for (const router of routers) {
      const routerInstance = instantiate(router);
      const [routerDecorator] = findClassDecorators(router, Router);

      console.log(`[${router.name}]`);

      for (const prop of Reflect.ownKeys(router.prototype)) {
        const routerProps = getRouteProps(router, prop);
        if (routerProps) {
          const url = routerProps.isAbsolute ? routerProps.path : routerDecorator.decoratorProps?.path || '' + routerProps?.path;
          if (url) {
            fastify.route({
              method: routerProps.method,
              handler: async (...args) => {
                return await Promise.resolve(routerInstance[prop].call(routerInstance, ...args));
              },
              url,
            });
          }
    
          console.log("  - " + routerProps.method + " " + url);
        }
      }
    }

    fastify.listen(opts);
  }
}

function getRouteProps (ctor: TCtor, propName: string | symbol): TRouteProps & { method: HTTPMethods } | undefined {
  for (const d of RouteDecorators) {
    const [decorator] = findMethodDecorators(ctor, propName, d);
    if (decorator) {
      return {
        ...decorator.decoratorProps,
        method: DecoratorsToHttpMethodMap[decorator.decoratorId]
      };
    }
  }

  return undefined;
}
