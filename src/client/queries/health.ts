import z from 'zod';
import { QUERY_KEYS, useCustomQuery } from './index';

export const exampleSchema = z.object({
  status: z.string(),
});
export const useHealth = (enabled = true) =>
  useCustomQuery(
    [QUERY_KEYS.HEALTH],
    {
      url: '/api/health',
      method: 'GET',
    },
    exampleSchema,
    {
      placeholderData: {
        status: '',
      },
      enabled,
    }
  );
