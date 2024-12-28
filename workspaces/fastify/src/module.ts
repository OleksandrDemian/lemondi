import {Component, Factory, Instantiate, instantiate, OnInit} from "@lemondi/core";
import Fastify, {FastifyInstance, HTTPMethods} from 'fastify';
import { Router } from "./decorators/router";
import {findClassDecorators, findMethodDecorators, getDecoratorId, scan, TCtor} from "@lemondi/scanner";
import { Delete, Get, Options, Post, Put, TRouteProps } from "./decorators/methods";
import {FastifyInitConfig, FastifyListenConfig} from "./configurations";

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

@Component()
export class FastifyModule {
  fastify: FastifyInstance;

  constructor (
    private instanceConfig: FastifyInitConfig,
    private listenConfig: FastifyListenConfig,
  ) {
    this.fastify = Fastify(this.instanceConfig.getConfig());
  }

  private getRouteProps (ctor: TCtor, propName: string | symbol): TRouteProps & { method: HTTPMethods } | undefined {
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

  private async buildRoutes () {
    const routers = scan(Router);

    for (const router of routers) {
      const routerInstance = await instantiate(router);
      const [routerDecorator] = findClassDecorators(router, Router);
      console.log(`[${router.name}]`);

      for (const prop of Reflect.ownKeys(router.prototype)) {
        const routerProps = this.getRouteProps(router, prop);
        if (routerProps) {
          const url = routerProps.isAbsolute ? routerProps.path : routerDecorator.decoratorProps?.path || '' + routerProps?.path;
          if (url) {
            this.fastify.route({
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

    return this;
  }

  @OnInit()
  async listen () {
    await this.buildRoutes();
    return this.fastify.listen(this.listenConfig.getConfig());
  }
}
