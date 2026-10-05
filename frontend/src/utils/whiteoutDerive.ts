import type { PointsEvent, EventDay, ScoringGroup, ScoringRow } from '../models/whiteoutInterface';
import {
  chiefGearStepByLabel,
  isDistinctiveStepLabel,
  CHIEF_GEAR_MIN_MATCHES,
} from '../data/whiteoutChiefGear';
import { planChiefGear, type ChiefGearPlan } from './whiteoutChiefGearPlanner';
import { planCharms, type CharmPlan } from './whiteoutCharmPlanner';
import { planPets, type PetPlan } from './whiteoutPetPlanner';
import { type RefinePlan } from './whiteoutRefinePlanner';
import { CHARM_SCORE_ROWS } from '../data/whiteoutChiefCharms';
import { rowPointsPerUnit } from '../models/whiteoutInterface';
import {
  planHunts,
  staminaBudget,
  charmPositions,
  petLevels,
  chiefGearPositions,
  chiefGearStock,
  chiefGearExchangeOpen,
  INTEL_STAMINA_PER_MISSION,
  MAX_BEAST_LEVEL,
  STAMINA_REGEN_CAP,
  shardsOfRarity,
  consumableCount,
  mithrilSpendable,
  spendableBooks,
  spendableExpertSigils,
  expertGaps,
  speedupMinutesFor,
  effectiveTrainingCapacity,
  type WhiteoutInventory,
} from '../models/whiteoutInventory';
import { rowKey, type Quantities } from './whiteoutScoring';
import { planTroops, type TroopPlan } from './whiteoutTroopOptimizer';
import { planMastery, type MasteryPlan } from './whiteoutMasteryPlanner';
import { planLuckyWheel, type WheelPlan } from './whiteoutWheelPlanner';
import { planWidgets, type WidgetPlan } from './whiteoutWidgetPlanner';
import { TROOP_TYPE_LABELS, TROOP_TYPES, trainingFor, type TroopType } from '../data/whiteoutTroops';
import type { ResourceStock } from '../data/whiteoutBuildings';
import { buildGatherQueues, planGathering, burdenBearerPressAt } from './whiteoutGathering';
import {
  GATHER_RESOURCES,
  burdenBearerCharges,
  type GatherResource,
} from '../data/whiteoutGatherTiles';

/**
 * Turns a player's inventory into per-row quantities for an event, so opening a
 * day shows what they could actually score rather than an empty form.
 *
 * The important subtlety: several days usually score the same thing. In the
 * Holiday Event both Day 1 and Day 6 pay for building power, and both Day 3 and
 * Day 7 pay for speedups. A stock can only be spent once, so each pool is
 * assigned to the single day that pays the most for it rather than being
 * counted on every day that would accept it. Ties go to the earlier day.
 *
 * Rows this cannot derive are left at zero and stay editable. `derivedKeys`
 * says which ones were filled in, so the UI can mark them.
 */

const DAY_MINUTES = 24 * 60;

/** Minutes below an hour read better as minutes than as a fraction of an hour. */
const formatMinutes = (minutes: number) => {
  const m = Math.round(minutes);
  if (m < 60) return `${m} min`;
  const hours = Math.floor(m / 60);
  const rest = m % 60;
  if (hours < 24) return rest ? `${hours}h ${rest}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const restHours = hours % 24;
  return restHours ? `${days}d ${restHours}h` : `${days}d`;
};

/** Each row id that can be filled automatically, and the pool it draws from. */
const ROW_SOURCE: Record<string, string> = {
  'use-epic-recruitment-1-time': 'goldKeys',
  'use-advanced-recruitment-1-time': 'platinumKeys',
  'use-1-rare-hero-shard': 'rareShards',
  'use-1-epic-hero-shard': 'epicShards',
  'use-1-mythic-hero-shard': 'mythicShards',
  'use-1-hero-gear-essence-stone': 'essenceStones',
  'use-1-widget-of-any-hero-exclusive-gear': 'widgets',
  'use-1-gem': 'gems',
  'use-1-mithril': 'mithril',
  'use-1-advanced-wild-mark-to-refine-pets': 'advancedWildMarks',
  'use-1-common-wild-mark-to-refine-pets': 'commonWildMarks',
  'construction-speedups-1-minute': 'constructionMinutes',
  'research-speedups-1-minute': 'researchMinutes',
  'troop-training-and-promotion-speedups-1-minute': 'trainingMinutes',
  'expert-skill-speedups-1-minute': 'expertMinutes',
  'use-1-book-of-knowledge': 'books',
  'use-any-1-expert-sigil': 'expertSigils',
  'build-up-1-building-power': 'buildingPower',
  'research-up-1-tech-power': 'researchPower',
  // Fed from the build plan's own spend, not from the bag: a crystal only
  // scores when it goes into an upgrade.
  'use-1-fire-crystal-to-upgrade-buildings': 'fireCrystalsSpent',
  'use-1-refined-fire-crystal-to-upgrade-buildings': 'refinedCrystalsSpent',
};

/**
 * A row that pays for resources gathered, and how much counts as one unit.
 *
 * The unit size only exists in the wording: "Gather 1,000 Meat" pays 10 points
 * for every thousand, "Gather 50 Iron" pays 10 for every fifty. Both are read
 * rather than assumed, so an event with different step sizes still scores.
 */
export const gatherRowUnit = (
  row: ScoringRow
): { resource: GatherResource; unit: number } | null => {
  const fromLabel = /^gather\s+([\d,.\s]+)\s+(meat|wood|coal|iron)$/i.exec(row.label ?? '');
  if (fromLabel) {
    const unit = Number(fromLabel[1].replace(/[,.\s]/g, ''));
    if (Number.isFinite(unit) && unit > 0) {
      return { resource: fromLabel[2].toLowerCase() as GatherResource, unit };
    }
  }
  const fromId = /^gather-([\d-]+)-(meat|wood|coal|iron)$/i.exec(row.id);
  if (fromId) {
    const unit = Number(fromId[1].replace(/-/g, ''));
    if (Number.isFinite(unit) && unit > 0) {
      return { resource: fromId[2].toLowerCase() as GatherResource, unit };
    }
  }
  return null;
};

/**
 * The gathering day, worked out from what the player has entered.
 *
 * Unlike the speedup and shard pools this is not spent once across the event:
 * marches go out on whichever day is being scored, so a second gathering day
 * would be gathered again rather than sharing one stock. Each day is therefore
 * filled independently.
 */
const gatheringTotals = (inv: WhiteoutInventory) => {
  const anySpeed = GATHER_RESOURCES.some(r => (inv.gatherSpeedPercent[r] ?? 0) > 0);
  if (!anySpeed || inv.gatherMarchQueues <= 0) return null;

  const lead = Math.max(
    Number.isFinite(inv.allianceBuildingLeadMinutes) ? inv.allianceBuildingLeadMinutes : 0,
    0
  );
  const alliance =
    lead > 0
      ? {
          placedAt: -lead,
          lifespanMinutes: inv.allianceBuildingLifespanMinutes,
          oneWayMinutes: inv.allianceBuildingOneWayMinutes,
          boostPercent: inv.allianceNodeUseBoost ? inv.gatherBoostPercent : 0,
        }
      : undefined;

  const runWith = (nodeTakesHero: boolean) => {
    const queues = buildGatherQueues({
      marchQueues: inv.gatherMarchQueues,
      tileLevel: inv.gatherTileLevel,
      oneWayMinutes: inv.gatherOneWayMinutes,
      speedPercent: inv.gatherSpeedPercent,
      heroLevels: inv.gatherHeroLevels,
      alliance,
      nodeTakesHero,
    });
    if (!queues.length) return null;

    // Pressed once the evening batch is all sitting on tiles, which is hours
    // before reset, so much of the cooldown is spent before the day opens.
    const pressedAt = burdenBearerPressAt(queues) ?? 0;

    return planGathering({
      queues,
      windowMinutes: DAY_MINUTES,
      burdenBearerAt: burdenBearerCharges(inv.burdenBearerLevel, DAY_MINUTES, pressedAt),
      boost:
        inv.gatherBoostMinutes > 0
          ? { percent: inv.gatherBoostPercent, lastsMinutes: inv.gatherBoostMinutes, startMinutes: 0 }
          : undefined,
    });
  };

  // A gathering hero can ride the node's first trip or stay on a tile queue all
  // day, and neither wins everywhere: the node trip is twelve hours against a
  // tile's seven, but a tile queue runs five of them. Both are planned and the
  // better kept, which costs one extra pass.
  const withHeroOnNode = alliance ? runWith(true) : null;
  const withHeroOnTiles = runWith(false);
  if (!withHeroOnNode) return withHeroOnTiles;
  if (!withHeroOnTiles) return withHeroOnNode;

  const yieldOf = (p: NonNullable<typeof withHeroOnTiles>) =>
    GATHER_RESOURCES.reduce((sum, r) => sum + p.totals[r], 0);
  return yieldOf(withHeroOnNode) > yieldOf(withHeroOnTiles) ? withHeroOnNode : withHeroOnTiles;
};

const TRAIN_ROW = /^train-1-lv-(\d+)-troop$/;

/** The tier a "Train 1 Lv.N Troop" row pays for, or null for any other row. */
export const trainRowTier = (row: ScoringRow): number | null => {
  const m = TRAIN_ROW.exec(row.id);
  return m ? Number(m[1]) : null;
};
const POLAR_TERROR = 'call-rally-and-hunt-down-1-polar-terror';
/** The flat row, used by every event except State of Power. */
const BEAST = 'kill-a-lv-1-30-beast';
/** A banded row, "Defeat 1 Lv. 11 to 15 Beast". Group 1 is the band's floor. */
const BEAST_BAND = /^defeat-1-lv-(\d+)-to-(\d+)-beast$/;

/** True for either shape of beast row, which is what a day needs to be a hunt day. */
const isBeastRow = (id: string) => id === BEAST || BEAST_BAND.test(id);

/**
 * The beast row this plan should fill in, and the band it stands for.
 *
 * With a flat row there is nothing to choose. With bands there is: they all
 * cost the same stamina, so the highest one the player can reach pays best,
 * and anything above that is not a choice they have. `maxLevel` is their input,
 * and a band counts as reachable when its floor is at or below it, because a
 * Lv. 26 beast is still worth the Lv. 26 to 30 rate.
 */
const findBeastRow = (
  event: PointsEvent,
  maxLevel: number
): { day: number; group: ScoringGroup; row: ScoringRow; band: [number, number] | null } | null => {
  const flat = findRow(event, BEAST);
  if (flat) return { ...flat, band: null };

  let best: { day: number; group: ScoringGroup; row: ScoringRow; band: [number, number] } | null = null;
  for (const day of event.days) {
    for (const group of day.groups) {
      for (const row of group.rows) {
        const m = BEAST_BAND.exec(row.id);
        if (!m) continue;
        const band: [number, number] = [Number(m[1]), Number(m[2])];
        if (band[0] > maxLevel) continue;
        const rate = rowPointsPerUnit(group, row);
        if (!best || rate > rowPointsPerUnit(best.group, best.row)) {
          best = { day: day.day, group, row, band };
        }
      }
    }
  }
  return best;
};
const BUILDING_POWER = 'build-up-1-building-power';

export interface DeriveInput {
  inventory: WhiteoutInventory;
  /**
   * The Crystal Laboratory plan, worked out by the caller.
   *
   * It has to run BEFORE the upgrade plan, because the Fire Crystals it
   * converts are the ones that plan then spends, so the caller owns the
   * decision and passes the result down.
   */
  refine?: RefinePlan | null;
  refineDay?: number | null;
  /** Power the upgrade planner says is reachable, used for building power rows. */
  buildingPower: number;
  /**
   * Power the research plan gains, for events that pay for it.
   *
   * Passed in rather than worked out here for the same reason buildingPower
   * is: the search behind it is not free and the caller has already run it.
   */
  researchPower?: number;
  /** Resources left for troops after the building plan has taken its share. */
  troopResources?: WhiteoutInventory['resources'];
  /**
   * Speedup minutes that can actually be burnt, per pool.
   *
   * Not what is held. A speedup only counts when it is poured into something
   * already running, so the ceiling is the work the plan can put in front of
   * it. Missing entries fall back to the held pile.
   */
  usableMinutes?: Partial<Record<'construction' | 'research', number>>;
  /**
   * Fire Crystals the building plan consumes.
   *
   * The spend, not the stock. Events pay for a crystal going INTO an
   * upgrade, so a bag with nothing to build on it is worth nothing here.
   */
  crystalsSpent?: { fireCrystal: number; refinedFireCrystal: number };
}

export interface DeriveResult {
  quantities: Quantities;
  derivedKeys: Set<string>;
  hunts: ReturnType<typeof planHunts> | null;
  /** Super Refinements worth running, or null where nothing pays for Refined. */
  refine: RefinePlan | null;
  /** The day the refined crystals would be spent, which is where it is shown. */
  refineDay: number | null;
  /** What the pet materials can buy, and where it was spent. */
  pets: PetPlan | null;
  /** The day the pet plan scores on, or null when no day pays for it. */
  petDay: number | null;
  /** What the Charm materials can buy, and where it was spent. */
  charms: CharmPlan | null;
  /** The day the charm plan scores on, or null when no day pays for it. */
  charmDay: number | null;
  troops: TroopPlan | null;
  /**
   * Points that belong to a day but not to any row. Promotions score the gap
   * between two tiers, which no single scoring row represents, so they are
   * carried here and added to the day and event totals.
   */
  extraPointsByDay: Record<number, number>;
  notes: string[];
  /** Which day each pool was assigned to, for explaining the allocation. */
  allocation: { source: string; day: number; amount: number }[];
  /** Pools a day would accept but that are worth more elsewhere. */
  holdBack: HoldBack[];
  /** The gathering day, or null when no gathering speed has been entered. */
  gathering: ReturnType<typeof planGathering> | null;
  /** The Chief Gear plan, and the day it was scored on. */
  chiefGear: ChiefGearPlan | null;
  chiefGearDay: number | null;
  /**
   * Warnings that belong to one day, keyed by it.
   *
   * Kept apart from `notes` because the day panel renders these and nothing
   * renders those. A thin-day warning filed only in `notes` is invisible.
   */
  dayNotes: Record<number, string[]>;
  /**
   * The day the construction work scores, or null when nothing pays for it.
   *
   * Not the same as the building power day. An event can score the upgrade
   * without scoring its power: King of Icefield pays for the Fire Crystals
   * that go in and the minutes that finish it, and has no power row at all.
   */
  upgradeDay: number | null;
  /** Which heroes to spend widgets on, and what cannot be spent at all. */
  widgets: WidgetPlan;
  /** How far each of the twelve pieces can be forged, and what strands. */
  mastery: MasteryPlan;
  /** How many wheel spins to buy and on which days, or null with no wheel. */
  wheel: WheelPlan | null;
  /**
   * Batches queued before the event that land on the troop day.
   *
   * Kept apart from the speedup plan because they cost no speedups: they are
   * scored whether or not burning the pile beat training with it.
   */
  preQueuedTroops: { type: TroopType; tier: number; count: number; points: number }[];
  /**
   * What became of the upgrade planner's building power.
   *
   * The plan is a single event-wide spend, not a per-day one, so it is only
   * advice on the day it is actually scored. Quite often it is scored on no day
   * at all, because burning the construction speedups raw pays more than the
   * power they would build.
   */
  buildingPowerPlan: {
    /** Day the power is scored on, or null when it is not scored. */
    day: number | null;
    /** Set when it lost to burning the speedups raw, with both valuations. */
    droppedFor: { betterDay: number; speedupValue: number; powerValue: number } | null;
    /** False when this event has no building power row to score at all. */
    hasRow: boolean;
  };
}

export interface HoldBack {
  /** The day to avoid spending on. */
  day: number;
  source: string;
  label: string;
  betterDay: number;
  rateHere: number;
  rateThere: number;
}

/**
 * Learning speedups are only worth points once they are spent, and they can
 * only be spent on learning an expert still has left. A player holding fifty
 * days of Learning with twenty days of skills left to learn can score twenty.
 *
 * The cap only applies once at least one expert has been ticked. With none
 * entered there is no information to cap against, and zeroing the pool would
 * read as a bug rather than as a warning.
 */
const spendableExpertMinutes = (inv: WhiteoutInventory, held: number) => {
  const gaps = expertGaps(inv);
  if (!gaps.length) return held;
  const room = gaps.reduce((total, gap) => total + gap.learningMinutes, 0);
  return Math.min(held, room);
};

const poolAmounts = (
  inv: WhiteoutInventory,
  buildingPower: number,
  researchPower: number,
  /** Minutes each speedup pool can actually spend, where that is known. */
  usable: Partial<Record<'construction' | 'research', number>>,
  /** What Mastery Forging can absorb, which is what these stones pay for. */
  mastery: MasteryPlan,
  /** What the build plan actually consumes, which is what these rows pay for. */
  crystals: { fireCrystal: number; refinedFireCrystal: number },
  /** Passed in rather than recomputed: the search behind it is not free. */
  widgets: WidgetPlan
): Record<string, number> => ({
  goldKeys: inv.goldKeys,
  platinumKeys: inv.platinumKeys,
  rareShards: shardsOfRarity(inv, 'rare'),
  epicShards: shardsOfRarity(inv, 'epic'),
  mythicShards: shardsOfRarity(inv, 'mythic'),
  // Not the bag: stones only score going into Mastery Forging, and that is
  // gated by Mythic Gear as much as by how much mastery is left to buy.
  essenceStones: mastery.stonesSpent,
  // What can actually go into a level up, not what is in the bag. A widget
  // on a hero at Lv 10 never scores, and neither does a pile short of the
  // next level's price.
  widgets: widgets.spent,
  gems: consumableCount(inv, 'gems'),
  // Held Mithril is not spendable Mithril: it only goes into a Legendary
  // breakthrough, so the twelve pieces' remaining breakthroughs cap it.
  mithril: mithrilSpendable(inv),
  advancedWildMarks: consumableCount(inv, 'advanced-wild-mark'),
  commonWildMarks: consumableCount(inv, 'common-wild-mark'),
  // These fields hold whole minutes, the way DurationInput writes them. They
  // used to hold days, and the conversion below was left behind when the input
  // changed, which multiplied every speedup pool by 1,440.
  //
  // The General pile lands in exactly one of these three, whichever the player
  // pointed it at, rather than in all of them.
  // Capped by the work available, not by the bag. A minute of speedup scores
  // only when it goes into something that is running, and with thin resources
  // most of a large pile has nothing to go into.
  constructionMinutes: Math.min(
    speedupMinutesFor(inv, 'construction'),
    usable.construction ?? Number.POSITIVE_INFINITY
  ),
  researchMinutes: Math.min(
    speedupMinutesFor(inv, 'research'),
    usable.research ?? Number.POSITIVE_INFINITY
  ),
  trainingMinutes: speedupMinutesFor(inv, 'training'),
  // Learning goes through the same door as the rest, so the General pile
  // can land here, and is then capped by how much learning is actually left.
  expertMinutes: spendableExpertMinutes(inv, speedupMinutesFor(inv, 'learning')),
  // Both capped by what the unlocked experts still owe, for the same reason
  // widgets are: an item with nowhere to go scores nothing.
  books: spendableBooks(inv),
  expertSigils: spendableExpertSigils(inv),
  buildingPower,
  researchPower,
  fireCrystalsSpent: crystals.fireCrystal,
  refinedCrystalsSpent: crystals.refinedFireCrystal,
});

export const POOL_LABELS: Record<string, string> = {
  goldKeys: 'Gold Keys',
  platinumKeys: 'Platinum Keys',
  rareShards: 'Rare Hero Shards',
  epicShards: 'Epic Hero Shards',
  mythicShards: 'Mythic Hero Shards',
  essenceStones: 'Hero Gear Essence Stones',
  widgets: 'Hero Exclusive Gear Widgets',
  gems: 'Gems',
  mithril: 'Mithril',
  advancedWildMarks: 'Advanced Wild Marks',
  commonWildMarks: 'Common Wild Marks',
  constructionMinutes: 'Construction speedups',
  researchMinutes: 'Research speedups',
  trainingMinutes: 'Training speedups',
  expertMinutes: 'Learning speedups',
  books: 'Books of Knowledge',
  expertSigils: 'Expert Sigils',
  buildingPower: 'Building power',
  researchPower: 'Research power',
  fireCrystalsSpent: 'Fire Crystals',
  refinedCrystalsSpent: 'Refined Fire Crystals',
};

/** The player's highest hunted beast level, clamped into the band range. */
const beastLevel = (inv: WhiteoutInventory) => {
  const raw = Number(inv.huntBeastLevel);
  if (!Number.isFinite(raw) || raw <= 0) return MAX_BEAST_LEVEL;
  return Math.min(Math.max(Math.floor(raw), 1), MAX_BEAST_LEVEL);
};

const findRow = (
  event: PointsEvent,
  id: string
): { day: number; group: ScoringGroup; row: ScoringRow } | null => {
  for (const day of event.days) {
    for (const group of day.groups) {
      const row = group.rows.find(r => r.id === id);
      if (row) return { day: day.day, group, row };
    }
  }
  return null;
};

/**
 * Rows on this day that score a Chief Gear step.
 *
 * Matched by label against the ladder rather than by a day number or an event
 * id, so any event that pays for Chief Gear picks the planner up on its own
 * and adding a new event with a gear stage needs no code change here.
 *
 * The match is made per GROUP, not per row, and a group has to clear two bars:
 * several of its rows must be ladder steps, and at least one of them must be a
 * label that could only be Chief Gear. Row by row matching looked fine and was
 * not: an event's hero shard rows are called Rare, Epic and Mythic, which are
 * three real ladder labels, so every shard table in the calculator was being
 * read as a gear table.
 */
export const chiefGearRowsOn = (day: EventDay) =>
  day.groups.flatMap(group => {
    const hits = group.rows.filter(row => chiefGearStepByLabel.has(row.label));
    if (hits.length < CHIEF_GEAR_MIN_MATCHES) return [];
    if (!hits.some(row => isDistinctiveStepLabel(row.label))) return [];
    return hits.map(row => ({ group, row }));
  });

/**
 * Groups that look like Chief Gear tables but whose rows do not join the
 * ladder, so the planner has to sit them out.
 *
 * Worth surfacing rather than swallowing: it means someone transcribed that
 * event's gear stage in a different format, which is a fixable data problem
 * and not a missing feature.
 */
export const chiefGearGroupsNotJoined = (day: EventDay) =>
  day.groups.filter(group => {
    if (chiefGearRowsOn(day).some(hit => hit.group === group)) return false;
    return /chief gear|gear upgrade/i.test(group.label) && group.rows.length > 0;
  });

/** The row id every event uses for a Lucky Wheel spin. */
export const WHEEL_ROW = 'play-lucky-wheel-1-time';

/**
 * The days that pay for wheel spins, and what each pays.
 *
 * Read off the event's own rows, so a new event with a wheel picks the plan up
 * without a day number being wired anywhere.
 */
export const wheelDaysOf = (event: PointsEvent) => {
  const out: { day: number; pointsPerSpin: number; group: ScoringGroup; row: ScoringRow }[] = [];
  for (const day of event.days) {
    for (const group of day.groups) {
      const row = group.rows.find(r => r.id === WHEEL_ROW);
      if (row) out.push({ day: day.day, pointsPerSpin: rowPointsPerUnit(group, row), group, row });
    }
  }
  return out;
};

/** The row id every event uses for spending an Essence Stone. */
export const ESSENCE_ROW = 'use-1-hero-gear-essence-stone';

/**
 * The day that pays for Essence Stones, and what it pays each.
 *
 * Read off the event's own rows rather than a day number, so a new event with
 * a hero gear stage picks the plan up with nothing wired here.
 */
export const essenceDayOf = (event: PointsEvent) => {
  for (const day of event.days) {
    for (const group of day.groups) {
      const row = group.rows.find(r => r.id === ESSENCE_ROW);
      if (row) return { day: day.day, pointsPerStone: rowPointsPerUnit(group, row) };
    }
  }
  return null;
};

/** The row id every event uses for spending a widget. */
export const WIDGET_ROW = 'use-1-widget-of-any-hero-exclusive-gear';

/**
 * The day that pays for widgets, and what it pays each.
 *
 * Found from the event's own rows rather than a day number, so a new event
 * with a hero gear stage picks the plan up without anything wired here.
 */
export const widgetDayOf = (event: PointsEvent) => {
  for (const day of event.days) {
    for (const group of day.groups) {
      const row = group.rows.find(r => r.id === WIDGET_ROW);
      if (row) return { day: day.day, pointsPerWidget: rowPointsPerUnit(group, row) };
    }
  }
  return null;
};

/** Every day of an event that scores Chief Gear, in day order. */
export const chiefGearDays = (event: PointsEvent) =>
  event.days.filter(day => chiefGearRowsOn(day).length > 0);

export function deriveQuantities(event: PointsEvent, input: DeriveInput): DeriveResult {
  const { inventory, buildingPower } = input;
  const researchPower = Math.max(Number(input.researchPower) || 0, 0);
  const crystalsSpent = input.crystalsSpent ?? { fireCrystal: 0, refinedFireCrystal: 0 };
  const usable = input.usableMinutes ?? {};
  // Worked out once: the pool table and the returned plan both want it, and it
  // searches every generation to find the best split.
  const widgetPlan = planWidgets(inventory);
  const masteryPlan = planMastery(inventory);
  const quantities: Quantities = {};
  const derivedKeys = new Set<string>();
  const notes: string[] = [];
  const allocation: DeriveResult['allocation'] = [];
  const holdBack: HoldBack[] = [];
  const extraPointsByDay: Record<number, number> = {};

  const dayNotes: Record<number, string[]> = {};
  /*
   * Files a note against ONE day, and nowhere else.
   *
   * It used to push into `notes` as well, which is the event-wide list the day
   * panel shows under "Why some rows are empty" on every day. The result was
   * that opening Day 1 explained the beast band for Day 3 and announced that
   * Days 4, 6 and 7 score nothing, none of which is about Day 1. Every caller
   * here is per-day and every one of them is already rendered on its own day,
   * so the second copy was only ever noise.
   */
  const noteForDay = (day: number, text: string) => {
    dayNotes[day] = [...(dayNotes[day] ?? []), text];
  };

  const set = (day: number, group: ScoringGroup, row: ScoringRow, value: number) => {
    if (!Number.isFinite(value) || value <= 0) return;
    const key = rowKey(day, group.id, row.id);
    quantities[key] = Math.floor(value);
    derivedKeys.add(key);
  };

  // Stamina is one pool across the event, so hunts are planned once using this
  // event's own rates rather than assuming Polar Terrors always win.
  const ptRow = findRow(event, POLAR_TERROR);
  const beastRow = findBeastRow(event, beastLevel(inventory));
  let hunts: ReturnType<typeof planHunts> | null = null;

  if (ptRow || beastRow) {
    hunts = planHunts(
      inventory,
      ptRow ? rowPointsPerUnit(ptRow.group, ptRow.row) : 0,
      beastRow ? rowPointsPerUnit(beastRow.group, beastRow.row) : 0
    );
    if (ptRow) set(ptRow.day, ptRow.group, ptRow.row, hunts.polarTerrors);
    if (beastRow) set(beastRow.day, beastRow.group, beastRow.row, hunts.beasts);
    if (beastRow?.band) {
      // Say so on the day itself. The band is an assumption about the player,
      // and the only way they can correct it is to be told what was assumed.
      const [lo, hi] = beastRow.band;
      const rate = Math.round(rowPointsPerUnit(beastRow.group, beastRow.row)).toLocaleString();
      noteForDay(
        beastRow.day,
        `Beasts are scored at the Lv. ${lo} to ${hi} band, ${rate} a kill, from the beast ` +
          'level you entered. Every band costs the same stamina, so hunt the highest you can clear.'
      );
    }
  }

  // The Crystal Laboratory decision is made by the caller, before the upgrade
  // plan, because the crystals it converts are the ones that plan spends.
  const refine = input.refine ?? null;
  const refineDay = input.refineDay ?? null;

  // Pets. Fourteen pets share four pools, so the plan is worked out once for
  // the event and landed on whichever day pays most, the same as the rest.
  //
  // Matched by row id, so any event paying for pet advancement picks this up.
  let pets: PetPlan | null = null;
  let petDay: number | null = null;
  {
    const ADVANCE = /^advance-a-pet-at-lv-(\d+)$/;
    let bestDay: { day: number; group: ScoringGroup; rate: number } | null = null;
    for (const day of event.days) {
      for (const group of day.groups) {
        if (!group.rows.some(r => ADVANCE.test(r.id))) continue;
        const rate = group.pointsPerSourceValue ?? 0;
        if (!bestDay || rate > bestDay.rate) bestDay = { day: day.day, group, rate };
      }
    }

    if (bestDay) {
      pets = planPets({
        levels: petLevels(inventory),
        pools: {
          food: consumableCount(inventory, 'pet-food'),
          manuals: consumableCount(inventory, 'taming-manual'),
          potions: consumableCount(inventory, 'energizing-potion'),
          serums: consumableCount(inventory, 'strengthening-serum'),
        },
      });
      petDay = bestDay.day;

      // One row per advancement LEVEL, and several pets can cross the same
      // level, so the rows are counted rather than set.
      const counts = new Map<number, number>();
      for (const jump of pets.jumps) {
        for (const level of jump.levels) counts.set(level, (counts.get(level) ?? 0) + 1);
      }
      for (const row of bestDay.group.rows) {
        const m = ADVANCE.exec(row.id);
        if (!m) continue;
        const count = counts.get(Number(m[1]));
        if (count) set(bestDay.day, bestDay.group, row, count);
      }
    }
  }

  // Chief Charms. Eighteen charms share three pools, so the plan is worked
  // out once for the event and landed on whichever day pays most for it, the
  // same way the gear and the hunts are handled.
  //
  // Matched by ROW ID rather than by day or event, so any event that pays for
  // charms picks this up without a line of code here.
  let charms: CharmPlan | null = null;
  let charmDay: number | null = null;
  {
    const ids = new Set(CHARM_SCORE_ROWS.map(r => r.id));
    let bestDay: { day: number; group: ScoringGroup; rate: number } | null = null;
    for (const day of event.days) {
      for (const group of day.groups) {
        const hits = group.rows.filter(r => ids.has(r.id)).length;
        if (hits < 2) continue;
        const rate = group.pointsPerSourceValue ?? 0;
        if (!bestDay || rate > bestDay.rate) bestDay = { day: day.day, group, rate };
      }
    }

    if (bestDay) {
      const startPositions = charmPositions(inventory);
      charms = planCharms({
        positions: startPositions,
        guides: consumableCount(inventory, 'charm-guide'),
        designs: consumableCount(inventory, 'charm-design'),
        secrets: consumableCount(inventory, 'charm-secrets'),
      });
      charmDay = bestDay.day;

      // One row per instalment, and several charms can take the same one, so
      // the rows are counted across the eighteen rather than set.
      const counts = new Map<string, number>();
      for (let charm = 0; charm < startPositions.length; charm += 1) {
        for (let step = startPositions[charm]; step < charms.positions[charm]; step += 1) {
          const row = CHARM_SCORE_ROWS[step];
          if (row) counts.set(row.id, (counts.get(row.id) ?? 0) + 1);
        }
      }
      for (const row of bestDay.group.rows) {
        const count = counts.get(row.id);
        if (count) set(bestDay.day, bestDay.group, row, count);
      }
    }
  }

  // Chief Gear. The six slots share one pile of materials, so the plan is
  // worked out once for the event and then landed on whichever scoring day
  // pays the most for it, the same way the hunts are handled above.
  let chiefGear: ChiefGearPlan | null = null;
  let chiefGearDay: number | null = null;
  const gearDays = chiefGearDays(event);
  for (const day of event.days) {
    for (const group of chiefGearGroupsNotJoined(day)) {
      notes.push(
        `Day ${day.day}'s "${group.label}" table is Chief Gear, but its rows are worded ` +
          'differently to the upgrade ladder, so it cannot be planned. The labels need to ' +
          'match the ladder before the planner can fill it in.'
      );
    }
  }
  if (gearDays.length > 0) {
    let best: { day: number; plan: ChiefGearPlan } | null = null;
    for (const day of gearDays) {
      const rates = new Map(
        chiefGearRowsOn(day).map(({ group, row }) => [row.label, rowPointsPerUnit(group, row)])
      );
      const plan = planChiefGear({
        positions: chiefGearPositions(inventory),
        stock: chiefGearStock(inventory),
        pointsFor: label => rates.get(label) ?? 0,
        exchangeOpen: chiefGearExchangeOpen(inventory),
      });
      if (!best || plan.points > best.plan.points) best = { day: day.day, plan };
    }
    if (best) {
      chiefGear = best.plan;
      chiefGearDay = best.day;
      const day = event.days.find(d => d.day === best.day);
      if (day) {
        const rows = new Map(
          chiefGearRowsOn(day).map(({ group, row }) => [row.label, { group, row }])
        );
        // Each step is taken at most once per slot, but several slots can take
        // the same step, so the quantities are counted rather than set.
        const counts = new Map<string, number>();
        for (const step of best.plan.steps) {
          counts.set(step.label, (counts.get(step.label) ?? 0) + 1);
        }
        for (const [label, count] of counts) {
          const hit = rows.get(label);
          if (hit) set(day.day, hit.group, hit.row, count);
        }
      }
    }
  }

  // Troops: the event pays per troop trained, and a promotion pays the gap
  // between tiers, so the mix is an optimisation rather than a lookup.
  let troops: TroopPlan | null = null;
  let troopPlanValue = 0;
  /** Batches queued before the event that land on the scoring day. */
  const preQueued: { type: TroopType; tier: number; count: number; points: number }[] = [];
  /** Resources the pre-queued batches draw on, before the speedup plan gets any. */
  const preQueueStock: ResourceStock = { ...(input.troopResources ?? inventory.resources) };
  const trainRows: { day: number; group: ScoringGroup; row: ScoringRow; tier: number }[] = [];
  for (const day of event.days) {
    for (const group of day.groups) {
      for (const row of group.rows) {
        const m = TRAIN_ROW.exec(row.id);
        if (m) trainRows.push({ day: day.day, group, row, tier: Number(m[1]) });
      }
    }
  }

  if (trainRows.length > 0) {
    const pointsPerTier: Record<number, number> = {};
    for (const t of trainRows) pointsPerTier[t.tier] = rowPointsPerUnit(t.group, t.row);

    // A batch queued before the event finishes on the scoring day having spent
    // no speedups at all, so it never competes with burning them and is applied
    // straight away. What caps it is training capacity, which is why the
    // capacity item and the Minister appointment matter more on this day than
    // any amount of speedups.
    for (const type of TROOP_TYPES) {
      const capacity = Math.floor(effectiveTrainingCapacity(inventory, type));
      if (capacity <= 0) continue;
      const tier = Math.round(inventory.maxTier[type] ?? 0);
      const target = trainRows.find(t => t.tier === tier);
      if (!target) continue;
      const per1k = trainingFor(type, tier, 1000, inventory.heliosLevels[type] ?? 0);
      if (!per1k) continue;

      // Only as many as the resources left after the building plan can cover.
      let count = capacity;
      for (const r of ['meat', 'wood', 'coal', 'iron'] as const) {
        const perTroop = per1k[r] / 1000;
        if (perTroop > 0) count = Math.min(count, Math.floor((preQueueStock[r] ?? 0) / perTroop));
      }
      if (count <= 0) continue;

      for (const r of ['meat', 'wood', 'coal', 'iron'] as const) {
        preQueueStock[r] = Math.max(0, (preQueueStock[r] ?? 0) - (per1k[r] / 1000) * count);
      }
      const key = rowKey(target.day, target.group.id, target.row.id);
      quantities[key] = (quantities[key] ?? 0) + count;
      derivedKeys.add(key);
      preQueued.push({ type, tier, count, points: count * (pointsPerTier[tier] ?? 0) });
    }

    troops = planTroops({
      inventory,
      pointsPerTier,
      // Whatever the pre-queued batches did not already claim.
      resources: preQueueStock,
      speedupMinutes: speedupMinutesFor(inventory, 'training'),
    });

    // Applying this is deferred: training the troops and burning the training
    // speedups are the same minutes, scored on different days, so the two have
    // to compete before either is written down. Doing it here, as it used to,
    // told the player to spend the same speedups on Day 3 and again on Day 4.
    troopPlanValue = troops.actions.reduce((total, action) => total + action.points, 0);
  }

  let troopPlanApplied = false;

  /** Writes the troop plan into the day rows. Only called if it wins. */
  const applyTroopPlan = () => {
    if (!troops || !trainRows.length) return;
    troopPlanApplied = true;
    const troopDay = trainRows[0].day;
    for (const action of troops.actions) {
      if (action.kind === 'train') {
        const target = trainRows.find(t => t.tier === action.toTier);
        if (!target) continue;
        const key = rowKey(target.day, target.group.id, target.row.id);
        quantities[key] = (quantities[key] ?? 0) + Math.floor(action.count);
        derivedKeys.add(key);
      } else {
        // No row represents a tier gap, so bank the points against the day.
        extraPointsByDay[troopDay] = (extraPointsByDay[troopDay] ?? 0) + action.points;
      }
    }
  };

  // Gathering. Not a pool: marches go out on whatever day is being scored, so a
  // second gathering day would be gathered again rather than splitting one
  // stock. Every gather row is therefore filled on its own day.
  const gathering = gatheringTotals(inventory);
  if (gathering) {
    for (const day of event.days) {
      for (const group of day.groups) {
        for (const row of group.rows) {
          const spec = gatherRowUnit(row);
          if (!spec) continue;
          set(day.day, group, row, Math.floor((gathering.totals[spec.resource] ?? 0) / spec.unit));
        }
      }
    }
  }

  // Collect every row each pool could be spent on, then pick the best payer.
  const candidates = new Map<string, { day: number; group: ScoringGroup; row: ScoringRow; rate: number }[]>();
  for (const day of event.days) {
    for (const group of day.groups) {
      for (const row of group.rows) {
        const source = ROW_SOURCE[row.id];
        if (!source) continue;
        const list = candidates.get(source) ?? [];
        list.push({ day: day.day, group, row, rate: rowPointsPerUnit(group, row) });
        candidates.set(source, list);
      }
    }
  }

  const amounts = poolAmounts(inventory, buildingPower, researchPower, usable, masteryPlan, crystalsSpent, widgetPlan);
  const contested: string[] = [];

  const bestFor = (source: string) => {
    const list = candidates.get(source);
    const amount = amounts[source] ?? 0;
    if (!list || !list.length || amount <= 0) return null;
    // Highest rate wins; on a tie the earlier day wins so plans stay stable.
    const best = list.reduce((a, b) => (b.rate > a.rate ? b : a));
    return { ...best, amount, value: amount * best.rate };
  };

  // What the engine decides to do with the power the upgrade planner found.
  // The plan is only worth showing as advice on the day it is actually scored,
  // and not at all when it loses to burning the speedups raw.
  const buildingPowerPlan: DeriveResult['buildingPowerPlan'] = {
    day: null,
    droppedFor: null,
    // Keyed by pool, not by row id: BUILDING_POWER is the row's id and never
    // appears as a key here.
    hasRow: candidates.has('buildingPower'),
  };

  // Construction speedups and building power are not independent: burning the
  // speedups is what completes the upgrades, and the two are scored on
  // different days. Counting both would spend the same speedups twice, so take
  // whichever placement is worth more and drop the other.
  const speedPick = bestFor('constructionMinutes');
  const powerPick = bestFor('buildingPower');
  const skip = new Set<string>();
  if (speedPick && powerPick) {
    const loser = speedPick.value >= powerPick.value ? 'buildingPower' : 'constructionMinutes';
    const winner = loser === 'buildingPower' ? speedPick : powerPick;
    skip.add(loser);
    if (loser === 'buildingPower') {
      buildingPowerPlan.droppedFor = {
        betterDay: speedPick.day,
        speedupValue: speedPick.value,
        powerValue: powerPick.value,
      };
    }
    const losing = loser === 'buildingPower' ? powerPick : speedPick;
    holdBack.push({
      day: losing.day,
      source: loser,
      label: POOL_LABELS[loser] ?? loser,
      betterDay: winner.day,
      rateHere: losing.rate,
      rateThere: winner.rate,
    });
  }

  // Research speedups and research power are the same pair again: the minutes
  // are what completes the research, and the power is what the research grants.
  // Counting both spends the same minutes twice.
  const researchSpeedPick = bestFor('researchMinutes');
  const researchPowerPick = bestFor('researchPower');
  if (researchSpeedPick && researchPowerPick) {
    const loser =
      researchSpeedPick.value >= researchPowerPick.value ? 'researchPower' : 'researchMinutes';
    const winner = loser === 'researchPower' ? researchSpeedPick : researchPowerPick;
    const losing = loser === 'researchPower' ? researchPowerPick : researchSpeedPick;
    skip.add(loser);
    holdBack.push({
      day: losing.day,
      source: loser,
      label: POOL_LABELS[loser] ?? loser,
      betterDay: winner.day,
      rateHere: losing.rate,
      rateThere: winner.rate,
    });
  }

  // Training speedups and the troops they train are the same spend too, on
  // different days: Day 3 pays per minute burned, Day 4 pays per troop trained.
  // Whichever is worth more wins and the other is dropped.
  const trainingPick = bestFor('trainingMinutes');
  if (troops && troopPlanValue > 0 && trainingPick) {
    if (troopPlanValue >= trainingPick.value) {
      skip.add('trainingMinutes');
      applyTroopPlan();
      holdBack.push({
        day: trainingPick.day,
        source: 'trainingMinutes',
        label: POOL_LABELS.trainingMinutes,
        betterDay: trainRows[0].day,
        rateHere: trainingPick.rate,
        rateThere: troopPlanValue / Math.max(amounts.trainingMinutes, 1),
      });
    }
  } else if (troops && troopPlanValue > 0) {
    applyTroopPlan();
  }

  for (const [source, list] of candidates) {
    if (skip.has(source)) continue;
    const amount = amounts[source] ?? 0;
    if (amount <= 0) continue;
    const best = list.reduce((a, b) => (b.rate > a.rate ? b : a));
    set(best.day, best.group, best.row, amount);
    allocation.push({ source, day: best.day, amount });
    if (source === 'buildingPower') buildingPowerPlan.day = best.day;
    if (list.length > 1) {
      contested.push(POOL_LABELS[source] ?? source);
      for (const other of list) {
        if (other.day === best.day) continue;
        holdBack.push({
          day: other.day,
          source,
          label: POOL_LABELS[source] ?? source,
          betterDay: best.day,
          rateHere: other.rate,
          rateThere: best.rate,
        });
      }
    }
  }

  // ---- days that will not pay their reward ----------------------------
  //
  // Each day carries its own reward for passing a points target, so a day left
  // far below its threshold forfeits one however large the event total is.
  //
  // THIS ONLY REPORTS. An earlier version moved spend between days to lift
  // them, and both halves of that were unsound. It sized the moves against a
  // guessed target, which made invented advice look precise. And it moved
  // speedups, which are not freely spendable: construction minutes need a
  // building already under construction that day, training minutes need a
  // queue running, and the upgrade plan may be scheduled for another day
  // entirely. The plan could contradict itself.
  //
  // So nothing is moved. Where an event has real captured targets the
  // shortfall is stated; where it does not, an empty day is simply named.
  // Neither can propose something the player cannot do.
  const dayPoints = (day: number) => {
    const eventDay = event.days.find(d => d.day === day);
    if (!eventDay) return 0;
    let total = extraPointsByDay[day] ?? 0;
    for (const group of eventDay.groups) {
      for (const row of group.rows) {
        const qty = quantities[rowKey(day, group.id, row.id)] ?? 0;
        total += qty * rowPointsPerUnit(group, row);
      }
    }
    return total;
  };

  // Real captured targets only. No estimate is used to drive anything.
  const milestones = event.dailyMilestones;
  const dailyTarget = milestones?.points?.length
    ? milestones.points[milestones.points.length - 1]
    : 0;

  const reportThinDays = () => {
    // An event with one stage has no days to name, so it talks about itself.
    const oneStage = event.days.length === 1;
    for (const eventDay of event.days) {
      const who = oneStage ? 'This event' : `Day ${eventDay.day}`;
      const scored = dayPoints(eventDay.day);

      if (dailyTarget > 0 && scored < dailyTarget) {
        // What this day pays for, so the player can pick something they can
        // actually do rather than being told to spend a pool they may have no
        // use for.
        const earners = eventDay.groups
          .filter(group => group.rows.some(row => rowPointsPerUnit(group, row) > 0))
          .map(group => group.label);
        noteForDay(
          eventDay.day,
          `${who} reaches ${Math.round(scored).toLocaleString()} of the ` +
            `${dailyTarget.toLocaleString()} its top reward wants, so it is ` +
            `${Math.round(dailyTarget - scored).toLocaleString()} short. ` +
            `${oneStage ? 'It' : 'This day'} pays for ${earners.join(', ')}.`
        );
        continue;
      }

      if (scored <= 0) {
        const earners = eventDay.groups
          .filter(group => group.rows.some(row => rowPointsPerUnit(group, row) > 0))
          .map(group => group.label);
        noteForDay(
          eventDay.day,
          `${who} scores nothing from what is entered, which forfeits ` +
            `${oneStage ? 'every' : "that day's"} reward. It pays for ${earners.join(', ')}: ` +
            `doing any of them is worth more than the total is.`
        );
      }
    }
  };
  reportThinDays();

  // The Lucky Wheel, planned last because the split depends on what the rest of
  // the day already scores. Gems buy spins; the spins' shards depend only on
  // the event total, so the split is free to go wherever a day is short of its
  // reward target.
  const wheelRows = wheelDaysOf(event);
  const wheel = wheelRows.length
    ? planLuckyWheel(
        consumableCount(inventory, 'gems'),
        wheelRows.map(entry => ({
          day: entry.day,
          pointsPerSpin: entry.pointsPerSpin,
          shortfall: dailyTarget > 0 ? Math.max(dailyTarget - dayPoints(entry.day), 0) : 0,
        }))
      )
    : null;
  if (wheel) {
    for (const entry of wheelRows) {
      const planned = wheel.days.find(d => d.day === entry.day);
      if (planned && planned.spins > 0) set(entry.day, entry.group, entry.row, planned.spins);
    }
  }

  if (buildingPower <= 0 && candidates.has('buildingPower')) {
    notes.push('Building power rows are zero until the upgrade planner has a plan.');
  }
  if (staminaBudget(inventory).net <= 0 && (ptRow || beastRow)) {
    notes.push(
      'No stamina left over for hunting. Either the bag is empty, or Intel is eating the whole ' +
        'daily income.'
    );
  }
  if (!troops) {
    notes.push('Research power and troop power rows have no data behind them yet.');
  }

  // Where the upgrade plan belongs. Power first, because that is the row that
  // scores the upgrade itself; then the Fire Crystals that go into it; then the
  // speedups that finish it. Null means nothing on this table pays for any of
  // it, and the plan is not shown rather than shown everywhere.
  const upgradeDay =
    buildingPowerPlan.day ??
    allocation.find(a => a.source === 'fireCrystalsSpent')?.day ??
    allocation.find(a => a.source === 'refinedCrystalsSpent')?.day ??
    allocation.find(a => a.source === 'constructionMinutes')?.day ??
    null;

  return {
    quantities,
    derivedKeys,
    refine,
    refineDay,
    pets,
    petDay,
    charms,
    charmDay,
    dayNotes,
    upgradeDay,
    hunts,
    // A plan that lost to the speedup row is not handed on. Leaving it would
    // put "troops ran out of training speedups" on the training day, when the
    // truth is the speedups were worth more burned elsewhere, which the note
    // above already explains.
    troops: troopPlanApplied ? troops : null,
    notes,
    allocation,
    holdBack,
    gathering,
    chiefGear,
    chiefGearDay,
    widgets: widgetPlan,
    mastery: masteryPlan,
    wheel,
    preQueuedTroops: preQueued,
    buildingPowerPlan,
    extraPointsByDay,
  };
}

/* ------------------------------------------------------------------ *
 * Turning a day's derived numbers into instructions
 * ------------------------------------------------------------------ */

export interface DayAction {
  /** What to do, in the order worth doing it. */
  text: string;
  points: number;
  /** True when the number came from the inventory rather than a manual entry. */
  derived: boolean;
}

export interface DayPlan {
  actions: DayAction[];
  total: number;
  notes: string[];
  /** Things to deliberately not spend on this day. */
  warnings: string[];
}

/**
 * Describes a day as a list of things to actually do, biggest payoff first,
 * rather than leaving the player to read a table of rates.
 */
export function describeDayPlan(
  event: PointsEvent,
  dayNumber: number,
  quantities: Quantities,
  derivedKeys: Set<string>,
  hunts: ReturnType<typeof planHunts> | null,
  buildingPower: number,
  ginaSummary: string | null,
  holdBack: HoldBack[] = [],
  troops: TroopPlan | null = null,
  /** Days the state President runs each buff, 0 when unknown. */
  president: { constructionDay: number; researchDay: number } | null = null,
  /** Anything the engine wants said about this day specifically. */
  dayNotes: string[] = []
): DayPlan {
  const day = event.days.find(d => d.day === dayNumber);
  if (!day) return { actions: [], total: 0, notes: [], warnings: [] };

  const actions: DayAction[] = [];
  const notes: string[] = [];
  // The day's own warnings come first: "this day scores nothing" outranks
  // "save your speedups for Tuesday".
  const warnings: string[] = [...dayNotes];
  warnings.push(...holdBack
    .filter(h => h.day === dayNumber)
    .map(h => {
      const here = Math.round(h.rateHere).toLocaleString();
      const there = Math.round(h.rateThere).toLocaleString();
      return h.rateThere > h.rateHere
        ? `Do not spend ${h.label} today. Day ${h.betterDay} pays ${there} per unit against ${here} here.`
        : `Save ${h.label} for Day ${h.betterDay}; both days pay ${here}, so spending it once is what matters.`;
    }));

  for (const group of day.groups) {
    for (const row of group.rows) {
      const key = rowKey(dayNumber, group.id, row.id);
      const qty = quantities[key] ?? 0;
      if (qty <= 0) continue;
      const points = qty * rowPointsPerUnit(group, row);
      const derived = derivedKeys.has(key);

      let text: string;
      if (row.id === POLAR_TERROR) {
        text = `Rally ${qty.toLocaleString()} Polar Terrors`;
      } else if (row.id === BEAST) {
        text = `Hunt ${qty.toLocaleString()} Lv.1-30 Beasts`;
      } else if (BEAST_BAND.test(row.id)) {
        const m = BEAST_BAND.exec(row.id);
        text = `Hunt ${qty.toLocaleString()} Lv.${m?.[1]}-${m?.[2]} Beasts`;
      } else if (row.id === BUILDING_POWER) {
        text = `Run the upgrade plan for ${qty.toLocaleString()} building power`;
      } else if (row.id.endsWith('-1-minute')) {
        const days = qty / DAY_MINUTES;
        text = `Burn ${qty.toLocaleString()} minutes (${days.toFixed(1)} days) of ${row.label.replace(' (1 minute)', '').toLowerCase()}`;
      } else {
        text = `${row.label} x ${qty.toLocaleString()}`;
      }

      actions.push({ text, points, derived });
    }
  }

  // Promotions score the gap between tiers, so they have no row of their own.
  const scoresTroops = day.groups.some(g => g.rows.some(r => TRAIN_ROW.test(r.id)));
  if (scoresTroops && troops) {
    for (const a of troops.actions) {
      if (a.kind !== 'promote') continue;
      actions.push({
        text: `Promote ${Math.round(a.count).toLocaleString()} ${TROOP_TYPE_LABELS[a.type]} from T${a.fromTier} to T${a.toTier}`,
        points: a.points,
        derived: true,
      });
    }
    if (troops.limitingFactors.length > 0) {
      notes.push(
        `Troops ran out of ${troops.limitingFactors.map(f => (f === 'time' ? 'training speedups' : f)).join(', ')}.`
      );
    }
  }

  actions.sort((a, b) => b.points - a.points);

  const hasHunts = day.groups.some(g => g.rows.some(r => r.id === POLAR_TERROR || isBeastRow(r.id)));
  if (hasHunts && hunts) {
    if (hunts.staminaAvailable <= 0) {
      notes.push('No stamina available for hunting, so no hunts are planned.');
    } else {
      const b = hunts.budget;
      notes.push(
        `Stamina: ${hunts.staminaSpent.toLocaleString()} of ${hunts.staminaAvailable.toLocaleString()} spent, ${hunts.staminaLeft.toLocaleString()} left over.`
      );
      notes.push(
        `That pool is ${Math.round(b.onHand).toLocaleString()} on the meter plus ` +
          `${Math.round(b.regen + b.storehouse + b.items).toLocaleString()} arriving across the ` +
          `day, less ${Math.round(b.intelSpend).toLocaleString()} for ` +
          `${Math.round(b.intelRunPerDay)} Intel missions.`
      );
      if (b.regenWasted >= 1) {
        notes.push(
          `The timer stops at ${STAMINA_REGEN_CAP}, so ` +
            `${Math.round(b.regenWasted).toLocaleString()} of regen was lost to a full meter. ` +
            (Math.round(b.perExtraDay) <= 0
              ? 'Waiting a day longer adds nothing from here: the two Storehouse claims go ' +
                'straight back out on Intel. Skipping Intel is the only thing that banks.'
              : `Waiting a day longer would add about ${Math.round(b.perExtraDay).toLocaleString()}` +
                ', from the Storehouse rather than from the timer.')
        );
      }
      if (b.intelSpend > 0) {
        notes.push(
          `Skipping Intel frees far less than the ${INTEL_STAMINA_PER_MISSION} a mission suggests, ` +
            'because a meter sitting at the cap earns nothing. Skip only if the hunt points beat ' +
            'the mission rewards.'
        );
      }
      notes.push(
        'Stamina goes to whichever hunt pays more per stamina, which is why the split looks the way it does.'
      );
      if (ginaSummary) {
        notes.push(ginaSummary);
      }
      if (hunts.totalMarchMinutes > 0) {
        notes.push(
          `Marching: ${formatMinutes(hunts.totalMarchMinutes)} of marches in total, about ` +
            `${formatMinutes(hunts.wallClockMinutes)} of real time with your rallies running at ` +
            `once. Check that fits inside the stage.`
        );
      }
    }
  }

  if (day.groups.some(g => g.rows.some(r => r.id === BUILDING_POWER)) && buildingPower <= 0) {
    notes.push('Fill in your buildings and speedups above to get building power for this day.');
  }

  // The President's buff is only up for part of the event, so a day that pays
  // well on paper can still be the wrong day to spend on.
  if (president) {
    const { constructionDay, researchDay } = president;
    if (constructionDay === dayNumber) {
      notes.push(
        'The President runs the Construction buff today, so builds go further now than on any other day.'
      );
    }
    if (researchDay === dayNumber) {
      notes.push(
        'The President runs the Research buff today, so research goes further now than on any other day.'
      );
    }
    const spendsConstruction = day.groups.some(g =>
      g.rows.some(r => r.id === 'construction-speedups-1-minute' || r.id === BUILDING_POWER)
    );
    if (spendsConstruction && constructionDay > 0 && constructionDay !== dayNumber) {
      warnings.push(
        `The President's Construction buff is on Day ${constructionDay}, not today. The same speedups build more then.`
      );
    }
    const spendsResearch = day.groups.some(g =>
      g.rows.some(r => r.id === 'research-speedups-1-minute')
    );
    if (spendsResearch && researchDay > 0 && researchDay !== dayNumber) {
      warnings.push(
        `The President's Research buff is on Day ${researchDay}, not today. The same speedups research more then.`
      );
    }
  }

  return { actions, total: actions.reduce((s, a) => s + a.points, 0), notes, warnings };
}
