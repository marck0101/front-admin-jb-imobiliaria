import { z } from 'zod';

const envSchema = z.object({
  BUILD: z.enum(['DEV', 'PROD', 'STAGE']).default('DEV'),
  API_URL: z.string().default('http://localhost:8181'),
  MOCK_REQUESTS: z.boolean().default(false),
  VITE_APP_FIREBASE_APIKEY: z.string().optional(),
  VITE_APP_FIREBASE_AUTHDOMAIN: z.string().optional(),
  VITE_APP_FIREBASE_PROJECTID: z.string().optional(),
  VITE_APP_FIREBASE_STORAGEBUCKET: z.string().optional(),
  VITE_APP_FIREBASE_MESSAGINGSENDERID: z.string().optional(),
  VITE_APP_FIREBASE_APPID: z.string().optional(),
  VITE_APP_MEASUREMENT_ID: z.string().optional(),
});

const _env = envSchema.safeParse({
  API_URL: import.meta.env.VITE_API_URL,
  VITE_APP_FIREBASE_APIKEY: import.meta.env.VITE_APP_FIREBASE_APIKEY,
  VITE_APP_FIREBASE_AUTHDOMAIN: import.meta.env.VITE_APP_FIREBASE_AUTHDOMAIN,
  VITE_APP_FIREBASE_PROJECTID: import.meta.env.VITE_APP_FIREBASE_PROJECTID,
  VITE_APP_FIREBASE_STORAGEBUCKET: import.meta.env.VITE_APP_FIREBASE_STORAGEBUCKET,
  VITE_APP_FIREBASE_MESSAGINGSENDERID: import.meta.env.VITE_APP_FIREBASE_MESSAGINGSENDERID,
  VITE_APP_FIREBASE_APPID: import.meta.env.VITE_APP_FIREBASE_APPID,
  VITE_APP_MEASUREMENT_ID: import.meta.env.VITE_APP_MEASUREMENT_ID,
});

if (!_env.success) {
  console.error('❌ Invalid environment variables', _env.error.format());
  throw new Error('Invalid environment varibles.');
}

export const env = _env.data;
