import { componentUniqueSymbol, getComponent, register, getDependencies } from "./container/container";

export interface IApp {
  start: () => void;
}

export const start = (app: new (...args: any[]) => IApp) => {
  const id = Symbol();
  Reflect.set(app, componentUniqueSymbol, id);
  Reflect.construct(app, getDependencies(app)).start();
};
