import { useContext, useEffect, useState, type ReactNode } from 'react';
import { CardContext } from './CardContext';
import { cardGaps, cardSignature, describeGaps } from '../../utils/whiteoutCardStatus';
import classes from './WhiteoutUpgradePlanner.module.css';

interface CollapsibleCardProps {
  /** Stable key for remembering whether this card is open. */
  id: string;
  title: string;
  /** Extra card classes, for the wide cards that use buildingsCard. */
  className?: string;
  children: ReactNode;
}

const OPEN_KEY = 'whiteoutCardsOpen';
const IGNORED_KEY = 'whiteoutCardsIgnored';

type ByAccount<T> = Record<string, Record<string, T>>;

/**
 * Per account, per card, in localStorage.
 *
 * Kept per account for the same reason the inventory is: the accounts are
 * different players. And in localStorage rather than in state, because the
 * calculator lives in a tab and only the active tab is mounted, so switching
 * away and back would otherwise undo everything the player had set.
 *
 * Every access is wrapped. Private windows and blocked site data make these
 * throw, and a form this long has to keep working when they do.
 */
const readStore = <T,>(key: string): ByAccount<T> => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === 'object' ? (parsed as ByAccount<T>) : {};
  } catch {
    return {};
  }
};

const writeStore = <T,>(key: string, accountId: string, id: string, value: T) => {
  try {
    const all = readStore<T>(key);
    localStorage.setItem(
      key,
      JSON.stringify({ ...all, [accountId]: { ...all[accountId], [id]: value } })
    );
  } catch {
    /* Nothing to do: the card still works, it just will not be remembered. */
  }
};

const readOpen = (accountId: string, id: string): boolean | undefined => {
  const value = readStore<boolean>(OPEN_KEY)[accountId]?.[id];
  return typeof value === 'boolean' ? value : undefined;
};

/**
 * The card stamp a dismissed warning was remembered against, if any.
 *
 * Storing the stamp rather than a plain "ignored" flag is what makes the
 * dismissal undo itself: the warning stays hidden only while the card still
 * holds exactly what it held when the player said to leave it alone. Edit any
 * field on that card and the stamp no longer matches, so the warning is back
 * without anything having to watch for the edit.
 */
const readIgnored = (accountId: string, id: string): string | undefined => {
  const value = readStore<string>(IGNORED_KEY)[accountId]?.[id];
  return typeof value === 'string' ? value : undefined;
};

/**
 * An inventory card whose whole top bar collapses it.
 *
 * Closed by default. Fifteen cards fully expanded is several screens of fields
 * with no shape to them, and a new player cannot see what the form is even
 * asking for. Closed, the whole thing reads as a short list of the fifteen
 * things the calculator wants, each saying how much of it is still blank.
 *
 * The header is a button rather than a heading with a click handler, so it is
 * reachable by keyboard and announces its state. The Ignore control is a
 * SIBLING of that button, not inside it: a button within a button is invalid
 * markup, and dismissing a warning should not also open the card.
 */
export const CollapsibleCard = ({ id, title, className = '', children }: CollapsibleCardProps) => {
  const { accountId, inventory } = useContext(CardContext);
  const [open, setOpen] = useState(() => readOpen(accountId, id) ?? false);

  /**
   * Whether this card has ever been opened.
   *
   * Once it has, its contents stay mounted and are hidden rather than thrown
   * away. Unmounting destroyed every image inside, so closing a card and
   * reopening it re-fetched and re-decoded the lot, which is what made the
   * icons visibly reload on every toggle.
   *
   * Not mounted up front for all fifteen: the heavy cards are thousands of
   * option elements between them, and a player who never opens Chief Gear
   * should not pay for its 900 options on first paint.
   */
  const [everOpened, setEverOpened] = useState(open);
  const [ignoredAt, setIgnoredAt] = useState(() => readIgnored(accountId, id));

  // Switching account has to re-read both, and the initialisers above only run
  // on mount. Without this a new account inherited whatever the previous one
  // had closed and dismissed, which is the opposite of keeping it per account.
  useEffect(() => {
    const next = readOpen(accountId, id) ?? false;
    setOpen(next);
    if (next) setEverOpened(true);
    setIgnoredAt(readIgnored(accountId, id));
  }, [accountId, id]);

  const gaps = inventory ? cardGaps(inventory, id) : [];
  const signature = inventory ? cardSignature(inventory, id) : '';
  // Dismissed, and nothing on the card has moved since.
  const ignored = ignoredAt !== undefined && ignoredAt === signature;
  const showWarning = gaps.length > 0 && !ignored;

  const toggle = () => {
    setOpen(prev => {
      writeStore(OPEN_KEY, accountId, id, !prev);
      if (!prev) setEverOpened(true);
      return !prev;
    });
  };

  const dismiss = () => {
    writeStore(IGNORED_KEY, accountId, id, signature);
    setIgnoredAt(signature);
  };

  return (
    <section className={`${classes.card} ${className} ${ignored ? classes.cardQuiet : ''}`}>
      <div className={classes.cardBar}>
        <button type="button" className={classes.cardHeader} onClick={toggle} aria-expanded={open}>
          <h3>{title}</h3>
          <span className={classes.cardCaret} aria-hidden="true">
            {open ? '▾' : '▸'}
          </span>
        </button>

        {/* The badge and its dismiss go together, and both disappear together:
            once a warning is ignored there is nothing left to ignore. */}
        {showWarning && (
          <span className={classes.cardWarning}>
            <span className={classes.cardEmptyBadge} title={describeGaps(gaps, title)}>
              <span aria-hidden="true">{gaps.length > 99 ? '99+' : gaps.length}</span>
              <span className={classes.srOnly}>{describeGaps(gaps, title)}</span>
            </span>
            <button
              type="button"
              className={classes.linkButton}
              onClick={dismiss}
              title={`Hide this until something under ${title} changes.`}
            >
              Ignore
            </button>
          </span>
        )}
      </div>
      {/* Hidden, not removed, so the images inside survive a collapse. The
          attribute is enough: `hidden` content is not rendered, not focusable
          and not read out, but it stays in the document. */}
      {everOpened && <div hidden={!open}>{children}</div>}
    </section>
  );
};
