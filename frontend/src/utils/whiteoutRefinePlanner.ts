// How many Super Refinements to run, and when to stop.
//
// THE GAME'S OWN SCREEN POINTS THE WRONG WAY. It badges Super Refinement II
// "Favored" and shows bigger numbers on both sides of every later tier, and
// the payout genuinely does rise, from 1.45 Refined on average to 3.71. But
// the cost rises faster, 20 Fire Crystals to 160, so the price of a single
// Refined Fire Crystal goes from 13.8 Fire Crystals to 43.1, nearly triple.
//
// Against King of Icefield's rates, 2,000 a Fire Crystal and 30,000 a Refined
// one, a Refined is worth refining for only while it costs under 15 Fire
// Crystals. That is true at tier I and nowhere else:
//
//   tier I     20 crystals -> 43,500 points refined, vs 40,000 raw     +8.8%
//   tier II    50 crystals -> 64,500 points refined, vs 100,000 raw   -35.5%
//   tier V    160 crystals -> 111,300 points refined, vs 320,000 raw  -65.2%
//
// So the useful answer is almost always "do your first twenty refines of the
// week and then stop", and this plans exactly that: it keeps buying refines
// while the next one is worth more than the crystals it eats, and stops the
// moment it is not. The rates come from the event rather than being assumed,
// because an event that paid differently would move the line.
//
// THE COMPARISON HAS A FLOOR THIS DOES NOT MODEL. Both raw and Refined Fire
// Crystals are only spent on building upgrades, so neither scores without an
// upgrade to put them into. Where a player holds more crystals than their
// buildings can absorb, the surplus is worth nothing raw, and refining it is
// better than letting it sit however bad the rate looks. That is called out in
// the plan's notes rather than guessed at, because this planner cannot see how
// much upgrading is left.

import type { PointsEvent } from '../models/whiteoutInterface';
import { rowPointsPerUnit } from '../models/whiteoutInterface';
import {
  REFINES_PER_DAY,
  crystalsPerDay,
  REFINE_RESOURCE_COST,
  SUPER_REFINE_TIERS,
  expectedRefined,
  costPerRefined,
  tierForRefine,
  MAX_WEEKLY_REFINES,
} from '../data/whiteoutCrystalLab';

export interface RefinePlanInput {
  /** Fire Crystals on hand. */
  crystals: number;
  /** Super Refinements already run since Monday, so the tier is right. */
  refinesDone: number;
  /** What the event pays for one Fire Crystal spent on a building. */
  pointsPerCrystal: number;
  /** What it pays for one Refined Fire Crystal. */
  pointsPerRefined: number;
}

export interface PlannedRefineTier {
  tier: number;
  refines: number;
  crystalsSpent: number;
  /** Refined Fire Crystals expected, which is an average and not a promise. */
  refinedGained: number;
  /** Points this run is worth, against what the crystals would have paid raw. */
  pointsGained: number;
  pointsIfSpentRaw: number;
}

export interface RefinePlan {
  byTier: PlannedRefineTier[];
  refines: number;
  crystalsSpent: number;
  refinedGained: number;
  crystalsLeft: number;
  /** Points gained over spending the same crystals straight into buildings. */
  pointsGained: number;
  /** Why it stopped: ran out of crystals, of refines, or of good value. */
  stoppedBecause: 'crystals' | 'weekly-limit' | 'not-worth-it' | 'nothing-to-do';
  /**
   * The basic Refine, which is a separate question and always worth doing.
   *
   * Eight a day turning 200,000 resources into about 2.1 Fire Crystals each.
   * Reported rather than decided, because unlike super refining there is no
   * choice in it: the allowance is free points if the resources are spare.
   */
  daily: {
    refines: number;
    crystals: number;
    resourcesEach: number;
    points: number;
  };
  notes: string[];
}

const dailyRefine = (pointsPerCrystal: number) => ({
  refines: REFINES_PER_DAY,
  crystals: crystalsPerDay(),
  resourcesEach: REFINES_PER_DAY * REFINE_RESOURCE_COST,
  points: crystalsPerDay() * pointsPerCrystal,
});

const empty = (crystals: number, pointsPerCrystal = 0): RefinePlan => ({
  byTier: [],
  refines: 0,
  crystalsSpent: 0,
  refinedGained: 0,
  crystalsLeft: crystals,
  pointsGained: 0,
  stoppedBecause: 'nothing-to-do',
  daily: dailyRefine(pointsPerCrystal),
  notes: [],
});

/**
 * Refines worth running right now.
 *
 * Walked one refine at a time rather than tier by tier, because a week can
 * start part way through a tier and because the crystals can run out mid tier.
 */
export function planRefines(input: RefinePlanInput): RefinePlan {
  const crystals = Math.max(Math.floor(Number(input.crystals) || 0), 0);
  const done = Math.min(Math.max(Math.floor(Number(input.refinesDone) || 0), 0), MAX_WEEKLY_REFINES);
  const perCrystal = Math.max(Number(input.pointsPerCrystal) || 0, 0);
  const perRefined = Math.max(Number(input.pointsPerRefined) || 0, 0);

  if (crystals <= 0 || perRefined <= 0) return empty(crystals, perCrystal);

  const plan = empty(crystals, perCrystal);
  const byTier = new Map<number, PlannedRefineTier>();
  let left = crystals;
  let next = done + 1;

  for (;;) {
    if (next > MAX_WEEKLY_REFINES) {
      plan.stoppedBecause = 'weekly-limit';
      break;
    }
    const tier = tierForRefine(next);
    if (!tier) {
      plan.stoppedBecause = 'weekly-limit';
      break;
    }
    if (tier.cost > left) {
      plan.stoppedBecause = 'crystals';
      break;
    }

    const gained = expectedRefined(tier) * perRefined;
    const raw = tier.cost * perCrystal;
    // Strictly better, so a refine that merely breaks even is not recommended:
    // it is a gamble, and an even gamble is not worth taking for the variance.
    if (gained <= raw) {
      plan.stoppedBecause = 'not-worth-it';
      break;
    }

    const row = byTier.get(tier.tier) ?? {
      tier: tier.tier,
      refines: 0,
      crystalsSpent: 0,
      refinedGained: 0,
      pointsGained: 0,
      pointsIfSpentRaw: 0,
    };
    row.refines += 1;
    row.crystalsSpent += tier.cost;
    row.refinedGained += expectedRefined(tier);
    row.pointsGained += gained;
    row.pointsIfSpentRaw += raw;
    byTier.set(tier.tier, row);

    left -= tier.cost;
    plan.refines += 1;
    plan.crystalsSpent += tier.cost;
    plan.refinedGained += expectedRefined(tier);
    plan.pointsGained += gained - raw;
    next += 1;
  }

  plan.byTier = [...byTier.values()].sort((a, b) => a.tier - b.tier);
  plan.crystalsLeft = left;

  if (plan.refines === 0 && plan.stoppedBecause === 'not-worth-it') {
    const tier = tierForRefine(next);
    if (tier) {
      plan.notes.push(
        `Nothing to refine this week. You are on Super Refinement ${tier.tier}, at ` +
          `${costPerRefined(tier).toFixed(1)} Fire Crystals per Refined, which scores less than ` +
          `spending those crystals straight into buildings.`
      );
    }
  }

  return plan;
}

/** The first tier, which is the one worth running almost every week. */
export const BEST_TIER = SUPER_REFINE_TIERS[0];

/**
 * The refine plan for an event, and the day it lands on.
 *
 * Lives here rather than in deriveQuantities because it has to run BEFORE the
 * upgrade plan: the crystals it converts are the crystals that plan spends.
 */
/** What this event pays for a Fire Crystal and a Refined one, on its best day. */
export const crystalRatesFor = (
  event: PointsEvent
): { day: number; raw: number; refined: number } | null => {
  const RAW = 'use-1-fire-crystal-to-upgrade-buildings';
  const REFINED = 'use-1-refined-fire-crystal-to-upgrade-buildings';
  let best: { day: number; raw: number; refined: number } | null = null;
  for (const day of event.days) {
    for (const group of day.groups) {
      const refinedRow = group.rows.find(r => r.id === REFINED);
      if (!refinedRow) continue;
      const rawRow = group.rows.find(r => r.id === RAW);
      const refined = rowPointsPerUnit(group, refinedRow);
      if (!best || refined > best.refined) {
        best = { day: day.day, raw: rawRow ? rowPointsPerUnit(group, rawRow) : 0, refined };
      }
    }
  }
  return best;
};

export const refineForEvent = (
  event: PointsEvent,
  inventory: { resources?: { fireCrystal?: number }; superRefinesDone?: number }
): { plan: RefinePlan; day: number } | null => {
  const rates = crystalRatesFor(event);
  if (!rates) return null;
  return {
    plan: planRefines({
      crystals: inventory.resources?.fireCrystal ?? 0,
      refinesDone: inventory.superRefinesDone ?? 0,
      pointsPerCrystal: rates.raw,
      pointsPerRefined: rates.refined,
    }),
    day: rates.day,
  };
};

/**
 * The bag as it stands once the refines have been run.
 *
 * Fire Crystals leave, Refined ones arrive. Floored, because a holding is a
 * whole number even when the expectation behind it is not.
 */
export const applyRefine = <T extends { resources: Record<string, number> }>(
  inventory: T,
  plan: RefinePlan | null
): T => {
  if (!plan || plan.refines <= 0) return inventory;
  return {
    ...inventory,
    resources: {
      ...inventory.resources,
      fireCrystal: Math.max((inventory.resources.fireCrystal ?? 0) - plan.crystalsSpent, 0),
      refinedFireCrystal:
        (inventory.resources.refinedFireCrystal ?? 0) + Math.floor(plan.refinedGained),
    },
  };
};
