import {RouteOptions} from "fastify";

export type FastifyRouteProps = Omit<RouteOptions, 'handler'>;

export function Route (props: FastifyRouteProps): MethodDecorator {
  return () => {};
}
