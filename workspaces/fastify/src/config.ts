import {FastifyHttpOptions, FastifyListenOptions} from "fastify";

export type FastifyModuleConfig = {
  instanceConfig: FastifyHttpOptions<any>;
  listenConfig: FastifyListenOptions;
};
