/**
 * How many times to spin the Lucky Wheel, and on which days.
 *
 * THE MILESTONES COUNT ONCE PER EVENT. They reset when the weekly event ends,
 * not overnight, so the shards depend only on the TOTAL spins and not at all
 * on how those spins are spread. 120 in an event collects every bonus; there
 * is no second helping on the next day.
 *
 * That makes this two independent decisions rather than one:
 *
 *   HOW MANY. Spins 1 to 120 cost between 873 and 970 gems a shard. Spins past
 *   120 cost 2,470, because every milestone has already been paid and a spin
 *   is worth its own 0.5466 and nothing more. So 120 is where the shard value
 *   stops, and anything beyond it is bought for the event points alone.
 *
 *   WHERE. Shards do not care, so the split is free to serve something else:
 *   each day of an event carries its own points target for that day's reward,
 *   and wheel spins are worth thousands of points each. So the spins go where
 *   days are short, which is the only thing the split can usefully do.
 *
 * An earlier version of this had the milestones resetting daily and built an
 * elaborate search around splitting to collect them repeatedly. That was
 * wrong, and the split it produced was optimising something that does not
 * exist.
 */
import {
  WHEEL_MILESTONES,
  WHEEL_MAX_SPINS_PER_DAY,
  WHEEL_LAST_MILESTONE,
  wheelExpectedShards,
  wheelGemCost,
  WHEEL_GEM_COST,
} from '../data/whiteoutLuckyWheel';

export interface WheelDayPlan {
  day: number;
  spins: number;
  gems: number;
  /** Points the event pays for those spins. */
  points: number;
}

export interface WheelPlan {
  days: WheelDayPlan[];
  totalSpins: number;
  gemsSpent: number;
  gemsHeld: number;
  /** Expected shards for the event, from the TOTAL spins. */
  shards: number;
  points: number;
  /** Spins bought past the last milestone, which pay no bonus shards. */
  tailSpins: number;
  /** Total spins that would collect every milestone. */
  idealSpins: number;
  /** Gems for that, whether or not the player has them. */
  idealGems: number;
  /** Short of the last milestone, so more gems would still buy bonus shards. */
  shortOfMilestones: boolean;
  /** Gems left after the plan, which the player may choose to spend anyway. */
  gemsLeft: number;
}

/** Spins affordable with a pile of gems, buying in tens wherever possible. */
export const spinsAffordable = (gems: number, cap: number) => {
  let best = 0;
  for (let spins = 0; spins <= cap; spins += 1) {
    if (wheelGemCost(spins) <= gems) best = spins;
    else break; // cost is monotonic in spins
  }
  return best;
};

/** The wheel is cheaper by the ten, so that is the unit a day is dealt in. */
const BATCH = 10;

/**
 * Spread a total across days without manufacturing single spins.
 *
 * Buying ten at a time costs 1,350 a spin against 1,500, so every spin outside
 * a batch is money lost. A split that leaves two days both holding a part
 * batch pays that penalty twice for nothing, which is exactly what 82 and 38
 * did.
 *
 * So days are dealt whole batches, and the remainder, which exists because the
 * milestones do not sit on multiples of ten, goes on one day only. The price
 * of the plan is then exactly the price of buying the total in one go.
 *
 * `shortfall` is how far a day is from its own reward target before the wheel
 * is counted. Days that are already there get nothing; days that are short get
 * batches until they are not, easiest first so the most days clear.
 */
const spreadSpins = (
  days: { day: number; pointsPerSpin: number; shortfall: number }[],
  totalSpins: number
): Map<number, number> => {
  const out = new Map<number, number>(days.map(d => [d.day, 0]));
  const capBatches = Math.floor(WHEEL_MAX_SPINS_PER_DAY / BATCH);
  let batchesLeft = Math.floor(totalSpins / BATCH);
  const remainder = totalSpins % BATCH;

  const roomFor = (day: number) => capBatches - Math.floor((out.get(day) ?? 0) / BATCH);

  // Easiest days to rescue first, so the spins clear as many as they can.
  const needy = days
    .filter(d => d.shortfall > 0 && d.pointsPerSpin > 0)
    .sort((a, b) => a.shortfall - b.shortfall);

  for (const d of needy) {
    if (batchesLeft <= 0) break;
    const want = Math.ceil(d.shortfall / (d.pointsPerSpin * BATCH));
    const take = Math.min(batchesLeft, want, roomFor(d.day));
    out.set(d.day, (out.get(d.day) ?? 0) + take * BATCH);
    batchesLeft -= take;
  }

  // Anything still unplaced goes wherever there is room.
  for (const d of days) {
    if (batchesLeft <= 0) break;
    const take = Math.min(batchesLeft, roomFor(d.day));
    out.set(d.day, (out.get(d.day) ?? 0) + take * BATCH);
    batchesLeft -= take;
  }

  // The remainder lands on one day, never split, so singles are paid once.
  if (remainder > 0) {
    const host =
      days.find(d => (out.get(d.day) ?? 0) + remainder <= WHEEL_MAX_SPINS_PER_DAY) ?? days[0];
    out.set(host.day, (out.get(host.day) ?? 0) + remainder);
  }
  return out;
};

export function planLuckyWheel(
  gemsHeld: number,
  wheelDays: { day: number; pointsPerSpin: number; shortfall?: number }[]
): WheelPlan | null {
  if (!wheelDays.length) return null;

  const gems = Math.max(gemsHeld, 0);
  const dailyCap = wheelDays.length * WHEEL_MAX_SPINS_PER_DAY;

  // Every spin up to the last milestone is good value, so buy as many of those
  // as the gems allow.
  const worthwhile = Math.min(
    spinsAffordable(gems, Math.min(WHEEL_LAST_MILESTONE, dailyCap)),
    WHEEL_LAST_MILESTONE
  );

  // Past that a spin buys no bonus shards at all, so only buy more where a day
  // is still short of its own reward target. Spending beyond that is a
  // judgement about ranking that this planner does not make for the player.
  const stillShort = wheelDays.reduce((sum, d) => {
    const after = Math.max((d.shortfall ?? 0), 0);
    return sum + (after > 0 && d.pointsPerSpin > 0 ? Math.ceil(after / d.pointsPerSpin) : 0);
  }, 0);
  const totalSpins = Math.min(
    spinsAffordable(gems, dailyCap),
    Math.max(worthwhile, Math.min(stillShort, dailyCap))
  );

  const split = spreadSpins(
    wheelDays.map(d => ({ ...d, shortfall: d.shortfall ?? 0 })),
    totalSpins
  );

  const days: WheelDayPlan[] = wheelDays.map(d => {
    const spins = split.get(d.day) ?? 0;
    return { day: d.day, spins, gems: wheelGemCost(spins), points: spins * d.pointsPerSpin };
  });

  return {
    days,
    totalSpins,
    // Priced as one purchase across the event: buying ten at a time is what
    // makes the difference, and nothing forces a day to end on a round number.
    // Summed from the days rather than priced as one purchase. Those are the
    // same number only because the remainder is never split, and billing the
    // imagined single purchase is what hid the 1,500 gem leak.
    gemsSpent: days.reduce((sum, d) => sum + d.gems, 0),
    gemsHeld,
    // From the TOTAL. Adding up per-day figures would pay the milestones once
    // a day, which is the bug this file was rebuilt to remove.
    shards: wheelExpectedShards(totalSpins),
    points: days.reduce((sum, d) => sum + d.points, 0),
    tailSpins: Math.max(totalSpins - WHEEL_LAST_MILESTONE, 0),
    idealSpins: WHEEL_LAST_MILESTONE,
    idealGems: wheelGemCost(WHEEL_LAST_MILESTONE),
    shortOfMilestones: totalSpins < WHEEL_LAST_MILESTONE,
    gemsLeft: Math.max(gems - days.reduce((sum, d) => sum + d.gems, 0), 0),
  };
}

/** Gems per expected shard for a plan, for saying how good a deal it is. */
export const wheelGemsPerShard = (plan: WheelPlan) =>
  plan.shards > 0 ? plan.gemsSpent / plan.shards : 0;

/** A single spin's price when bought ten at a time, which is always cheaper. */
export const WHEEL_BEST_SPIN_PRICE = WHEEL_GEM_COST.batchOfTen / 10;

/**
 * Every sensible place to stop, with what it costs and what it returns.
 *
 * Shown rather than decided, because the right answer depends on something
 * this planner cannot see: how quickly gems come back. 120 spins is 162,000
 * gems every event, and a player who cannot earn that between events is better
 * off stopping lower and spinning every time than emptying the bag once.
 *
 * Note that the best RATE is 35, not 120, and that stopping exactly on a
 * milestone is worth paying a few singles for: 35 costs 48,000 where 40 in
 * clean batches costs 54,000 and reaches the same milestone.
 */
export const wheelStoppingPoints = () =>
  WHEEL_MILESTONES.map(m => ({
    spins: m.spins,
    gems: wheelGemCost(m.spins),
    shards: wheelExpectedShards(m.spins),
    gemsPerShard: wheelGemCost(m.spins) / wheelExpectedShards(m.spins),
  }));
