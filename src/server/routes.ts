import {
  persistCollection,
  persistKeyValue,
} from 'fullstack-simple-persist/express';
import { wrapMiddleware as w, type Routes } from 'simple-express-framework';

import { RouteNotFoundError } from './errorHandling/errors.js';
import { exampleRoute } from './modules/example';
import { type Locals, type RouteParams } from './types';

const routes: Routes<RouteParams, Locals>[] = [
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
  [
    '/*path',
    {
      get: () =>
        new RouteNotFoundError({ devMessage: 'You ran out of routes!' }),
    },
  ],
];

export default routes;
