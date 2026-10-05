// How far eighteen Chief Charms can be pushed on the materials in the bag.
//
// THE UNIT OF DECISION IS A JUMP, NOT A STEP. The ladder is not monotone: a
// step can be worse value than the one after it, so a planner that buys the
// best next step repeatedly will stop short of a good level because a bad one
// guards it. Measured on the real table, score per material rises again at six
// of the seventy-four transitions, the worst being Lv. 2 at 22.7 a material
// against Lv. 3's 31.3 and Lv. 4's 48.6. A charm parked on Lv. 2 is sitting
// right in front of the cheapest climb in the game, and a step-at-a-time
// planner would never tell it to move.
//
// So a candidate is any position a charm could climb to, not just the next
// one, and they are ranked by value.
//
// AND EVERY POSITION IS A CANDIDATE, WHICH IS NOT WHERE THIS STARTED. The
// first version offered only the upper convex hull of (cost, score) from where
// each charm stood, on the reasoning that a point under the hull is never
// worth stopping at. That is true with money to spare and false when the bag
// is nearly empty. From Lv. 2 the hull's first point is Lv. 4, because Lv. 3
// is dominated; given 120 Guides and 120 Designs, Lv. 4 costs 140 Guides and
// cannot be had, so the planner bought NOTHING and scored zero where Lv. 3
// alone was affordable and worth 3,125. The brute force caught it on the first
// run. A dominated position you can afford beats a better one you cannot.
//
// LEVEL ONE IS THE WHOLE GAME EARLY ON. 625 score for five Guides and five
// Designs is 62.5 a material, against 48.6 for the next best anywhere and
// under 20 for most of the ladder. Eighteen charms off zero cost 90 Guides and
// 90 Designs and score 11,250. Nothing else here comes close, which is why
// every plan opens with it.
//
// THREE POOLS, NOT ONE. Guides, Designs and Secrets are not interchangeable,
// and Secrets do not appear until Lv. 11.1 and then wall hard at 575 a charm.
// A flat summed cost would undervalue them badly once they bind, so jumps are
// ranked by how much of each REMAINING pool they eat, which re-weights itself
// as the pools drain.
//
// That ranking is still a heuristic for a three-constraint knapsack, so it is
// measured rather than trusted: the test brute-forces every allocation on
// reduced instances, with the real ladder, and compares.

import { CHARM_STEPS, CHARM_COUNT } from '../data/whiteoutChiefCharms';

/** Where one charm stands: how many of the 75 steps it has finished. */
export type CharmPosition = number;

export const CHARM_STEP_COUNT = CHARM_STEPS.length;

/**
 * Cumulative cost and score from Lv. 0 to each position.
 *
 * Indexed by position, so the cost of any jump is one subtraction. Without
 * this the planner walks the ladder for every candidate it considers and the
 * whole thing goes quadratic in a hot loop.
 */
const CUM = (() => {
  const guides = new Int32Array(CHARM_STEP_COUNT + 1);
  const designs = new Int32Array(CHARM_STEP_COUNT + 1);
  const secrets = new Int32Array(CHARM_STEP_COUNT + 1);
  const score = new Int32Array(CHARM_STEP_COUNT + 1);
  for (let i = 0; i < CHARM_STEP_COUNT; i += 1) {
    const s = CHARM_STEPS[i];
    guides[i + 1] = guides[i] + s.guides;
    designs[i + 1] = designs[i] + s.designs;
    secrets[i + 1] = secrets[i] + (s.secrets ?? 0);
    score[i + 1] = score[i] + s.score;
  }
  return { guides, designs, secrets, score };
})();

export interface CharmJump {
  /** Steps finished before the jump, and after it. */
  from: CharmPosition;
  to: CharmPosition;
  guides: number;
  designs: number;
  secrets: number;
  score: number;
}

export interface PlannedCharmJump extends CharmJump {
  /** Which of the eighteen charms, by index. */
  charm: number;
}

export interface CharmPlan {
  jumps: PlannedCharmJump[];
  /** Where every charm ends up. */
  positions: CharmPosition[];
  spent: { guides: number; designs: number; secrets: number };
  left: { guides: number; designs: number; secrets: number };
  /** Charm score gained, which is what events multiply by their own rate. */
  score: number;
  /** Pools something wanted and could not have. */
  limitingFactors: ('guides' | 'designs' | 'secrets')[];
}

export interface CharmPlanInput {
  /** Steps finished on each charm. Short or long arrays are tolerated. */
  positions: CharmPosition[];
  guides: number;
  designs: number;
  secrets: number;
}

/**
 * How a jump's cost is weighed against what is left.
 *
 * Every scheme returns a number to divide the score by, so smaller is better
 * value. They disagree on purpose: which one wins depends on which pool is the
 * wall, and the planner runs them all rather than betting on one.
 */
type CostWeight = (
  cost: { guides: number; designs: number; secrets: number },
  left: { guides: number; designs: number; secrets: number },
  held: { guides: number; designs: number; secrets: number }
) => number;

const WEIGHTS: CostWeight[] = [
  // Share of what is REMAINING. Re-weights as the pools drain, so a scarce
  // pool gets dearer the closer it comes to running out.
  (c, l) =>
    (l.guides > 0 ? c.guides / l.guides : 0) +
    (l.designs > 0 ? c.designs / l.designs : 0) +
    (l.secrets > 0 ? c.secrets / l.secrets : 0),
  // Share of what was HELD at the start. Fixed, so early jumps are not
  // flattered by how little the first few leave behind.
  (c, _l, h) =>
    (h.guides > 0 ? c.guides / h.guides : 0) +
    (h.designs > 0 ? c.designs / h.designs : 0) +
    (h.secrets > 0 ? c.secrets / h.secrets : 0),
  // Flat materials. Ignores scarcity entirely, which is right when the pools
  // are balanced and the cheapest jump really is the best one.
  c => c.guides + c.designs + c.secrets,
  // The bottleneck alone: whichever pool this jump eats the most OF. This is
  // the one that wins on a lopsided bag, where only the scarce pool matters.
  (c, l) =>
    Math.max(
      l.guides > 0 ? c.guides / l.guides : c.guides > 0 ? Infinity : 0,
      l.designs > 0 ? c.designs / l.designs : c.designs > 0 ? Infinity : 0,
      l.secrets > 0 ? c.secrets / l.secrets : c.secrets > 0 ? Infinity : 0
    ),
];

/** Cost of climbing one charm from `from` to `to`. */
export const charmJumpCost = (from: CharmPosition, to: CharmPosition): CharmJump => ({
  from,
  to,
  guides: CUM.guides[to] - CUM.guides[from],
  designs: CUM.designs[to] - CUM.designs[from],
  secrets: CUM.secrets[to] - CUM.secrets[from],
  score: CUM.score[to] - CUM.score[from],
});

const clampPosition = (p: unknown): CharmPosition => {
  const n = Number(p);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(Math.floor(n), CHARM_STEP_COUNT);
};

/**
 * Spends the three pools across eighteen charms.
 *
 * Repeatedly takes the best-value jump available anywhere, where value is
 * score divided by the share of the REMAINING pools the jump consumes. That
 * weighting is what keeps Secrets from being spent like Guides once they start
 * to bind: a jump wanting a tenth of the remaining Secrets is charged a tenth,
 * however small that is in absolute terms.
 *
 * Ties go to the shorter jump, so the plan commits as little as possible for
 * the same value and leaves the bag able to answer a better option later.
 */
export function planCharms(input: CharmPlanInput): CharmPlan {
  const start = Array.from({ length: CHARM_COUNT }, (_, i) =>
    clampPosition(input.positions?.[i])
  );
  const held = {
    guides: Math.max(Math.floor(Number(input.guides) || 0), 0),
    designs: Math.max(Math.floor(Number(input.designs) || 0), 0),
    secrets: Math.max(Math.floor(Number(input.secrets) || 0), 0),
  };

  let best: CharmPlan | null = null;
  for (const weigh of WEIGHTS) {
    const plan = repair(start, held, runGreedy(start, held, weigh), weigh);
    if (!best || plan.score > best.score) best = plan;
  }
  return best as CharmPlan;
}

/** How many repair sweeps to allow before calling it settled. */
const MAX_REPAIR_PASSES = 12;

/**
 * How many steps a charm may be asked to give back at once.
 *
 * One step closed most of the gap. More closes the rest: the cases left over
 * needed a charm to give up a short run, not a single step, before the refund
 * was large enough to buy anything better. The cost is linear and the whole
 * search still settles in milliseconds.
 */
const MAX_STEPS_BACK = 6;

/**
 * Hands one step back, per charm, and sees whether the refund buys more.
 *
 * Accepts only a strict improvement, which is what stops it cycling: giving a
 * step back and being handed the same one straight back scores the same and is
 * refused. Repeats while anything improves, capped so a pathological bag
 * cannot spin.
 */
function repair(
  start: CharmPosition[],
  held: { guides: number; designs: number; secrets: number },
  plan: CharmPlan,
  weigh: CostWeight
): CharmPlan {
  let bestPlan = plan;

  for (let pass = 0; pass < MAX_REPAIR_PASSES; pass += 1) {
    let improved = false;

    for (let charm = 0; charm < CHARM_COUNT; charm += 1) {
      const at = bestPlan.positions[charm];
      // Only ground this planner gained is given back. A charm the player
      // already owns is never proposed for a downgrade.
      if (at <= start[charm]) continue;

      for (let back = 1; back <= MAX_STEPS_BACK; back += 1) {
      const target = at - back;
      if (target < start[charm]) break;
      const held2 = {
        guides: held.guides,
        designs: held.designs,
        secrets: held.secrets,
      };
      const floor = [...bestPlan.positions];
      floor[charm] = target;

      // Re-fill from the stepped-back board, charging it what the board
      // already cost rather than starting the bag over.
      const already = floor.reduce(
        (acc, p, i) => {
          const c = charmJumpCost(start[i], p);
          acc.guides += c.guides;
          acc.designs += c.designs;
          acc.secrets += c.secrets;
          return acc;
        },
        { guides: 0, designs: 0, secrets: 0 }
      );
      held2.guides -= already.guides;
      held2.designs -= already.designs;
      held2.secrets -= already.secrets;
      if (held2.guides < 0 || held2.designs < 0 || held2.secrets < 0) continue;

      // Pinned where it was stepped back to, so the refill cannot simply hand
      // the same step back and call it even.
      const ceiling = new Array(CHARM_COUNT).fill(CHARM_STEP_COUNT);
      ceiling[charm] = floor[charm];
      const refilled = runGreedy(floor, held2, weigh, ceiling);
      const score = refilled.score + floor.reduce(
        (acc, p, i) => acc + (CUM.score[p] - CUM.score[start[i]]),
        0
      );

      if (score > bestPlan.score + 1e-9) {
        bestPlan = rebuild(start, held, refilled.positions);
        improved = true;
        break;
      }
      }
    }

    if (!improved) break;
  }

  return bestPlan;
}

/**
 * A plan stated as the jumps from `start` to `positions`.
 *
 * The repair pass works on boards rather than on jump lists, so the winning
 * board is turned back into a plan here. One jump per charm that moved, which
 * also reads better than the many small hops the greedy actually took.
 */
function rebuild(
  start: CharmPosition[],
  held: { guides: number; designs: number; secrets: number },
  positions: CharmPosition[]
): CharmPlan {
  const jumps: PlannedCharmJump[] = [];
  const spent = { guides: 0, designs: 0, secrets: 0 };
  let score = 0;

  for (let charm = 0; charm < CHARM_COUNT; charm += 1) {
    if (positions[charm] <= start[charm]) continue;
    const j = charmJumpCost(start[charm], positions[charm]);
    jumps.push({ ...j, charm });
    spent.guides += j.guides;
    spent.designs += j.designs;
    spent.secrets += j.secrets;
    score += j.score;
  }

  const left = {
    guides: held.guides - spent.guides,
    designs: held.designs - spent.designs,
    secrets: held.secrets - spent.secrets,
  };

  // Which pools now block the cheapest remaining step anywhere.
  const limitingFactors: CharmPlan['limitingFactors'] = [];
  const blocked = { guides: false, designs: false, secrets: false };
  for (let charm = 0; charm < CHARM_COUNT; charm += 1) {
    const at = positions[charm];
    if (at >= CHARM_STEP_COUNT) continue;
    const next = charmJumpCost(at, at + 1);
    if (next.guides > left.guides) blocked.guides = true;
    if (next.designs > left.designs) blocked.designs = true;
    if (next.secrets > left.secrets) blocked.secrets = true;
  }
  if (blocked.guides) limitingFactors.push('guides');
  if (blocked.designs) limitingFactors.push('designs');
  if (blocked.secrets) limitingFactors.push('secrets');

  return { jumps, positions: [...positions], spent, left, score, limitingFactors };
}

/** One greedy pass under one ranking. */
function runGreedy(
  start: CharmPosition[],
  held: { guides: number; designs: number; secrets: number },
  weigh: CostWeight,
  /** Highest position each charm may reach. Used by the repair pass to pin one. */
  ceiling?: CharmPosition[]
): CharmPlan {
  const positions = [...start];

  let guides = held.guides;
  let designs = held.designs;
  let secrets = held.secrets;

  const spent = { guides: 0, designs: 0, secrets: 0 };
  const jumps: PlannedCharmJump[] = [];
  let score = 0;

  // Pools that something wanted and could not have. Recorded as it happens
  // rather than guessed at the end: a pool can sit untouched because nothing
  // needed it, which is not the same as running out.
  const blocked = { guides: false, designs: false, secrets: false };

  for (;;) {
    let bestValue = -1;
    let bestCharm = -1;
    let bestTo = -1;
    let bestSpan = Infinity;

    for (let charm = 0; charm < CHARM_COUNT; charm += 1) {
      const at = positions[charm];
      const top = ceiling ? Math.min(ceiling[charm], CHARM_STEP_COUNT) : CHARM_STEP_COUNT;
      if (at >= top) continue;

      for (let to = at + 1; to <= top; to += 1) {
        const g = CUM.guides[to] - CUM.guides[at];
        const d = CUM.designs[to] - CUM.designs[at];
        const s = CUM.secrets[to] - CUM.secrets[at];

        // Costs only ever rise with `to`, so once a pool is exceeded every
        // longer jump is out too and the rest of the row can be skipped.
        // All three are tested before giving up on the row. Breaking on the
        // first one short would report a single pool as the wall when the bag
        // is empty of two, and "go and get Guides" is poor advice to a player
        // who is also out of Designs.
        const shortG = g > guides;
        const shortD = d > designs;
        const shortS = s > secrets;
        if (shortG || shortD || shortS) {
          if (shortG && g > 0) blocked.guides = true;
          if (shortD && d > 0) blocked.designs = true;
          if (shortS && s > 0) blocked.secrets = true;
          // Costs only rise with `to`, so every longer jump is out as well.
          break;
        }

        const share = weigh(
          { guides: g, designs: d, secrets: s },
          { guides, designs, secrets },
          held
        );
        if (!Number.isFinite(share) || share <= 0) continue;

        const value = (CUM.score[to] - CUM.score[at]) / share;
        const span = to - at;
        if (value > bestValue + 1e-9 || (value > bestValue - 1e-9 && span < bestSpan)) {
          bestValue = value;
          bestCharm = charm;
          bestTo = to;
          bestSpan = span;
        }
      }
    }

    if (bestCharm < 0 || bestTo < 0) break;

    const jump = charmJumpCost(positions[bestCharm], bestTo);
    guides -= jump.guides;
    designs -= jump.designs;
    secrets -= jump.secrets;
    spent.guides += jump.guides;
    spent.designs += jump.designs;
    spent.secrets += jump.secrets;
    score += jump.score;
    positions[bestCharm] = bestTo;
    jumps.push({ ...jump, charm: bestCharm });
  }

  const limitingFactors: CharmPlan['limitingFactors'] = [];
  if (positions.some(p => p < CHARM_STEP_COUNT)) {
    if (blocked.guides) limitingFactors.push('guides');
    if (blocked.designs) limitingFactors.push('designs');
    if (blocked.secrets) limitingFactors.push('secrets');
  }

  return {
    jumps,
    positions,
    spent,
    left: { guides, designs, secrets },
    score,
    limitingFactors,
  };
}

/** Human label for a position: "Lv. 0", "Lv. 4", "Lv. 11.3". */
export const charmPositionLabel = (position: CharmPosition) => {
  if (position <= 0) return 'Lv. 0';
  const s = CHARM_STEPS[Math.min(position, CHARM_STEP_COUNT) - 1];
  return s.sub ? `Lv. ${s.level}.${s.sub}` : `Lv. ${s.level}`;
};

/** Every position, for a dropdown. The index is the position itself. */
export const CHARM_POSITION_LABELS = Array.from(
  { length: CHARM_STEP_COUNT + 1 },
  (_, i) => charmPositionLabel(i)
);
