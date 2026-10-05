/** Shared shapes for Whiteout Survival points events. */

export interface ScoringRow {
  id: string;
  label: string;
  /**
   * Points per one unit. Omit when the row is scored through the group's
   * `pointsPerSourceValue` instead, in which case `sourceValue` carries the
   * underlying game number.
   */
  pointsPerUnit?: number;
  /**
   * The raw in-game value this row contributes, for rows that are not scored
   * directly. Chief Gear is the case that needs this: the game lists a gear
   * score per level up, and the event pays a flat rate per 1 gear score.
   */
  sourceValue?: number;
}

export interface ScoringGroup {
  id: string;
  label: string;
  note?: string;
  /**
   * When set, a row in this group scores `sourceValue * pointsPerSourceValue`.
   * Keeping the rate separate means a change to it is a one line edit instead
   * of rewriting every row.
   */
  pointsPerSourceValue?: number;
  /** Label for the unit, shown next to the input. Defaults to a plain count. */
  unitLabel?: string;
  rows: ScoringRow[];
}

export interface EventDay {
  day: number;
  label: string;
  groups: ScoringGroup[];
}

/**
 * The per-day reward track an event runs alongside its scoring.
 *
 * Most events pay a fixed reward for passing point targets on each day, which
 * is why a day left on zero forfeits something no matter how large the total
 * is. The targets are the part that is hard to get: they move with a state's
 * age in at least some events, so they are kept optional and nullable rather
 * than guessed at.
 */
export interface DailyMilestones {
  /** How many targets each day carries. */
  perDay: number;
  /** Points for each target, in order, or null when nobody has captured them. */
  points: number[] | null;
  /**
   * Roughly what the top target costs, where the exact figures are unknown.
   *
   * An estimate, and treated as one: it is what the planner aims a day at, not
   * something it reports as fact. Replace it with `points` the moment the real
   * numbers are read off the event panel.
   */
  estimatedTop?: number;
  /** Where the numbers came from, or why there are none. */
  note: string;
}

/**
 * The ladder an event ranks players on when it closes.
 *
 * The second reason points matter. Milestones pay everyone who passes them;
 * this pays only the top few, and usually only above a floor. Worth modelling
 * because it changes what "enough points" means: below the floor the ladder is
 * worth nothing at all, and above it every band is a step change rather than a
 * gradient.
 */
export interface RankingRewards {
  /** How many places are paid at all. */
  paidPlaces: number;
  /** Points needed before a place counts for anything. */
  minimumPoints: number;
  /** The bands, best first, as inclusive rank ranges. */
  bands: { from: number; to: number }[];
  note: string;
}

/** Where a point table's numbers came from, so the UI can be honest about it. */
export type PointsEventSource = 'in-game' | 'community';

export interface PointsEvent {
  id: string;
  name: string;
  season: string;
  source: PointsEventSource;
  sourceLabel: string;
  sourceUrl?: string;
  /** Anything known to be missing or unverified in this table. */
  caveats?: string[];
  /** The daily reward track, where the event has one. */
  dailyMilestones?: DailyMilestones;
  /** The ladder paid out when the event closes, where there is one. */
  rankingRewards?: RankingRewards;
  days: EventDay[];
}

/** Points per unit for a row, resolving the group's rate when it uses one. */
export const rowPointsPerUnit = (group: ScoringGroup, row: ScoringRow): number => {
  if (typeof row.pointsPerUnit === 'number') return row.pointsPerUnit;
  if (typeof row.sourceValue === 'number' && typeof group.pointsPerSourceValue === 'number') {
    return row.sourceValue * group.pointsPerSourceValue;
  }
  return 0;
};
