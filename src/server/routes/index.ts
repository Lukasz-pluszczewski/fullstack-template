import { Routes } from 'simple-express-framework';
import { RouteNotFoundError } from '../errorHandling/errors';
import { RouteParams } from '../types';

const routes: Routes<RouteParams>[] = [
  [
    '/example/*path',
    {
      get: async ({ body, query, params, originalUrl, protocol }) => {
        return {
          body: {
            message: 'Request success',
            body,
            query,
            params,
            originalUrl,
            protocol,
          },
        };
      },
    },
  ],
  [
    '/health',
    {
      get: () => ({
        body: {
          status: 'healthy',
        },
      }),
    },
  ],
  // ['/*path', {
  //   get: () => new RouteNotFoundError({ devMessage: 'You ran out of routes!' }),
  // }],
];

export default routes;
