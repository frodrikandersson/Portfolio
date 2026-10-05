import {
  whiteoutExperts,
  type ExpertDefinition,
  type ExpertSkill,
} from '../data/whiteoutExperts';
import {
  expertProgress,
  consumableCount,
  gatesPaidFor,
  type WhiteoutInventory,
} from '../models/whiteoutInventory';
import { skillCapAt } from '../data/whiteoutExpertSkillCaps';
import { totalSkillRequired, totalSkillLevel } from '../data/whiteoutExpertTotalSkill';

/**
 * Planning which expert skills to raise, which nothing did before.
 *
 * The engine already REFUSED to score books and sigils an expert cannot take:
 * spendableBooks subtracts the ones with nowhere to go, and spendableExpertSigils
 * sums each expert's own sigils against the gates they have left. What it never
 * did was say WHERE any of it should go, so the capping was invisible and read
 * as though the whole bag was being scored.
 *
 * The shape of the problem is not the same as charms or pets. Those pay per
 * point of score gained, so the planner is choosing what to buy. An expert
 * event pays PER BOOK SPENT and PER MINUTE OF LEARNING SPEEDUP, so the points
 * follow the bill rather than the benefit. That makes the goal "get as much of
 * the bag spent as the experts can absorb", and the ranking below is about
 * fitting the budget, not about which skill is worth having.
 */

/** One level of one skill, the smallest thing that can be bought. */
export interface SkillStep {
  expertId: string;
  expertName: string;
  skillId: string;
  skillName: string;
  /** False where no relationship cap is recorded for this skill. */
  capKnown: boolean;
  /** The level this step moves from, so 0 means Lv 0 to Lv 1. */
  fromLevel: number;
  books: number;
  learningMinutes: number;
}

export interface ExpertPlan {
  steps: SkillStep[];
  booksSpent: number;
  booksLeft: number;
  /** Learning time the chosen steps need in all. */
  minutesNeeded: number;
  /** Of that, how much the speedup pile can actually cover. */
  minutesSped: number;
  minutesLeft: number;
  /** Points from the books and the sped minutes together. */
  points: number;
  /** Books with nowhere to go, because every unlocked skill is capped. */
  booksStranded: number;
  /** True when no expert is ticked, so nothing can be planned at all. */
  noExperts: boolean;
}

/** Every buyable step, cheapest first. Talents are skipped: they cost nothing. */
export const skillSteps = (inv: WhiteoutInventory): SkillStep[] => {
  const steps: SkillStep[] = [];
  for (const expert of whiteoutExperts) {
    const progress = expertProgress(inv, expert.id);
    if (!progress.unlocked) continue;
    /*
     * The cap is keyed on the STATUS, not the level.
     *
     * wostools records these against "relationship level" at multiples of ten,
     * and a multiple of ten is exactly a gate. The gate is what the status
     * follows, so an expert sitting at Lv 70 with the 70 gate unpaid is still
     * Casual 3 and still capped where Casual 3 caps them. Reading the raw level
     * here was what offered Cyrille's Entrapment Lv 10, which needs Close 1, to
     * a Cyrille at Lv 70 who had not bought it.
     */
    const paid = gatesPaidFor(inv, expert.id);
    // The levels as this walk leaves them, so the running total reflects the
    // steps already offered rather than only what is in the bag.
    const planned: Record<string, number> = {};
    for (const skill of expert.skills) {
      planned[skill.id] = Math.min(
        Math.max(progress.skillLevels[skill.id] ?? 0, 0),
        skill.maxLevel
      );
    }
    const relationship = paid * 10;
    /*
     * A SKILL HAS TO BE UNLOCKED BEFORE IT CAN BE RAISED, and that is a gate
     * too. The Nth non-talent skill unlocks at the Nth gate: skill 1 at
     * Acquaintance 1, skill 4 at Casual 1.
     *
     * Published by wostools as "Skill 1 unlocks at Relationship Lv 10, Skill 2
     * at Lv 20, Skill 3 at Lv 30, Skill 4 at Lv 40", and confirmed twice
     * against Fredrik's game: Romulus's One Heart is his fourth non-talent
     * skill and the game asks for Casual 1, which is the fourth gate; and at
     * Acquaintance 2 his third and fourth skills are both shown locked.
     *
     * The index counts only the four learnable skills. The talent sits among
     * them in the data and rises with the relationship on its own, so counting
     * it would push every skill after it one gate too far.
     */
    let unlockIndex = 0;
    for (const skill of expert.skills) {
      if (skill.isTalent) continue;
      unlockIndex += 1;
      if (paid < unlockIndex) continue;
      const at = Math.min(Math.max(progress.skillLevels[skill.id] ?? 0, 0), skill.maxLevel);
      // The relationship ceiling, which is a separate gate from the books.
      // Where a cap is recorded the plan stops at it rather than offering a
      // level the game will refuse; where none is, the step is still offered
      // and marked, because 43 of the 50 skills have no cap data at all.
      const { cap, known, next } = skillCapAt(expert.id, skill.id, relationship);
      /*
       * Two different kinds of "the recorded cap is below where you stand".
       *
       * A cap you have already beaten proves the ladder carries on past where
       * anyone wrote it down, so it cannot be used as a ceiling. But that does
       * NOT make the skill uncapped, and treating it that way was the bug that
       * put Cyrille's Entrapment Lv 9 to 10 back in the plan.
       *
       *   ENTRAPMENT. Recorded 20->4, 30->7, 40->7, 70->10. At Casual 3 the
       *   last rung at or below her is 7 and she is at 9, so 7 is stale. But
       *   there is a HIGHER rung she has not reached, 70->10, and she cannot
       *   have reached the cap recorded there. Her ceiling is therefore 9: one
       *   below the next rung. Entrapment Lv 10 waits for the gate at 70.
       *
       *   SCAVENGING. Recorded 20->2, 30->2 and nothing above. She is at 4 with
       *   no higher rung to bound her, so the cap really is unknown and the
       *   skill is left alone rather than pinned to a number from Lv 30.
       */
      let ceiling = skill.maxLevel;
      let capIsKnown = false;
      if (known) {
        const below = Math.max(cap ?? 0, at);
        if (next) {
          // A rung she has not climbed to is a real bound, whatever the stale
          // one below her says.
          ceiling = Math.min(below, next.cap - 1, skill.maxLevel);
          capIsKnown = true;
        } else if ((cap ?? 0) >= at) {
          ceiling = Math.min(cap ?? 0, skill.maxLevel);
          capIsKnown = true;
        }
      }
      for (let level = at; level < ceiling; level += 1) {
        /*
         * The Total Expert Skill gate.
         *
         * The sum of this expert's four learnable skills has to reach a figure
         * the game prints on the skill screen. The total RISES as the plan
         * takes levels, so it is recomputed against the levels this plan has
         * already bought, not against the levels in the bag: taking Scavenging
         * up can be what unlocks Ursa's Bane.
         *
         * Only recorded requirements block. See whiteoutExpertTotalSkill.ts
         * for why there is no formula here.
         */
        const needed = totalSkillRequired(expert.id, skill.id, level + 1);
        if (needed !== null && totalSkillLevel(expert.skills, planned) < needed) break;
        // Learning a skill from scratch is free, so it scores nothing and is
        // not a plan step. It was being listed as "Lv 0 -> 1, 0 books, 0m",
        // which read as advice and was only noise.
        if ((skill.bookCosts[level] ?? 0) <= 0) continue;
        planned[skill.id] = level + 1;
        steps.push({
          expertId: expert.id,
          expertName: expert.name,
          skillId: skill.id,
          skillName: skill.name,
          capKnown: capIsKnown,
          fromLevel: level,
          books: skill.bookCosts[level] ?? 0,
          learningMinutes: skill.learningTimeMinutes[level] ?? 0,
        });
      }
    }
  }
  return steps;
};

/**
 * Would paying one more gate open a skill level this expert cannot take now?
 *
 * Answered by building the steps twice, once as things stand and once with the
 * status nudged up one, rather than by reasoning about the ladders. The gate
 * rules live in skillSteps, so asking it directly cannot drift from it.
 */
export const gateUnlocksASkill = (inv: WhiteoutInventory, expertId: string) => {
  const now = skillSteps(inv).filter(s => s.expertId === expertId).length;
  const progress = expertProgress(inv, expertId);
  const nudged: WhiteoutInventory = {
    ...inv,
    experts: {
      ...inv.experts,
      [expertId]: {
        ...progress,
        // One gate further on, which also needs the level to allow it.
        affinityLevel: Math.max(progress.affinityLevel, (gatesPaidFor(inv, expertId) + 1) * 10),
        gatesPaid: gatesPaidFor(inv, expertId) + 1,
      },
    },
  };
  return skillSteps(nudged).filter(s => s.expertId === expertId).length > now;
};

interface PlanInput {
  steps: SkillStep[];
  books: number;
  learningMinutes: number;
  pointsPerBook: number;
  pointsPerLearningMinute: number;
  noExperts: boolean;
}

/**
 * Picks the steps to run.
 *
 * CHEAPEST FIRST IS NOT GOOD ENOUGH, which is worth recording because it is the
 * obvious answer and it looks right. Every book scores the same wherever it
 * goes, so taking the most levels does spend the most books. But learning
 * speedup minutes score too, and a cheap skill level is usually a short one.
 * Measured against brute force on 1,680 instances, cheapest-first was beaten on
 * 1,181 of them, by up to 72% on the events that pay far more per minute than
 * per book.
 *
 * So the pool is run several times under different rankings and the best result
 * kept. The rankings are not arbitrary: each one is the exactly right answer in
 * some regime, and which regime an event is in depends on its two rates and on
 * how big the speedup pile is relative to the learning time on offer.
 *
 * Steps are taken in skill order because a skill cannot be jumped: Lv 3 needs
 * Lv 1 and Lv 2 first. `available` is what enforces that, rather than trusting
 * a sort to keep each chain in order.
 */

/** How a ranking scores one step. Higher is taken sooner. */
type Ranking = (step: SkillStep, rb: number, rm: number) => number;

const RANKINGS: Ranking[] = [
  // Most value per book, assuming the pile covers the learning time. Right
  // whenever speedups are not the binding constraint.
  (s, rb, rm) => (s.books * rb + s.learningMinutes * rm) / Math.max(s.books, 1),
  // Most books spent, ignoring time. Right when the pile is tiny, where the
  // minutes score nothing beyond the first few steps anyway.
  s => -s.books,
  // Most learning time per book. Right when a minute is worth far more than a
  // book, which is the case cheapest-first lost 72% on.
  s => s.learningMinutes / Math.max(s.books, 1),
  // Most learning time outright, for a generous book budget and a thin pile.
  s => s.learningMinutes,
];

const runGreedy = (
  steps: SkillStep[],
  books: number,
  pile: number,
  rb: number,
  rm: number,
  rank: Ranking
) => {
  // Where each skill currently sits, so only the next level is ever offered.
  const at = new Map<string, number>();
  for (const s of steps) {
    const key = s.expertId + '/' + s.skillId;
    const low = at.get(key);
    if (low === undefined || s.fromLevel < low) at.set(key, s.fromLevel);
  }

  const remaining = new Set(steps);
  const chosen: SkillStep[] = [];
  let booksLeft = Math.max(books, 0);
  let minutes = 0;

  for (;;) {
    let pick: SkillStep | null = null;
    let pickScore = -Infinity;
    for (const step of remaining) {
      const key = step.expertId + '/' + step.skillId;
      if (at.get(key) !== step.fromLevel) continue;
      if (step.books > booksLeft) continue;
      const score = rank(step, rb, rm);
      if (score > pickScore) {
        pickScore = score;
        pick = step;
      }
    }
    if (!pick) break;
    remaining.delete(pick);
    at.set(pick.expertId + '/' + pick.skillId, pick.fromLevel + 1);
    booksLeft -= pick.books;
    minutes += pick.learningMinutes;
    chosen.push(pick);
  }

  const sped = Math.min(minutes, Math.max(pile, 0));
  const booksSpent = Math.max(books, 0) - booksLeft;
  return {
    chosen,
    booksSpent,
    booksLeft,
    minutesNeeded: minutes,
    minutesSped: sped,
    points: booksSpent * rb + sped * rm,
  };
};

/**
 * The exact shape of the problem, solved properly.
 *
 * Each skill offers a PREFIX: take its next k levels for a cumulative price in
 * books and in learning time, k from 0 to however many it has left. Choosing
 * one prefix per skill under a book budget is a multiple-choice knapsack, and
 * the greedies above cannot see it, because the step that is worth having is
 * often behind two cheap ones that are not.
 *
 * The objective is maximised over minutes rather than over points, because
 * min(minutes, pile) is not separable and a DP cannot carry it. Books are
 * tracked alongside so the real objective can be evaluated at every budget at
 * the end, which is where the trade between "more books" and "more time" is
 * actually settled.
 *
 * Buckets, because book budgets run to hundreds of thousands and an exact axis
 * would be tens of millions of cells. The bucket is read off the RUNNING REAL
 * TOTAL, never by rounding each cost on the way in. Rounding each cost up was
 * the first attempt and it quietly accumulated: four steps that fit a budget of
 * 1,750 exactly landed one cell past the end of the array, so the planner could
 * not see the only plan that filled the budget and came in 8.21% short.
 */
const BUCKETS = 2000;

const runDp = (steps: SkillStep[], books: number, pile: number, rb: number, rm: number) => {
  // Group into skill chains, each already in level order.
  const chains = new Map<string, SkillStep[]>();
  for (const step of steps) {
    const key = step.expertId + '/' + step.skillId;
    chains.set(key, [...(chains.get(key) ?? []), step]);
  }
  const groups = [...chains.values()].map(list =>
    [...list].sort((a, b) => a.fromLevel - b.fromLevel)
  );

  const room = steps.reduce((t, x) => t + x.books, 0);
  const budget = Math.min(Math.max(books, 0), room);
  if (budget <= 0 || !groups.length) {
    return { chosen: [] as SkillStep[], booksSpent: 0, booksLeft: Math.max(books, 0),
             minutesNeeded: 0, minutesSped: 0, points: 0 };
  }
  const scale = Math.max(1, Math.ceil(budget / BUCKETS));
  const cells = Math.floor(budget / scale) + 1;

  // minutes[b] and realBooks[b] for the best-minutes plan costing bucket b.
  let minutes = new Float64Array(cells).fill(-1);
  let realBooks = new Float64Array(cells);
  minutes[0] = 0;
  // pick[g][b] = how many levels of group g the plan at bucket b took.
  const picks: Int16Array[] = [];
  const parents: Int32Array[] = [];

  for (const group of groups) {
    const nextMinutes = new Float64Array(cells).fill(-1);
    const nextBooks = new Float64Array(cells);
    const took = new Int16Array(cells).fill(-1);
    const from = new Int32Array(cells).fill(-1);
    // Cumulative prefixes, k = 0 meaning take none.
    let cumBooks = 0;
    let cumMinutes = 0;
    const prefixes: { k: number; books: number; minutes: number }[] = [
      { k: 0, books: 0, minutes: 0 },
    ];
    for (let k = 0; k < group.length; k += 1) {
      cumBooks += group[k].books;
      cumMinutes += group[k].learningMinutes;
      prefixes.push({ k: k + 1, books: cumBooks, minutes: cumMinutes });
    }
    for (let b = 0; b < cells; b += 1) {
      if (minutes[b] < 0) continue;
      for (const prefix of prefixes) {
        const spent = realBooks[b] + prefix.books;
        if (spent > budget) continue;
        const at = Math.min(Math.floor(spent / scale), cells - 1);
        const total = minutes[b] + prefix.minutes;
        if (total > nextMinutes[at]) {
          nextMinutes[at] = total;
          nextBooks[at] = spent;
          took[at] = prefix.k;
          from[at] = b;
        }
      }
    }
    minutes = nextMinutes;
    realBooks = nextBooks;
    picks.push(took);
    parents.push(from);
  }

  // The trade is settled here: every budget is priced with the real objective.
  let bestAt = -1;
  let bestPoints = -1;
  for (let b = 0; b < cells; b += 1) {
    if (minutes[b] < 0) continue;
    const value = realBooks[b] * rb + Math.min(minutes[b], Math.max(pile, 0)) * rm;
    if (value > bestPoints) {
      bestPoints = value;
      bestAt = b;
    }
  }
  if (bestAt < 0) {
    return { chosen: [] as SkillStep[], booksSpent: 0, booksLeft: Math.max(books, 0),
             minutesNeeded: 0, minutesSped: 0, points: 0 };
  }

  // Walk the picks back to the steps themselves.
  const chosen: SkillStep[] = [];
  let at = bestAt;
  for (let g = groups.length - 1; g >= 0; g -= 1) {
    const k = picks[g][at];
    if (k === undefined || k < 0) break;
    const group = groups[g];
    for (let i = 0; i < k; i += 1) chosen.push(group[i]);
    const previous = parents[g][at];
    if (previous < 0) break;
    at = previous;
  }

  const booksSpent = chosen.reduce((t, x) => t + x.books, 0);
  const minutesNeeded = chosen.reduce((t, x) => t + x.learningMinutes, 0);
  const sped = Math.min(minutesNeeded, Math.max(pile, 0));
  return {
    chosen,
    booksSpent,
    booksLeft: Math.max(books, 0) - booksSpent,
    minutesNeeded,
    minutesSped: sped,
    points: booksSpent * rb + sped * rm,
  };
};

export const planExpertSkills = ({
  steps,
  books,
  learningMinutes,
  pointsPerBook,
  pointsPerLearningMinute,
  noExperts,
}: PlanInput): ExpertPlan => {
  const pile = Math.max(learningMinutes, 0);
  // The DP is the one that understands the prefix structure; the greedies are
  // kept because bucketing can round the DP just under a budget the greedy
  // fills exactly, and taking the better of the two costs nothing.
  let best = runDp(steps, books, pile, pointsPerBook, pointsPerLearningMinute);

  /*
   * A second DP, run on a disguised instance, for the events where a book is
   * worth far more than a minute. The one above maximises MINUTES and prices
   * the result afterwards, which is the right move when time is what pays; it
   * is the wrong one when books are, and that was the last 8% of gap left.
   *
   * Swapping each step's minutes for its books makes the same solver maximise
   * books instead. The plan it returns is then priced on the real objective,
   * so the disguise never escapes into the answer.
   */
  const asBooks = steps.map(x => ({ ...x, learningMinutes: x.books }));
  const booksFirst = runDp(asBooks, books, Number.POSITIVE_INFINITY, pointsPerBook, 1);
  if (booksFirst.chosen.length) {
    const picked = booksFirst.chosen.map(
      x => steps.find(o => o.expertId === x.expertId && o.skillId === x.skillId && o.fromLevel === x.fromLevel) ?? x
    );
    const booksSpent = picked.reduce((t, x) => t + x.books, 0);
    const minutesNeeded = picked.reduce((t, x) => t + x.learningMinutes, 0);
    const sped = Math.min(minutesNeeded, pile);
    const points = booksSpent * pointsPerBook + sped * pointsPerLearningMinute;
    if (points > best.points) {
      best = {
        chosen: picked,
        booksSpent,
        booksLeft: Math.max(books, 0) - booksSpent,
        minutesNeeded,
        minutesSped: sped,
        points,
      };
    }
  }

  for (const rank of RANKINGS) {
    const run = runGreedy(steps, books, pile, pointsPerBook, pointsPerLearningMinute, rank);
    if (run.points > best.points) best = run;
  }

  // What the experts could never take, however many books are held.
  const roomForBooks = steps.reduce((total, s) => total + s.books, 0);
  const booksStranded = Math.max(0, Math.max(books, 0) - roomForBooks);

  return {
    steps: best.chosen,
    booksSpent: best.booksSpent,
    booksLeft: best.booksLeft,
    minutesNeeded: best.minutesNeeded,
    minutesSped: best.minutesSped,
    minutesLeft: Math.max(pile - best.minutesSped, 0),
    points: best.points,
    booksStranded,
    noExperts,
  };
};

/** The whole thing, from a bag. */
export const planExpertsFor = (
  inv: WhiteoutInventory,
  pointsPerBook: number,
  pointsPerLearningMinute: number,
  learningMinutes: number
): ExpertPlan =>
  planExpertSkills({
    steps: skillSteps(inv),
    books: consumableCount(inv, 'book-of-knowledge'),
    learningMinutes,
    pointsPerBook,
    pointsPerLearningMinute,
    noExperts: !whiteoutExperts.some(e => expertProgress(inv, e.id).unlocked),
  });

/**
 * Where Expert Sigils can go, per expert.
 *
 * Sigils are not interchangeable: each expert's own sigil fits only them, and
 * only up to the relationship gates they have left. A pile of Gareth sigils is
 * worth nothing to a player who has not recruited Gareth, which is exactly the
 * case the totals in the backpack hide.
 */
export interface SigilRoom {
  expert: ExpertDefinition;
  /** Sigils of this expert's own kind in the bag. */
  held: number;
  /** Sigils the remaining gates would take. */
  room: number;
  /** What can actually be spent, which is the lower of the two. */
  usable: number;
}

export const sigilRooms = (
  inv: WhiteoutInventory,
  roomFor: (expert: ExpertDefinition) => number
): SigilRoom[] =>
  whiteoutExperts
    .filter(expert => expertProgress(inv, expert.id).unlocked)
    .map(expert => {
      const held = consumableCount(inv, `sigil-${expert.id}`);
      const room = roomFor(expert);
      return { expert, held, room, usable: Math.min(held, room) };
    })
    .filter(r => r.held > 0 || r.room > 0);

export type { ExpertSkill };
