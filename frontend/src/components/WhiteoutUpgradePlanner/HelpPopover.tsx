import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import classes from './WhiteoutUpgradePlanner.module.css';

interface HelpPopoverProps {
  /** Read out in place of the question mark. */
  label: string;
  children: ReactNode;
}

/** Kept clear of the window edge by this much. */
const EDGE = 8;

/**
 * A question mark that opens a short panel of instructions.
 *
 * For the handful of fields that ask for a number the game never shows in one
 * place. "Construction speed buff %" is the worst of them: the figure is the
 * sum of a research node, an alliance tech, a hero skill and a VIP tier, each
 * read off a different screen, and some of them must be left out because this
 * form collects them separately. That does not fit in a hint, and putting it
 * in a paragraph under the field is what made this card wall-to-wall text.
 *
 * Closes on Escape and on a click outside, because a panel you cannot dismiss
 * without hunting for the same small button is worse than a tooltip.
 */
export const HelpPopover = ({ label, children }: HelpPopoverProps) => {
  const [open, setOpen] = useState(false);
  const [shift, setShift] = useState(0);
  // Bumped to re-measure a panel that is already open, after a resize.
  const [measured, setMeasured] = useState(0);
  const wrap = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    // A panel left open across a rotation or a window drag has to be placed
    // again, since the measurement it was placed by no longer holds.
    const onResize = () => setMeasured(n => n + 1);
    document.addEventListener('keydown', onKey);
    // Captured, so a click that opens another popover closes this one first.
    document.addEventListener('mousedown', onClick, true);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  /*
   * Slides the panel sideways by however much of it is off screen.
   *
   * These sit in a grid of fields, so the rightmost one opens a panel that
   * would hang off the edge of the window. Flipping it to open leftwards was
   * the first attempt and it only moved the problem: on a phone the same panel
   * then ran off the left edge instead, by 77px. Shifting by the measured
   * overflow is the one approach that cannot pick the wrong side.
   *
   * Layout effect so the correction lands before the first paint.
   */
  useLayoutEffect(() => {
    if (!open) {
      setShift(0);
      return;
    }
    const box = panel.current?.getBoundingClientRect();
    if (!box) return;
    const view = document.documentElement.clientWidth;
    // Undo any shift already applied, so a second pass measures the same edges
    // the first one did rather than compounding its own correction.
    const left = box.left - shift;
    const right = box.right - shift;
    const over = right - (view - EDGE);
    const next = over > 0 ? -Math.min(over, left - EDGE) : 0;
    if (next !== shift) setShift(next);
    // shift is deliberately not a dependency: it is the output of this effect,
    // and reading it back in would make it chase itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, measured]);

  return (
    <span className={classes.helpWrap} ref={wrap}>
      <button
        type="button"
        className={classes.helpButton}
        // The panel lives inside the field's label, so without this the click
        // would fall through and select the number input behind it.
        onClick={e => {
          e.preventDefault();
          setOpen(v => !v);
        }}
        aria-expanded={open}
        aria-label={`Where to find ${label}`}
      >
        ?
      </button>
      {open && (
        <span
          className={classes.helpPanel}
          role="note"
          ref={panel}
          style={shift ? { transform: `translateX(${shift}px)` } : undefined}
        >
          <span className={classes.helpTitle}>{label}</span>
          {children}
        </span>
      )}
    </span>
  );
};
