import { z } from 'zod';

const booleanSchema = z
  .union([z.string(), z.number()])
  .transform((v: any) => v === 'true' || Boolean(parseInt(v)));

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']),
  port: z.coerce.number().min(1).max(65535),
});

export type Config = z.infer<typeof configSchema>;

const config = {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
} as const;

const parsedConfig = configSchema.safeParse(config);

if (!parsedConfig.success) {
  console.error('Config validation failed', parsedConfig.error);
  throw parsedConfig.error;
}

console.log('Config loaded successfully', parsedConfig.data);

export default parsedConfig.data;
