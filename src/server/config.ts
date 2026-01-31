import { map } from 'async-collection-utils';
import { z } from 'zod';

import { detectSecret, formatSecret } from '../shared/utilities/secrets';

const booleanSchema = z
  .union([z.string(), z.number()])
  .transform((v: any) => v === 'true' || Boolean(parseInt(v)));

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']),
  port: z.coerce.number().min(1).max(65535),
});

const config = {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
} as const;

const parsedConfig = configSchema.safeParse(config);

if (!parsedConfig.success) {
  console.error('Config validation failed', config, parsedConfig.error);
  throw parsedConfig.error;
}


console.log(
  'Config loaded successfully',
  map(parsedConfig.data, (value, key) =>
    detectSecret(key, value) ? formatSecret(value) : value)
);


export type Config = z.infer<typeof configSchema>;
export default parsedConfig.data;
