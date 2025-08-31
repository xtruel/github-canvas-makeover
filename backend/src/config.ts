import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(8080),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET too short'),
  ADMIN_USERNAME: z.string().min(3),
  ADMIN_PASSWORD: z.string().min(10),
  STORAGE_PROVIDER: z.enum(['local']).default('local'),
  MEDIA_LOCAL_DIR: z.string().default('uploads'),
  MAX_IMAGE_MB: z.coerce.number().default(5),
  MAX_VIDEO_MB: z.coerce.number().default(120)
});

export const config = schema.parse(process.env);
