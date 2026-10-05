// Relationship level caps on expert skill levels.
//
// WHY THIS FILE EXISTS. An expert skill cannot be raised past a level its
// RELATIONSHIP allows, which is separate from whether you hold the Books of
// Knowledge. Without it the planner cheerfully recommended Cyrille's Entrapment
// Lv 9 to Lv 10 for a player whose relationship with her was Casual 3, where
// that level needs Close 1. The books were there; the level was not available.
//
// SOURCING, AND WHY IT IS THIN. Nothing publishes these as a table. The game
// shows the requirement only on the skill you are looking at, which is no use
// for planning. wostools.net's experts calculator carries a `relLevelCaps`
// field, and their own page says it "enforces every cap that has been verified
// in-game" and that the caps "do not follow a universal formula; they vary
// per-skill". Pulled out of their data module, it covers 7 of 50 skills. That
// is what is below, unchanged, plus one row Fredrik read off his own game.
//
// A NOTE ON THE SHAPE. Each key is a relationship level and its value is the
// highest that skill may reach there. They are NOT a formula: Holger's Arena
// Star reaches Lv 10 at relationship 50, while Baldur's Blazing Sunrise needs
// 70 for the same level. Do not interpolate between them and do not extend a
// ladder past its last recorded key.
//
// EDIT FREELY: add a row whenever the game shows you one. A skill missing from
// this file is treated as unknown rather than uncapped, and says so.

/** Relationship level to the highest skill level allowed at it. */
export type SkillCapLadder = Record<number, number>;

export const EXPERT_SKILL_CAPS: Record<string, Record<string, SkillCapLadder>> = {
  cyrille: {
    // 20, 30 and 40 from wostools. The 70 is Fredrik's own: the game refused
    // Entrapment Lv 10 at Casual 3 and named Close 1, which is level 70.
    entrapment: { 20: 4, 30: 7, 40: 7, 70: 10 },
    scavenging: { 20: 2, 30: 2 },
  },
  holger: {
    'crowd-pleaser': { 50: 7 },
    'arena-star': { 50: 10 },
  },
  baldur: {
    'blazing-sunrise': { 60: 9, 70: 10 },
  },
  ronne: {
    'treasure-scent': { 30: 4 },
  },
  gareth: {
    'undefeated-will': { 10: 5, 20: 10, 30: 14, 40: 19, 50: 20 },
  },
};

export interface SkillCap {
  /** The highest level confirmed available at this relationship, or null. */
  cap: number | null;
  /**
   * False where nothing is recorded for the skill at all, so the planner is
   * working without a cap rather than with a known one.
   */
  known: boolean;
  /**
   * The next relationship level that is recorded to raise the cap, with the
   * level it raises it to. Null when nothing higher is recorded.
   */
  next: { atRelationship: number; cap: number } | null;
}

/**
 * What a skill may reach at a given relationship level.
 *
 * Reads the highest recorded key at or below the relationship. Anything above
 * the last recorded key is deliberately NOT extrapolated: the cap there is
 * unknown, and the planner treats the last known value as the safe ceiling
 * rather than guessing that it keeps climbing.
 */
export const skillCapAt = (
  expertId: string,
  skillId: string,
  relationship: number
): SkillCap => {
  const ladder = EXPERT_SKILL_CAPS[expertId]?.[skillId];
  if (!ladder) return { cap: null, known: false, next: null };

  const keys = Object.keys(ladder)
    .map(Number)
    .sort((a, b) => a - b);
  const level = Math.max(relationship, 0);

  let cap: number | null = null;
  for (const key of keys) {
    if (key <= level) cap = ladder[key];
  }
  const nextKey = keys.find(k => k > level);
  return {
    cap,
    known: true,
    next: nextKey === undefined ? null : { atRelationship: nextKey, cap: ladder[nextKey] },
  };
};
