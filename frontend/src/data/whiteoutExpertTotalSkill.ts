// The "Total Expert Skill" gate on upgrading an expert skill.
//
// WHAT IT IS. The skill screen's To Upgrade box prints a line like
// "Total Expert Skill: Lv.27/Lv.29" in red. The left number is the sum of that
// expert's four learnable skill levels; the right is what the upgrade wants.
// Books alone are not enough: the gate blocks the upgrade outright.
//
// WHY THIS IS A TABLE AND NOT A FORMULA. Nothing publishes it, so the only way
// to a formula is to fit one to observations, and one observation is not
// enough to fit anything safely. Worse, the arithmetic rules out the obvious
// shapes outright. From Fredrik's Cyrille:
//
//   skills      Entrapment 9, Scavenging 4, Weapon Master 5 (max), Ursa's Bane 9
//   total       27
//   maxes       10, 5, 5, 10, so 30 is the most she can ever total
//   observed    Ursa's Bane 9 -> 10 wants a total of 29
//
// The obvious path out is Fredrik's: take Entrapment to 10 and Scavenging to 5,
// which is 10 + 5 + 5 + 9 = 29, and Ursa's Bane is then free to follow. That
// only works if Entrapment's own level 10 is NOT also gated at 29, and nobody
// has seen what it asks for. So the requirement may well vary per skill, and
// the two formulas that fit the single observed point, 3L-1 and "target plus
// the others capped at L-1", both give 29 for every level 10 and would block
// that path. Fitting either one would be guessing at the shape of a rule from
// one reading of it.
//
// So this file records what has actually been seen and nothing else. A skill
// with no entry is not blocked, because no entry means no knowledge, not no
// requirement.
//
// EDIT FREELY: every red "Total Expert Skill Lv.x/Lv.y" you meet is one row.
// Keyed expert, then skill, then the level being upgraded TO.

/** Required total, keyed by the level the skill is being raised to. */
export type TotalSkillLadder = Record<number, number>;

export const EXPERT_TOTAL_SKILL: Record<string, Record<string, TotalSkillLadder>> = {
  cyrille: {
    // Read off the game by Fredrik: Lv 9 to Lv 10 shows Lv.27/Lv.29.
    "ursas-bane": { 10: 29 },
  },
};

/**
 * The total an expert needs before a skill may be raised to `toLevel`.
 *
 * Null where nothing has been recorded, which the planner treats as "no reason
 * to block" rather than as "no requirement".
 */
export const totalSkillRequired = (
  expertId: string,
  skillId: string,
  toLevel: number
): number | null => EXPERT_TOTAL_SKILL[expertId]?.[skillId]?.[toLevel] ?? null;

/** The sum of an expert's learnable skill levels, which is what the gate reads. */
export const totalSkillLevel = (
  skills: { id: string; isTalent: boolean }[],
  levels: Record<string, number>
) =>
  skills
    .filter(skill => !skill.isTalent)
    .reduce((total, skill) => total + Math.max(levels[skill.id] ?? 0, 0), 0);
