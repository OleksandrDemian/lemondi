import { Component, OnInit } from "@lemondi/core";
import Fastify, { FastifyInstance } from 'fastify';
import { FastifyModuleConfig } from "./config";
import { setup } from "./setup";

@Component()
export class FastifyModule {
  fastify: FastifyInstance;

  constructor (private moduleConfig: FastifyModuleConfig) {
    this.fastify = Fastify(this.moduleConfig.instanceConfig);
  }

  @OnInit()
  async listen () {
    await setup(this.fastify);
    return this.fastify.listen(this.moduleConfig.listenConfig);
  }
}
