import { RouteParams } from '../../types';
import { Routes } from 'simple-express-framework';

export const exampleRoute: Routes<RouteParams>[] = [
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
];
