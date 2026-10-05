// Chief Gear: the upgrade ladder, its sub-steps, and the material exchange.
//
// All six slots walk this same ladder independently, so a cost here is what ONE
// slot pays for ONE upgrade, and a player can push one slot as far ahead of the
// others as they like.
//
// Matching three or six slots at a stage does pay a stat bonus in game, but
// nothing here models it: whether that is worth diverting materials for is the
// player's judgement, so the planner optimises for points and says so.
//
// THE SUB-STEPS. Past a point the game stops charging for an upgrade in one
// go and splits it into equal instalments, each of which scores on its own.
// The instalments are named after the level you are LEAVING, so the four parts
// of the jump from Mythic T2 (3 Star) to Legendary read:
//
//     MythicT2 (3-Star Status: 1)   a quarter of the cost
//     MythicT2 (3-Star Status: 2)   a quarter
//     MythicT2 (3-Star Status: 3)   a quarter
//     Legendary                     the last quarter, which completes it
//
// `parts` below is how many instalments an upgrade takes: 1 up to Mythic T2
// (3 Star), 4 from Legendary to Legendary T3 (3 Star), then 5. Those counts are
// not guessed, they are read off the event's own scoring rows.
//
// SOURCING: the costs are Fredrik's transcription, every number of which was
// confirmed against a parse of wos.h5joy-games.com. That site has Mythic and
// Legendary the wrong way round, so only its numbers were used, never its
// order; the order here comes from the in-game event table. Legendary T5 and
// T6 are real levels whose costs nobody has yet, so they carry a null.
//
// Two things look wrong and are not: Rare (2 Star) through Epic (1 Star)
// really do cost Design Plans alone, and Lunar Amber really does start only at
// Legendary.
//
// EDIT FREELY: correcting a number here is all that is needed.

import type { ScoringRow } from '../models/whiteoutInterface';

export type ChiefGearMaterial =
  | 'designPlans'
  | 'hardenedAlloy'
  | 'polishingSolution'
  | 'lunarAmber';

export const CHIEF_GEAR_MATERIALS: ChiefGearMaterial[] = [
  'designPlans',
  'hardenedAlloy',
  'polishingSolution',
  'lunarAmber',
];

/** The backpack item id each material is entered under. */
export const CHIEF_GEAR_ITEM_IDS: Record<ChiefGearMaterial, string> = {
  designPlans: 'design-plans',
  hardenedAlloy: 'hardened-alloy',
  polishingSolution: 'polishing-solution',
  lunarAmber: 'lunar-amber',
};

export const CHIEF_GEAR_MATERIAL_LABELS: Record<ChiefGearMaterial, string> = {
  designPlans: 'Design Plans',
  hardenedAlloy: 'Hardened Alloy',
  polishingSolution: 'Polishing Solution',
  lunarAmber: 'Lunar Amber',
};

export type ChiefGearCost = Partial<Record<ChiefGearMaterial, number>>;

export interface ChiefGearUpgrade {
  tier: string;
  /** 0 to 3. */
  stars: number;
  /** Instalments this upgrade is charged in. */
  parts: number;
  /** Total cost of the whole upgrade, or null where nobody has the numbers. */
  cost: ChiefGearCost | null;
}

/**
 * Whole upgrades, in order. Index 0 is reaching Uncommon from nothing, so a
 * slot sitting at Uncommon has finished upgrade 0.
 */
export const CHIEF_GEAR_UPGRADES: ChiefGearUpgrade[] = [
  { tier: 'Uncommon', stars: 0, parts: 1, cost: { hardenedAlloy: 1500, polishingSolution: 15 } },
  { tier: 'Uncommon', stars: 1, parts: 1, cost: { hardenedAlloy: 3800, polishingSolution: 40 } },
  { tier: 'Rare', stars: 0, parts: 1, cost: { hardenedAlloy: 7000, polishingSolution: 70 } },
  { tier: 'Rare', stars: 1, parts: 1, cost: { hardenedAlloy: 9700, polishingSolution: 95 } },
  { tier: 'Rare', stars: 2, parts: 1, cost: { designPlans: 45 } },
  { tier: 'Rare', stars: 3, parts: 1, cost: { designPlans: 50 } },
  { tier: 'Epic', stars: 0, parts: 1, cost: { designPlans: 60 } },
  { tier: 'Epic', stars: 1, parts: 1, cost: { designPlans: 70 } },
  { tier: 'Epic', stars: 2, parts: 1, cost: { designPlans: 40, hardenedAlloy: 6500, polishingSolution: 65 } },
  { tier: 'Epic', stars: 3, parts: 1, cost: { designPlans: 50, hardenedAlloy: 8000, polishingSolution: 80 } },
  { tier: 'Epic T1', stars: 0, parts: 1, cost: { designPlans: 60, hardenedAlloy: 10000, polishingSolution: 95 } },
  { tier: 'Epic T1', stars: 1, parts: 1, cost: { designPlans: 70, hardenedAlloy: 11000, polishingSolution: 110 } },
  { tier: 'Epic T1', stars: 2, parts: 1, cost: { designPlans: 85, hardenedAlloy: 13000, polishingSolution: 130 } },
  { tier: 'Epic T1', stars: 3, parts: 1, cost: { designPlans: 100, hardenedAlloy: 15000, polishingSolution: 160 } },
  { tier: 'Mythic', stars: 0, parts: 1, cost: { designPlans: 40, hardenedAlloy: 22000, polishingSolution: 220 } },
  { tier: 'Mythic', stars: 1, parts: 1, cost: { designPlans: 40, hardenedAlloy: 23000, polishingSolution: 230 } },
  { tier: 'Mythic', stars: 2, parts: 1, cost: { designPlans: 45, hardenedAlloy: 25000, polishingSolution: 250 } },
  { tier: 'Mythic', stars: 3, parts: 1, cost: { designPlans: 45, hardenedAlloy: 26000, polishingSolution: 260 } },
  { tier: 'Mythic T1', stars: 0, parts: 1, cost: { designPlans: 45, hardenedAlloy: 28000, polishingSolution: 280 } },
  { tier: 'Mythic T1', stars: 1, parts: 1, cost: { designPlans: 55, hardenedAlloy: 30000, polishingSolution: 300 } },
  { tier: 'Mythic T1', stars: 2, parts: 1, cost: { designPlans: 55, hardenedAlloy: 32000, polishingSolution: 320 } },
  { tier: 'Mythic T1', stars: 3, parts: 1, cost: { designPlans: 55, hardenedAlloy: 35000, polishingSolution: 340 } },
  { tier: 'Mythic T2', stars: 0, parts: 1, cost: { designPlans: 55, hardenedAlloy: 38000, polishingSolution: 360 } },
  { tier: 'Mythic T2', stars: 1, parts: 1, cost: { designPlans: 75, hardenedAlloy: 43000, polishingSolution: 430 } },
  { tier: 'Mythic T2', stars: 2, parts: 1, cost: { designPlans: 80, hardenedAlloy: 45000, polishingSolution: 460 } },
  { tier: 'Mythic T2', stars: 3, parts: 1, cost: { designPlans: 85, hardenedAlloy: 48000, polishingSolution: 500 } },
  { tier: 'Legendary', stars: 0, parts: 4, cost: { designPlans: 85, hardenedAlloy: 50000, polishingSolution: 530, lunarAmber: 10 } },
  { tier: 'Legendary', stars: 1, parts: 4, cost: { designPlans: 90, hardenedAlloy: 52000, polishingSolution: 560, lunarAmber: 10 } },
  { tier: 'Legendary', stars: 2, parts: 4, cost: { designPlans: 95, hardenedAlloy: 54000, polishingSolution: 590, lunarAmber: 10 } },
  { tier: 'Legendary', stars: 3, parts: 4, cost: { designPlans: 100, hardenedAlloy: 56000, polishingSolution: 620, lunarAmber: 10 } },
  { tier: 'Legendary T1', stars: 0, parts: 4, cost: { designPlans: 110, hardenedAlloy: 59000, polishingSolution: 670, lunarAmber: 15 } },
  { tier: 'Legendary T1', stars: 1, parts: 4, cost: { designPlans: 115, hardenedAlloy: 61000, polishingSolution: 700, lunarAmber: 15 } },
  { tier: 'Legendary T1', stars: 2, parts: 4, cost: { designPlans: 120, hardenedAlloy: 63000, polishingSolution: 730, lunarAmber: 15 } },
  { tier: 'Legendary T1', stars: 3, parts: 4, cost: { designPlans: 125, hardenedAlloy: 65000, polishingSolution: 760, lunarAmber: 15 } },
  { tier: 'Legendary T2', stars: 0, parts: 4, cost: { designPlans: 135, hardenedAlloy: 68000, polishingSolution: 810, lunarAmber: 20 } },
  { tier: 'Legendary T2', stars: 1, parts: 4, cost: { designPlans: 140, hardenedAlloy: 70000, polishingSolution: 840, lunarAmber: 20 } },
  { tier: 'Legendary T2', stars: 2, parts: 4, cost: { designPlans: 145, hardenedAlloy: 72000, polishingSolution: 870, lunarAmber: 20 } },
  { tier: 'Legendary T2', stars: 3, parts: 4, cost: { designPlans: 150, hardenedAlloy: 74000, polishingSolution: 900, lunarAmber: 20 } },
  { tier: 'Legendary T3', stars: 0, parts: 4, cost: { designPlans: 160, hardenedAlloy: 77000, polishingSolution: 950, lunarAmber: 25 } },
  { tier: 'Legendary T3', stars: 1, parts: 4, cost: { designPlans: 165, hardenedAlloy: 80000, polishingSolution: 990, lunarAmber: 25 } },
  { tier: 'Legendary T3', stars: 2, parts: 4, cost: { designPlans: 170, hardenedAlloy: 83000, polishingSolution: 1030, lunarAmber: 25 } },
  { tier: 'Legendary T3', stars: 3, parts: 4, cost: { designPlans: 180, hardenedAlloy: 86000, polishingSolution: 1070, lunarAmber: 25 } },
  { tier: 'Legendary T4', stars: 0, parts: 5, cost: { designPlans: 250, hardenedAlloy: 120000, polishingSolution: 1500, lunarAmber: 40 } },
  { tier: 'Legendary T4', stars: 1, parts: 5, cost: { designPlans: 275, hardenedAlloy: 140000, polishingSolution: 1650, lunarAmber: 40 } },
  { tier: 'Legendary T4', stars: 2, parts: 5, cost: { designPlans: 300, hardenedAlloy: 160000, polishingSolution: 1800, lunarAmber: 40 } },
  { tier: 'Legendary T4', stars: 3, parts: 5, cost: { designPlans: 325, hardenedAlloy: 180000, polishingSolution: 1950, lunarAmber: 40 } },
  { tier: 'Legendary T5', stars: 0, parts: 5, cost: null },
  { tier: 'Legendary T5', stars: 1, parts: 5, cost: null },
  { tier: 'Legendary T5', stars: 2, parts: 5, cost: null },
  { tier: 'Legendary T5', stars: 3, parts: 5, cost: null },
  { tier: 'Legendary T6', stars: 0, parts: 5, cost: null },
  { tier: 'Legendary T6', stars: 1, parts: 5, cost: null },
  { tier: 'Legendary T6', stars: 2, parts: 5, cost: null },
  { tier: 'Legendary T6', stars: 3, parts: 5, cost: null },
];

/** How many slots a chief has. Independent, but they share this ladder. */
export const CHIEF_GEAR_SLOTS = 6;

/**
 * The six slots, named and ordered as the Chief Profile screen lays them out.
 *
 * The position is half the label on purpose: the screen shows the pieces in a
 * grid with no names on them, so "Top Left" is how a player actually finds the
 * one they mean.
 */
export const CHIEF_GEAR_SLOT_NAMES = [
  'Helmet (Top Left)',
  'Watch (Top Right)',
  'Jacket (Middle Left)',
  'Pants (Middle Right)',
  'Ring (Bottom Left)',
  'Cane (Bottom Right)',
];



export const chiefGearUpgradeLabel = (u: ChiefGearUpgrade) =>
  u.stars ? `${u.tier} (${u.stars} Star)` : u.tier;

/**
 * Splits a cost into instalments the way the game does: every part takes the
 * floor, and the remainder lands on the LAST parts. Fredrik's worked example
 * is 85 into four as 21, 21, 21, 22, and 530 into four as 132, 132, 133, 133.
 */
export const splitCost = (total: number, parts: number): number[] => {
  const base = Math.floor(total / parts);
  const remainder = total - base * parts;
  return Array.from({ length: parts }, (_, i) => base + (i >= parts - remainder ? 1 : 0));
};

export interface ChiefGearStep {
  /** Exactly as the event's scoring row spells it, so the two can be joined. */
  label: string;
  /** Index into CHIEF_GEAR_UPGRADES. */
  upgrade: number;
  /** 1-based instalment, and how many this upgrade takes. */
  part: number;
  parts: number;
  /** This instalment's share, or null when the upgrade has no costs yet. */
  cost: ChiefGearCost | null;
}

/**
 * Every step a slot can actually take, one per event scoring row.
 *
 * Built rather than typed: the labels are generated from the upgrade list and
 * checked against the event's rows, so the two cannot drift apart silently.
 */
export const CHIEF_GEAR_STEPS: ChiefGearStep[] = CHIEF_GEAR_UPGRADES.flatMap(
  (upgrade, index) => {
    const shares = upgrade.cost
      ? (Object.entries(upgrade.cost) as [ChiefGearMaterial, number][]).map(
          ([material, total]) => [material, splitCost(total, upgrade.parts)] as const
        )
      : null;

    const previous = index > 0 ? CHIEF_GEAR_UPGRADES[index - 1] : null;
    const leaving = previous
      ? previous.tier.replace(/ /g, '') +
        (previous.stars ? ` (${previous.stars}-Star Status: ` : ' (Status: ')
      : '';

    return Array.from({ length: upgrade.parts }, (_, part) => ({
      label:
        part === upgrade.parts - 1
          ? upgrade.tier.replace(/ /g, '') +
            (upgrade.stars ? ` (${upgrade.stars}-Star)` : '')
          : `${leaving}${part + 1})`,
      upgrade: index,
      part: part + 1,
      parts: upgrade.parts,
      cost: shares
        ? Object.fromEntries(
            shares.map(([m, list]) => [m, list[part]]).filter(([, v]) => (v as number) > 0)
          )
        : null,
    }));
  }
);

/** A step looked up by the event row that scores it. */
export const chiefGearStepByLabel = new Map(CHIEF_GEAR_STEPS.map(s => [s.label, s]));

/**
 * True for a label that could ONLY be a Chief Gear step.
 *
 * The bare tier names are shared with other things the game scores: an event's
 * hero shard rows are called Rare, Epic and Mythic too, and matching those
 * would have the planner filling in shard rows with gear upgrades. A star or a
 * Status marker is unambiguous, so a group has to contain at least one before
 * it counts as a gear group at all.
 */
export const isDistinctiveStepLabel = (label: string) =>
  chiefGearStepByLabel.has(label) && /\(\d-Star|Status:/.test(label);

/** Matches needed before a group is treated as a Chief Gear table. */
export const CHIEF_GEAR_MIN_MATCHES = 4;

/**
 * The Enhancement Material Exchange, unlocked by taking a first slot to
 * Mythic T2 (3 Star).
 *
 * The rates are deliberately lopsided: one Design Plan buys 300 Hardened Alloy,
 * but buying one back costs 1,000. Converting down is cheap and converting up
 * throws away seventy percent or more, and every round trip loses, so there is
 * no free loop to find. Design Plans are also the only route to Lunar Amber,
 * which is what makes this worth solving rather than ignoring.
 *
 * It is also why the planner warns about using it at all. Over the priced
 * ladder one slot needs 440 Lunar Amber, and at ten Design Plans each that is
 * 4,400 plans on top of the 4,540 the upgrades ask for directly. Buying the
 * Amber roughly doubles what a slot costs in plans, and Amber cannot be sold
 * back. That is where the wording in ChiefGearCard and ChiefGearPlan comes
 * from; recompute it here if the numbers ever change.
 *
 * `limit` is how many times a trade can be made before the daily reset.
 */
export interface ChiefGearExchange {
  from: ChiefGearMaterial;
  give: number;
  to: ChiefGearMaterial;
  get: number;
  limit: number;
}

export const CHIEF_GEAR_EXCHANGE: ChiefGearExchange[] = [
  { from: 'designPlans', give: 10, to: 'lunarAmber', get: 1, limit: 500 },
  { from: 'designPlans', give: 1, to: 'polishingSolution', get: 3, limit: 500 },
  { from: 'designPlans', give: 1, to: 'hardenedAlloy', get: 300, limit: 500 },
  { from: 'polishingSolution', give: 10, to: 'designPlans', get: 1, limit: 50 },
  { from: 'polishingSolution', give: 1, to: 'hardenedAlloy', get: 50, limit: 1000 },
  { from: 'hardenedAlloy', give: 1000, to: 'designPlans', get: 1, limit: 50 },
  { from: 'hardenedAlloy', give: 200, to: 'polishingSolution', get: 1, limit: 500 },
];

/**
 * What one unit is worth in Design Plans, taken from the rate at which a plan
 * buys it. Plans are the yardstick because they are the scarce currency and
 * the only thing that buys Lunar Amber.
 */
const UNIT_WORTH: Record<ChiefGearMaterial, number> = (() => {
  const out = { designPlans: 1 } as Record<ChiefGearMaterial, number>;
  for (const trade of CHIEF_GEAR_EXCHANGE) {
    if (trade.from === 'designPlans') out[trade.to] = trade.give / trade.get;
  }
  return out;
})();

/**
 * True when a trade breaks something scarce into something plentiful.
 *
 * This is the move worth warning about, and it is the one the planner reaches
 * for most: across six hundred simulated backpacks it broke Design Plans down
 * into Alloy or Polishing Solution in roughly four hundred of them, against a
 * hundred and fifteen that bought Lunar Amber.
 *
 * The damage is in the asymmetry. A Design Plan buys 300 Hardened Alloy, but
 * buying that plan back costs 1,000, so undoing it needs more than three times
 * what it gave you. Alloy and Polishing Solution come back from ordinary play;
 * Design Plans do not.
 *
 * Buying Lunar Amber is NOT a downgrade and is not warned about the same way:
 * plans are its only source, so there is nothing to avoid, only a price.
 */
export const isDowngrade = (trade: ChiefGearExchange) =>
  UNIT_WORTH[trade.to] < UNIT_WORTH[trade.from];

/** The upgrade a slot must finish before the exchange opens at all. */
export const EXCHANGE_UNLOCK_UPGRADE = CHIEF_GEAR_UPGRADES.findIndex(
  u => u.tier === 'Mythic T2' && u.stars === 3
);

/**
 * What one level up on the ladder above adds to a player's Chief Gear score.
 *
 * This is a property of the gear, not of any one event, and that was checked
 * rather than assumed: the popup was read out of two different events and the
 * 150 rows matched exactly. Events pay a flat rate per 1 gear score and differ
 * only in that rate, so the scores live here and each event supplies its own
 * `pointsPerSourceValue`.
 *
 * Those rates are NOT comparable with each other. Every event scores in its own
 * currency and resets when it next runs, so nothing here should be read as one
 * event being a better place to spend than another.
 *
 * Keeping one copy is not only tidiness. The planner matches an event group to
 * this ladder BY LABEL, so a second hand-copied list would eventually drift,
 * and a drifted label reads as a day that cannot be planned rather than as an
 * error anyone would notice.
 *
 * Transcribed from the in-game scoring tooltip. It ends at LegendaryT6
 * (3-Star); anything above that is missing rather than absent from the game.
 */
export const CHIEF_GEAR_SCORE_ROWS: ScoringRow[] = [
  { id: 'uncommon', label: 'Uncommon', sourceValue: 1125 },
  { id: 'uncommon-1-star', label: 'Uncommon (1-Star)', sourceValue: 1875 },
  { id: 'rare', label: 'Rare', sourceValue: 3000 },
  { id: 'rare-1-star', label: 'Rare (1-Star)', sourceValue: 4500 },
  { id: 'rare-2-star', label: 'Rare (2-Star)', sourceValue: 5100 },
  { id: 'rare-3-star', label: 'Rare (3-Star)', sourceValue: 5440 },
  { id: 'epic', label: 'Epic', sourceValue: 3230 },
  { id: 'epic-1-star', label: 'Epic (1-Star)', sourceValue: 3230 },
  { id: 'epic-2-star', label: 'Epic (2-Star)', sourceValue: 3225 },
  { id: 'epic-3-star', label: 'Epic (3-Star)', sourceValue: 3225 },
  { id: 'epict1', label: 'EpicT1', sourceValue: 3440 },
  { id: 'epict1-1-star', label: 'EpicT1 (1-Star)', sourceValue: 3440 },
  { id: 'epict1-2-star', label: 'EpicT1 (2-Star)', sourceValue: 4085 },
  { id: 'epict1-3-star', label: 'EpicT1 (3-Star)', sourceValue: 4085 },
  { id: 'mythic', label: 'Mythic', sourceValue: 6250 },
  { id: 'mythic-1-star', label: 'Mythic (1-Star)', sourceValue: 6250 },
  { id: 'mythic-2-star', label: 'Mythic (2-Star)', sourceValue: 6250 },
  { id: 'mythic-3-star', label: 'Mythic (3-Star)', sourceValue: 6250 },
  { id: 'mythict1', label: 'MythicT1', sourceValue: 6250 },
  { id: 'mythict1-1-star', label: 'MythicT1 (1-Star)', sourceValue: 6250 },
  { id: 'mythict1-2-star', label: 'MythicT1 (2-Star)', sourceValue: 6250 },
  { id: 'mythict1-3-star', label: 'MythicT1 (3-Star)', sourceValue: 6250 },
  { id: 'mythict2', label: 'MythicT2', sourceValue: 6250 },
  { id: 'mythict2-1-star', label: 'MythicT2 (1-Star)', sourceValue: 6250 },
  { id: 'mythict2-2-star', label: 'MythicT2 (2-Star)', sourceValue: 6250 },
  { id: 'mythict2-3-star', label: 'MythicT2 (3-Star)', sourceValue: 6250 },
  { id: 'mythict2-3-star-status-1', label: 'MythicT2 (3-Star Status: 1)', sourceValue: 2320 },
  { id: 'mythict2-3-star-status-2', label: 'MythicT2 (3-Star Status: 2)', sourceValue: 2320 },
  { id: 'mythict2-3-star-status-3', label: 'MythicT2 (3-Star Status: 3)', sourceValue: 2320 },
  { id: 'legendary', label: 'Legendary', sourceValue: 2600 },
  { id: 'legendary-status-1', label: 'Legendary (Status: 1)', sourceValue: 2320 },
  { id: 'legendary-status-2', label: 'Legendary (Status: 2)', sourceValue: 2320 },
  { id: 'legendary-status-3', label: 'Legendary (Status: 3)', sourceValue: 2320 },
  { id: 'legendary-1-star', label: 'Legendary (1-Star)', sourceValue: 2600 },
  { id: 'legendary-1-star-status-1', label: 'Legendary (1-Star Status: 1)', sourceValue: 2310 },
  { id: 'legendary-1-star-status-2', label: 'Legendary (1-Star Status: 2)', sourceValue: 2310 },
  { id: 'legendary-1-star-status-3', label: 'Legendary (1-Star Status: 3)', sourceValue: 2310 },
  { id: 'legendary-2-star', label: 'Legendary (2-Star)', sourceValue: 2630 },
  { id: 'legendary-2-star-status-1', label: 'Legendary (2-Star Status: 1)', sourceValue: 2330 },
  { id: 'legendary-2-star-status-2', label: 'Legendary (2-Star Status: 2)', sourceValue: 2330 },
  { id: 'legendary-2-star-status-3', label: 'Legendary (2-Star Status: 3)', sourceValue: 2330 },
  { id: 'legendary-3-star', label: 'Legendary (3-Star)', sourceValue: 2570 },
  { id: 'legendary-3-star-status-1', label: 'Legendary (3-Star Status: 1)', sourceValue: 2300 },
  { id: 'legendary-3-star-status-2', label: 'Legendary (3-Star Status: 2)', sourceValue: 2300 },
  { id: 'legendary-3-star-status-3', label: 'Legendary (3-Star Status: 3)', sourceValue: 2300 },
  { id: 'legendaryt1', label: 'LegendaryT1', sourceValue: 2660 },
  { id: 'legendaryt1-status-1', label: 'LegendaryT1 (Status: 1)', sourceValue: 2300 },
  { id: 'legendaryt1-status-2', label: 'LegendaryT1 (Status: 2)', sourceValue: 2300 },
  { id: 'legendaryt1-status-3', label: 'LegendaryT1 (Status: 3)', sourceValue: 2300 },
  { id: 'legendaryt1-1-star', label: 'LegendaryT1 (1-Star)', sourceValue: 2660 },
  { id: 'legendaryt1-1-star-status-1', label: 'LegendaryT1 (1-Star Status: 1)', sourceValue: 2320 },
  { id: 'legendaryt1-1-star-status-2', label: 'LegendaryT1 (1-Star Status: 2)', sourceValue: 2320 },
  { id: 'legendaryt1-1-star-status-3', label: 'LegendaryT1 (1-Star Status: 3)', sourceValue: 2320 },
  { id: 'legendaryt1-2-star', label: 'LegendaryT1 (2-Star)', sourceValue: 2600 },
  { id: 'legendaryt1-2-star-status-1', label: 'LegendaryT1 (2-Star Status: 1)', sourceValue: 2320 },
  { id: 'legendaryt1-2-star-status-2', label: 'LegendaryT1 (2-Star Status: 2)', sourceValue: 2320 },
  { id: 'legendaryt1-2-star-status-3', label: 'LegendaryT1 (2-Star Status: 3)', sourceValue: 2320 },
  { id: 'legendaryt1-3-star', label: 'LegendaryT1 (3-Star)', sourceValue: 2600 },
  { id: 'legendaryt1-3-star-status-1', label: 'LegendaryT1 (3-Star Status: 1)', sourceValue: 2370 },
  { id: 'legendaryt1-3-star-status-2', label: 'LegendaryT1 (3-Star Status: 2)', sourceValue: 2370 },
  { id: 'legendaryt1-3-star-status-3', label: 'LegendaryT1 (3-Star Status: 3)', sourceValue: 2370 },
  { id: 'legendaryt2', label: 'LegendaryT2', sourceValue: 2450 },
  { id: 'legendaryt2-status-1', label: 'LegendaryT2 (Status: 1)', sourceValue: 2390 },
  { id: 'legendaryt2-status-2', label: 'LegendaryT2 (Status: 2)', sourceValue: 2390 },
  { id: 'legendaryt2-status-3', label: 'LegendaryT2 (Status: 3)', sourceValue: 2390 },
  { id: 'legendaryt2-1-star', label: 'LegendaryT2 (1-Star)', sourceValue: 2390 },
  { id: 'legendaryt2-1-star-status-1', label: 'LegendaryT2 (1-Star Status: 1)', sourceValue: 2380 },
  { id: 'legendaryt2-1-star-status-2', label: 'LegendaryT2 (1-Star Status: 2)', sourceValue: 2380 },
  { id: 'legendaryt2-1-star-status-3', label: 'LegendaryT2 (1-Star Status: 3)', sourceValue: 2380 },
  { id: 'legendaryt2-2-star', label: 'LegendaryT2 (2-Star)', sourceValue: 2420 },
  { id: 'legendaryt2-2-star-status-1', label: 'LegendaryT2 (2-Star Status: 1)', sourceValue: 2380 },
  { id: 'legendaryt2-2-star-status-2', label: 'LegendaryT2 (2-Star Status: 2)', sourceValue: 2380 },
  { id: 'legendaryt2-2-star-status-3', label: 'LegendaryT2 (2-Star Status: 3)', sourceValue: 2380 },
  { id: 'legendaryt2-3-star', label: 'LegendaryT2 (3-Star)', sourceValue: 2420 },
  { id: 'legendaryt2-3-star-status-1', label: 'LegendaryT2 (3-Star Status: 1)', sourceValue: 2370 },
  { id: 'legendaryt2-3-star-status-2', label: 'LegendaryT2 (3-Star Status: 2)', sourceValue: 2370 },
  { id: 'legendaryt2-3-star-status-3', label: 'LegendaryT2 (3-Star Status: 3)', sourceValue: 2370 },
  { id: 'legendaryt3', label: 'LegendaryT3', sourceValue: 2450 },
  { id: 'legendaryt3-status-1', label: 'LegendaryT3 (Status: 1)', sourceValue: 2360 },
  { id: 'legendaryt3-status-2', label: 'LegendaryT3 (Status: 2)', sourceValue: 2360 },
  { id: 'legendaryt3-status-3', label: 'LegendaryT3 (Status: 3)', sourceValue: 2360 },
  { id: 'legendaryt3-1-star', label: 'LegendaryT3 (1-Star)', sourceValue: 2480 },
  { id: 'legendaryt3-1-star-status-1', label: 'LegendaryT3 (1-Star Status: 1)', sourceValue: 2360 },
  { id: 'legendaryt3-1-star-status-2', label: 'LegendaryT3 (1-Star Status: 2)', sourceValue: 2360 },
  { id: 'legendaryt3-1-star-status-3', label: 'LegendaryT3 (1-Star Status: 3)', sourceValue: 2360 },
  { id: 'legendaryt3-2-star', label: 'LegendaryT3 (2-Star)', sourceValue: 2480 },
  { id: 'legendaryt3-2-star-status-1', label: 'LegendaryT3 (2-Star Status: 1)', sourceValue: 2370 },
  { id: 'legendaryt3-2-star-status-2', label: 'LegendaryT3 (2-Star Status: 2)', sourceValue: 2370 },
  { id: 'legendaryt3-2-star-status-3', label: 'LegendaryT3 (2-Star Status: 3)', sourceValue: 2370 },
  { id: 'legendaryt3-3-star', label: 'LegendaryT3 (3-Star)', sourceValue: 2450 },
  { id: 'legendaryt3-3-star-status-1', label: 'LegendaryT3 (3-Star Status: 1)', sourceValue: 3190 },
  { id: 'legendaryt3-3-star-status-2', label: 'LegendaryT3 (3-Star Status: 2)', sourceValue: 3090 },
  { id: 'legendaryt3-3-star-status-3', label: 'LegendaryT3 (3-Star Status: 3)', sourceValue: 3090 },
  { id: 'legendaryt3-3-star-status-4', label: 'LegendaryT3 (3-Star Status: 4)', sourceValue: 3100 },
  { id: 'legendaryt4', label: 'LegendaryT4', sourceValue: 3090 },
  { id: 'legendaryt4-status-1', label: 'LegendaryT4 (Status: 1)', sourceValue: 3020 },
  { id: 'legendaryt4-status-2', label: 'LegendaryT4 (Status: 2)', sourceValue: 3100 },
  { id: 'legendaryt4-status-3', label: 'LegendaryT4 (Status: 3)', sourceValue: 3090 },
  { id: 'legendaryt4-status-4', label: 'LegendaryT4 (Status: 4)', sourceValue: 3100 },
  { id: 'legendaryt4-1-star', label: 'LegendaryT4 (1-Star)', sourceValue: 3090 },
  { id: 'legendaryt4-1-star-status-1', label: 'LegendaryT4 (1-Star Status: 1)', sourceValue: 3020 },
  { id: 'legendaryt4-1-star-status-2', label: 'LegendaryT4 (1-Star Status: 2)', sourceValue: 3090 },
  { id: 'legendaryt4-1-star-status-3', label: 'LegendaryT4 (1-Star Status: 3)', sourceValue: 3100 },
  { id: 'legendaryt4-1-star-status-4', label: 'LegendaryT4 (1-Star Status: 4)', sourceValue: 3090 },
  { id: 'legendaryt4-2-star', label: 'LegendaryT4 (2-Star)', sourceValue: 3100 },
  { id: 'legendaryt4-2-star-status-1', label: 'LegendaryT4 (2-Star Status: 1)', sourceValue: 3010 },
  { id: 'legendaryt4-2-star-status-2', label: 'LegendaryT4 (2-Star Status: 2)', sourceValue: 3100 },
  { id: 'legendaryt4-2-star-status-3', label: 'LegendaryT4 (2-Star Status: 3)', sourceValue: 3090 },
  { id: 'legendaryt4-2-star-status-4', label: 'LegendaryT4 (2-Star Status: 4)', sourceValue: 3100 },
  { id: 'legendaryt4-3-star', label: 'LegendaryT4 (3-Star)', sourceValue: 3090 },
  { id: 'legendaryt4-3-star-status-1', label: 'LegendaryT4 (3-Star Status: 1)', sourceValue: 3020 },
  { id: 'legendaryt4-3-star-status-2', label: 'LegendaryT4 (3-Star Status: 2)', sourceValue: 3100 },
  { id: 'legendaryt4-3-star-status-3', label: 'LegendaryT4 (3-Star Status: 3)', sourceValue: 3090 },
  { id: 'legendaryt4-3-star-status-4', label: 'LegendaryT4 (3-Star Status: 4)', sourceValue: 3090 },
  { id: 'legendaryt5', label: 'LegendaryT5', sourceValue: 3100 },
  { id: 'legendaryt5-status-1', label: 'LegendaryT5 (Status: 1)', sourceValue: 3020 },
  { id: 'legendaryt5-status-2', label: 'LegendaryT5 (Status: 2)', sourceValue: 3090 },
  { id: 'legendaryt5-status-3', label: 'LegendaryT5 (Status: 3)', sourceValue: 3100 },
  { id: 'legendaryt5-status-4', label: 'LegendaryT5 (Status: 4)', sourceValue: 3090 },
  { id: 'legendaryt5-1-star', label: 'LegendaryT5 (1-Star)', sourceValue: 3090 },
  { id: 'legendaryt5-1-star-status-1', label: 'LegendaryT5 (1-Star Status: 1)', sourceValue: 3020 },
  { id: 'legendaryt5-1-star-status-2', label: 'LegendaryT5 (1-Star Status: 2)', sourceValue: 3100 },
  { id: 'legendaryt5-1-star-status-3', label: 'LegendaryT5 (1-Star Status: 3)', sourceValue: 3090 },
  { id: 'legendaryt5-1-star-status-4', label: 'LegendaryT5 (1-Star Status: 4)', sourceValue: 3100 },
  { id: 'legendaryt5-2-star', label: 'LegendaryT5 (2-Star)', sourceValue: 3090 },
  { id: 'legendaryt5-2-star-status-1', label: 'LegendaryT5 (2-Star Status: 1)', sourceValue: 3020 },
  { id: 'legendaryt5-2-star-status-2', label: 'LegendaryT5 (2-Star Status: 2)', sourceValue: 3090 },
  { id: 'legendaryt5-2-star-status-3', label: 'LegendaryT5 (2-Star Status: 3)', sourceValue: 3100 },
  { id: 'legendaryt5-2-star-status-4', label: 'LegendaryT5 (2-Star Status: 4)', sourceValue: 3090 },
  { id: 'legendaryt5-3-star', label: 'LegendaryT5 (3-Star)', sourceValue: 3100 },
  { id: 'legendaryt5-3-star-status-1', label: 'LegendaryT5 (3-Star Status: 1)', sourceValue: 3020 },
  { id: 'legendaryt5-3-star-status-2', label: 'LegendaryT5 (3-Star Status: 2)', sourceValue: 3090 },
  { id: 'legendaryt5-3-star-status-3', label: 'LegendaryT5 (3-Star Status: 3)', sourceValue: 3090 },
  { id: 'legendaryt5-3-star-status-4', label: 'LegendaryT5 (3-Star Status: 4)', sourceValue: 3100 },
  { id: 'legendaryt6', label: 'LegendaryT6', sourceValue: 3090 },
  { id: 'legendaryt6-status-1', label: 'LegendaryT6 (Status: 1)', sourceValue: 3020 },
  { id: 'legendaryt6-status-2', label: 'LegendaryT6 (Status: 2)', sourceValue: 3100 },
  { id: 'legendaryt6-status-3', label: 'LegendaryT6 (Status: 3)', sourceValue: 3090 },
  { id: 'legendaryt6-status-4', label: 'LegendaryT6 (Status: 4)', sourceValue: 3100 },
  { id: 'legendaryt6-1-star', label: 'LegendaryT6 (1-Star)', sourceValue: 3090 },
  { id: 'legendaryt6-1-star-status-1', label: 'LegendaryT6 (1-Star Status: 1)', sourceValue: 3020 },
  { id: 'legendaryt6-1-star-status-2', label: 'LegendaryT6 (1-Star Status: 2)', sourceValue: 3090 },
  { id: 'legendaryt6-1-star-status-3', label: 'LegendaryT6 (1-Star Status: 3)', sourceValue: 3100 },
  { id: 'legendaryt6-1-star-status-4', label: 'LegendaryT6 (1-Star Status: 4)', sourceValue: 3090 },
  { id: 'legendaryt6-2-star', label: 'LegendaryT6 (2-Star)', sourceValue: 3100 },
  { id: 'legendaryt6-2-star-status-1', label: 'LegendaryT6 (2-Star Status: 1)', sourceValue: 3010 },
  { id: 'legendaryt6-2-star-status-2', label: 'LegendaryT6 (2-Star Status: 2)', sourceValue: 3100 },
  { id: 'legendaryt6-2-star-status-3', label: 'LegendaryT6 (2-Star Status: 3)', sourceValue: 3090 },
  { id: 'legendaryt6-2-star-status-4', label: 'LegendaryT6 (2-Star Status: 4)', sourceValue: 3100 },
  { id: 'legendaryt6-3-star', label: 'LegendaryT6 (3-Star)', sourceValue: 3090 },
];
