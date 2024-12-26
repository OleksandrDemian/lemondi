import {FastifyHttpOptions, FastifyListenOptions} from "fastify";

export class FastifyInitConfig {
  constructor(
    private config: FastifyHttpOptions<any>,
  ) { }

  getConfig() {
    return this.config;
  }
}

export class FastifyListenConfig {
  constructor(
    private config: FastifyListenOptions,
  ) { }

  getConfig() {
    return this.config;
  }
}
