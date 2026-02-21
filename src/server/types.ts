import { Config } from './config.js';
import { ExampleService } from './modules/example/Example.service.js';
import { MultiplyService } from './modules/example/Multiply.service.js';

export type RouteParams = {
  config: Config;
  exampleService: ExampleService;
  multiplyService: MultiplyService;
};

export type Locals = Record<string, unknown>;
