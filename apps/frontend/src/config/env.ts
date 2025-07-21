import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().min(1, 'VITE_API_URL is required'),
});

export const env = envSchema.parse(import.meta.env);