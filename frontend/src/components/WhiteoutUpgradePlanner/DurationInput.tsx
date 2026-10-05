import classes from './WhiteoutUpgradePlanner.module.css';
import { WhiteoutItemIcon } from '../WhiteoutItemIcon/WhiteoutItemIcon';

interface DurationInputProps {
  label: string;
  /** Game art for this speedup pile. */
  icon?: string | null;
  /** Total minutes. */
  value: number;
  onChange: (minutes: number) => void;
}

const MINUTES_PER_DAY = 24 * 60;

/**
 * Speedups are shown in game as "2 day(s) 14 hr(s) 14 min", so they are entered
 * the same way here rather than forced into a fraction of a day. The value is
 * kept as whole minutes.
 */
export const DurationInput = ({ label, icon, value, onChange }: DurationInputProps) => {
  const total = Math.max(Math.round(value), 0);
  const days = Math.floor(total / MINUTES_PER_DAY);
  const hours = Math.floor((total % MINUTES_PER_DAY) / 60);
  const minutes = total % 60;

  const set = (d: number, h: number, m: number) =>
    onChange(Math.max(d, 0) * MINUTES_PER_DAY + Math.max(h, 0) * 60 + Math.max(m, 0));

  const part = (
    partLabel: string,
    partValue: number,
    max: number | undefined,
    apply: (n: number) => void
  ) => (
    <span className={classes.durationPart}>
      <input
        className={`${classes.input} ${classes.durationField}`}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="0"
        value={partValue || ''}
        aria-label={`${label} ${partLabel}`}
        onChange={e => {
          const n = Number(e.target.value.replace(/[^\d]/g, ''));
          if (!Number.isFinite(n)) return;
          apply(max === undefined ? n : Math.min(n, max));
        }}
      />
      <span className={classes.durationUnit}>{partLabel}</span>
    </span>
  );

  return (
    <div className={classes.field}>
      <span className={`${classes.fieldLabel} ${icon ? classes.fieldLabelIcon : ''}`}>
        {/* The five speedup icons differ only by a small emblem in one corner,
            a hammer against a microscope, so full size is the minimum that
            tells them apart. */}
        <WhiteoutItemIcon src={icon} />
        {label}
      </span>
      <span className={classes.duration}>
        {part('d', days, undefined, n => set(n, hours, minutes))}
        {part('h', hours, 23, n => set(days, n, minutes))}
        {part('m', minutes, 59, n => set(days, hours, n))}
      </span>
    </div>
  );
};
