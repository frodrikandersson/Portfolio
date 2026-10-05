import { useEffect, useState } from 'react';
import { otherImageFormat } from '../../data/whiteoutItemIcons';

/**
 * What we have already learned about a path, remembered for the session.
 *
 * WITHOUT THIS, HALF THE ART RELOADED EVERY TIME A CARD OPENED. Paths are
 * built saying .webp and 72 of the 150 item files are .png, as are all 18
 * buildings and all 10 expert portraits. Each of those asked for the webp,
 * got the SPA's index.html back, failed to decode it, and only then tried the
 * png. That is a wasted request and a visible flash, and it happened again on
 * every single mount, so collapsing a card and reopening it did the whole
 * dance a second time.
 *
 * Now the answer is kept: the retry happens at most once per path for as long
 * as the page is open, and a reopened card renders its icons straight away.
 *
 * Module level rather than React state on purpose. It has to outlive the
 * components that discover it, which is the entire point.
 */
const resolved = new Map<string, string | null>();

/**
 * Picks the image path to actually use, and copes with the two ways one fails.
 *
 * THE FORMAT IS A GUESS. The art folder holds a mix of webp and png, and which
 * is which changes whenever a batch gets re-exported. Paths are built saying
 * webp; if that does not load, this retries the same path as png before giving
 * up. So converting a file's format needs no code change, which a hardcoded
 * list of formats would not have given us.
 *
 * THE ART MAY NOT EXIST AT ALL. Paths are derived from an item's id, so a path
 * exists for every item whether or not anyone has drawn it. Once both formats
 * have failed the caller gets a null src and renders text alone.
 *
 * It has to be an error handler rather than a HEAD check: a missing file under
 * public is answered with the SPA fallback, a 200 carrying index.html, so the
 * status code says nothing. The browser still cannot decode it as an image, so
 * `error` fires either way.
 */
export const useIconSrc = (src: string | null | undefined) => {
  // Seeded from what is already known, so a path this session has seen before
  // renders correctly on the first paint rather than after a failed request.
  const [tried, setTried] = useState<string | null>(() =>
    src && resolved.has(src) ? resolved.get(src)! : null
  );
  const [dead, setDead] = useState(() => (src ? resolved.get(src) === null : false));

  // A new src is a fresh start: without this, one missing icon would poison
  // the next item to reuse the same element.
  useEffect(() => {
    if (src && resolved.has(src)) {
      const known = resolved.get(src)!;
      setTried(known);
      setDead(known === null);
      return;
    }
    setTried(null);
    setDead(false);
  }, [src]);

  if (!src || dead) return { src: null as string | null, onError: () => {} };

  const current = tried ?? src;
  return {
    src: current,
    onError: () => {
      const alternative = tried ? null : otherImageFormat(src);
      if (alternative) {
        resolved.set(src, alternative);
        setTried(alternative);
      } else {
        resolved.set(src, null);
        setDead(true);
      }
    },
    // Called by the image once it loads, so a path that worked first time is
    // remembered too and never re-guessed.
    onLoad: () => {
      if (!resolved.has(src)) resolved.set(src, current === src ? src : current);
    },
  };
};
