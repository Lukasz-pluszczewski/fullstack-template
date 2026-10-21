import { simpleExpress } from 'simple-express-framework';
import type { InlineConfig } from 'vite';
import ViteExpress from 'vite-express';

import config from './config';
import errorHandlers from './errorHandling/errorHandlers';
import { createExampleService } from './modules/example/Example.service';
import { createMultiplyService } from './modules/example/Multiply.service';
import { updateOpenRouterTypes } from './modules/openrouter/models';
import routes from './routes';
import type { Locals, RouteParams } from './types';

// vite-express uses this instead of resolving vite.config.ts, which Vite still
// loads. The default 'bundle' loader imports vite.config.ts from a new temp file
// on every start and deletes it, which makes `--watch` restart in a loop
const viteConfig = {
  root: process.cwd(),
  base: '/',
  build: { outDir: 'dist' },
  configLoader: 'runner',
} satisfies InlineConfig;

ViteExpress.config({
  mode: config.NODE_ENV,
  ignorePaths: /^\/api(\/|$)/,
  inlineViteConfig: viteConfig,
});

(async () => {
  await updateOpenRouterTypes();
  const multiplyService = createMultiplyService();
  const exampleService = createExampleService({ multiplyService });

  simpleExpress<RouteParams, Locals>({
    port: config.PORT,
    routes: [
      ['/api', routes],
      [
        '/config.json',
        {
          get: () => ({
            body: {
              env: config.NODE_ENV,
            },
          }),
        },
      ],
    ],
    errorHandlers,
    routeParams: {
      config,
      multiplyService,
      exampleService,
    },
  })
    .then(({ app, server, port }) => {
      ViteExpress.bind(app, server, async () => {
        const { root, base } = await ViteExpress.getViteConfig();
        console.log(
          `Serving frontend app from root ${root}; listening on :${port}${base}`
        );
      });
      console.log('Backend app listening on port', port);
    })
    .catch(error => console.error('Error', error));
})();
