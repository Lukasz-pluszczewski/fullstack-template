import { map } from 'async-collection-utils';
import { z } from 'zod';

import { detectSecret, formatSecret } from '../shared/utilities/secrets';

const booleanSchema = z
  .union([z.string(), z.number()])
  .transform((v: any) => v === 'true' || Boolean(parseInt(v)));

// Config validation
const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']),
  port: z.coerce.number().min(1).max(65535),
});

// Config mapping
const config = {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
} as const;

// List of config keys containing secrets
const SECRETS = [
  'OPENAI_API_KEY',
];

// List of config keys that definitely not contain secrets
const IGNORELIST = ['OPEN_AI_URL'];

const parsedConfig = configSchema.safeParse(config);

if (!parsedConfig.success) {
  console.error('Config validation failed', config, parsedConfig.error);
  throw parsedConfig.error;
}


console.log(
  'Config loaded successfully',
  config.NODE_ENV === 'development' ? parsedConfig.data : map(parsedConfig.data, (value, key) => {
    if (SECRETS.includes(key)) return formatSecret(value);
    if (detectSecret(key, value, { ignorelist: IGNORELIST })) {
      throw new Error(`"${key}" seems to be a secret. Add it to ignorelist or to "SECRETS" array in config.ts`)
    }
    return value;
  })
);


export type Config = z.infer<typeof configSchema>;
export default parsedConfig.data;
