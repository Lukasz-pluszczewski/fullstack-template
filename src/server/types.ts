import { type Config } from './config.js';
import { type ExampleService } from './modules/example/Example.service.js';
import { type MultiplyService } from './modules/example/Multiply.service.js';

export type RouteParams = {
  config: Config;
  exampleService: ExampleService;
  multiplyService: MultiplyService;
};

export type Locals = Record<string, unknown>;
