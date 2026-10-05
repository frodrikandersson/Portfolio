// The Lucky Wheel: what a spin costs, what it pays, and where to stop.
//
// It appears inside several events and pays points per SPIN, so it is two
// things at once: a scoring row and a way of turning gems into hero shards.
// The shards are for the free-to-play hero of each of the three most recent
// seasons, which is why almost everyone spins it.
//
// WHERE TO STOP IS THE WHOLE QUESTION. Spinning pays a fixed expected 0.5466
// shards a spin, but the milestones on top are worth more than the spins are:
// 115 of the first 180 shards come from milestones rather than luck.
//
// THE MILESTONES COUNT ONCE PER EVENT, NOT PER DAY. They reset when the weekly
// event ends. So 120 spins is the number for the whole event, however those
// spins are spread, and there is no way to collect the bonuses twice inside
// one event. Past 120 a spin pays only its own 0.5466, which makes spins 121
// upward the worst gems on the wheel even though the game sells up to 150 a
// day.
//
// This corrects an earlier reading of the wiki, which listed
// "120th x 5 times = 575 + 327.96 shards" and looked like five days. It is
// five separate EVENTS at 120 spins each.
//
// TEN AT A TIME IS CHEAPER, 1,350 a spin against 1,500, so a plan that ends on
// a number that is not a multiple of ten has paid over the odds for the tail.
//
// SOURCING. The drop table and the milestones are from whiteoutsurvival.wiki
// via Fredrik. The table is checked here rather than trusted: the eleven
// chances sum to exactly 100%, and the expected shards a spin reproduce the
// wiki's own 0.5466 and every one of its six worked milestone totals.
//
// EDIT FREELY: nothing in the scoring code hardcodes a number.

/** What one spin can land on. Chances are percentages and sum to 100. */
export interface WheelPrize {
  id: string;
  label: string;
  chance: number;
  /** Hero shards granted, for the two shard outcomes. */
  shards?: number;
  /** Minutes of General speedup. */
  speedupMinutes?: number;
  /** Hero EXP. */
  heroExp?: number;
  /** A resource bundle: `amount` of `kind`, `count` times. */
  resource?: { kind: 'meat' | 'wood' | 'coal' | 'iron'; amount: number; count: number };
  /** True for the Mystery Pack, whose contents are a second roll. */
  mysteryPack?: boolean;
}

export const WHEEL_PRIZES: WheelPrize[] = [
  { id: 'shards-5', label: '5 shards', chance: 4.37, shards: 5 },
  { id: 'shards-1', label: '1 shard', chance: 32.81, shards: 1 },
  // Listed twice on the wiki as two separate outcomes at the same chance, so
  // they are kept apart rather than merged into one 13.12% row.
  { id: 'mystery-pack-a', label: 'Mystery Pack x1', chance: 6.56, mysteryPack: true },
  { id: 'mystery-pack-b', label: 'Mystery Pack x1', chance: 6.56, mysteryPack: true },
  { id: 'speedup-1h', label: '1h General Speedup x1', chance: 20.51, speedupMinutes: 60 },
  { id: 'hero-xp-10k', label: '10,000 Hero XP x1', chance: 18.27, heroExp: 10_000 },
  { id: 'iron-10k-20', label: '10K Iron x20', chance: 2.73, resource: { kind: 'iron', amount: 10_000, count: 20 } },
  { id: 'coal-10k-80', label: '10K Coal x80', chance: 2.73, resource: { kind: 'coal', amount: 10_000, count: 80 } },
  { id: 'wood-10k-400', label: '10K Wood x400', chance: 2.73, resource: { kind: 'wood', amount: 10_000, count: 400 } },
  { id: 'meat-10k-400', label: '10K Meat x400', chance: 2.73, resource: { kind: 'meat', amount: 10_000, count: 400 } },
];

/**
 * What a Mystery Pack can hold.
 *
 * The wiki lists the possible contents but not their chances, and not whether
 * a pack gives one of them or several. So this is recorded for reference and
 * deliberately left out of the expected value below, which therefore UNDERSTATES
 * a spin rather than guessing.
 */
export const MYSTERY_PACK_CONTENTS = [
  { label: 'Mythic Exploration Manual', min: 2, max: 4 },
  { label: 'Mythic Expedition Skill Manual', min: 2, max: 4 },
  { label: '10,000 Hero XP', min: 5, max: 5 },
  { label: '1h Training Speedup', min: 2, max: 5 },
  { label: '1h Research Speedup', min: 2, max: 5 },
  { label: '1h Construction Speedup', min: 2, max: 5 },
] as const;

/**
 * Bonus shards for reaching a spin count, paid once each PER EVENT.
 *
 * Not per day. The count carries across the event's days and resets when the
 * event does, so these are the only 115 bonus shards on offer in a week.
 */
export const WHEEL_MILESTONES = [
  { spins: 5, shards: 5 },
  { spins: 15, shards: 10 },
  { spins: 35, shards: 20 },
  { spins: 70, shards: 30 },
  { spins: 120, shards: 50 },
] as const;

/**
 * The game allows this many spins a day.
 *
 * A daily cap on a per-event milestone track, so it only binds when someone
 * wants more than 150 spins in one sitting. The milestones are long finished
 * by then.
 */
export const WHEEL_MAX_SPINS_PER_DAY = 150;

/** Past this, for the whole event, a spin is worth only its own roll. */
export const WHEEL_LAST_MILESTONE = WHEEL_MILESTONES[WHEEL_MILESTONES.length - 1].spins;

export const WHEEL_GEM_COST = {
  /** Spinning one at a time. */
  single: 1_500,
  /** Ten at a time, which is the same wheel for a tenth less. */
  batchOfTen: 13_500,
};

/** Cheapest gems for a number of spins, using tens wherever they fit. */
export const wheelGemCost = (spins: number) => {
  const tens = Math.floor(Math.max(spins, 0) / 10);
  const singles = Math.max(spins, 0) - tens * 10;
  return tens * WHEEL_GEM_COST.batchOfTen + singles * WHEEL_GEM_COST.single;
};

/** Expected shards from one spin, before any milestone. */
export const WHEEL_SHARDS_PER_SPIN = WHEEL_PRIZES.reduce(
  (sum, p) => sum + (p.shards ?? 0) * (p.chance / 100),
  0
);

/** Milestone shards earned at a total spin count across the event. */
export const wheelMilestoneShards = (spins: number) =>
  WHEEL_MILESTONES.filter(m => spins >= m.spins).reduce((sum, m) => sum + m.shards, 0);

/**
 * Expected shards from a whole event's spins: the rolls plus the milestones.
 *
 * Takes the EVENT total. Feeding it a single day's spins and adding the results
 * up counts the milestones once per day, which is the mistake this file used to
 * make.
 */
export const wheelExpectedShards = (spins: number) =>
  Math.max(spins, 0) * WHEEL_SHARDS_PER_SPIN + wheelMilestoneShards(spins);
