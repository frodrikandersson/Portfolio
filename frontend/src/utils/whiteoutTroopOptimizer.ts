import {
  TROOP_TYPES,
  trainingFor,
  promotionFor,
  whiteoutTroops,
  TOP_TIER,
  type TroopType,
} from '../data/whiteoutTroops';
import type { ResourceStock } from '../data/whiteoutBuildings';
import { effectiveTrainingSpeed, type WhiteoutInventory } from '../models/whiteoutInventory';

/**
 * Chooses how to spend resources and training speedups across training fresh
 * troops and promoting ones already owned.
 *
 * Neither option simply wins. Per resource, training fresh is far better: a
 * fresh T11 scores its full value while a promotion only scores the difference
 * between the two tiers. Per second they are near enough identical. So the
 * answer depends on which of the two the player has run out of, and on how many
 * lower-tier troops are sitting there doing nothing, which is why this weighs
 * them rather than preferring one.
 */

const RESOURCE_KEYS = ['meat', 'wood', 'coal', 'iron'] as const;
type TroopResource = (typeof RESOURCE_KEYS)[number];

export interface TroopAction {
  kind: 'train' | 'promote';
  type: TroopType;
  /** Source tier for a promotion; undefined when training. */
  fromTier?: number;
  toTier: number;
  /** Troops this action covers. */
  count: number;
  points: number;
  seconds: number;
  cost: Record<TroopResource, number>;
}

export interface TroopPlanInput {
  inventory: WhiteoutInventory;
  /** Event points per troop trained, keyed by tier. */
  pointsPerTier: Record<number, number>;
  /** Resources left for troops after anything else has claimed them. */
  resources: ResourceStock;
  /** Training speedup pool in minutes. */
  speedupMinutes: number;
}

export interface TroopPlan {
  actions: TroopAction[];
  points: number;
  secondsUsed: number;
  secondsAvailable: number;
  resourcesUsed: Record<TroopResource, number>;
  remaining: Record<TroopResource, number>;
  limitingFactors: string[];
}

const zero = (): Record<TroopResource, number> => ({ meat: 0, wood: 0, coal: 0, iron: 0 });

/** A candidate action costed for exactly 1,000 troops, for ranking. */
interface Candidate {
  kind: 'train' | 'promote';
  type: TroopType;
  fromTier?: number;
  toTier: number;
  pointsPer1k: number;
  secondsPer1k: number;
  costPer1k: Record<TroopResource, number>;
  /** Troops available to convert, for promotions. Infinity when training. */
  supply: number;
}

export function planTroops(input: TroopPlanInput): TroopPlan {
  const { inventory, pointsPerTier } = input;

  const remaining = zero();
  for (const r of RESOURCE_KEYS) remaining[r] = Math.max(input.resources[r] ?? 0, 0);
  const startStock = { ...remaining };

  const speedPercent = effectiveTrainingSpeed(inventory);
  const speedDivisor = 1 + Math.max(speedPercent, -99) / 100;
  const secondsAvailable = Math.max(input.speedupMinutes, 0) * 60;
  let secondsLeft = secondsAvailable;

  // Troops available to promote away, consumed as the plan is built.
  const supply: Record<TroopType, Record<number, number>> = {
    infantry: {},
    lancer: {},
    marksman: {},
  };
  for (const type of TROOP_TYPES) {
    for (const [tier, n] of Object.entries(inventory.troopsOwned[type] ?? {})) {
      supply[type][Number(tier)] = Math.max(n, 0);
    }
  }

  const candidates: Candidate[] = [];
  for (const type of TROOP_TYPES) {
    // Capped by the table rather than a literal, so adding a tier to the data
    // is all it takes for the planner to start using it.
    const max = Math.min(inventory.maxTier[type] ?? 1, TOP_TIER);
    const helios = inventory.heliosLevels[type] ?? 0;

    // Training any unlocked tier is allowed; the ranking decides which is worth it.
    for (const row of whiteoutTroops[type]) {
      if (row.tier > max) continue;
      const t = trainingFor(type, row.tier, 1000, helios);
      if (!t) continue;
      candidates.push({
        kind: 'train',
        type,
        toTier: row.tier,
        pointsPer1k: (pointsPerTier[row.tier] ?? 0) * 1000,
        secondsPer1k: t.seconds,
        costPer1k: { meat: t.meat, wood: t.wood, coal: t.coal, iron: t.iron },
        supply: Infinity,
      });
    }

    // Promotions go straight to the highest unlocked tier: an intermediate hop
    // costs the same in total and scores the same, so it is never better.
    for (const row of whiteoutTroops[type]) {
      if (row.tier >= max) continue;
      const held = supply[type][row.tier] ?? 0;
      if (held <= 0) continue;
      const p = promotionFor(type, row.tier, max, 1000, helios);
      if (!p) continue;
      candidates.push({
        kind: 'promote',
        type,
        fromTier: row.tier,
        toTier: max,
        pointsPer1k: ((pointsPerTier[max] ?? 0) - (pointsPerTier[row.tier] ?? 0)) * 1000,
        secondsPer1k: p.seconds,
        costPer1k: { meat: p.meat, wood: p.wood, coal: p.coal, iron: p.iron },
        supply: held,
      });
    }
  }

  // Rank by points per unit of scarcity, measuring each cost against what the
  // player actually holds rather than against an absolute price.
  //
  // The burden is the WORST constraint, not the sum of them. Summing quietly
  // misallocates: with plenty of resources but few speedups it would pick a
  // cheap low tier because its resource share looked small, when the only thing
  // that mattered was points per second. Taking the maximum makes the ranking
  // follow whichever constraint is actually binding.
  const burdenOf = (c: Candidate) => {
    let burden = 0;
    for (const r of RESOURCE_KEYS) {
      const cost = c.costPer1k[r];
      if (cost <= 0) continue;
      burden = Math.max(burden, startStock[r] > 0 ? cost / startStock[r] : 1);
    }
    if (secondsAvailable > 0) {
      burden = Math.max(burden, c.secondsPer1k / speedDivisor / secondsAvailable);
    }
    return burden;
  };

  const ranked = candidates
    .filter(c => c.pointsPer1k > 0)
    .map(c => ({ c, rate: burdenOf(c) > 0 ? c.pointsPer1k / burdenOf(c) : c.pointsPer1k }))
    .sort((a, b) => b.rate - a.rate);

  const actions: TroopAction[] = [];
  const used = zero();
  const blocked = new Set<string>();

  for (const { c } of ranked) {
    // How many 1,000-troop batches fit inside every constraint at once.
    let batches = Infinity;
    for (const r of RESOURCE_KEYS) {
      const cost = c.costPer1k[r];
      if (cost <= 0) continue;
      batches = Math.min(batches, remaining[r] / cost);
      if (remaining[r] < cost) blocked.add(r);
    }
    const seconds1k = c.secondsPer1k / speedDivisor;
    if (seconds1k > 0) {
      batches = Math.min(batches, secondsLeft / seconds1k);
      if (secondsLeft < seconds1k) blocked.add('time');
    }
    if (c.supply !== Infinity) {
      batches = Math.min(batches, c.supply / 1000);
      if (c.supply <= 0) blocked.add('troops');
    }
    if (!Number.isFinite(batches) || batches <= 0) continue;

    // Costs are quoted per 1,000 and the game trains in batches, so a stray
    // handful of troops is noise rather than a plan.
    const count = Math.floor(batches * 1000);
    if (count < 100) continue;
    const k = count / 1000;

    const cost = zero();
    for (const r of RESOURCE_KEYS) {
      cost[r] = c.costPer1k[r] * k;
      remaining[r] -= cost[r];
      used[r] += cost[r];
    }
    const seconds = seconds1k * k;
    secondsLeft -= seconds;
    if (c.supply !== Infinity) supply[c.type][c.fromTier!] -= count;

    actions.push({
      kind: c.kind,
      type: c.type,
      fromTier: c.fromTier,
      toTier: c.toTier,
      count,
      points: c.pointsPer1k * k,
      seconds,
      cost,
    });
  }

  return {
    actions,
    points: actions.reduce((s, a) => s + a.points, 0),
    secondsUsed: actions.reduce((s, a) => s + a.seconds, 0),
    secondsAvailable,
    resourcesUsed: used,
    remaining,
    limitingFactors: [...blocked],
  };
}
