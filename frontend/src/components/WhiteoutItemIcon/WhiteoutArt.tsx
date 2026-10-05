import { useIconSrc } from './useIconSrc';
import classes from './WhiteoutItemIcon.module.css';

interface WhiteoutArtProps {
  /** Where the file would be, whether or not it has been drawn yet. */
  src: string;
  /** Real alt text: this art identifies the thing, it is not decoration. */
  alt: string;
  /** Which sizing rule to use. */
  variant: 'portrait' | 'building' | 'expert';
  /**
   * Hold the space open when the art is missing.
   *
   * For a grid where most cells have a picture, the ones that do not would
   * otherwise collapse and drag every row out of line. A hero row is a single
   * flex row and does not need it.
   */
  reserve?: boolean;
}

/**
 * A picture that removes itself when the file is not there.
 *
 * Hero portraits and building art both arrive a file at a time, so a miss is
 * the normal case rather than a fault. Building the path from a name and
 * letting the element drop out on error means new art works the moment it is
 * dropped in the folder, with no list to keep in step.
 *
 * It has to be an error handler rather than a HEAD check: the dev server
 * answers a missing public file with the SPA fallback, a 200 carrying
 * index.html, so the status says nothing. The browser still cannot decode it as
 * an image, so `error` fires and the row falls back to plain text.
 */
export const WhiteoutArt = ({ src, alt, variant, reserve }: WhiteoutArtProps) => {
  // Same two rules as the item icons: retry the other image format once, then
  // drop out. See useIconSrc.
  const resolved = useIconSrc(src);
  const className =
    variant === 'portrait'
      ? classes.portrait
      : variant === 'expert'
        ? classes.expertPortrait
        : classes.building;
  if (!resolved.src) return reserve ? <span className={className} aria-hidden="true" /> : null;
  return (
    <img
      key={resolved.src}
      className={className}
      src={resolved.src}
      alt={alt}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={resolved.onError}
      onLoad={resolved.onLoad}
    />
  );
};
