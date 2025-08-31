import { z } from 'zod';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const configSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  // Admin Configuration
  ADMIN_USERNAME: z.string().min(3, 'ADMIN_USERNAME must be at least 3 characters'),
  ADMIN_PASSWORD: z.string().min(8, 'ADMIN_PASSWORD must be at least 8 characters'),
  
  // Server Configuration
  PORT: z.string().regex(/^\d+$/, 'PORT must be a number').transform(Number).default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Media Upload Configuration
  MEDIA_LOCAL_DIR: z.string().default('uploads'),
  MAX_IMAGE_SIZE_MB: z.string().regex(/^\d+$/, 'MAX_IMAGE_SIZE_MB must be a number').transform(Number).default('10'),
  MAX_VIDEO_SIZE_MB: z.string().regex(/^\d+$/, 'MAX_VIDEO_SIZE_MB must be a number').transform(Number).default('100'),
  ALLOWED_IMAGE_TYPES: z.string().default('image/jpeg,image/png,image/gif,image/webp'),
  ALLOWED_VIDEO_TYPES: z.string().default('video/mp4,video/webm,video/quicktime'),
});

const parseConfig = () => {
  try {
    const config = configSchema.parse(process.env);
    
    // Process arrays from comma-separated strings
    return {
      ...config,
      ALLOWED_IMAGE_TYPES: config.ALLOWED_IMAGE_TYPES.split(',').map(type => type.trim()),
      ALLOWED_VIDEO_TYPES: config.ALLOWED_VIDEO_TYPES.split(',').map(type => type.trim()),
      MAX_IMAGE_SIZE_BYTES: config.MAX_IMAGE_SIZE_MB * 1024 * 1024,
      MAX_VIDEO_SIZE_BYTES: config.MAX_VIDEO_SIZE_MB * 1024 * 1024,
    };
  } catch (error) {
    console.error('❌ Invalid environment configuration:');
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error(error);
    }
    process.exit(1);
  }
};

export const config = parseConfig();
export type Config = typeof config;