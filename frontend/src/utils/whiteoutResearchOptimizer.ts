import {
  whiteoutResearch,
  researchByKey,
  type ResearchNode,
  type ResearchTree,
} from '../data/whiteoutResearch';
import type { ResourceStock } from '../data/whiteoutBuildings';

/**
 * Picks which research to run for the most power from a fixed stock.
 *
 * Research is a dependency graph, not a list: a level can need other nodes at a
 * given level and a minimum Research Center. So, as with buildings, a node is
 * considered together with everything needed to unlock it, and the bundle is
 * ranked as a whole. That stops a cheap unrewarding prerequisite from hiding a
 * valuable node behind it.
 */

const KEYS = ['meat', 'wood', 'coal', 'iron', 'steel'] as const;
type ResearchResource = (typeof KEYS)[number];

export interface ResearchPlanInput {
  /** Level already reached per node key. Missing means nothing done. */
  completed: Record<string, number>;
  /** Trees the player wants to spend on. */
  trees: ResearchTree[];
  resources: ResourceStock;
  /** Research speedup pool in minutes. */
  speedupMinutes: number;
  /** Research speed bonus percentage, applied the same way as build speed. */
  speedPercent: number;
  /** Building levels, so a node is not proposed before its building allows it. */
  buildingLevels: Record<string, number>;
}

export interface PlannedResearch {
  key: string;
  name: string;
  tree: ResearchTree;
  fromLevel: number;
  toLevel: number;
  power: number;
  seconds: number;
  cost: Record<ResearchResource, number>;
}

export interface ResearchPlan {
  steps: PlannedResearch[];
  powerGained: number;
  secondsUsed: number;
  secondsAvailable: number;
  secondsRemaining: number;
  resourcesUsed: Record<ResearchResource, number>;
  remaining: Record<ResearchResource, number>;
  finalLevels: Record<string, number>;
  limitingFactors: string[];
  /** Nodes blocked purely by a building level, worth telling the player about. */
  blockedByBuilding: { name: string; slug: string; level: number }[];
}

const zero = (): Record<ResearchResource, number> => ({
  meat: 0,
  wood: 0,
  coal: 0,
  iron: 0,
  steel: 0,
});

const applySpeed = (seconds: number, percent: number) =>
  seconds / (1 + Math.max(percent, -99) / 100);

/**
 * Every level needed to advance `node` by one, including levels of other nodes
 * that gate it. Returns null when a building requirement blocks it.
 */
function resolveBundle(
  node: ResearchNode,
  levels: Record<string, number>,
  buildings: Record<string, number>,
  blocked: ResearchPlan['blockedByBuilding'],
  visiting: Set<string>,
  depth = 0
): PlannedResearch[] | null {
  if (depth > 30) return null;
  const current = levels[node.key] ?? 0;
  const next = node.levels.find(l => l.level === current + 1);
  if (!next) return null;

  const mark = `${node.key}:${next.level}`;
  if (visiting.has(mark)) return null;
  visiting.add(mark);

  for (const req of next.requiresBuildings) {
    if ((buildings[req.slug] ?? 0) < req.level) {
      blocked.push({ name: node.name, slug: req.slug, level: req.level });
      visiting.delete(mark);
      return null;
    }
  }

  const bundle: PlannedResearch[] = [];
  const scratch = { ...levels };

  for (const req of next.requiresResearch) {
    const dep = researchByKey.get(req.key);
    if (!dep) continue;
    let guard = 0;
    while ((scratch[req.key] ?? 0) < req.level) {
      if (guard++ > 40) {
        visiting.delete(mark);
        return null;
      }
      const sub = resolveBundle(dep, scratch, buildings, blocked, visiting, depth + 1);
      if (!sub) {
        visiting.delete(mark);
        return null;
      }
      for (const step of sub) {
        bundle.push(step);
        scratch[step.key] = step.toLevel;
      }
    }
  }

  const from = scratch[node.key] ?? 0;
  const target = node.levels.find(l => l.level === from + 1);
  if (!target) {
    visiting.delete(mark);
    return null;
  }

  bundle.push({
    key: node.key,
    name: node.name,
    tree: node.tree,
    fromLevel: from,
    toLevel: target.level,
    power: target.power,
    seconds: target.seconds,
    cost: { ...target.cost },
  });

  visiting.delete(mark);
  return bundle;
}

export function planResearch(input: ResearchPlanInput): ResearchPlan {
  const levels: Record<string, number> = { ...input.completed };
  const remaining = zero();
  for (const k of KEYS) remaining[k] = Math.max(input.resources[k] ?? 0, 0);
  const startStock = { ...remaining };

  const secondsAvailable = Math.max(input.speedupMinutes, 0) * 60;
  let secondsLeft = secondsAvailable;

  const pool = whiteoutResearch.filter(n => input.trees.includes(n.tree));
  // A node at its last level can never contribute again, and most of the pool
  // ends up there on a long plan, so skipping them keeps the search cheap.
  // Nothing else is treated as permanently finished.
  const exhausted = new Set<string>();
  const steps: PlannedResearch[] = [];
  const used = zero();
  const limiting = new Set<string>();
  const blockedByBuilding: ResearchPlan['blockedByBuilding'] = [];

  for (let guard = 0; guard < 5000; guard++) {
    let best: { bundle: PlannedResearch[]; rate: number } | null = null;
    const blockedThisRound: ResearchPlan['blockedByBuilding'] = [];

    for (const node of pool) {
      if (exhausted.has(node.key)) continue;
      const maxLevel = node.levels[node.levels.length - 1]?.level ?? 0;
      if ((levels[node.key] ?? 0) >= maxLevel) {
        exhausted.add(node.key);
        continue;
      }
      // Deliberately not marking a failed resolve as exhausted: a chain that
      // cannot be satisfied yet often can be once other nodes advance, and
      // writing it off costs real power.
      const bundle = resolveBundle(node, levels, input.buildingLevels, blockedThisRound, new Set());
      if (!bundle || bundle.length === 0) continue;

      const cost = zero();
      let power = 0;
      let seconds = 0;
      for (const step of bundle) {
        for (const k of KEYS) cost[k] += step.cost[k] ?? 0;
        power += step.power;
        seconds += applySpeed(step.seconds, input.speedPercent);
      }
      if (power <= 0) continue;

      let affordable = true;
      for (const k of KEYS) {
        if (cost[k] > remaining[k]) {
          affordable = false;
          limiting.add(k);
        }
      }
      if (seconds > secondsLeft) {
        affordable = false;
        limiting.add('time');
      }
      if (!affordable) continue;

      // Burden is the worst constraint, not the sum, so the ranking follows
      // whichever of resources or speedups is actually binding.
      let burden = 0;
      for (const k of KEYS) {
        if (cost[k] <= 0) continue;
        burden = Math.max(burden, startStock[k] > 0 ? cost[k] / startStock[k] : 1);
      }
      if (secondsAvailable > 0) {
        burden = Math.max(burden, seconds / secondsAvailable);
      }
      const rate = burden > 0 ? power / burden : power;
      if (!best || rate > best.rate) best = { bundle, rate };
    }

    if (!best) {
      // Only report building blocks once nothing else can be done.
      for (const b of blockedThisRound) {
        if (!blockedByBuilding.some(x => x.name === b.name)) blockedByBuilding.push(b);
      }
      break;
    }

    // Not cleared: a node is only marked exhausted for reasons that cannot
    // change mid-plan, namely being maxed out or gated behind a building level
    // that is fixed input. Affordability is checked after the bundle is built,
    // so a node that is merely too expensive right now stays in the running.
    for (const step of best.bundle) {
      const seconds = applySpeed(step.seconds, input.speedPercent);
      steps.push({ ...step, seconds });
      levels[step.key] = step.toLevel;
      secondsLeft -= seconds;
      for (const k of KEYS) {
        const c = step.cost[k] ?? 0;
        if (!c) continue;
        remaining[k] -= c;
        used[k] += c;
      }
    }
  }

  return {
    steps,
    powerGained: steps.reduce((s, x) => s + x.power, 0),
    secondsUsed: steps.reduce((s, x) => s + x.seconds, 0),
    secondsAvailable,
    secondsRemaining: Math.max(0, secondsLeft),
    resourcesUsed: used,
    remaining,
    finalLevels: levels,
    limitingFactors: [...limiting],
    blockedByBuilding: blockedByBuilding.slice(0, 5),
  };
}

/** Collapses consecutive levels of one node into a single from/to row. */
export function summariseResearch(steps: PlannedResearch[]) {
  const out: PlannedResearch[] = [];
  for (const step of steps) {
    const last = out.find(o => o.key === step.key);
    if (last && last.toLevel === step.fromLevel) {
      last.toLevel = step.toLevel;
      last.power += step.power;
      last.seconds += step.seconds;
      for (const k of KEYS) last.cost[k] += step.cost[k] ?? 0;
    } else {
      out.push({ ...step, cost: { ...step.cost } });
    }
  }
  return out.sort((a, b) => b.power - a.power);
}
