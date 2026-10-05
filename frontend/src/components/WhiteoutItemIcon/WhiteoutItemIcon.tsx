import { useIconSrc } from './useIconSrc';
import classes from './WhiteoutItemIcon.module.css';

interface WhiteoutItemIconProps {
  /** Path under /whiteout/items, or nothing when that item has no art. */
  src: string | null | undefined;
  /**
   * Default. `sm` is for the dense event scoring rows, where a full size
   * icon would set the row height instead of the text.
   */
  size?: 'sm' | 'md';
  /**
   * Keep the icon's space when there is no art.
   *
   * For a fixed list where nearly every entry has an icon, one that does not
   * would otherwise sit flush left and break the column. Not for the backpack,
   * where most items have no art and reserving would indent the lot.
   */
  reserve?: boolean;
}

/**
 * The little square of game art that sits beside an item's name.
 *
 * It is always paired with the label, never a replacement for it, so the image
 * is marked decorative: the name right next to it is already the accessible
 * text, and an alt would make a screen reader say it twice. A null src renders
 * nothing at all rather than a placeholder, because most of the catalogue has
 * no art yet and half-filled rows read worse than plain text. `reserve` is the
 * exception, for lists where the missing one is the odd man out.
 *
 * These are plain <img> tags on purpose. ResponsiveImage routes anything
 * outside /uploads through the API origin, which would break a /public path.
 *
 * A file that is not there is treated exactly like no src at all. That case
 * used to be impossible, because every path came out of a hand-written list of
 * files that existed; paths are derived from ids now, so it is routine.
 */
export const WhiteoutItemIcon = ({ src, size = 'md', reserve }: WhiteoutItemIconProps) => {
  // Two separate reasons an image may not load, handled in one place.
  //
  // The path is built from the item's id, so a path exists for every item and
  // the art behind it may not: that ends as nothing, exactly like a null src.
  //
  // And the extension in that path is a guess, because the folder mixes webp
  // and png. So the first failure retries the other format and only the second
  // gives up. `useIconSrc` holds both rules.
  const resolved = useIconSrc(src);
  const className = `${classes.icon} ${size === 'sm' ? classes.sm : classes.md}`;
  if (!resolved.src) return reserve ? <span className={className} aria-hidden="true" /> : null;
  return (
    <img
      key={resolved.src}
      className={className}
      src={resolved.src}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={resolved.onError}
      onLoad={resolved.onLoad}
    />
  );
};
