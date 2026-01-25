import { getCoverImageUrls } from '../../utils/coverImageUtils';
import type { CoverImageData } from '../../models/ProductInterface';

interface ResponsiveImageProps {
  coverImage: string | CoverImageData | undefined;
  alt: string;
  className?: string;
  sizes?: string;
  onClick?: () => void;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
}

export const ResponsiveImage = ({
  coverImage,
  alt,
  className,
  sizes,
  onClick,
  loading = 'lazy',
  fetchPriority,
}: ResponsiveImageProps) => {
  const urls = getCoverImageUrls(coverImage);
  if (!urls) return null;

  return (
    <img
      src={urls.src}
      srcSet={urls.srcSet || undefined}
      sizes={sizes}
      alt={alt}
      className={className}
      onClick={onClick}
      loading={loading}
      fetchPriority={fetchPriority}
    />
  );
};
