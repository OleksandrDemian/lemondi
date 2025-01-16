import {ClassPath, ClassUtils} from "@lemondi/classpath";
import {FastifyRouteProps, Route} from "./decorators/methods";
import {FastifyInstance} from "fastify";
import {Router} from "./decorators/router";
import {AppContext} from "@lemondi/core";

async function buildRoutes (fastifyInstance: FastifyInstance) {
  const cls = ClassPath.findDecoratedClasses(Router);

  for (const c of cls) {
    const [routerDecorator] = ClassUtils.getDecorators(c, Router);
    if (routerDecorator) {
      const routerInstance = await AppContext.instantiate(c);
      const routerPath = routerDecorator.getProps()?.path || '';
      console.log(`[${c.name}]`);

      const methods = ClassUtils.getMethods(c);
      for (const method of methods) {
        const [route] = method.getDecorators(Route);
        if (route) {
          const props = route.getProps() as FastifyRouteProps;
          const url = routerPath + props.url;
          fastifyInstance.route({
            ...props,
            url,
            handler: async (...args) => {
              return await Promise.resolve(routerInstance[method.getName()].call(routerInstance, ...args));
            },
          });

          console.log("  - " + props.method + " " + url);
        }
      }
    }
  }
}

export const setup = async (fastifyInstance: FastifyInstance) => {
  return buildRoutes(fastifyInstance);
};
