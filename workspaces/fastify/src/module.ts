import { Component } from "@bframe/core";
import Fastify, { FastifyListenOptions } from 'fastify'
import { iterateRouters } from "./containers/routerContainer";
import { TRouterProps } from "./decorators/router";
import { ROUTER_META } from "./const/const";

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
    console.log(this.config);
    const fastify = Fastify(this.config);

    iterateRouters((router, routerMethods) => {
      const routerMeta = Reflect.getMetadata(ROUTER_META, router) as TRouterProps;
      for (const route of routerMethods) {
        const fnName = route.name as string;
        const url = route.isAbsolute ? route.path : routerMeta?.path || '' + route?.path;
        if (url) {
          fastify.route({
            method: route.method,
            handler: router[fnName].bind(router),
            url,
          });
        }
  
        console.log("Registered " + route.method + " " + url);
      }
    });

    fastify.listen(opts);
  }
}
