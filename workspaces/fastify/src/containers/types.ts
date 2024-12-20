import { HTTPMethods } from "fastify";

export type TRouterMethod = {
  method: HTTPMethods;
  path?: string;
  isAbsolute?: boolean;
  name: string | Symbol;
}