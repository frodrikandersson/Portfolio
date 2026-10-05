/**
 * Shorthand number entry, so a player can type "1b" instead of 1000000000.
 *
 * Accepts k / m / b / t suffixes and both decimal conventions: "25.3" and
 * "25,3" mean the same thing. That matters because a comma is a thousands
 * separator in some locales and a decimal point in others, and the app renders
 * large numbers with spaces, which people paste straight back in.
 */

const MULTIPLIERS: Record<string, number> = {
  '': 1,
  k: 1e3,
  m: 1e6,
  b: 1e9,
  t: 1e12,
};

/**
 * Decides whether a comma is a decimal point or a thousands separator, using
 * the usual rule: a single comma followed by at most two digits is a decimal
 * point ("25,3"), anything else is grouping ("1,500", "1,000,000").
 */
function normaliseSeparators(input: string): string {
  const lastDot = input.lastIndexOf('.');
  const lastComma = input.lastIndexOf(',');

  if (lastDot >= 0 && lastComma >= 0) {
    // Both present: whichever comes last is the decimal point.
    const decimalIsComma = lastComma > lastDot;
    const stripped = input.replace(decimalIsComma ? /\./g : /,/g, '');
    return decimalIsComma ? stripped.replace(',', '.') : stripped;
  }

  if (lastComma >= 0) {
    const commaCount = (input.match(/,/g) ?? []).length;
    const afterComma = input.slice(lastComma + 1).replace(/[^\d]/g, '');
    const isDecimal = commaCount === 1 && afterComma.length <= 2;
    return isDecimal ? input.replace(',', '.') : input.replace(/,/g, '');
  }

  return input;
}

/** Returns NaN when the text cannot be read as a number. */
export function parseAmount(raw: string): number {
  const trimmed = raw.trim().replace(/[\s_]/g, '');
  if (!trimmed) return 0;
  const cleaned = normaliseSeparators(trimmed);
  // A trailing separator is allowed so a half-typed "25." is not rejected
  // while the player is still reaching for the next digit.
  const match = /^(\d+(?:\.\d*)?|\.\d+)([kmbt]?)$/i.exec(cleaned);
  if (!match) return NaN;
  const value = Number.parseFloat(match[1]);
  if (!Number.isFinite(value)) return NaN;
  return value * MULTIPLIERS[match[2].toLowerCase()];
}

/**
 * Renders a number back as compact shorthand, so a field the player typed "1b"
 * into does not read back as an unreadable wall of zeroes.
 */
export function formatAmount(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '';
  const abs = Math.abs(value);
  const units: [number, string][] = [
    [1e12, 't'],
    [1e9, 'b'],
    [1e6, 'm'],
    [1e3, 'k'],
  ];
  for (const [size, suffix] of units) {
    if (abs >= size) {
      const scaled = value / size;
      // Keep up to two decimals, but drop trailing zeroes so 1.00b reads "1b".
      const text = scaled.toFixed(2).replace(/\.?0+$/, '');
      return `${text}${suffix}`;
    }
  }
  // Below 1000, keep the player's precision rather than rounding a buff like
  // 25.3% down to 25.
  return String(Number(value.toFixed(4)));
}

/**
 * Full number with thousands separators, for display rather than entry.
 *
 * Anything that is not a real number reads as 0 rather than printing "NaN" at
 * the player. A stored value can come back as null or a string from an older
 * save, and a stray NaN should not leak into a points total on screen.
 */
export const formatFull = (value: number) =>
  Number.isFinite(value) ? Math.round(value).toLocaleString() : '0';
