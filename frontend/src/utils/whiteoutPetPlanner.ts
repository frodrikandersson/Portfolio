// How far the pet materials go, across the fourteen pets.
//
// THE SCORE IS THE SAME FOR EVERY PET AND THE COST IS NOT. Advancing any pet
// at Lv. 10 grants 500 advancement score, whether it is the Common Cave Hyena
// or a Legendary. What differs is the bill: the Hyena wants 15 Taming Manuals
// and 150 Pet Food to get there, a Legendary wants 35 and 500. So for an event
// that pays per point of advancement score, the cheap pets are the efficient
// ones, which is the opposite of how pets are usually ranked.
//
// ONLY THE ADVANCEMENT LEVELS ARE WORTH STOPPING AT. Advancement happens at
// Lv. 10, 20, 30 and so on, and nothing is scored in between, so a pet parked
// on Lv. 37 has paid for seven levels of food and been given nothing for them.
// Candidate targets are therefore the advancement levels only.
//
// FOUR POOLS. Pet Food, Taming Manuals, Energizing Potions and Strengthening
// Serums, and they come in at different points: Potions start at Lv. 30 and
// Serums at Lv. 50, so a bag full of Food and Manuals still stops dead at the
// first level that wants something it has none of. Jumps are ranked by the
// share of each REMAINING pool they eat, which is what keeps the late
// materials from being spent like the early ones.
//
// The ranking is a heuristic for a four-constraint knapsack, so it is measured
// against brute force on reduced instances rather than trusted, the same way
// the charm planner is. It uses the same multi-start and give-a-step-back
// repair, for the same reason: a single greedy opens with the cheapest pet and
// can be left with a remainder too small to buy anything.

import { whiteoutPets, type Pet } from '../data/whiteoutPets';

export type PetPools = {
  food: number;
  manuals: number;
  potions: number;
  serums: number;
};

export const PET_POOL_LABELS: Record<keyof PetPools, string> = {
  food: 'Pet Food',
  manuals: 'Taming Manuals',
  potions: 'Energizing Potions',
  serums: 'Strengthening Serums',
};

export interface PetJump {
  petId: string;
  from: number;
  to: number;
  cost: PetPools;
  /** Advancement score gained, which is what events multiply by their rate. */
  score: number;
  /** The advancement levels crossed, so the scoring rows can be counted. */
  levels: number[];
}

export interface PetPlan {
  jumps: PetJump[];
  /** Where every pet ends up, by id. */
  levels: Record<string, number>;
  spent: PetPools;
  left: PetPools;
  score: number;
  /** Pools something wanted and could not have. */
  limitingFactors: (keyof PetPools)[];
}

export interface PetPlanInput {
  /** Current level per pet id. Missing or zero means the pet is not owned. */
  levels: Record<string, number>;
  pools: PetPools;
}

const POOLS: (keyof PetPools)[] = ['food', 'manuals', 'potions', 'serums'];

/**
 * Cost and score of taking one pet from `from` to an advancement level `to`.
 *
 * Food is charged for every level crossed; the advancement materials only at
 * the advancement levels themselves.
 */
const jumpFor = (pet: Pet, from: number, to: number): PetJump => {
  const cost: PetPools = { food: 0, manuals: 0, potions: 0, serums: 0 };
  // foodCosts[0] is level 1 to 2, so taking a pet from `from` to `to` spends
  // entries [from - 1, to - 1).
  for (let i = Math.max(from - 1, 0); i < Math.max(to - 1, 0); i += 1) {
    cost.food += pet.foodCosts[i] ?? 0;
  }
  let score = 0;
  const levels: number[] = [];
  for (const a of pet.advancementCosts) {
    if (a.level <= from || a.level > to) continue;
    cost.manuals += a.tamingManuals;
    cost.potions += a.energizingPotions;
    cost.serums += a.strengtheningSerums;
    score += a.advancementScore;
    levels.push(a.level);
  }
  return { petId: pet.id, from, to, cost, score, levels };
};

/** The advancement levels of a pet above its current one. */
const targetsAbove = (pet: Pet, from: number) =>
  pet.advancementCosts.map(a => a.level).filter(l => l > from && l <= pet.maxLevel);

type Weight = (cost: PetPools, left: PetPools, held: PetPools) => number;

/**
 * The rankings, run in turn with the best result kept.
 *
 * They disagree deliberately: which is right depends on which pool is the
 * wall, and a bag short of Serums wants a different answer from one short of
 * Food.
 */
const WEIGHTS: Weight[] = [
  // Share of what remains, so a pool gets dearer as it empties.
  (c, l) => POOLS.reduce((sum, k) => sum + (l[k] > 0 ? c[k] / l[k] : 0), 0),
  // Share of what was held at the start, so early jumps are not flattered.
  (c, _l, h) => POOLS.reduce((sum, k) => sum + (h[k] > 0 ? c[k] / h[k] : 0), 0),
  // Flat materials, which is right when the pools are balanced.
  c => POOLS.reduce((sum, k) => sum + c[k], 0),
  // The bottleneck alone, which wins on a lopsided bag.
  (c, l) =>
    Math.max(...POOLS.map(k => (l[k] > 0 ? c[k] / l[k] : c[k] > 0 ? Infinity : 0))),
];

const MAX_REPAIR_PASSES = 8;

const affordable = (cost: PetPools, left: PetPools) =>
  POOLS.every(k => cost[k] <= left[k]);

/** One greedy pass under one ranking. */
function runGreedy(
  start: Record<string, number>,
  held: PetPools,
  weigh: Weight,
  /** Highest level each pet may reach, used by the repair pass to pin one. */
  ceiling?: Record<string, number>
): { levels: Record<string, number>; score: number; blocked: Set<keyof PetPools> } {
  const levels = { ...start };
  const left: PetPools = { ...held };
  const blocked = new Set<keyof PetPools>();
  let score = 0;

  for (;;) {
    let bestValue = -1;
    let best: PetJump | null = null;

    for (const pet of whiteoutPets) {
      const at = levels[pet.id] ?? 0;
      // A pet at level 0 is not owned, so there is nothing to advance.
      if (at <= 0) continue;
      const top = ceiling?.[pet.id] ?? pet.maxLevel;

      for (const to of targetsAbove(pet, at)) {
        if (to > top) break;
        const jump = jumpFor(pet, at, to);
        if (!affordable(jump.cost, left)) {
          for (const k of POOLS) if (jump.cost[k] > left[k] && jump.cost[k] > 0) blocked.add(k);
          // Costs only rise with `to`, so no longer jump is affordable either.
          break;
        }
        const share = weigh(jump.cost, left, held);
        if (!Number.isFinite(share) || share <= 0) continue;
        const value = jump.score / share;
        if (value > bestValue + 1e-9) {
          bestValue = value;
          best = jump;
        }
      }
    }

    if (!best) break;
    for (const k of POOLS) left[k] -= best.cost[k];
    levels[best.petId] = best.to;
    score += best.score;
  }

  return { levels, score, blocked };
}

/** Turns a finished board back into a plan, one jump per pet that moved. */
const rebuild = (
  start: Record<string, number>,
  held: PetPools,
  levels: Record<string, number>,
  blocked: Set<keyof PetPools>
): PetPlan => {
  const jumps: PetJump[] = [];
  const spent: PetPools = { food: 0, manuals: 0, potions: 0, serums: 0 };
  let score = 0;

  for (const pet of whiteoutPets) {
    const from = start[pet.id] ?? 0;
    const to = levels[pet.id] ?? 0;
    if (to <= from) continue;
    const jump = jumpFor(pet, from, to);
    jumps.push(jump);
    for (const k of POOLS) spent[k] += jump.cost[k];
    score += jump.score;
  }

  const left: PetPools = {
    food: held.food - spent.food,
    manuals: held.manuals - spent.manuals,
    potions: held.potions - spent.potions,
    serums: held.serums - spent.serums,
  };

  // Only a pool that something actually wanted counts as a wall. A pool nobody
  // needed is not what stopped the plan.
  const stillClimbing = whiteoutPets.some(
    p => (levels[p.id] ?? 0) > 0 && (levels[p.id] ?? 0) < p.maxLevel
  );
  const limitingFactors = stillClimbing ? POOLS.filter(k => blocked.has(k)) : [];

  return { jumps, levels: { ...levels }, spent, left, score, limitingFactors };
};

/**
 * Spends the four pools across the pets that are owned.
 *
 * Multi-start over the rankings, then a repair pass that offers each pet one
 * advancement back and re-fills with that pet pinned, keeping the result only
 * if it genuinely scores more. Without the pin the refill simply buys the same
 * advancement again and nothing ever improves.
 */
export function planPets(input: PetPlanInput): PetPlan {
  const start: Record<string, number> = {};
  for (const pet of whiteoutPets) {
    const raw = Number(input.levels?.[pet.id]);
    start[pet.id] = Number.isFinite(raw) && raw > 0 ? Math.min(Math.floor(raw), pet.maxLevel) : 0;
  }
  const held: PetPools = {
    food: Math.max(Math.floor(Number(input.pools?.food) || 0), 0),
    manuals: Math.max(Math.floor(Number(input.pools?.manuals) || 0), 0),
    potions: Math.max(Math.floor(Number(input.pools?.potions) || 0), 0),
    serums: Math.max(Math.floor(Number(input.pools?.serums) || 0), 0),
  };

  let best: PetPlan | null = null;

  for (const weigh of WEIGHTS) {
    const run = runGreedy(start, held, weigh);
    let plan = rebuild(start, held, run.levels, run.blocked);

    for (let pass = 0; pass < MAX_REPAIR_PASSES; pass += 1) {
      let improved = false;
      for (const pet of whiteoutPets) {
        const at = plan.levels[pet.id] ?? 0;
        if (at <= start[pet.id]) continue;
        // One advancement back: the level below the one it reached.
        const below = targetsAbove(pet, start[pet.id]).filter(l => l < at).pop() ?? start[pet.id];
        const floor = { ...plan.levels, [pet.id]: below };
        const used: PetPools = { food: 0, manuals: 0, potions: 0, serums: 0 };
        for (const p of whiteoutPets) {
          const j = jumpFor(p, start[p.id], floor[p.id] ?? 0);
          for (const k of POOLS) used[k] += j.cost[k];
        }
        const spare: PetPools = {
          food: held.food - used.food,
          manuals: held.manuals - used.manuals,
          potions: held.potions - used.potions,
          serums: held.serums - used.serums,
        };
        if (POOLS.some(k => spare[k] < 0)) continue;

        const ceiling: Record<string, number> = {};
        for (const p of whiteoutPets) ceiling[p.id] = p.maxLevel;
        ceiling[pet.id] = below;

        const refilled = runGreedy(floor, spare, weigh, ceiling);
        const candidate = rebuild(start, held, refilled.levels, refilled.blocked);
        if (candidate.score > plan.score + 1e-9) {
          plan = candidate;
          improved = true;
        }
      }
      if (!improved) break;
    }

    if (!best || plan.score > best.score) best = plan;
  }

  return best as PetPlan;
}
