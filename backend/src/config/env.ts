import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URL: requireEnv('MONGO_URL'),
  MONGO_DB_NAME: process.env.MONGO_DB_NAME || 'QuilCount',
  GOOGLE_CLIENT_ID: requireEnv('GOOGLE_CLIENT_ID'),
  PORT: parseInt(process.env.PORT || '4000', 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  SESSION_EXPIRY_HOURS: parseInt(process.env.SESSION_EXPIRY_HOURS || '24', 10),
  STRIPE_SECRET_KEY: requireEnv('STRIPE_SECRET_KEY'),
  STRIPE_WEBHOOK_SECRET: requireEnv('STRIPE_WEBHOOK_SECRET'),
  PRODUCT_FILES_DIR: process.env.PRODUCT_FILES_DIR || path.join(__dirname, '..', '..', 'product-files'),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Cloudflare R2 Storage (optional - falls back to local storage if not set)
  R2_ENDPOINT: process.env.R2_ENDPOINT || '',
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || '',
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || '',
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || '',
  R2_PUBLIC_URL: process.env.R2_PUBLIC_URL || '', // e.g., https://pub-xxx.r2.dev or custom domain
};
