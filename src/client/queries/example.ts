import z from 'zod';
import { useCustomMutation } from '../platform/react-query';
import { QUERY_KEYS } from './keys';


export const exampleSchema = z.object({
  foo: z.string().min(1, 'Foo is required'),
});
export const useExampleMutation = () =>
  useCustomMutation(
    (example) => ({ url: '/example', method: 'POST', data: example }),
    exampleSchema,
    {
      invalidateKeys: [QUERY_KEYS.HEALTH],
    }
  );
