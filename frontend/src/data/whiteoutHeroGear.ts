// Hero gear: enhancement XP, the Legendary tier, and Mastery Forging.
//
// THREE SYSTEMS SIT ON ONE PIECE OF GEAR and they are easy to confuse:
//
//   ENHANCEMENT ("Empower") pours XP into a piece, Lv 0 to 100. The XP comes
//   from Enhancement components, +10 green and +100 purple, or from feeding it
//   spare gear. This is the ladder below.
//
//   THE LEGENDARY TIER continues past 100 once the piece breaks through. Its
//   levels cost far more XP, and five of them are material milestones paid in
//   Mithril and Legendary Gear rather than XP. Mithril is what makes this
//   interesting for scoring: some events pay well for it.
//
//   MASTERY FORGING is a separate track on the same piece, paid in Essence
//   Stones and, past level 10, in whole Mythic Gear pieces. The screenshot in
//   the game shows both at once: "Lv. 8" on the icon is Mastery, "Enhancement
//   Level Lv.0" below it is the ladder here.
//
// SOURCING. The Mythic ladder is the strong one: Fredrik read it off the game
// and gave the rule and sixteen anchors, and the wiki's hundred row table
// reproduces every single level of it with no disagreement. The Legendary tier
// is the wiki alone, cross-checked against wos-guide.com for the XP column and
// the Mithril milestones. See MASTERY_FORGING below for why that one carries a
// warning.
//
// EDIT FREELY: correcting a number here is all that is needed.

/** XP to go from level n to n+1, for n = 0 to 99. Index 0 is Lv 0 -> Lv 1. */
export const MYTHIC_ENHANCE_XP: number[] = [
  10, 15, 20, 25, 30, 35, 40, 45, 50, 55,
  60, 65, 70, 75, 80, 85, 90, 95, 100, 105,
  110, 115, 120, 125, 130, 135, 140, 145, 150, 160,
  170, 180, 190, 200, 210, 220, 230, 240, 250, 270,
  290, 310, 330, 350, 370, 390, 410, 430, 450, 470,
  490, 510, 530, 550, 570, 590, 610, 630, 650, 680,
  710, 740, 770, 800, 830, 860, 890, 920, 950, 990,
  1030, 1070, 1110, 1150, 1190, 1230, 1270, 1310, 1350, 1400,
  1450, 1500, 1550, 1600, 1650, 1700, 1750, 1800, 1850, 1900,
  1950, 2000, 2050, 2100, 2150, 2200, 2250, 2300, 2350, 2400,
];

export const MYTHIC_MAX_LEVEL = MYTHIC_ENHANCE_XP.length;

/** Everything it takes to carry one piece from Lv 0 to Lv 100. */
export const MYTHIC_TOTAL_XP = MYTHIC_ENHANCE_XP.reduce((a, b) => a + b, 0);

/** The components XP comes in. Spare gear also works, at its own rate. */
export const ENHANCE_COMPONENT_XP = { green: 10, purple: 100 };

/**
 * XP to REACH each Legendary level, for the levels paid in XP.
 *
 * Levels 1, 20, 40, 60, 80 and 100 are missing on purpose: those are paid in
 * materials instead, and live in LEGENDARY_BREAKTHROUGHS.
 */
export const LEGENDARY_ENHANCE_XP: Record<number, number> = {
  2: 2500, 3: 2550, 4: 2600, 5: 2650, 6: 2700, 7: 2750,
  8: 2800, 9: 2850, 10: 2900, 11: 2950, 12: 3000, 13: 3050,
  14: 3100, 15: 3150, 16: 3200, 17: 3250, 18: 3300, 19: 3350,
  21: 3450, 22: 3500, 23: 3550, 24: 3600, 25: 3650, 26: 3700,
  27: 3750, 28: 3800, 29: 3850, 30: 3900, 31: 3950, 32: 4000,
  33: 4050, 34: 4100, 35: 4150, 36: 4200, 37: 4250, 38: 4300,
  39: 4350, 41: 4450, 42: 4500, 43: 4550, 44: 4600, 45: 4650,
  46: 4700, 47: 4750, 48: 4800, 49: 4850, 50: 4900, 51: 4950,
  52: 5000, 53: 5050, 54: 5100, 55: 5150, 56: 5200, 57: 5250,
  58: 5300, 59: 5350, 61: 5500, 62: 5600, 63: 5700, 64: 5800,
  65: 5900, 66: 6000, 67: 6100, 68: 6200, 69: 6300, 70: 6400,
  71: 6500, 72: 6600, 73: 6700, 74: 6800, 75: 6900, 76: 7000,
  77: 7100, 78: 7200, 79: 7300, 81: 7500, 82: 7600, 83: 7700,
  84: 7800, 85: 7900, 86: 8000, 87: 8100, 88: 8200, 89: 8300,
  90: 8400, 91: 8500, 92: 8600, 93: 8700, 94: 8800, 95: 8900,
  96: 9000, 97: 9100, 98: 9200, 99: 9300,
};

/**
 * The levels bought with materials rather than XP.
 *
 * Fredrik first described Mithril as starting at Lv 100 and later corrected
 * that himself: it is spent at every one of these. Level 1 is the breakthrough
 * into Legendary and costs gear alone.
 */
export const LEGENDARY_BREAKTHROUGHS: Record<number, { legendaryGear: number; mithril: number }> = {
  1: { legendaryGear: 2, mithril: 0 },
  20: { legendaryGear: 3, mithril: 10 },
  40: { legendaryGear: 5, mithril: 20 },
  60: { legendaryGear: 5, mithril: 30 },
  80: { legendaryGear: 10, mithril: 40 },
  100: { legendaryGear: 10, mithril: 50 },
};

export const LEGENDARY_TOTAL_XP = Object.values(LEGENDARY_ENHANCE_XP).reduce((a, b) => a + b, 0);

export const LEGENDARY_TOTAL_MITHRIL = Object.values(LEGENDARY_BREAKTHROUGHS).reduce(
  (sum, b) => sum + b.mithril,
  0
);

export const LEGENDARY_TOTAL_GEAR = Object.values(LEGENDARY_BREAKTHROUGHS).reduce(
  (sum, b) => sum + b.legendaryGear,
  0
);

/**
 * Mastery Forging, the Essence Stone track.
 *
 * Levels 1 to 3 are a single step each. From level 4 the game splits every
 * level into five smaller steps, stage 0 through stage 4, so a player pays a
 * little at a time instead of saving for a whole level. It is the same shape as
 * the Chief Gear Status steps, except this one runs to stage 4 rather than 3.
 *
 * Mythic Gear is eaten as a component from level 11 upward, which is why spare
 * Mythic pieces are worth keeping even unequipped. It is not wanted on every
 * step though: it is sprinkled across the stages so the per-level totals come
 * out right, so six of the steps past level 11 cost stones alone. Somebody
 * short of spare pieces can still move on those.
 *
 * SOURCING. whiteoutdata.com gives per-level totals and the wiki gives the
 * per-stage breakdown. They looked like they disagreed on seventeen of twenty
 * levels; they do not. A wiki row is the cost to REACH that level.stage, so the
 * stages of level L are progress toward L+1. Bucketed that way the two agree on
 * all twenty levels, for stones and for gear, to the unit.
 */
export interface MasteryStep {
  level: number;
  /** 0 to 4. Always 0 below level 4, where the game had no stages. */
  stage: number;
  stones: number;
  mythicGear?: number;
  /** The stat bonus the piece carries once this step is done. */
  stat: string;
}

export const MASTERY_STEPS: MasteryStep[] = [
  { level: 1, stage: 0, stones: 10, stat: '10%' },
  { level: 2, stage: 0, stones: 20, stat: '20%' },
  { level: 3, stage: 0, stones: 30, stat: '30%' },
  { level: 4, stage: 0, stones: 40, stat: '40%' },
  { level: 4, stage: 1, stones: 10, stat: '42%' },
  { level: 4, stage: 2, stones: 10, stat: '44%' },
  { level: 4, stage: 3, stones: 10, stat: '46%' },
  { level: 4, stage: 4, stones: 10, stat: '48%' },
  { level: 5, stage: 0, stones: 10, stat: '50%' },
  { level: 5, stage: 1, stones: 12, stat: '52%' },
  { level: 5, stage: 2, stones: 12, stat: '54%' },
  { level: 5, stage: 3, stones: 12, stat: '56%' },
  { level: 5, stage: 4, stones: 12, stat: '58%' },
  { level: 6, stage: 0, stones: 12, stat: '60%' },
  { level: 6, stage: 1, stones: 14, stat: '62%' },
  { level: 6, stage: 2, stones: 14, stat: '64%' },
  { level: 6, stage: 3, stones: 14, stat: '66%' },
  { level: 6, stage: 4, stones: 14, stat: '68%' },
  { level: 7, stage: 0, stones: 14, stat: '70%' },
  { level: 7, stage: 1, stones: 16, stat: '72%' },
  { level: 7, stage: 2, stones: 16, stat: '74%' },
  { level: 7, stage: 3, stones: 16, stat: '76%' },
  { level: 7, stage: 4, stones: 16, stat: '78%' },
  { level: 8, stage: 0, stones: 16, stat: '80%' },
  { level: 8, stage: 1, stones: 18, stat: '82%' },
  { level: 8, stage: 2, stones: 18, stat: '84%' },
  { level: 8, stage: 3, stones: 18, stat: '86%' },
  { level: 8, stage: 4, stones: 18, stat: '88%' },
  { level: 9, stage: 0, stones: 18, stat: '90%' },
  { level: 9, stage: 1, stones: 20, stat: '92%' },
  { level: 9, stage: 2, stones: 20, stat: '94%' },
  { level: 9, stage: 3, stones: 20, stat: '96%' },
  { level: 9, stage: 4, stones: 20, stat: '98%' },
  { level: 10, stage: 0, stones: 20, stat: '100%' },
  { level: 10, stage: 1, stones: 22, stat: '102%' },
  { level: 10, stage: 2, stones: 22, stat: '104%' },
  { level: 10, stage: 3, stones: 22, stat: '106%' },
  { level: 10, stage: 4, stones: 22, stat: '108%' },
  { level: 11, stage: 0, stones: 22, mythicGear: 1, stat: '110%' },
  { level: 11, stage: 1, stones: 24, stat: '112%' },
  { level: 11, stage: 2, stones: 24, stat: '114%' },
  { level: 11, stage: 3, stones: 24, mythicGear: 1, stat: '116%' },
  { level: 11, stage: 4, stones: 24, stat: '118%' },
  { level: 12, stage: 0, stones: 24, mythicGear: 1, stat: '120%' },
  { level: 12, stage: 1, stones: 26, stat: '122%' },
  { level: 12, stage: 2, stones: 26, mythicGear: 1, stat: '124%' },
  { level: 12, stage: 3, stones: 26, stat: '126%' },
  { level: 12, stage: 4, stones: 26, mythicGear: 1, stat: '128%' },
  { level: 13, stage: 0, stones: 26, mythicGear: 1, stat: '130%' },
  { level: 13, stage: 1, stones: 28, stat: '132%' },
  { level: 13, stage: 2, stones: 28, mythicGear: 1, stat: '134%' },
  { level: 13, stage: 3, stones: 28, mythicGear: 1, stat: '136%' },
  { level: 13, stage: 4, stones: 28, mythicGear: 1, stat: '138%' },
  { level: 14, stage: 0, stones: 28, mythicGear: 1, stat: '140%' },
  { level: 14, stage: 1, stones: 30, mythicGear: 1, stat: '142%' },
  { level: 14, stage: 2, stones: 30, mythicGear: 1, stat: '144%' },
  { level: 14, stage: 3, stones: 30, mythicGear: 1, stat: '146%' },
  { level: 14, stage: 4, stones: 30, mythicGear: 1, stat: '148%' },
  { level: 15, stage: 0, stones: 30, mythicGear: 1, stat: '150%' },
  { level: 15, stage: 1, stones: 32, mythicGear: 1, stat: '152%' },
  { level: 15, stage: 2, stones: 32, mythicGear: 1, stat: '154%' },
  { level: 15, stage: 3, stones: 32, mythicGear: 1, stat: '156%' },
  { level: 15, stage: 4, stones: 32, mythicGear: 1, stat: '158%' },
  { level: 16, stage: 0, stones: 32, mythicGear: 2, stat: '160%' },
  { level: 16, stage: 1, stones: 34, mythicGear: 1, stat: '162%' },
  { level: 16, stage: 2, stones: 34, mythicGear: 1, stat: '164%' },
  { level: 16, stage: 3, stones: 34, mythicGear: 2, stat: '166%' },
  { level: 16, stage: 4, stones: 34, mythicGear: 1, stat: '168%' },
  { level: 17, stage: 0, stones: 34, mythicGear: 2, stat: '170%' },
  { level: 17, stage: 1, stones: 36, mythicGear: 1, stat: '172%' },
  { level: 17, stage: 2, stones: 36, mythicGear: 2, stat: '174%' },
  { level: 17, stage: 3, stones: 36, mythicGear: 1, stat: '176%' },
  { level: 17, stage: 4, stones: 36, mythicGear: 2, stat: '178%' },
  { level: 18, stage: 0, stones: 36, mythicGear: 2, stat: '180%' },
  { level: 18, stage: 1, stones: 38, mythicGear: 1, stat: '182%' },
  { level: 18, stage: 2, stones: 38, mythicGear: 2, stat: '184%' },
  { level: 18, stage: 3, stones: 38, mythicGear: 2, stat: '186%' },
  { level: 18, stage: 4, stones: 38, mythicGear: 2, stat: '188%' },
  { level: 19, stage: 0, stones: 38, mythicGear: 2, stat: '190%' },
  { level: 19, stage: 1, stones: 40, mythicGear: 2, stat: '192%' },
  { level: 19, stage: 2, stones: 40, mythicGear: 2, stat: '194%' },
  { level: 19, stage: 3, stones: 40, mythicGear: 2, stat: '196%' },
  { level: 19, stage: 4, stones: 40, mythicGear: 2, stat: '198%' },
  { level: 20, stage: 0, stones: 40, mythicGear: 2, stat: '200%' },
];

export const MASTERY_FORGING = {
  maxLevel: 20,
  /** The level at which the game starts splitting a level into stages. */
  stagesFromLevel: 4,
  stagesPerLevel: 5,
  totalEssenceStones: MASTERY_STEPS.reduce((sum, s) => sum + s.stones, 0),
  totalMythicGear: MASTERY_STEPS.reduce((sum, s) => sum + (s.mythicGear ?? 0), 0),
  /** Mythic Gear is consumed as a component from this level upward. */
  gearNeededFromLevel: 11,
  /** Fredrik: a piece needs this much Mastery before it can break through. */
  masteryNeededToBreakThrough: 10,
};

/** Essence Stones and Mythic Gear to go from one point on the ladder to another. */
export const masteryCost = (
  from: { level: number; stage: number },
  to: { level: number; stage: number }
) => {
  const rank = (p: { level: number; stage: number }) => p.level * 10 + p.stage;
  let stones = 0;
  let mythicGear = 0;
  for (const step of MASTERY_STEPS) {
    const at = rank(step);
    if (at > rank(from) && at <= rank(to)) {
      stones += step.stones;
      mythicGear += step.mythicGear ?? 0;
    }
  }
  return { stones, mythicGear };
};

/**
 * What feeding a spare piece of gear is worth in Enhancement XP.
 *
 * Kept for completeness rather than as an input. Fredrik's point is that the
 * game gives no good way to count what is in the bag, so asking a player how
 * many grey pieces they are sitting on would get a guess, and a guess would
 * quietly become a score. The countable things are the +10 and +100 components
 * in ENHANCE_COMPONENT_XP, which stack with a number on them.
 */
export const SPARE_GEAR_XP = {
  grey: 10,
  green: 30,
  blue: 60,
  purple: 150,
} as const;

/** The three hero classes, each fielding its own set of four pieces. */
export const GEAR_CLASSES = ['infantry', 'lancer', 'marksman'] as const;
export type GearClass = (typeof GEAR_CLASSES)[number];

/** The four slots a hero wears. */
export const GEAR_SLOTS = ['helm', 'gloves', 'belt', 'boots'] as const;
export type GearSlot = (typeof GEAR_SLOTS)[number];

export const GEAR_CLASS_LABELS: Record<GearClass, string> = {
  infantry: 'Infantry',
  lancer: 'Lancer',
  marksman: 'Marksman',
};

export const GEAR_SLOT_LABELS: Record<GearSlot, string> = {
  helm: 'Helm',
  gloves: 'Gloves',
  belt: 'Belt',
  boots: 'Boots',
};

/**
 * The twelve pieces, as `class-slot`.
 *
 * Heroes do not share a gear pool, so each of these is its own independent
 * ladder rather than a share of something. Twelve separate pieces is why the
 * input has to be laid out as a grid and not a list.
 */
export const GEAR_PIECES = GEAR_CLASSES.flatMap(cls =>
  GEAR_SLOTS.map(slot => ({ id: `${cls}-${slot}`, cls, slot }))
);

export type GearTier = 'mythic' | 'legendary';

export const GEAR_TIER_LABELS: Record<GearTier, string> = {
  mythic: 'Mythic',
  legendary: 'Legendary',
};

/**
 * Where one piece currently sits.
 *
 * The two tracks are independent and easy to confuse, which is why they are
 * named apart here: `enhanceLevel` is the Empower ladder on the bar, and
 * `masteryLevel`/`masteryStage` is the Essence Stone track shown on the icon.
 */
export interface GearPieceState {
  tier: GearTier;
  /** 0 to 100 on either ladder. */
  enhanceLevel: number;
  /** 0 to 20. */
  masteryLevel: number;
  /** 0 to 4, and always 0 below the level where the game added stages. */
  masteryStage: number;
}

export const emptyGearPiece = (): GearPieceState => ({
  tier: 'mythic',
  enhanceLevel: 0,
  masteryLevel: 0,
  masteryStage: 0,
});

/**
 * Mithril is the reason any of this scores.
 *
 * Nothing pays for Enhancement XP or Essence Stones directly. Mithril does get
 * paid for, and it is only ever spent at the Legendary breakthroughs, so the
 * scoring question is how many of those a player can reach rather than how far
 * a bar moves. King of Icefield stage 4 pays 40,000 a piece.
 */
export const MITHRIL_IS_SPENT_AT = Object.keys(LEGENDARY_BREAKTHROUGHS)
  .map(Number)
  .filter(level => LEGENDARY_BREAKTHROUGHS[level].mithril > 0)
  .sort((a, b) => a - b);

/** XP to take one piece from `from` to `to` on the Mythic ladder. */
export const mythicEnhanceCost = (from: number, to: number) => {
  let total = 0;
  for (let level = Math.max(from, 0); level < Math.min(to, MYTHIC_MAX_LEVEL); level += 1) {
    total += MYTHIC_ENHANCE_XP[level];
  }
  return total;
};

/**
 * Mithril a single piece has still to swallow.
 *
 * A Mythic piece has every breakthrough ahead of it. A Legendary one has only
 * the breakthroughs above its current level, because the ones below are paid.
 *
 * This is an upper bound on what can be spent, not a forecast. Reaching the
 * next breakthrough also takes Enhancement XP, and there is no way to count
 * the spare gear in a player's bag, so the XP side is not checked here.
 */
export const mithrilRemainingForPiece = (piece: GearPieceState) => {
  const from = piece.tier === 'legendary' ? piece.enhanceLevel : 0;
  return MITHRIL_IS_SPENT_AT.filter(level => level > from).reduce(
    (total, level) => total + LEGENDARY_BREAKTHROUGHS[level].mithril,
    0
  );
};
