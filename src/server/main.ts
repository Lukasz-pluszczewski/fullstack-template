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
    .then(({ app }) => {
      ViteExpress.listen(app, config.port, () =>
        console.log(`Server is listening on port ${config.port}...`)
      );
    })
    .catch((error) => console.error('Error', error));
})();
