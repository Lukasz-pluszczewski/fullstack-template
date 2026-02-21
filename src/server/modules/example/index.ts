import { Routes } from 'simple-express-framework';
import z from 'zod';

import { Locals, RouteParams } from '../../types';

export const exampleRoute: Routes<RouteParams, Locals>[] = [
  [
    '/example/*path',
    {
      get: async ({
        body,
        query,
        params,
        originalUrl,
        protocol,
        exampleService,
      }) => {
        const { a, b } = z.object({ a: z.number(), b: z.number() }).parse(body);

        const exampleResult = await exampleService.handleExample(a, b);
        return {
          body: {
            message: 'Request success',
            body,
            query,
            params,
            originalUrl,
            protocol,
            exampleResult,
          },
        };
      },
    },
  ],
];
