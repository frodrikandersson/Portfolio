import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { uploadToR2, uploadBufferToR2, isR2Configured, deleteMultipleFromR2 } from '../services/r2Storage';
import { env } from '../config/env';

export interface CoverImageData {
  baseName: string;
  originalExt: string;
  widths: number[];
  path: string; // URL path prefix, e.g. "/uploads/products/" or R2 public URL
}

const DEFAULT_WIDTHS = [320, 640, 1024, 1536, 2048];

export async function generateImageVariants(
  originalFilePath: string,
  outputDir: string,
  urlPath: string,
  widths: number[] = DEFAULT_WIDTHS
): Promise<CoverImageData> {
  const ext = path.extname(originalFilePath);
  const baseName = path.basename(originalFilePath, ext);
  const useR2 = isR2Configured();

  const metadata = await sharp(originalFilePath).metadata();
  const originalWidth = metadata.width || Infinity;

  const successfulWidths: number[] = [];

  // Determine the R2 folder from urlPath (e.g., "/uploads/media/" -> "media")
  const r2Folder = urlPath.replace(/^\/uploads\//, '').replace(/\/$/, '');

  if (useR2) {
    // Upload original to R2
    const originalKey = `${r2Folder}/${baseName}${ext}`;
    const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    await uploadToR2(originalFilePath, originalKey, mimeType);

    // Generate and upload variants
    for (const width of widths) {
      if (width >= originalWidth) continue;

      try {
        const variantBuffer = await sharp(originalFilePath)
          .resize(width)
          .webp({ quality: 85 })
          .toBuffer();

        const variantKey = `${r2Folder}/${baseName}-${width}w.webp`;
        await uploadBufferToR2(variantBuffer, variantKey, 'image/webp');
        successfulWidths.push(width);
      } catch (err) {
        console.error(`Failed to generate ${width}w variant for ${baseName}:`, err);
      }
    }

    // Clean up local file
    if (fs.existsSync(originalFilePath)) {
      fs.unlinkSync(originalFilePath);
    }

    // Return R2 path
    return {
      baseName,
      originalExt: ext,
      widths: successfulWidths,
      path: `${env.R2_PUBLIC_URL}/${r2Folder}/`,
    };
  }

  // Local storage fallback
  for (const width of widths) {
    if (width >= originalWidth) continue;

    const variantPath = path.join(outputDir, `${baseName}-${width}w.webp`);

    try {
      await sharp(originalFilePath)
        .resize(width)
        .webp({ quality: 85 })
        .toFile(variantPath);

      successfulWidths.push(width);
    } catch (err) {
      console.error(`Failed to generate ${width}w variant for ${baseName}:`, err);
    }
  }

  return { baseName, originalExt: ext, widths: successfulWidths, path: urlPath };
}

export async function cleanupImageFromStorage(
  coverImage: CoverImageData,
  localOutputDir?: string
): Promise<void> {
  const { baseName, originalExt, widths, path: imagePath } = coverImage;

  // Check if it's an R2 URL
  if (imagePath.startsWith('http')) {
    // R2 storage - delete from R2
    const keys: string[] = [];
    const folder = imagePath.replace(env.R2_PUBLIC_URL + '/', '').replace(/\/$/, '');

    // Original file
    keys.push(`${folder}${baseName}${originalExt}`);

    // Variants
    for (const width of widths) {
      keys.push(`${folder}${baseName}-${width}w.webp`);
    }

    await deleteMultipleFromR2(keys);
  } else if (localOutputDir) {
    // Local storage - delete from disk
    cleanupVariants(localOutputDir, baseName, widths);
    cleanupOriginal(localOutputDir, baseName, originalExt);
  }
}

export function cleanupVariants(outputDir: string, baseName: string, widths: number[]): void {
  for (const width of widths) {
    const filePath = path.join(outputDir, `${baseName}-${width}w.webp`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

export function cleanupOriginal(outputDir: string, baseName: string, originalExt: string): void {
  const filePath = path.join(outputDir, `${baseName}${originalExt}`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
