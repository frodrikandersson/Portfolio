// The Crystal Laboratory: turning Fire Crystals into Refined Fire Crystals.
//
// Two things happen in the building, unlocked at different Furnace levels:
//
//   REFINE turns 50,000 each of Meat, Wood, Coal and Iron into Fire Crystals,
//   eight times a day, and it is a gamble too: 1 to 5 crystals come out on a
//   published spread averaging 2.1. So 200,000 resources buy about 2.1 Fire
//   Crystals, or roughly 95,000 resources each. Unlocked at Furnace Fire
//   Crystal 1.
//
//   SUPER REFINE turns Fire Crystals into Refined Fire Crystals, from Furnace
//   Fire Crystal 5. A fixed number of Fire Crystals goes in and somewhere
//   between one and twelve Refined come out, on a published distribution.
//
// THE LEVEL IS A COUNTER, NOT AN UPGRADE. Super Refinement I covers your first
// 20 refines of the week, II the next 20, and so on, and the whole thing goes
// back to I every Monday at 00:00 UTC. So a refine's cost and payout depend
// entirely on how many you have already done since Monday.
//
// AND IT GETS WORSE AS IT GOES, WHICH IS THE OPPOSITE OF HOW IT LOOKS. The
// in-game screen badges the higher tiers "Favored" and shows bigger numbers on
// both sides, and the payout does rise, from 1.45 Refined on average to 3.71.
// But the cost rises faster, 20 Fire Crystals to 160, so the price of one
// Refined Fire Crystal goes from 13.8 Fire Crystals to 43.1. See
// SUPER_REFINE_TIERS and the numbers worked out in whiteoutCrystalLab's test.
//
// TWO THINGS WORTH KNOWING, BOTH MEASURED RATHER THAN FELT:
//
//   REFINING IS THE BEST THING RESOURCES CAN DO FOR POINTS. A day of refining
//   costs 1,600,000 resources and returns about 16.8 Fire Crystals, worth
//   33,600 points at King of Icefield's rate. That is 47.6 resources a point,
//   against 667 for gathering the same resources on its gathering day. Call it
//   fourteen times better, which is not a margin worth being subtle about.
//
//   THE LAB CANNOT FEED ITS OWN SUPER REFINEMENTS. Tier I's twenty refines
//   want 400 Fire Crystals, and a full week of basic refining makes 117.6, so
//   under a third of it. At eight refines a day it is about 24 days of
//   refining to afford one week's worth of tier I. The crystals for super
//   refining come from events and chests; the lab is a top-up, not a source.
//
// SOURCING. Transcribed from the in-game Probability popup, every tier and
// every row. Each tier's probabilities sum to exactly 100%, which is checked
// in the test rather than assumed.

/**
 * The two halves unlock at different Furnace levels.
 *
 * Refine comes first and is the one most accounts live on; Super Refinement
 * arrives four Fire Crystal levels later.
 */
export const REFINE_UNLOCK = 'Fire Crystal 1';
export const SUPER_REFINE_UNLOCK = 'Fire Crystal 5';

/** What one basic Refine consumes, for EACH of the four resources. */
export const REFINE_RESOURCE_COST = 50_000;

/**
 * Basic Refines allowed per day.
 *
 * Eight at Furnace Fire Crystal 1, which is what has been read off the game.
 * Whether it rises at higher Fire Crystal levels is not known, so this is a
 * single number rather than a table, and a player on a later Furnace may get
 * more than this says.
 */
export const REFINES_PER_DAY = 8;

/**
 * Fire Crystals one basic Refine returns, as count to percentage.
 *
 * From the Probability popup's Refine tab. Averages 2.1 crystals, so the four
 * resources cost about 23,810 each per Fire Crystal, or 95,238 across all four.
 */
export const REFINE_OUTCOMES: { crystals: number; percent: number }[] = [
  { crystals: 1, percent: 40 },
  { crystals: 2, percent: 30 },
  { crystals: 3, percent: 15 },
  { crystals: 4, percent: 10 },
  { crystals: 5, percent: 5 },
];

/** Fire Crystals one basic Refine returns on average. */
export const expectedCrystalsPerRefine = REFINE_OUTCOMES.reduce(
  (sum, o) => sum + o.crystals * (o.percent / 100),
  0
);

/** Resources of EACH kind spent per Fire Crystal produced, on average. */
export const resourcesPerCrystal = () => REFINE_RESOURCE_COST / expectedCrystalsPerRefine;

/** Fire Crystals a full day of refining yields, on average. */
export const crystalsPerDay = () => REFINES_PER_DAY * expectedCrystalsPerRefine;

/** Refines per tier before the next one takes over. */
export const REFINES_PER_TIER = 20;

export interface SuperRefineTier {
  /** 1 to 5, matching the game's Super Refinement I to V. */
  tier: number;
  /** Refine number this tier starts and ends on, within the week. */
  from: number;
  to: number;
  /** Fire Crystals one refine costs at this tier. */
  cost: number;
  /**
   * Refined Fire Crystals returned, as count to probability.
   *
   * Probabilities are percentages exactly as the game prints them, not
   * fractions, so they can be compared to the popup without arithmetic.
   */
  outcomes: { refined: number; percent: number }[];
}

export const SUPER_REFINE_TIERS: SuperRefineTier[] = [
  {
    tier: 1,
    from: 1,
    to: 20,
    cost: 20,
    outcomes: [
      { refined: 1, percent: 65 },
      { refined: 2, percent: 25 },
      { refined: 3, percent: 10 },
    ],
  },
  {
    tier: 2,
    from: 21,
    to: 40,
    cost: 50,
    outcomes: [
      { refined: 2, percent: 85 },
      { refined: 3, percent: 15 },
    ],
  },
  {
    tier: 3,
    from: 41,
    to: 60,
    cost: 100,
    outcomes: [
      { refined: 3, percent: 85 },
      { refined: 4, percent: 12.5 },
      { refined: 5, percent: 2 },
      { refined: 6, percent: 0.5 },
    ],
  },
  {
    tier: 4,
    from: 61,
    to: 80,
    cost: 130,
    outcomes: [
      { refined: 3, percent: 75 },
      { refined: 4, percent: 15 },
      { refined: 5, percent: 5 },
      { refined: 6, percent: 3 },
      { refined: 7, percent: 1 },
      { refined: 8, percent: 0.5 },
      { refined: 9, percent: 0.5 },
    ],
  },
  {
    tier: 5,
    from: 81,
    to: 100,
    cost: 160,
    outcomes: [
      { refined: 3, percent: 70 },
      { refined: 4, percent: 12 },
      { refined: 5, percent: 9 },
      { refined: 6, percent: 4 },
      { refined: 7, percent: 1.5 },
      { refined: 8, percent: 1 },
      { refined: 9, percent: 1 },
      { refined: 10, percent: 0.5 },
      { refined: 11, percent: 0.5 },
      { refined: 12, percent: 0.5 },
    ],
  },
];

/** Refined Fire Crystals one refine returns on average at this tier. */
export const expectedRefined = (tier: SuperRefineTier) =>
  tier.outcomes.reduce((sum, o) => sum + o.refined * (o.percent / 100), 0);

/**
 * Fire Crystals paid per Refined Fire Crystal, on average.
 *
 * The number that matters, and the one the game never shows. It rises at every
 * tier, so the cheapest Refined Fire Crystals of the week are always the first
 * twenty refines.
 */
export const costPerRefined = (tier: SuperRefineTier) => tier.cost / expectedRefined(tier);

/** The tier a given refine of the week falls in, or null past the last one. */
export const tierForRefine = (refineNumber: number): SuperRefineTier | null =>
  SUPER_REFINE_TIERS.find(t => refineNumber >= t.from && refineNumber <= t.to) ?? null;

/** The last refine number the table covers. */
export const MAX_WEEKLY_REFINES = SUPER_REFINE_TIERS[SUPER_REFINE_TIERS.length - 1].to;
