import {
  CHIEF_GEAR_STEPS,
  CHIEF_GEAR_EXCHANGE,
  CHIEF_GEAR_MATERIALS,
  CHIEF_GEAR_MATERIAL_LABELS,
  CHIEF_GEAR_SLOTS,
  isDowngrade,
  type ChiefGearCost,
  type ChiefGearMaterial,
  type ChiefGearExchange,
} from '../data/whiteoutChiefGear';

export type ChiefGearStock = Record<ChiefGearMaterial, number>;

const emptyStock = (): ChiefGearStock => ({
  designPlans: 0,
  hardenedAlloy: 0,
  polishingSolution: 0,
  lunarAmber: 0,
});

/** One upgrade the plan says to take. */
export interface PlannedGearStep {
  /** 0 to 5. */
  slot: number;
  /** Index into CHIEF_GEAR_STEPS. */
  step: number;
  label: string;
  points: number;
  cost: ChiefGearCost;
}

/** One line at the exchange, collapsed to a single count. */
export interface PlannedTrade {
  from: ChiefGearMaterial;
  to: ChiefGearMaterial;
  give: number;
  get: number;
  /** How many times to press Redeem. */
  times: number;
  gave: number;
  got: number;
  /** True when this breaks something scarce into something plentiful. */
  downgrade: boolean;
}

export interface PlannedSlot {
  slot: number;
  /** Step index the slot starts and ends on, -1 meaning nothing built. */
  from: number;
  to: number;
  fromLabel: string;
  toLabel: string;
  steps: number;
  points: number;
}

export interface ChiefGearPlan {
  steps: PlannedGearStep[];
  trades: PlannedTrade[];
  slots: PlannedSlot[];
  points: number;
  spent: ChiefGearStock;
  left: ChiefGearStock;
  /**
   * What stopped the plan: the materials the next best step was short of,
   * after every trade that could have helped had been considered.
   */
  blockedBy: ChiefGearMaterial[];
  /** Slots already sitting on a step whose cost nobody has yet. */
  unpricedSlots: number[];
}

/**
 * The slot's next step, or null when it is finished or the next step's cost is
 * unknown. A slot at -1 has built nothing and its next step is index 0.
 */
export const nextStepFor = (position: number) => {
  const index = position + 1;
  if (index < 0 || index >= CHIEF_GEAR_STEPS.length) return null;
  const step = CHIEF_GEAR_STEPS[index];
  return step.cost ? { index, step } : null;
};

/** True when the slot has more ladder left but the cost is not known. */
export const isUnpriced = (position: number) => {
  const index = position + 1;
  return index >= 0 && index < CHIEF_GEAR_STEPS.length && !CHIEF_GEAR_STEPS[index].cost;
};

const label = (position: number) =>
  position < 0 ? 'nothing built' : (CHIEF_GEAR_STEPS[position]?.label ?? 'unknown');

/**
 * Rough worth of one unit, in Design Plans, used only to rank one trade
 * against another.
 *
 * Design Plans are the hard currency here: they are the only route to Lunar
 * Amber and they buy the other two at far better rates than the other two buy
 * anything. So everything is priced against them, using the rate at which a
 * Design Plan buys that material.
 */
const DP_PER_UNIT: Record<ChiefGearMaterial, number> = (() => {
  const out = { designPlans: 1 } as Record<ChiefGearMaterial, number>;
  for (const m of CHIEF_GEAR_MATERIALS) {
    if (m === 'designPlans') continue;
    const buy = CHIEF_GEAR_EXCHANGE.find(e => e.from === 'designPlans' && e.to === m);
    out[m] = buy ? buy.give / buy.get : 0;
  }
  return out;
})();

interface TradeState extends ChiefGearExchange {
  used: number;
}

/**
 * Buys `need` units of `material`, paying out of stock, and records the trades.
 *
 * Returns false and changes nothing when it cannot be done. Trades are tried
 * cheapest first, priced in Design Plans, which keeps the lossy upward
 * conversions (Alloy back into Plans at a thousand to one) as a last resort
 * without having to special case them.
 */
const buy = (
  material: ChiefGearMaterial,
  need: number,
  stock: ChiefGearStock,
  trades: TradeState[]
): boolean => {
  if (need <= 0) return true;

  const options = trades
    .filter(t => t.to === material && t.used < t.limit)
    .sort((a, b) => (a.give * DP_PER_UNIT[a.from]) / a.get - (b.give * DP_PER_UNIT[b.from]) / b.get);

  for (const option of options) {
    if (need <= 0) break;
    // How many redemptions this trade can still cover, wanted and affordable.
    const wanted = Math.ceil(need / option.get);
    const allowed = option.limit - option.used;
    const affordable = Math.floor(stock[option.from] / option.give);
    const times = Math.min(wanted, allowed, affordable);
    if (times <= 0) continue;
    stock[option.from] -= times * option.give;
    stock[material] += times * option.get;
    option.used += times;
    need -= times * option.get;
  }

  return need <= 0;
};

/**
 * Works out whether a cost can be met, converting where it has to, WITHOUT
 * changing anything. Returns the state it would leave behind, or null.
 *
 * Kept as a dry run on purpose: the planner has to know what each of six
 * candidates would cost before it picks one, and a version that spent as it
 * checked would leave five slots' worth of trades half applied.
 */
const priceUp = (cost: ChiefGearCost, stock: ChiefGearStock, trades: TradeState[]) => {
  const trial = { ...stock };
  const trialTrades = trades.map(t => ({ ...t }));

  for (const material of CHIEF_GEAR_MATERIALS) {
    const want = cost[material] ?? 0;
    if (want <= trial[material]) continue;
    if (!buy(material, want - trial[material], trial, trialTrades)) return null;
  }
  for (const material of CHIEF_GEAR_MATERIALS) {
    trial[material] -= cost[material] ?? 0;
    if (trial[material] < 0) return null;
  }

  return { stock: trial, trades: trialTrades };
};

/** Commits what priceUp worked out. */
const settle = (
  paid: NonNullable<ReturnType<typeof priceUp>>,
  stock: ChiefGearStock,
  trades: TradeState[]
) => {
  Object.assign(stock, paid.stock);
  trades.forEach((t, i) => {
    t.used = paid.trades[i].used;
  });
};

/** What a step costs in Design Plans, for ranking one step against another. */
const priceOf = (cost: ChiefGearCost) =>
  CHIEF_GEAR_MATERIALS.reduce((total, m) => total + (cost[m] ?? 0) * DP_PER_UNIT[m], 0);

export interface ChiefGearPlanInput {
  /** Where each of the six slots sits, as a step index, -1 for nothing. */
  positions: number[];
  stock: ChiefGearStock;
  /** Points the event pays for a step, by its label. Missing means zero. */
  pointsFor: (label: string) => number;
  /** False before a slot has reached the unlock, which shuts the exchange. */
  exchangeOpen: boolean;
}

/**
 * Which slot to advance next. Higher wins; a candidate scoring -Infinity is
 * never taken.
 */
type Policy = (candidate: {
  points: number;
  /** The step's cost, valued in Design Plans. */
  price: number;
  /** Where the slot sits now, so a policy can favour the one furthest behind. */
  position: number;
  /** Share of the scarcest material this step would eat, 0 to 1 and beyond. */
  burden: number;
}) => number;

/**
 * Four ways to decide what to upgrade next, all of them run.
 *
 * No single rule wins everywhere, and the differences are not small: measured
 * across a spread of starting positions and backpacks, best-value beats
 * cheapest-first by nine percent on a deep rich account, and loses to it by
 * eight percent when the six slots are at very different levels. So rather
 * than argue for one, the planner runs all four and keeps whichever scored
 * most. That costs four cheap passes and can never do worse than the best
 * single rule.
 */
const POLICIES: { id: string; pick: Policy }[] = [
  // Most points per Design Plan of cost. Strong when materials are balanced.
  { id: 'value', pick: c => (c.price > 0 ? c.points / c.price : c.points > 0 ? Infinity : -1) },
  // Cheapest step first. Since steps within a band all pay the same, taking
  // more of them wins, and this takes the most. Strong on uneven slots.
  { id: 'cheapest', pick: c => -c.price },
  // Whichever slot is furthest behind, which is the cheapest by another name
  // once the slots share a ladder. Strong deep in the ladder.
  { id: 'laggard', pick: c => -c.position },
  // Most points per unit of the scarcest thing it consumes. Strong when one
  // material is nearly gone and a Design Plan price hides that.
  { id: 'burden', pick: c => (c.burden > 0 ? c.points / c.burden : c.points > 0 ? Infinity : -1) },
];

/**
 * How far the six slots can be pushed on what is in the backpack.
 *
 * The goal is points and nothing else: it does not try to keep the slots level
 * or chase a set bonus, because whether those are worth anything is the
 * player's call, not the calculator's.
 *
 * Conversions are done only when a step is short, never speculatively, because
 * every trade loses value and an unspent material is worth more than a
 * converted one.
 */
export function planChiefGear(input: ChiefGearPlanInput): ChiefGearPlan {
  let best: ChiefGearPlan | null = null;
  for (const policy of POLICIES) {
    const plan = runPolicy(input, policy.pick);
    if (!best || plan.points > best.points) best = plan;
  }
  return best as ChiefGearPlan;
}

function runPolicy(input: ChiefGearPlanInput, pick: Policy): ChiefGearPlan {
  const positions = Array.from({ length: CHIEF_GEAR_SLOTS }, (_, i) => {
    const raw = input.positions[i];
    const n = typeof raw === 'number' && Number.isFinite(raw) ? Math.round(raw) : -1;
    return Math.min(Math.max(n, -1), CHIEF_GEAR_STEPS.length - 1);
  });
  const start = [...positions];

  const stock = { ...emptyStock(), ...input.stock };
  for (const m of CHIEF_GEAR_MATERIALS) {
    stock[m] = Math.max(Math.floor(Number.isFinite(stock[m]) ? stock[m] : 0), 0);
  }
  const opening = { ...stock };

  // With the exchange shut, every trade is simply unavailable.
  const trades: TradeState[] = input.exchangeOpen
    ? CHIEF_GEAR_EXCHANGE.map(t => ({ ...t, used: 0 }))
    : [];

  const steps: PlannedGearStep[] = [];
  const pointsBySlot = new Array(CHIEF_GEAR_SLOTS).fill(0);
  let blockedBy: ChiefGearMaterial[] = [];

  // At most six candidates a round, and each round advances one slot, so this
  // cannot run away: the bound is the whole ladder across every slot.
  const ceiling = CHIEF_GEAR_STEPS.length * CHIEF_GEAR_SLOTS;
  for (let guard = 0; guard < ceiling; guard += 1) {
    let best:
      | { slot: number; index: number; points: number; rank: number; paid: NonNullable<ReturnType<typeof priceUp>> }
      | null = null;
    const unaffordable: ChiefGearCost[] = [];

    for (let slot = 0; slot < CHIEF_GEAR_SLOTS; slot += 1) {
      const next = nextStepFor(positions[slot]);
      if (!next || !next.step.cost) continue;
      const cost = next.step.cost;

      // Affordability is checked BEFORE ranking, not after. Ranking first and
      // stopping when the winner turned out to be unaffordable threw away
      // every cheaper slot that could still have moved, which cost real points
      // whenever the slots were at different levels.
      const paid = priceUp(cost, stock, trades);
      if (!paid) {
        unaffordable.push(cost);
        continue;
      }

      const points = input.pointsFor(next.step.label);
      const rank = pick({
        points,
        price: priceOf(cost),
        position: positions[slot],
        // The scarcest material decides, so this is a max and not a sum: a
        // step needing everything you have left of one thing is expensive
        // however cheap the rest of it looks.
        burden: CHIEF_GEAR_MATERIALS.reduce((worst, m) => {
          const want = cost[m] ?? 0;
          if (want <= 0) return worst;
          return Math.max(worst, stock[m] > 0 ? want / stock[m] : Infinity);
        }, 0),
      });
      if (!best || rank > best.rank) best = { slot, index: next.index, points, rank, paid };
    }

    if (!best) {
      // Nothing is affordable any more. Report what the nearest miss was short
      // of, which is the cheapest of the steps that could not be paid.
      const nearest = unaffordable.sort((a, b) => priceOf(a) - priceOf(b))[0];
      blockedBy = nearest
        ? CHIEF_GEAR_MATERIALS.filter(m => (nearest[m] ?? 0) > stock[m])
        : [];
      break;
    }

    settle(best.paid, stock, trades);
    const step = CHIEF_GEAR_STEPS[best.index];
    steps.push({
      slot: best.slot,
      step: best.index,
      label: step.label,
      points: best.points,
      cost: step.cost as ChiefGearCost,
    });
    pointsBySlot[best.slot] += best.points;
    positions[best.slot] = best.index;
  }

  const spent = emptyStock();
  for (const m of CHIEF_GEAR_MATERIALS) spent[m] = opening[m] - stock[m];

  const plannedTrades: PlannedTrade[] = trades
    .filter(t => t.used > 0)
    .map(t => ({
      from: t.from,
      to: t.to,
      give: t.give,
      get: t.get,
      times: t.used,
      gave: t.used * t.give,
      got: t.used * t.get,
      downgrade: isDowngrade(t),
    }));

  const slots: PlannedSlot[] = positions.map((to, slot) => ({
    slot,
    from: start[slot],
    to,
    fromLabel: label(start[slot]),
    toLabel: label(to),
    steps: to - start[slot],
    points: pointsBySlot[slot],
  }));

  return {
    steps,
    trades: plannedTrades,
    slots,
    points: steps.reduce((total, s) => total + s.points, 0),
    spent,
    left: stock,
    blockedBy,
    unpricedSlots: positions
      .map((p, slot) => (isUnpriced(p) ? slot : -1))
      .filter(slot => slot >= 0),
  };
}

export const materialLabel = (m: ChiefGearMaterial) => CHIEF_GEAR_MATERIAL_LABELS[m];
