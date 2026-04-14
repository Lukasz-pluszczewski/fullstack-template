import { simpleExpress } from 'simple-express-framework';
import ViteExpress from 'vite-express';

import config from './config';
import errorHandlers from './errorHandling/errorHandlers';
import { createExampleService } from './modules/example/Example.service';
import { createMultiplyService } from './modules/example/Multiply.service';
import { updateOpenRouterTypes } from './modules/openrouter/models';
import routes from './routes';
import type { Locals, RouteParams } from './types';

ViteExpress.config({
  mode: config.NODE_ENV,
  ignorePaths: /\/api'/,
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
          `Serving frontend app from root ${root}; listening on :${port}${base}`,
        );
      });
      console.log('Backend app listening on port', port);
    })
    .catch(error => console.error('Error', error));
})();
