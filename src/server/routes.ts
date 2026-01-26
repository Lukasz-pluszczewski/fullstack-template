import { Routes, wrapMiddleware as w } from 'simple-express-framework';
import { RouteParams } from './types';
import { persistCollection, persistKeyValue } from 'fullstack-simple-persist/express';
import { RouteNotFoundError } from './errorHandling/errors.js';
import { exampleRoute } from './modules/example';

const routes: Routes<RouteParams>[] = [
  ['/keyvalue', w(persistKeyValue('keyvalue'))],
  ['/collection', w(persistCollection('collection'))],
  ...exampleRoute,
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
