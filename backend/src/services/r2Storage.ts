import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env';
import fs from 'fs';
import path from 'path';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload a file to R2
 * @param filePath Local file path
 * @param key R2 object key (path in bucket)
 * @param contentType MIME type
 */
export async function uploadToR2(
  filePath: string,
  key: string,
  contentType: string
): Promise<string> {
  const fileBuffer = fs.readFileSync(filePath);

  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    })
  );

  // Return the public URL
  return `${env.R2_PUBLIC_URL}/${key}`;
}

/**
 * Upload a buffer directly to R2
 */
export async function uploadBufferToR2(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return `${env.R2_PUBLIC_URL}/${key}`;
}

/**
 * Delete a file from R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    })
  );
}

/**
 * Delete multiple files from R2
 */
export async function deleteMultipleFromR2(keys: string[]): Promise<void> {
  await Promise.all(keys.map((key) => deleteFromR2(key)));
}

/**
 * Get the R2 key from a full URL
 */
export function getR2KeyFromUrl(url: string): string | null {
  if (!url.startsWith(env.R2_PUBLIC_URL)) return null;
  return url.replace(`${env.R2_PUBLIC_URL}/`, '');
}

/**
 * Check if R2 is configured
 */
export function isR2Configured(): boolean {
  return !!(
    env.R2_ENDPOINT &&
    env.R2_ACCESS_KEY_ID &&
    env.R2_SECRET_ACCESS_KEY &&
    env.R2_BUCKET_NAME &&
    env.R2_PUBLIC_URL
  );
}
