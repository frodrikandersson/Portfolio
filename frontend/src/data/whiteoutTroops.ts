// Whiteout Survival troop training costs and times, per 1,000 troops.
//
// PROMOTION NEEDS NO DATA OF ITS OWN. Promoting a troop from tier A to tier B
// costs the difference between the two tiers' training costs, takes the
// difference of their training times, and scores the difference of their event
// points. So every promotion figure is derived from this one table.
//
// PROVENANCE: all three T1-T10 columns were checked against Fredrik's own
// in-game figures. 120 values compared, zero mismatches: 109 matched exactly
// and 11 matched once the game's truncation is accounted for (it shows
// 1,394,000 as "1.3M", truncating rather than rounding). All 30 training times
// matched exactly. The T11 rows come from the same source, which that check
// validates, but have not been seen in game directly.
//
// EDIT FREELY: nothing in the calculator hardcodes these numbers.

export type TroopType = 'infantry' | 'lancer' | 'marksman';

export const TROOP_TYPES: TroopType[] = ['infantry', 'lancer', 'marksman'];

export const TROOP_TYPE_LABELS: Record<TroopType, string> = {
  infantry: 'Infantry',
  lancer: 'Lancer',
  marksman: 'Marksman',
};

/**
 * True where the figures are derived rather than read off the game.
 *
 * Only T12 carries it. Nothing publishes a per-troop T12 training cost: every
 * guide that claims to is quoting the War Academy research bill instead, which
 * runs to 105,350,000 Meat for a troop TYPE and has nothing to do with training
 * one. The one usable number is wostools' recorded T11 to T12 Marksman
 * promotion, 2,173 Meat, 3,223 Wood, 535 Coal and 165 Iron per troop. A
 * promotion costs the difference between the two tiers, and their own recorded
 * T11 base of 6,970 / 5,228 / 1,220 / 253 matches this table exactly, so that
 * difference puts T12 at 1.5 times T11 on all four resources, within a quarter
 * of a percent on three of them.
 *
 * So the resource costs below are T11 x 1.5 and the time is the step the last
 * two tiers used, 1.18. Good enough to plan with, not good enough to trust
 * silently, which is why the Troops card says so when a plan leans on them.
 *
 * TO CORRECT THEM: the training screen in your own camp prints the real cost
 * per troop. Multiply by 1,000, put the numbers in, and drop the flag.
 */
export interface TroopTierCost {
  tier: number;
  /** Cost to train 1,000 troops of this tier. */
  meat: number;
  wood: number;
  coal: number;
  iron: number;
  /** Base time to train 1,000 troops, in seconds, before any speed bonus. */
  seconds: number;
  /** Set where the row is derived rather than observed. See above. */
  estimated?: boolean;
}

/**
 * Helios Training research reduces T11 training COST, not time: 10 levels at
 * 5% each, to a maximum of 50%. Confirmed by Fredrik. It is researched per
 * troop type, so Helios Infantry, Lancer and Marksman Training are three
 * separate levels.
 */
export const HELIOS_LEVELS = 10;
export const HELIOS_PER_LEVEL = 0.05;

/** The tier Helios Training applies to. */
export const HELIOS_TIER = 11;

/** Helios level per troop type, since each is researched separately. */
export type HeliosLevels = Record<TroopType, number>;

export const emptyHeliosLevels = (): HeliosLevels => ({
  infantry: 0,
  lancer: 0,
  marksman: 0,
});

export const heliosReduction = (level: number) =>
  Math.min(Math.max(Math.round(level), 0), HELIOS_LEVELS) * HELIOS_PER_LEVEL;

export const whiteoutTroops: Record<TroopType, TroopTierCost[]> = {
  infantry: [
    { tier: 1, meat: 36000, wood: 27000, coal: 7000, iron: 2000, seconds: 12000 },
    { tier: 2, meat: 58000, wood: 44000, coal: 10000, iron: 3000, seconds: 17000 },
    { tier: 3, meat: 92000, wood: 69000, coal: 17000, iron: 4000, seconds: 24000 },
    { tier: 4, meat: 120000, wood: 90000, coal: 21000, iron: 5000, seconds: 32000 },
    { tier: 5, meat: 156000, wood: 117000, coal: 27000, iron: 6000, seconds: 44000 },
    { tier: 6, meat: 186000, wood: 140000, coal: 33000, iron: 7000, seconds: 60000 },
    { tier: 7, meat: 279000, wood: 210000, coal: 49000, iron: 11000, seconds: 83000 },
    { tier: 8, meat: 558000, wood: 419000, coal: 98000, iron: 21000, seconds: 113000 },
    { tier: 9, meat: 1394000, wood: 1046000, coal: 244000, iron: 51000, seconds: 131000 },
    { tier: 10, meat: 2788000, wood: 2091000, coal: 488000, iron: 102000, seconds: 152000 },
    { tier: 11, meat: 6970000, wood: 5228000, coal: 1220000, iron: 253000, seconds: 180000 },
    { tier: 12, meat: 10455000, wood: 7842000, coal: 1830000, iron: 379500, seconds: 213000, estimated: true },
  ],
  lancer: [
    { tier: 1, meat: 32000, wood: 30000, coal: 7000, iron: 2000, seconds: 12000 },
    { tier: 2, meat: 51000, wood: 48000, coal: 10000, iron: 3000, seconds: 17000 },
    { tier: 3, meat: 81000, wood: 76000, coal: 16000, iron: 4000, seconds: 24000 },
    { tier: 4, meat: 105000, wood: 99000, coal: 21000, iron: 5000, seconds: 32000 },
    { tier: 5, meat: 136000, wood: 129000, coal: 27000, iron: 7000, seconds: 44000 },
    { tier: 6, meat: 163000, wood: 154000, coal: 32000, iron: 8000, seconds: 60000 },
    { tier: 7, meat: 244000, wood: 231000, coal: 48000, iron: 11000, seconds: 83000 },
    { tier: 8, meat: 488000, wood: 461000, coal: 95000, iron: 22000, seconds: 113000 },
    { tier: 9, meat: 1220000, wood: 1151000, coal: 237000, iron: 55000, seconds: 131000 },
    { tier: 10, meat: 2440000, wood: 2301000, coal: 474000, iron: 109000, seconds: 152000 },
    { tier: 11, meat: 6099000, wood: 5751000, coal: 1185000, iron: 271000, seconds: 180000 },
    { tier: 12, meat: 9148500, wood: 8626500, coal: 1777500, iron: 406500, seconds: 213000, estimated: true },
  ],
  marksman: [
    { tier: 1, meat: 23000, wood: 34000, coal: 6000, iron: 2000, seconds: 12000 },
    { tier: 2, meat: 36000, wood: 54000, coal: 9000, iron: 4000, seconds: 17000 },
    { tier: 3, meat: 58000, wood: 86000, coal: 15000, iron: 5000, seconds: 24000 },
    { tier: 4, meat: 75000, wood: 111000, coal: 19000, iron: 6000, seconds: 32000 },
    { tier: 5, meat: 97000, wood: 144000, coal: 24000, iron: 8000, seconds: 44000 },
    { tier: 6, meat: 117000, wood: 173000, coal: 29000, iron: 10000, seconds: 60000 },
    { tier: 7, meat: 175000, wood: 258000, coal: 44000, iron: 14000, seconds: 83000 },
    { tier: 8, meat: 349000, wood: 516000, coal: 87000, iron: 28000, seconds: 113000 },
    { tier: 9, meat: 872000, wood: 1290000, coal: 217000, iron: 70000, seconds: 131000 },
    { tier: 10, meat: 1740000, wood: 2579000, coal: 433000, iron: 140000, seconds: 152000 },
    { tier: 11, meat: 4357000, wood: 6448000, coal: 1081000, iron: 349000, seconds: 180000 },
    { tier: 12, meat: 6535500, wood: 9672000, coal: 1621500, iron: 523500, seconds: 213000, estimated: true },
  ],
};

/** The highest tier the table knows, so callers never hardcode it. */
export const TOP_TIER = Math.max(...whiteoutTroops.infantry.map(r => r.tier));

/** True when a tier's costs are derived rather than observed. */
export const tierIsEstimated = (type: TroopType, tier: number) =>
  whiteoutTroops[type].find(r => r.tier === tier)?.estimated === true;

/**
 * Training cost and time for `count` troops of a tier, scaled from the
 * per-1,000 table. `heliosLevel` discounts the resource cost at T11 only.
 */
export const trainingFor = (
  type: TroopType,
  tier: number,
  count: number,
  heliosLevel = 0
) => {
  const row = whiteoutTroops[type].find(r => r.tier === tier);
  if (!row || count <= 0) return null;
  const k = count / 1000;
  const off = tier === HELIOS_TIER ? 1 - heliosReduction(heliosLevel) : 1;
  return {
    meat: row.meat * k * off,
    wood: row.wood * k * off,
    coal: row.coal * k * off,
    iron: row.iron * k * off,
    // Helios reduces cost, not time.
    seconds: row.seconds * k,
  };
};

/**
 * Promoting from `fromTier` to `toTier` costs and takes the difference between
 * the two tiers' training figures. Returns null when the tiers are out of order
 * or missing.
 */
export const promotionFor = (
  type: TroopType,
  fromTier: number,
  toTier: number,
  count: number,
  heliosLevel = 0
) => {
  const from = whiteoutTroops[type].find(r => r.tier === fromTier);
  const to = whiteoutTroops[type].find(r => r.tier === toTier);
  if (!from || !to || toTier <= fromTier || count <= 0) return null;
  const k = count / 1000;
  const off = toTier === HELIOS_TIER ? 1 - heliosReduction(heliosLevel) : 1;
  return {
    meat: (to.meat * off - from.meat) * k,
    wood: (to.wood * off - from.wood) * k,
    coal: (to.coal * off - from.coal) * k,
    iron: (to.iron * off - from.iron) * k,
    seconds: (to.seconds - from.seconds) * k,
  };
};
