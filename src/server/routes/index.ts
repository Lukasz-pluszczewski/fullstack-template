import { Routes, wrapMiddleware as w } from 'simple-express-framework';
import { RouteParams } from '../types';
import { persistCollection, persistKeyValue } from 'fullstack-simple-persist/express';
import { RouteNotFoundError } from '../errorHandling/errors.js';

const routes: Routes<RouteParams>[] = [
  ['/keyvalue', w(persistKeyValue('keyvalue'))],
  ['/collection', w(persistCollection('collection'))],
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
  ['/*path', {
    get: () => new RouteNotFoundError({ devMessage: 'You ran out of routes!' }),
  }],
];

export default routes;
