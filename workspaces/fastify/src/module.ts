import { Component, instantiate } from "@bframe/core";
import Fastify, { FastifyListenOptions, HTTPMethods } from 'fastify';
import { Router, TRouterProps } from "./decorators/router";
import { getDecoratorId, scan, scanClass, TScanClassResult } from "@bframe/scanner";
import { Delete, Get, Options, Post, Put, TRouteProps } from "./decorators/methods";

const DecoratorsToHttpMethodMap: Record<symbol, HTTPMethods> = {
  [getDecoratorId(Get)]: "GET",
  [getDecoratorId(Post)]: "POST",
  [getDecoratorId(Put)]: "PUT",
  [getDecoratorId(Delete)]: "DELETE",
  [getDecoratorId(Options)]: "OPTIONS",
}

const RouteDecorators = [
  getDecoratorId(Get),
  getDecoratorId(Post),
  getDecoratorId(Put),
  getDecoratorId(Delete),
  getDecoratorId(Options),
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
      const props = router.decoratorProps as TRouterProps;
      const classScan = scanClass(router.ctor);
      const routerInstance = instantiate(router.ctor);

      console.log(`[${router.ctor.name}]`);
      for (const prop of classScan) {
        const routerProps = getRouteProps(prop);
        if (routerProps) {
          const url = routerProps.isAbsolute ? routerProps.path : props?.path || '' + routerProps?.path;
          if (url) {
            fastify.route({
              method: routerProps.method,
              handler: async (...args) => {
                const result = await Promise.resolve(routerInstance[prop.name].call(routerInstance, ...args));
                return result;
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

function getRouteProps (scanResult: TScanClassResult): TRouteProps & { method: HTTPMethods } | undefined {
  if (scanResult.decorators && scanResult.decorators.length > 0) {
    for (const decorator of scanResult.decorators) {
      if (RouteDecorators.includes(decorator.decoratorId)) {
        return {
          ...(decorator.decoratorProps as TRouteProps),
          method: DecoratorsToHttpMethodMap[decorator.decoratorId],
        };
      }
    }
  }

  return undefined;
}
