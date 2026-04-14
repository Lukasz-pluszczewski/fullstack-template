import { map } from 'async-collection-utils';
import { z } from 'zod';

import { ConfigValidationError } from './errorHandling/errors';
import { detectSecret, formatSecret } from '../shared/utilities/secrets';
import {
  exampleModelSchema,
  exampleProviderSchema,
  exampleReasoningEffortSchema,
  exampleTemperatureSchema,
} from './modules/ai/prompts/example.prompt';

// Config validation
const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']),
  PORT: z.coerce.number().min(1).max(65535),
  INCLUDE_STACK_IN_ERROR_RESPONSES: z.stringbool().default(false),

  OPENAI_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_URL: z.string().default('https://openrouter.ai'),

  PROMPTS_EXAMPLE_PROVIDER: exampleProviderSchema,
  PROMPTS_EXAMPLE_MODEL: exampleModelSchema,
  PROMPTS_EXAMPLE_TEMPERATURE: exampleTemperatureSchema,
  PROMPTS_EXAMPLE_REASONING_EFFORT: exampleReasoningEffortSchema,
});

// Config mapping
const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3210,
  INCLUDE_STACK_IN_ERROR_RESPONSES:
    process.env.INCLUDE_STACK_IN_ERROR_RESPONSES || 'false',

  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_URL: process.env.OPENROUTER_URL,

  PROMPTS_EXAMPLE_PROVIDER: process.env.PROMPTS_EXAMPLE_PROVIDER,
  PROMPTS_EXAMPLE_MODEL: process.env.PROMPTS_EXAMPLE_MODEL,
  PROMPTS_EXAMPLE_TEMPERATURE: process.env.PROMPTS_EXAMPLE_TEMPERATURE,
  PROMPTS_EXAMPLE_REASONING_EFFORT:
    process.env.PROMPTS_EXAMPLE_REASONING_EFFORT,
} as const;

// List of config keys containing secrets
const SECRETS = ['OPENAI_API_KEY'];

// List of config keys that definitely not contain secrets
const IGNORELIST = ['OPEN_AI_URL'];

const parsedConfig = configSchema.safeParse(config);

if (!parsedConfig.success) {
  throw new ConfigValidationError({
    message: 'Config validation failed',
    inputConfig: config,
    cause: parsedConfig.error,
  });
}

console.log(
  'Config loaded successfully',
  config.NODE_ENV === 'development'
    ? parsedConfig.data
    : map(parsedConfig.data, (value, key) => {
        if (SECRETS.includes(key)) return formatSecret(value);
        if (detectSecret(key, value, { ignorelist: IGNORELIST })) {
          throw new Error(
            `"${key}" seems to be a secret. Add it to ignorelist or to "SECRETS" array in config.ts`
          );
        }
        return value;
      })
);

export type Config = z.infer<typeof configSchema>;
export default parsedConfig.data;
