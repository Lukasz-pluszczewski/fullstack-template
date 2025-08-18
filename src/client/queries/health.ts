import z from 'zod';
import { useCustomQuery } from '../platform/react-query';
import { QUERY_KEYS } from './keys';

export const healthSchema = z.object({
  status: z.string(),
});
export const useHealth = (enabled = true) =>
  useCustomQuery(
    [QUERY_KEYS.HEALTH],
    {
      url: '/api/health',
      method: 'GET',
    },
    healthSchema,
    {
      placeholderData: {
        status: '',
      },
      enabled,
    }
  );
