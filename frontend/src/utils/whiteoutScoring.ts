import { rowPointsPerUnit } from '../models/whiteoutInterface';
import type { PointsEvent, ScoringGroup } from '../models/whiteoutInterface';
import type { BuildingTable } from '../data/whiteoutBuildings';

/** Quantities the user has entered, keyed by `${day}.${groupId}.${rowId}`. */
export type Quantities = Record<string, number>;

export const rowKey = (day: number, groupId: string, rowId: string) => `${day}.${groupId}.${rowId}`;

const amount = (quantities: Quantities, key: string) => {
  const value = quantities[key];
  return Number.isFinite(value) && value > 0 ? value : 0;
};

export function scoreGroup(day: number, group: ScoringGroup, quantities: Quantities): number {
  return group.rows.reduce(
    (sum, row) =>
      sum + amount(quantities, rowKey(day, group.id, row.id)) * rowPointsPerUnit(group, row),
    0
  );
}

export function scoreDay(event: PointsEvent, day: number, quantities: Quantities): number {
  const eventDay = event.days.find(d => d.day === day);
  if (!eventDay) return 0;
  return eventDay.groups.reduce((sum, group) => sum + scoreGroup(day, group, quantities), 0);
}

export function scoreEvent(event: PointsEvent, quantities: Quantities) {
  const perDay: Record<number, number> = {};
  for (const eventDay of event.days) {
    perDay[eventDay.day] = scoreDay(event, eventDay.day, quantities);
  }
  const total = Object.values(perDay).reduce((sum, n) => sum + n, 0);
  return { perDay, total };
}

/* ------------------------------------------------------------------ *
 * Construction planner
 *
 * Hall of Chiefs scores power gained, not upgrades completed, so the
 * useful question is "how much power do my speedups actually buy me?".
 * A construction speed buff divides build time, which is what decides
 * how far a fixed speedup stock stretches.
 * ------------------------------------------------------------------ */

export interface UpgradeSelection {
  slug: string;
  /** Level labels as they appear in the building table, e.g. "24" or "FC 1-2". */
  fromLevel: string;
  toLevel: string;
}

export interface PlannedUpgrade {
  slug: string;
  name: string;
  fromLevel: string;
  toLevel: string;
  power: number;
  baseSeconds: number;
  buffedSeconds: number;
}

export interface ConstructionPlan {
  upgrades: PlannedUpgrade[];
  /** Total building power gained, which is what Day 1 and Day 5 score. */
  powerGained: number;
  baseSeconds: number;
  /** Build time after the speed buff is applied. */
  buffedSeconds: number;
  speedupSecondsAvailable: number;
  /** True when the speedup stock covers the buffed build time. */
  affordable: boolean;
  shortfallSeconds: number;
}

/**
 * A speed buff divides build time: +120% means the job runs at 2.2x speed.
 * Negative or nonsense input is clamped so the UI can never produce Infinity.
 */
export const applySpeedBuff = (seconds: number, buffPercent: number) => {
  const multiplier = 1 + Math.max(buffPercent, -99) / 100;
  return seconds / multiplier;
};

export function planConstruction(
  buildings: BuildingTable[],
  selections: UpgradeSelection[],
  buffPercent: number,
  speedupMinutes: number
): ConstructionPlan {
  const upgrades: PlannedUpgrade[] = [];

  for (const selection of selections) {
    const building = buildings.find(b => b.slug === selection.slug);
    if (!building) continue;

    const from = building.levels.findIndex(l => l.level === selection.fromLevel);
    const to = building.levels.findIndex(l => l.level === selection.toLevel);
    if (from < 0 || to < 0 || to <= from) continue;

    // `power` is the cumulative total at a level, so the gain is the difference.
    // `seconds` is the time to build that one level, so the cost is the sum of
    // every level actually passed through.
    const span = building.levels.slice(from + 1, to + 1);
    const baseSeconds = span.reduce((sum, l) => sum + l.seconds, 0);

    upgrades.push({
      slug: building.slug,
      name: building.name,
      fromLevel: selection.fromLevel,
      toLevel: selection.toLevel,
      power: building.levels[to].power - building.levels[from].power,
      baseSeconds,
      buffedSeconds: applySpeedBuff(baseSeconds, buffPercent),
    });
  }

  const baseSeconds = upgrades.reduce((sum, u) => sum + u.baseSeconds, 0);
  const buffedSeconds = upgrades.reduce((sum, u) => sum + u.buffedSeconds, 0);
  const speedupSecondsAvailable = Math.max(speedupMinutes, 0) * 60;

  return {
    upgrades,
    powerGained: upgrades.reduce((sum, u) => sum + u.power, 0),
    baseSeconds,
    buffedSeconds,
    speedupSecondsAvailable,
    affordable: buffedSeconds <= speedupSecondsAvailable,
    shortfallSeconds: Math.max(0, buffedSeconds - speedupSecondsAvailable),
  };
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0m';
  const total = Math.round(seconds);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes || !parts.length) parts.push(`${minutes}m`);
  return parts.join(' ');
}

/**
 * Speedup minutes a plan can actually absorb.
 *
 * `secondsUsed` counts the work the plan COMPLETES, which is the right answer
 * only when resources ran out: nothing further can be started, so leftover
 * speedups have nowhere to go.
 *
 * When the plan ran out of TIME instead, it stopped short of finishing another
 * job that it could still start, and a part-finished job absorbs minutes just
 * as well. The scoring rows pay per minute spent, not per job completed, so in
 * that case the whole pile is spendable.
 */
export const usableSpeedupMinutes = (
  plan: { secondsUsed: number; limitingFactors: string[] },
  heldMinutes: number
) => (plan.limitingFactors.includes('time') ? heldMinutes : Math.floor(plan.secondsUsed / 60));
