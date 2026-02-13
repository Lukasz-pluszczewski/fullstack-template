import { Config } from './config.js';

export type RouteParams = {
  config: Config
};

export type Locals = Record<string, unknown>;
