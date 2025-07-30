import { simpleExpress } from 'simple-express-framework';
import ViteExpress from 'vite-express';
import config from './config';
import errorHandlers from './errorHandling/errorHandlers';
import routes from './routes';
import { RouteParams } from './types';

ViteExpress.config({
  mode: config.NODE_ENV,
  ignorePaths: /\/api'/,
});

(async function () {
  simpleExpress<RouteParams>({
    port: config.port,
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
    },
  })
    .then(({ app, server, address, port }) => {
      ViteExpress.bind(app, server, async () => {
        const { root, base } = await ViteExpress.getViteConfig();
        console.log(
          `Serving app from root ${root}; listening on :${port}${base}`
        );
      });
    })
    .catch((error) => console.error('Error', error));
})();
