import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: '.env' });

const configSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DB_HOST: z.string().default('db'),
  DB_PORT: z.coerce.number().default(3306),
  DB_USERNAME: z.string().default('wheelz'),
  DB_PASSWORD: z.string().default('root'),
  DB_NAME: z.string().default('user_service_db'),
  AUTH_SERVICE_URL: z.string().default('http://auth_api:4010'),
});

const parsedConfig = configSchema.safeParse(process.env);
if (!parsedConfig.success) {
  throw new Error('Invalid configuration');
}

export const config = parsedConfig.data;
