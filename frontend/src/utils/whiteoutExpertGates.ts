import {
  whiteoutExperts,
  EXPERT_GATES,
  type ExpertDefinition,
} from '../data/whiteoutExperts';
import {
  expertProgress,
  consumableCount,
  gatesPaidFor,
  type WhiteoutInventory,
} from '../models/whiteoutInventory';

/**
 * What Expert Sigils can actually buy, which is whole gates and nothing else.
 *
 * THE OLD MODEL WAS WRONG AND FLATTERED THE BAG. It treated an expert's sigils
 * as a pool and counted min(held, everything still owed), so 7 sigils against a
 * 10 sigil gate scored as 7. The game does not take part payment: a gate at a
 * multiple of ten costs an EXACT number of that expert's own sigils, and until
 * you hold all of it you spend none of it and score none of it.
 *
 * COMMON EXPERT SIGILS ARE NOT DEAD EITHER, which the old model also had wrong.
 * They redeem into any one expert's own sigils, so they are a shared pool that
 * can finish whichever gate is closest. That makes the split a real choice, and
 * the cheapest-gate-first rule below is what makes the most gates out of them.
 */

export interface GatePlan {
  expert: ExpertDefinition;
  /** Relationship level now. */
  level: number;
  /** Gates already paid, which is what the status follows. */
  paid: number;
  /** True when passing the next gate would raise a skill's ceiling. */
  unlocks: boolean;
  /** That expert's own sigils in the bag. */
  own: number;
  /** Commons redeemed into this expert to finish a gate. */
  redeemed: number;
  /** Gates this expert can actually pass. */
  gates: number;
  /** Sigils those gates cost in all, which is what an event would score. */
  sigilsSpent: number;
  /** The next gate's price, or null at Intimate. */
  nextGateCost: number | null;
  /** Sigils short of that next gate, after redeeming. */
  short: number;
}

export interface SigilSpend {
  perExpert: GatePlan[];
  /** Sigils spent across every expert, which is the figure an event pays for. */
  totalSpent: number;
  commonsHeld: number;
  commonsRedeemed: number;
  /** Own sigils that cannot complete a gate, so they buy nothing yet. */
  stranded: number;
}

/** Gate costs still ahead of an expert, in order, from the gates PAID. */
const gatesAhead = (expert: ExpertDefinition, paid: number) =>
  expert.sigilCosts.slice(Math.min(Math.max(paid, 0), EXPERT_GATES), EXPERT_GATES);

/**
 * Whole gates buyable from one pile, taking them in order because they have to
 * be passed in order.
 */
const gatesFrom = (costs: number[], sigils: number) => {
  let left = sigils;
  let gates = 0;
  let spent = 0;
  for (const cost of costs) {
    if (cost > left) break;
    left -= cost;
    spent += cost;
    gates += 1;
  }
  return { gates, spent, left };
};

export const planSigilSpend = (
  inv: WhiteoutInventory,
  /** Does passing one more gate open a skill level for this expert? */
  unlocksASkill: (expertId: string) => boolean = () => false
): SigilSpend => {
  const commonsHeld = consumableCount(inv, 'common-expert-sigil');
  const unlocked = whiteoutExperts.filter(e => expertProgress(inv, e.id).unlocked);

  const rows: GatePlan[] = unlocked.map(expert => {
    const level = Math.max(expertProgress(inv, expert.id).affinityLevel, 0);
    const paid = gatesPaidFor(inv, expert.id);
    const own = consumableCount(inv, `sigil-${expert.id}`);
    const costs = gatesAhead(expert, paid);
    const { gates, spent, left } = gatesFrom(costs, own);
    const nextGateCost = costs[gates] ?? null;
    return {
      expert,
      level,
      paid,
      unlocks: unlocksASkill(expert.id),
      own,
      redeemed: 0,
      gates,
      sigilsSpent: spent,
      nextGateCost,
      short: nextGateCost === null ? 0 : Math.max(nextGateCost - left, 0),
    };
  });

  /*
   * Where the Commons go.
   *
   * Cheapest-gate-first alone was wrong, and visibly so: with 38 Commons it
   * spent 22 of them on Holger, whose gate unlocks nothing, and left Cyrille
   * 32 short of the gate at Lv 70, which is the only thing standing between
   * her Entrapment and Lv 10. The skill plan then recommended that level
   * anyway, so the two halves of the advice contradicted each other.
   *
   * A gate that unlocks a skill level is worth more than a gate that does not,
   * so those come first, and only then the cheapest. `unlocks` is supplied by
   * the caller, because this module knows about gates and not about skills.
   */
  let commons = commonsHeld;
  for (;;) {
    const candidates = rows
      .filter(r => r.nextGateCost !== null && r.short > 0 && r.short <= commons)
      .sort((a, b) => (b.unlocks ? 1 : 0) - (a.unlocks ? 1 : 0) || a.short - b.short);
    const pick = candidates[0];
    if (!pick) break;
    commons -= pick.short;
    pick.redeemed += pick.short;
    pick.sigilsSpent += pick.nextGateCost ?? 0;
    pick.gates += 1;
    const costs = gatesAhead(pick.expert, pick.paid);
    const leftOwn = Math.max(
      pick.own - costs.slice(0, pick.gates).reduce((t, c) => t + c, 0) + pick.redeemed,
      0
    );
    pick.nextGateCost = costs[pick.gates] ?? null;
    pick.short = pick.nextGateCost === null ? 0 : Math.max(pick.nextGateCost - leftOwn, 0);
  }

  const totalSpent = rows.reduce((t, r) => t + r.sigilsSpent, 0);
  const ownHeld = unlocked.reduce((t, e) => t + consumableCount(inv, `sigil-${e.id}`), 0);
  // Sigils belonging to experts who are not recruited can never be spent.
  const lockedAway = whiteoutExperts
    .filter(e => !expertProgress(inv, e.id).unlocked)
    .reduce((t, e) => t + consumableCount(inv, `sigil-${e.id}`), 0);

  return {
    perExpert: rows,
    totalSpent,
    commonsHeld,
    commonsRedeemed: commonsHeld - commons,
    stranded: Math.max(ownHeld - rows.reduce((t, r) => t + (r.sigilsSpent - r.redeemed), 0), 0) + lockedAway,
  };
};
