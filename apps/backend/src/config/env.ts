import { z } from 'zod';

const envSchema = z.object({
  FRONTEND_URL: z.string().min(1, 'FRONTEND_URL is required'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
});

export const env = envSchema.parse(process.env);
