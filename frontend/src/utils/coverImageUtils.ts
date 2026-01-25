import type { CoverImageData } from '../models/ProductInterface';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface CoverImageUrls {
  src: string;
  srcSet: string;
  originalSrc: string;
}

export function getCoverImageUrls(
  coverImage: string | CoverImageData | undefined
): CoverImageUrls | null {
  if (!coverImage) return null;

  // Legacy string format
  if (typeof coverImage === 'string') {
    let fullUrl = coverImage;
    if (coverImage.startsWith('http')) {
      fullUrl = coverImage;
    } else if (coverImage.startsWith('/uploads')) {
      fullUrl = `${API_URL}${coverImage}`;
    } else {
      // Relative path without /uploads prefix - add it
      fullUrl = `${API_URL}/uploads/${coverImage}`;
    }
    return { src: fullUrl, srcSet: '', originalSrc: fullUrl };
  }

  // Structured format with variants
  const { baseName, originalExt, widths, path } = coverImage;
  // If path is already a full URL (R2), use it directly; otherwise prepend API_URL
  const baseUrl = path.startsWith('http') ? path : `${API_URL}${path}`;
  const originalSrc = `${baseUrl}${baseName}${originalExt}`;

  if (widths.length === 0) {
    return { src: originalSrc, srcSet: '', originalSrc };
  }

  const sortedWidths = [...widths].sort((a, b) => a - b);
  const srcSet = sortedWidths
    .map(w => `${baseUrl}${baseName}-${w}w.webp ${w}w`)
    .join(', ');

  const src = `${baseUrl}${baseName}-${sortedWidths[0]}w.webp`;

  return { src, srcSet, originalSrc };
}
