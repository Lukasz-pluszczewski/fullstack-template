import { Routes, wrapMiddleware } from 'simple-express-framework';
import { RouteParams } from '../types';
import { persistCollection, persistKeyValue } from 'fullstack-simple-persist/express';

const routes: Routes<RouteParams>[] = [
  ['/keyvalue', wrapMiddleware(persistKeyValue('keyvalue'))],
  ['/collection', wrapMiddleware(persistCollection('collection'))],
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
