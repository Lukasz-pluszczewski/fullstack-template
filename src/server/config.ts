import { z } from 'zod';

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']),
  port: z.coerce.number().min(1).max(65535),
});

export type Config = z.infer<typeof configSchema>;

const config = {
  NODE_ENV: process.env.NODE_ENV || 'production',
  port: process.env.PORT || 8080,
} as const;

console.log('Config loaded', config);

export default configSchema.parse(config);
