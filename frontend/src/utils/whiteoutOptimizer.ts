import {
  WHITEOUT_RESOURCES,
  type BuildingTable,
  type ResourceStock,
  type WhiteoutResource,
} from '../data/whiteoutBuildings';
import { allPrereqs } from './whiteoutLevels';

/**
 * Works out which upgrades to run to gain the most building power from a fixed
 * stock of resources and speedups.
 *
 * This is a multi-dimensional knapsack with prerequisites, which has no cheap
 * exact solution, so it uses a greedy strategy: repeatedly take whichever
 * upgrade buys the most power per unit of scarcity, where scarcity is measured
 * against what the player actually holds rather than an absolute price. An
 * upgrade that is blocked by prerequisites is considered as a bundle together
 * with everything needed to unlock it, so a cheap-but-unrewarding prerequisite
 * never stops a valuable upgrade from being found.
 */

export interface OptimizerInput {
  /** Current level label per building slug. Missing means "not built". */
  currentLevels: Record<string, string>;
  stock: ResourceStock;
  /** Speedups usable only for construction, in minutes. */
  constructionSpeedupMinutes: number;
  /** Speedups usable for anything, in minutes. */
  generalSpeedupMinutes: number;
  /** Construction speed buff, as a percentage. 120 means +120%. */
  buffPercent: number;
  /**
   * Flat seconds removed from each upgrade after the speed buff, for Agnes's
   * Project Management. Applied per upgrade, never below zero.
   */
  flatSecondsOff?: number;
  /** Fraction off the listed cost of `discountResources`, e.g. 0.15 for Zinman Lv5. */
  costDiscount?: number;
  discountResources?: WhiteoutResource[];
}

export interface PlannedStep {
  slug: string;
  name: string;
  fromLevel: string;
  toLevel: string;
  power: number;
  baseSeconds: number;
  buffedSeconds: number;
  cost: ResourceStock;
}

export interface OptimizerResult {
  steps: PlannedStep[];
  powerGained: number;
  secondsUsed: number;
  resourcesUsed: ResourceStock;
  remaining: ResourceStock;
  secondsAvailable: number;
  secondsRemaining: number;
  /** Final level per building after running the plan. */
  finalLevels: Record<string, string>;
  /** What ran out first, which is the thing worth topping up. */
  limitingFactors: string[];
}

const EMPTY: ResourceStock = {};

/**
 * The game's formula is New Time = Original / (1 + sumOfPercentages / 100).
 * Agnes takes flat hours off, which is applied afterwards, on the already
 * buffed time. An upgrade shorter than her reduction finishes instantly.
 */
export const applySpeedBuff = (seconds: number, buffPercent: number, flatSecondsOff = 0) => {
  const multiplier = 1 + Math.max(buffPercent, -99) / 100;
  return Math.max(0, seconds / multiplier - Math.max(flatSecondsOff, 0));
};

/** Rounded up, so a discount never overstates what a stock can buy. */
const discountCost = (
  cost: ResourceStock,
  fraction: number,
  resources: WhiteoutResource[]
): ResourceStock => {
  if (!fraction) return cost;
  const out: ResourceStock = { ...cost };
  for (const r of resources) {
    const v = out[r];
    if (v) out[r] = Math.ceil(v * (1 - fraction));
  }
  return out;
};

const levelIndex = (table: BuildingTable, level: string | undefined) => {
  if (!level) return -1;
  const i = table.levels.findIndex(l => l.level === level);
  return i;
};

/** True once `have` is at or past `needed` in this building's level order. */
const meetsLevel = (table: BuildingTable, have: string | undefined, needed: string) => {
  const haveIdx = levelIndex(table, have);
  const needIdx = levelIndex(table, needed);
  // A prerequisite level the table does not list cannot be checked; treat it as
  // met rather than blocking the whole plan on missing data.
  if (needIdx < 0) return true;
  return haveIdx >= needIdx;
};

/**
 * Every step needed to take `slug` one level past its current position,
 * including steps on other buildings to satisfy prerequisites.
 * Returns null when it cannot be resolved (missing data or a cycle).
 */
function resolveBundle(
  tables: Map<string, BuildingTable>,
  levels: Record<string, string>,
  slug: string,
  visiting: Set<string>,
  depth = 0,
  discount = 0,
  discountResources: WhiteoutResource[] = []
): PlannedStep[] | null {
  if (depth > 40) return null;
  const table = tables.get(slug);
  if (!table) return null;

  const currentIdx = levelIndex(table, levels[slug]);
  const nextIdx = currentIdx + 1;
  if (nextIdx >= table.levels.length) return null;

  const key = `${slug}:${nextIdx}`;
  if (visiting.has(key)) return null;
  visiting.add(key);

  const target = table.levels[nextIdx];
  const bundle: PlannedStep[] = [];
  // Prerequisites are resolved against a scratch copy so partial work is not
  // committed if the bundle turns out to be impossible.
  const scratch = { ...levels };

  // The tables only print the level cap where the wiki happened to show it, so
  // the implied gates are merged in. Without this the planner will happily take
  // the Command Center past the Embassy.
  for (const prereq of allPrereqs(slug, target.level, target.prereqs)) {
    const prereqTable = tables.get(prereq.slug);
    if (!prereqTable) continue;
    let guard = 0;
    while (!meetsLevel(prereqTable, scratch[prereq.slug], prereq.level)) {
      if (guard++ > 100) {
        visiting.delete(key);
        return null;
      }
      const sub = resolveBundle(
        tables, scratch, prereq.slug, visiting, depth + 1, discount, discountResources
      );
      if (!sub) {
        visiting.delete(key);
        return null;
      }
      for (const step of sub) {
        bundle.push(step);
        scratch[step.slug] = step.toLevel;
      }
    }
  }

  const fromIdx = levelIndex(table, scratch[slug]);
  const stepIdx = fromIdx + 1;
  if (stepIdx >= table.levels.length) {
    visiting.delete(key);
    return null;
  }
  const to = table.levels[stepIdx];
  const fromPower = fromIdx >= 0 ? table.levels[fromIdx].power : 0;

  bundle.push({
    slug,
    name: table.name,
    fromLevel: fromIdx >= 0 ? table.levels[fromIdx].level : 'none',
    toLevel: to.level,
    power: to.power - fromPower,
    baseSeconds: to.seconds,
    buffedSeconds: to.seconds,
    cost: discountCost(to.cost, discount, discountResources),
  });

  visiting.delete(key);
  return bundle;
}

const addCost = (into: ResourceStock, from: ResourceStock) => {
  for (const r of WHITEOUT_RESOURCES) {
    const v = from[r];
    if (v) into[r] = (into[r] ?? 0) + v;
  }
};

const affordable = (remaining: ResourceStock, cost: ResourceStock) =>
  WHITEOUT_RESOURCES.every(r => (cost[r] ?? 0) <= (remaining[r] ?? 0));

export function optimizeUpgrades(
  tablesList: BuildingTable[],
  input: OptimizerInput
): OptimizerResult {
  const tables = new Map(tablesList.map(t => [t.slug, t]));
  const levels: Record<string, string> = { ...input.currentLevels };

  const remaining: ResourceStock = {};
  for (const r of WHITEOUT_RESOURCES) remaining[r] = Math.max(input.stock[r] ?? 0, 0);

  const secondsAvailable =
    (Math.max(input.constructionSpeedupMinutes, 0) + Math.max(input.generalSpeedupMinutes, 0)) * 60;
  let secondsLeft = secondsAvailable;

  const steps: PlannedStep[] = [];
  const resourcesUsed: ResourceStock = {};
  const blockedBy = new Set<string>();

  // Scarcity is measured against the starting stock so the ranking stays stable
  // as the plan is built, rather than swinging wildly as a resource drains.
  const scale: Record<string, number> = {};
  for (const r of WHITEOUT_RESOURCES) scale[r] = remaining[r] || 0;

  for (let iteration = 0; iteration < 5000; iteration++) {
    let best: { bundle: PlannedStep[]; ratio: number } | null = null;

    for (const table of tablesList) {
      const bundle = resolveBundle(
        tables, levels, table.slug, new Set(), 0,
        input.costDiscount ?? 0, input.discountResources ?? []
      );
      if (!bundle || !bundle.length) continue;

      const cost: ResourceStock = {};
      let power = 0;
      let seconds = 0;
      for (const step of bundle) {
        addCost(cost, step.cost);
        power += step.power;
        seconds += applySpeedBuff(step.baseSeconds, input.buffPercent, input.flatSecondsOff);
      }

      if (!affordable(remaining, cost)) {
        for (const r of WHITEOUT_RESOURCES) {
          if ((cost[r] ?? 0) > (remaining[r] ?? 0)) blockedBy.add(r);
        }
        continue;
      }
      if (seconds > secondsLeft) {
        blockedBy.add('time');
        continue;
      }
      if (power <= 0) continue;

      // Fraction of the player's holdings this bundle consumes, summed across
      // resources plus time. Lower is better value.
      let burden = 0;
      for (const r of WHITEOUT_RESOURCES) {
        const c = cost[r] ?? 0;
        if (!c) continue;
        burden += scale[r] > 0 ? c / scale[r] : 1;
      }
      burden += secondsAvailable > 0 ? seconds / secondsAvailable : 0;

      const ratio = burden > 0 ? power / burden : power;
      if (!best || ratio > best.ratio) best = { bundle, ratio };
    }

    if (!best) break;

    for (const step of best.bundle) {
      const buffed = applySpeedBuff(step.baseSeconds, input.buffPercent, input.flatSecondsOff);
      steps.push({ ...step, buffedSeconds: buffed });
      levels[step.slug] = step.toLevel;
      secondsLeft -= buffed;
      for (const r of WHITEOUT_RESOURCES) {
        const c = step.cost[r] ?? 0;
        if (!c) continue;
        remaining[r] = (remaining[r] ?? 0) - c;
        resourcesUsed[r] = (resourcesUsed[r] ?? 0) + c;
      }
    }
  }

  return {
    steps,
    powerGained: steps.reduce((s, x) => s + x.power, 0),
    secondsUsed: steps.reduce((s, x) => s + x.buffedSeconds, 0),
    resourcesUsed,
    remaining,
    secondsAvailable,
    secondsRemaining: Math.max(0, secondsLeft),
    finalLevels: levels,
    limitingFactors: [...blockedBy],
  };
}

/** Collapses consecutive steps on one building into a single from/to row. */
export function summariseSteps(steps: PlannedStep[]) {
  const out: (PlannedStep & { count: number })[] = [];
  for (const step of steps) {
    const last = out[out.length - 1];
    if (last && last.slug === step.slug && last.toLevel === step.fromLevel) {
      last.toLevel = step.toLevel;
      last.power += step.power;
      last.baseSeconds += step.baseSeconds;
      last.buffedSeconds += step.buffedSeconds;
      last.count += 1;
      const merged: ResourceStock = { ...last.cost };
      addCost(merged, step.cost);
      last.cost = merged;
    } else {
      out.push({ ...step, cost: { ...step.cost }, count: 1 });
    }
  }
  return out;
}

export { EMPTY as EMPTY_STOCK };
export type { WhiteoutResource };
