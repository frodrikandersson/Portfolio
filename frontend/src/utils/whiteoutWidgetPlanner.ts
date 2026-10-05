import {
  WIDGET_GENERATIONS,
  WIDGET_MAX_LEVEL,
  WIDGET_COST_PER_LEVEL,
} from '../data/whiteoutConsumables';
import {
  consumableCount,
  widgetLevel,
  type WhiteoutInventory,
} from '../models/whiteoutInventory';

/** One hero's share of the plan. */
export interface WidgetHeroPlan {
  generation: number;
  hero: string;
  widgetId: string;
  from: number;
  to: number;
  /** Widgets consumed getting there, which is what the event pays for. */
  spent: number;
}

export interface WidgetGenerationPlan {
  generation: number;
  chestId: string;
  heroes: WidgetHeroPlan[];
  /** Chests held and how many are actually used. */
  chestsHeld: number;
  chestsSpent: number;
  /** Hero-locked widgets held and used, across this generation. */
  lockedHeld: number;
  lockedSpent: number;
}

export interface WidgetPlan {
  generations: WidgetGenerationPlan[];
  /** Widgets held in total, which is what the old scoring counted. */
  held: number;
  /** Widgets that actually go into a level up. Only these score. */
  spent: number;
  /**
   * Held but unusable because every hero that could take them is at max. No
   * amount of saving fixes this one.
   */
  strandedMaxed: number;
  /**
   * Held, with room to spend them, but short of the next level's price. These
   * become spendable once more widgets arrive.
   */
  strandedShort: number;
}

/** Cost of taking a hero from `from` to `to`. */
const costBetween = (from: number, to: number) => {
  let total = 0;
  for (let level = from; level < to; level += 1) total += WIDGET_COST_PER_LEVEL[level];
  return total;
};

/**
 * The most widgets a generation can actually spend.
 *
 * Solved exactly rather than greedily, because greedy is provably wrong here.
 * With fifteen chests and two heroes at Lv 0, taking the cheapest next level
 * each time buys 5 and 5 and then stalls, spending ten. Pushing one hero to
 * Lv 2 costs 5 + 10 and spends all fifteen. Cheapest-first maximises the number
 * of level ups; the event pays for widgets consumed, which is a different thing.
 *
 * The search is small enough to do properly: each hero takes some number of its
 * remaining levels, so it is eleven choices at most per hero, and a generation
 * has three of them.
 */
const planGeneration = (
  inv: WhiteoutInventory,
  generation: (typeof WIDGET_GENERATIONS)[number]
): WidgetGenerationPlan => {
  const chests = Math.max(consumableCount(inv, generation.chestId), 0);
  const heroes = generation.heroes.map(h => ({
    ...h,
    level: widgetLevel(inv, h.widgetId),
    locked: Math.max(consumableCount(inv, h.widgetId), 0),
  }));

  const room = heroes.map(h => WIDGET_MAX_LEVEL - h.level);
  let best: { levels: number[]; spent: number; fromChests: number } | null = null;

  const walk = (index: number, taken: number[]) => {
    if (index === heroes.length) {
      let spent = 0;
      let fromChests = 0;
      for (let h = 0; h < heroes.length; h += 1) {
        const cost = costBetween(heroes[h].level, heroes[h].level + taken[h]);
        spent += cost;
        // A hero's own widgets can only go to that hero, so they are used up
        // first and only the shortfall competes for the shared chests.
        fromChests += Math.max(cost - heroes[h].locked, 0);
      }
      if (fromChests > chests) return;
      if (!best || spent > best.spent) best = { levels: [...taken], spent, fromChests };
      return;
    }
    for (let k = 0; k <= room[index]; k += 1) walk(index + 1, [...taken, k]);
  };
  walk(0, []);

  const levels = best ? (best as { levels: number[] }).levels : heroes.map(() => 0);
  const fromChests = best ? (best as { fromChests: number }).fromChests : 0;
  const spent = best ? (best as { spent: number }).spent : 0;

  return {
    generation: generation.gen,
    chestId: generation.chestId,
    heroes: heroes.map((h, i) => ({
      generation: generation.gen,
      hero: h.name,
      widgetId: h.widgetId,
      from: h.level,
      to: h.level + levels[i],
      spent: costBetween(h.level, h.level + levels[i]),
    })),
    chestsHeld: chests,
    chestsSpent: fromChests,
    lockedHeld: heroes.reduce((sum, h) => sum + h.locked, 0),
    lockedSpent: spent - fromChests,
  };
};

/**
 * What the backpack's widgets can actually be turned into.
 *
 * The event pays per widget USED, not per widget held, and the two differ a
 * lot. A widget on a hero already at Lv 10 can never be spent, and a pile
 * short of the next level's price cannot be spent yet either. Counting what is
 * held credited both.
 */
export function planWidgets(inv: WhiteoutInventory): WidgetPlan {
  const generations = WIDGET_GENERATIONS.map(g => planGeneration(inv, g));

  let held = 0;
  let spent = 0;
  let strandedMaxed = 0;

  for (const g of generations) {
    held += g.chestsHeld + g.lockedHeld;
    spent += g.chestsSpent + g.lockedSpent;

    // A hero-locked widget on a maxed hero has nowhere to go, ever. Chests are
    // only stranded when EVERY hero in the generation is maxed, since any one
    // of them could otherwise take it.
    for (const h of g.heroes) {
      if (h.from >= WIDGET_MAX_LEVEL) {
        strandedMaxed += Math.max(consumableCount(inv, h.widgetId), 0);
      }
    }
    if (g.heroes.every(h => h.to >= WIDGET_MAX_LEVEL)) {
      strandedMaxed += g.chestsHeld - g.chestsSpent;
    }
  }

  return {
    generations,
    held,
    spent,
    strandedMaxed,
    // Whatever is left over that is not permanently stuck is simply short of
    // the next price, and will be spendable once more arrive.
    strandedShort: Math.max(held - spent - strandedMaxed, 0),
  };
}
