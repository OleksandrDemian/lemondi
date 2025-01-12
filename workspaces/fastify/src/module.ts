import {Component, instantiate, OnInit} from "@lemondi/core";
import Fastify, {FastifyHttpOptions, FastifyInstance, FastifyListenOptions, HTTPMethods} from 'fastify';
import { Router } from "./decorators/router";
import { Delete, Get, Options, Post, Put, TRouteProps } from "./decorators/methods";
import {ClassPath, ClassUtils, TMethodHandler} from "@lemondi/classpath";

const DecoratorsToHttpMethodMap: Record<symbol, HTTPMethods> = {
  [Get.name]: "GET",
  [Post.name]: "POST",
  [Put.name]: "PUT",
  [Delete.name]: "DELETE",
  [Options.name]: "OPTIONS",
}

const RouteDecorators = [
  Get,
  Post,
  Put,
  Delete,
  Options,
];

export type ModuleConfig = {
  enabled: boolean;
};

@Component()
export class FastifyModule {
  fastify: FastifyInstance;

  constructor (
    private config: ModuleConfig,
    private instanceConfig: FastifyHttpOptions<any>,
    private listenConfig: FastifyListenOptions,
  ) {
    console.log(config, instanceConfig, listenConfig);
    this.fastify = Fastify(this.instanceConfig);
  }

  private getRouteProps (method: TMethodHandler): TRouteProps & { method: HTTPMethods } | undefined {
    for (const d of RouteDecorators) {
      const [decorator] = method.getDecorators(d);
      if (decorator) {
        return {
          ...decorator.getProps(),
          method: DecoratorsToHttpMethodMap[d.name]
        };
      }
    }

    return undefined;
  }

  private async buildRoutes () {
    const cls = ClassPath.findDecoratedClasses(Router);

    for (const c of cls) {
      const [routerDecorator] = ClassUtils.getDecorators(c, Router);
      if (routerDecorator) {
        const routerInstance = await instantiate(c);
        console.log(`[${c.name}]`);

        const methods = ClassUtils.getMethods(c);
        for (const method of methods) {
          const routerProps = this.getRouteProps(method);
          if (routerProps) {
            const url = routerProps.isAbsolute ? routerProps.path : routerDecorator.getProps()?.path || '' + routerProps?.path;
            if (url) {
              this.fastify.route({
                method: routerProps.method,
                handler: async (...args) => {
                  return await Promise.resolve(routerInstance[method.getName()].call(routerInstance, ...args));
                },
                url,
              });
            }

            console.log("  - " + routerProps.method + " " + url);
          }
        }
      }
    }

    return this;
  }

  @OnInit()
  async listen () {
    await this.buildRoutes();
    return this.fastify.listen(this.listenConfig);
  }
}
