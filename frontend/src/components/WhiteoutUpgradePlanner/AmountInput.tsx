import { useId, useState, type ReactNode } from 'react';
import { parseAmount, formatAmount } from '../../utils/whiteoutFormat';
import classes from './WhiteoutUpgradePlanner.module.css';
import { WhiteoutItemIcon } from '../WhiteoutItemIcon/WhiteoutItemIcon';

interface AmountInputProps {
  label: string;
  /** Game art for the item this counts, when there is any. */
  icon?: string | null;
  /** Keep the icon's space in a list where the others have one. */
  reserveIcon?: boolean;
  hint?: string;
  /** The full explanation, shown on hover when the hint is too short to carry it. */
  title?: string;
  value: number;
  onChange: (value: number) => void;
  /** Small counts like rally slots read better as plain digits. */
  plain?: boolean;
  /** A question mark and panel, for fields the game never shows in one place. */
  help?: ReactNode;
}

/**
 * A number field that understands shorthand: 1b, 2.5m, 300k.
 *
 * While focused it shows exactly what was typed, so editing "1b" does not fight
 * the formatter. On blur it snaps back to canonical shorthand.
 */
export const AmountInput = ({
  label,
  icon,
  reserveIcon,
  hint,
  title,
  value,
  onChange,
  plain,
  help,
}: AmountInputProps) => {
  const [draft, setDraft] = useState<string | null>(null);
  const display = plain ? (value ? String(value) : '') : formatAmount(value);
  const invalid = draft !== null && Number.isNaN(parseAmount(draft));
  /*
   * The label has to name its input outright, because a button is a labelable
   * element too. With the help button sitting in the label text, ahead of the
   * input, the browser made THE QUESTION MARK the label's control: every click
   * anywhere in the row, including three hundred pixels away over the number
   * box, was forwarded to it and opened the panel.
   *
   * Naming the input fixes it at the source. Clicking the row focuses the
   * number, clicking the question mark opens the panel, and nothing else does.
   */
  const inputId = useId();

  return (
    <label className={classes.field} title={title} htmlFor={inputId}>
      <span
        className={`${classes.fieldLabel} ${
          icon || reserveIcon ? classes.fieldLabelIcon : ''
        }`}
      >
        <WhiteoutItemIcon src={icon} reserve={reserveIcon} />
        {label}
        {hint && <em className={classes.fieldHint}>{hint}</em>}
        {help}
      </span>
      <input
        id={inputId}
        className={`${classes.input} ${invalid ? classes.inputInvalid : ''}`}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        placeholder="0"
        value={draft ?? display}
        onChange={e => {
          setDraft(e.target.value);
          const parsed = parseAmount(e.target.value);
          if (!Number.isNaN(parsed)) onChange(Math.max(parsed, 0));
        }}
        onFocus={e => {
          setDraft(e.target.value);
          e.target.select();
        }}
        onBlur={() => setDraft(null)}
      />
    </label>
  );
};
