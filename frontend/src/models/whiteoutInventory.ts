import type { ResourceStock } from '../data/whiteoutBuildings';
import { CHARM_COUNT, CHARM_STEPS } from '../data/whiteoutChiefCharms';
import { whiteoutPets, petById } from '../data/whiteoutPets';
import { whiteoutResearch, researchByKey } from '../data/whiteoutResearch';

/** Steps in the charm ladder, so a position can be clamped to it. */
const CHARM_STEP_TOTAL = CHARM_STEPS.length;
import {
  MASTERY_FORGING,
  GEAR_PIECES,
  mithrilRemainingForPiece,
  emptyGearPiece,
  type GearPieceState,
} from '../data/whiteoutHeroGear';
import {
  CHIEF_GEAR_SLOTS,
  CHIEF_GEAR_ITEM_IDS,
  CHIEF_GEAR_MATERIALS,
  CHIEF_GEAR_STEPS,
  EXCHANGE_UNLOCK_UPGRADE,
} from '../data/whiteoutChiefGear';
import { TROOP_TYPES, type TroopType } from '../data/whiteoutTroops';
import { RESEARCH_TREES, type ResearchTree } from '../data/whiteoutResearch';
import { shardsRemaining } from '../data/whiteoutHeroStars';
import { planSigilSpend } from '../utils/whiteoutExpertGates';
import { GATHER_RESOURCES, type GatherResource } from '../data/whiteoutGatherTiles';
import {
  ALL_WIDGET_IDS,
  WIDGET_GENERATIONS,
  WIDGET_MAX_LEVEL,
  widgetCostForNextLevel,
  widgetsToMax,
  widgetLevelsAffordable,
} from '../data/whiteoutConsumables';
import {
  whiteoutExperts,
  EXPERT_GIFTS,
  EXPERT_MAX_LEVEL,
  EXPERT_GATES,
  affinityRemaining,
  sigilsRemaining,
  booksRemaining,
  learningMinutesRemaining,
  nextGate,
  statusName,
  talentLevelForStatus,
  gatesReachable,
  gatesAssumed,
  type ExpertDefinition,
} from '../data/whiteoutExperts';

/**
 * A state appointment, held for a single thirty minute slot.
 *
 * The slot length is what decides how these are worth modelling, and it splits
 * them in two:
 *
 *   - A CAPACITY bonus is captured the moment you press train. Hold the
 *     Minister for that one press and the whole batch carries the extra, then
 *     trains on for however long it takes. So it counts in full.
 *
 *   - A SPEED bonus only runs while the slot does. Half an hour of +15% against
 *     a build or research plan measured in days is a rounding error, so it is
 *     deliberately NOT folded into the speed totals. Counting it there would
 *     quietly inflate every long plan.
 *
 * The slot rotates every thirty minutes and every slot is contested, so in
 * practice a player lands one appointment on a good day and none on most. It is
 * not worth planning around holding a position repeatedly, which is the other
 * reason the speed half of it is ignored: you would need it running all week.
 *
 * Only the two with confirmed numbers are here. More positions exist; guessing
 * their bonuses would change which one the calculator tells you to chase.
 */
export type Appointment = 'none' | 'vicePresident' | 'ministerOfEducation';

export interface AppointmentEffect {
  id: Appointment;
  label: string;
  note: string;
  /** Percentage points, for the half hour the slot lasts. */
  construction: number;
  research: number;
  training: number;
  /** Flat troops added to a camp's batch, captured when the batch is queued. */
  trainingCapacity: number;
}

export const APPOINTMENT_MINUTES = 30;

export const APPOINTMENTS: AppointmentEffect[] = [
  {
    id: 'none',
    label: 'None',
    note: 'No appointment held.',
    construction: 0,
    research: 0,
    training: 0,
    trainingCapacity: 0,
  },
  {
    id: 'vicePresident',
    label: 'Vice President',
    note: '+15% construction, research and training speed, for the 30 minute slot only.',
    construction: 15,
    research: 15,
    training: 15,
    trainingCapacity: 0,
  },
  {
    id: 'ministerOfEducation',
    label: 'Minister of Education',
    note: '+300 training capacity and +75% training speed, for the 30 minute slot only.',
    construction: 0,
    research: 0,
    training: 75,
    trainingCapacity: 300,
  },
];

const NO_APPOINTMENT = APPOINTMENTS[0];

export const appointmentEffect = (id: Appointment): AppointmentEffect =>
  APPOINTMENTS.find(a => a.id === id) ?? NO_APPOINTMENT;

/**
 * Chief Order Double Time: +20% on construction, 23 hour cooldown.
 *
 * It only reaches upgrades started within five minutes of using it, so it is a
 * buff on what you begin next rather than on anything already running. The
 * planner spends it on a fresh plan, which is exactly that case.
 */
export const DOUBLE_TIME_PERCENT = 20;

/**
 * Cave Hyena, Builder's Aide: construction speed, by skill level 1 to 5.
 *
 * The same shape as Double Time, five minutes on a 23 hour cooldown, and it
 * counts for the same reason: the planner starts a fresh run of upgrades, and
 * both buffs reach whatever is begun inside that window. Five minutes is not
 * the small number it looks: speedups poured in while it is up are the cheap
 * way to finish several builds at a raised rate.
 *
 * 5 / 7 / 9 / 12 / 15, confirmed by whiteoutdata and heaven-guardian.
 */
export const BUILDERS_AIDE_BY_LEVEL = [5, 7, 9, 12, 15];

export type HeroRarity = 'rare' | 'epic' | 'mythic';

/** Where the General speedup pile gets spent. */
/**
 * Where the General pile can go. It substitutes for ANY of these, which is the
 * whole point of it, so Learning belongs here as much as the other three.
 */
export type GeneralSpeedupTarget = 'construction' | 'training' | 'research' | 'learning';

export const GENERAL_TARGETS: GeneralSpeedupTarget[] = [
  'construction',
  'training',
  'research',
  'learning',
];

export const GENERAL_TARGET_LABELS: Record<GeneralSpeedupTarget, string> = {
  construction: 'Construction',
  training: 'Troop Training',
  research: 'Research',
  learning: 'Learning',
};

export const HERO_RARITIES: HeroRarity[] = ['rare', 'epic', 'mythic'];

export const HERO_RARITY_LABELS: Record<HeroRarity, string> = {
  rare: 'Rare',
  epic: 'Epic',
  mythic: 'Mythic',
};

export interface HeroShardEntry {
  /** Stable key for React and for editing a row in place. */
  id: string;
  name: string;
  rarity: HeroRarity;
  count: number;
  /** False when the hero is not unlocked, which costs 10 shards on its own. */
  owned: boolean;
  /** Stars already reached, 0 to 5. A hero at 5 cannot absorb more shards. */
  starLevel: number;
  /** Tiers paid toward the next star, 0 to 5. A star takes six tiers. */
  starTier: number;
}

let heroIdCounter = 0;
export const newHeroShardEntry = (): HeroShardEntry => ({
  id: `hero-${++heroIdCounter}`,
  name: '',
  rarity: 'mythic',
  count: 0,
  owned: true,
  starLevel: 0,
  starTier: 0,
});

/**
 * Pushes the id counter past anything restored from storage, so a hero added
 * after a reload cannot collide with a saved one and break React's keys.
 */
export const seedHeroIds = (entries: HeroShardEntry[]) => {
  for (const entry of entries) {
    const n = Number.parseInt(String(entry.id).replace(/^hero-/, ''), 10);
    if (Number.isFinite(n) && n > heroIdCounter) heroIdCounter = n;
  }
};

/**
 * Where a player has got to with one expert.
 *
 * Relationship is a single track, Lv 1 to 100, not two. Gift items buy the
 * affinity that raises it, and every multiple of ten is a Sigil gate on the same
 * track rather than a separate friendship number. The status, the talent level
 * and the Sigils still owed all follow from this one figure.
 */
export interface ExpertProgress {
  /** False when the expert has not been recruited at all. */
  unlocked: boolean;
  /** Relationship level, 0 to 100. Zero means not recruited. */
  affinityLevel: number;
  /**
   * Relationship gates actually PAID in sigils, 0 to 10, which is what sets
   * the status. Separate from the level because reaching Lv 70 does not make
   * an expert Close 1: the gate at 70 has to be bought as well. Undefined
   * means "not paid yet", which is where you stand the moment you reach a
   * gate, so a level of exactly 70 reads as Casual 3 until told otherwise.
   */
  gatesPaid?: number;
  /** Current level per skill id. Missing means level 0. */
  skillLevels: Record<string, number>;
}

export const emptyExpertProgress = (): ExpertProgress => ({
  unlocked: false,
  affinityLevel: 0,
  skillLevels: {},
});

/**
 * Everything a player holds. Entered once, outside the event list, because the
 * same stock is what every event scores against.
 */
export interface WhiteoutInventory {
  resources: ResourceStock;

  /** Recruitment keys. Platinum drives Advanced, Gold drives Epic. */
  platinumKeys: number;
  goldKeys: number;

  /** Generic hero shards held, by rarity. */
  rareShards: number;
  epicShards: number;
  mythicShards: number;
  /**
   * Hero-specific shards. Events score shards by rarity rather than by hero, so
   * each entry carries the hero's rarity and is added to that pool.
   */
  heroShards: HeroShardEntry[];

  /** Stamina on hand, plus Chief Stamina items worth 10 stamina each. */
  stamina: number;
  chiefStaminaItems: number;
  /**
   * Intel missions deliberately left unrun each day, to bank the stamina.
   *
   * Zero is the honest default: the missions pay too well to skip. It is still
   * a lever, because during a hunt stage the points may be worth more than the
   * mission rewards, and this is the only place the stamina can come from.
   */
  intelMissionsSkippedPerDay: number;
  /** How many rallies the player sends at once. Gina can only ride one of them. */
  ralliesAtATime: number;
  /** Whether Gina is in the rotation at all. */
  useGina: boolean;
  /** Gina's Endurance Training level, 1 to 5. */
  ginaSkillLevel: number;
  /**
   * Round-trip minutes per hunt: march out, march back, and for Polar Terrors
   * the rally assembly wait. Defaults are typical averages, not fixed values,
   * since march time depends on distance and march speed.
   */
  polarTerrorMarchMinutes: number;
  beastMarchMinutes: number;
  /**
   * The highest beast level you actually hunt, 1 to 30.
   *
   * Only matters where an event pays by level band, which State of Power does
   * and the others do not: their single row covers Lv. 1 to 30 at one rate.
   * Every band costs the same 10 stamina, so the top one always pays best and
   * the only question is which bands you can clear.
   */
  huntBeastLevel: number;

  /**
   * Which pool the General speedups join. They can be spent on anything, but
   * only once, so the calculator makes the player say where they are going
   * rather than quietly offering the same minutes to construction, training and
   * research at the same time.
   */
  generalSpeedupTarget: GeneralSpeedupTarget;

  /**
   * Super Refinements already run in the Crystal Laboratory since Monday.
   *
   * Needed because the cost of a refine depends entirely on how many have
   * been done this week: the first twenty cost 20 Fire Crystals each and the
   * last twenty cost 160, and the counter resets Mondays at 00:00 UTC.
   */
  superRefinesDone: number;

  /** Speedups in whole minutes, split by what they can be spent on. */
  constructionSpeedupMinutes: number;
  researchSpeedupMinutes: number;
  trainingSpeedupMinutes: number;
  expertSpeedupMinutes: number;
  generalSpeedupMinutes: number;

  /**
   * Days the state President runs each buff, or 0 when unknown.
   *
   * The buff is rarely up for the whole event, and a President usually puts
   * Construction on one day and Research on another. That decides which day a
   * pile of speedups is actually worth spending, which the points table alone
   * cannot say.
   */
  presidentConstructionDay: number;
  presidentResearchDay: number;

  constructionBuffPercent: number;
  /**
   * Total training speed bonus, summed the same way as the build buff. Sources
   * include tech bonus, the island, Ling Xue, Lancer Camp level, Alliance Tech
   * Advanced Training, Chief Order Advanced Training and the presidential
   * Mobilize skill.
   */
  trainingSpeedPercent: number;

  /** Zinman cuts build cost on meat, wood, coal and iron. */
  useZinman: boolean;
  /** Zinman's build-cost skill level, 1 to 5. */
  zinmanSkillLevel: number;
  /**
   * Agnes's Project Management takes a flat number of hours off a building
   * upgrade rather than a percentage.
   */
  /** Ling Xue's Total Control raises training speed. */
  useLingXue: boolean;
  lingXueLevel: number;
  /** Jasser's Enlightened Warfare raises research speed. */
  useJasser: boolean;
  jasserLevel: number;
  /** Research speed from everything other than Jasser. */
  researchSpeedPercent: number;

  /**
   * Backpack contents, keyed by the ids in data/whiteoutConsumables. One bag
   * rather than a field per item, so adding an item is a data edit only.
   */
  consumables: Record<string, number>;

  /**
   * The twelve hero gear pieces, keyed by `class-slot`. Missing means untouched.
   *
   * Heroes do not share a pool, so these are twelve independent ladders rather
   * than shares of one stock.
   */
  heroGear: Record<string, GearPieceState>;

  /**
   * Where each of the six Chief Gear slots sits, as an index into
   * CHIEF_GEAR_STEPS. -1 means nothing built in that slot.
   *
   * A step index rather than a tier, because the Status instalments are real
   * steps that score on their own, so a slot can sit part way through an
   * upgrade.
   */
  chiefGearSlots: number[];
  /**
   * Where each of the eighteen Chief Charms stands, as finished steps.
   *
   * Steps rather than levels because the ladder splits levels into
   * instalments and each one scores on its own: 0 is a charm not started, 4 is
   * Lv. 4 reached, 5 is Lv. 4.1 done, 75 is Lv. 18. Order is the three types
   * in turn, six of each, matching CHARM_TYPES.
   */
  charmSlots: number[];
  /**
   * Current level per pet id. Missing or zero means the pet is not owned.
   *
   * Levels rather than advancement counts, because levelling is what costs
   * food and the advancements fall out of the level reached.
   */
  petLevels: Record<string, number>;

  /** Expert progress, keyed by expert id. Missing means untouched. */
  experts: Record<string, ExpertProgress>;

  /**
   * Exclusive gear widget level per mythic hero, keyed by that hero's widget id.
   * Missing means Lv 0. Held widgets are worthless without this: the next level
   * costs five more than the last, so what a stack buys depends entirely on
   * where the hero already is.
   */
  widgetLevels: Record<string, number>;

  /**
   * Gathering, for the event days that score resources brought home.
   *
   * These are all measurable rather than guessable: the tile confirmation
   * screen shows the gathering speed and the march time, and the rest the
   * player simply knows. None of it is derived from anything else, which is why
   * it is asked for rather than inferred.
   */
  gatherMarchQueues: number;
  /**
   * Gathering speed per resource, as a percentage, before any hero bonus.
   *
   * Per resource because it genuinely differs: a player can be at +345.5% on
   * meat and wood but +345% on coal and iron, and the buffs behind them are not
   * the same set.
   */
  gatherSpeedPercent: Record<GatherResource, number>;
  /** Minutes one way to the tiles usually worked. */
  gatherOneWayMinutes: number;
  /** Tile level usually worked, 1 to 8. */
  gatherTileLevel: number;
  /** Skill level 0 to 5 for each resource's gathering hero. */
  gatherHeroLevels: Record<GatherResource, number>;
  /**
   * Minutes before reset the alliance puts its gathering building up, or 0 when
   * there is none. It cannot be gathered before it exists and everything inside
   * comes home when it collapses, so this one number fixes that march entirely.
   */
  /**
   * Burden Bearer, the Musk Ox pet skill, 1 to 6. Zero means no Musk Ox.
   *
   * Only the level is asked for: the cooldown follows from it, and the number
   * of charges in a day follows from the cooldown.
   */
  burdenBearerLevel: number;
  allianceBuildingLeadMinutes: number;
  allianceBuildingLifespanMinutes: number;
  allianceBuildingOneWayMinutes: number;
  /** Whether the Gathering Speed Boost will be running during the node march. */
  allianceNodeUseBoost: boolean;
  /** Gathering Speed Boost: minutes it lasts, or 0 when it will not be used. */
  gatherBoostMinutes: number;
  /** Extra gathering speed the boost gives. The item gives 100. */
  gatherBoostPercent: number;

  /** Current level per building slug. Empty string means not built. */
  buildingLevels: Record<string, string>;

  /** Troops held, per type, keyed by tier. */
  troopsOwned: Record<TroopType, Record<number, number>>;
  /** Highest tier each camp can train or promote to. */
  maxTier: Record<TroopType, number>;
  /**
   * Troops one camp can hold in a single training batch, per type.
   *
   * This is the number that decides a troop scoring day, not the speedup pile.
   * A batch queued before the event finishes on the day itself and scores in
   * full having spent no speedups at all, so capacity is what caps the free
   * points and speedups only buy whatever is trained on top.
   */
  trainingCapacity: Record<TroopType, number>;
  /** Training Capacity Enhance, a two hour item that triples capacity. */
  useTrainingCapacityEnhance: boolean;
  /**
   * The appointment held at the moment the troop batch is queued.
   *
   * Only the capacity part of it survives past the slot, which is why this is a
   * single question about one press rather than a state spanning the event.
   */
  appointmentWhenQueueing: Appointment;
  /** Chief Order Advanced Training: +20% for two hours, on a two day cooldown. */
  useAdvancedTraining: boolean;
  /** Chief Order Double Time: +20% construction, on a 23 hour cooldown. */
  useDoubleTime: boolean;
  useBuildersAide: boolean;
  buildersAideLevel: number;
  /** Helios Training level per type, cutting T11 cost by 5% a level. */
  heliosLevels: Record<TroopType, number>;

  /** Research trees the player wants the planner to spend on. */
  researchTrees: ResearchTree[];
  /**
   * Highest fully finished tier per tree. Asking for a tier rather than all 191
   * nodes keeps the form usable; the planner treats every node at or below it
   * as complete.
   */
  /**
   * Kept for saves made before the tree existed. Read once on revival and
   * expanded into researchLevels, never written again.
   */
  researchTiersDone: Record<ResearchTree, number>;
  /**
   * Level reached on each research node, keyed by node key.
   *
   * Missing means nothing done. A node's own level count varies, from one on
   * Command Tactics to six on the later Battle nodes, so this is clamped
   * against the node rather than against a single maximum.
   */
  researchLevels: Record<string, number>;
}

export const emptyInventory = (): WhiteoutInventory => ({
  resources: {},
  platinumKeys: 0,
  goldKeys: 0,
  rareShards: 0,
  epicShards: 0,
  mythicShards: 0,
  heroShards: [],
  stamina: 0,
  chiefStaminaItems: 0,
  intelMissionsSkippedPerDay: 0,
  ralliesAtATime: 1,
  useGina: false,
  ginaSkillLevel: 5,
  polarTerrorMarchMinutes: DEFAULT_POLAR_TERROR_MARCH_MINUTES,
  beastMarchMinutes: DEFAULT_BEAST_MARCH_MINUTES,
  // Defaulting to the top band. Anyone whose state is running a State of Power
  // is long past the point where Lv. 30 beasts are out of reach, and the day
  // plan names the band it used so a lower one gets corrected on sight.
  huntBeastLevel: MAX_BEAST_LEVEL,
  superRefinesDone: 0,
  constructionSpeedupMinutes: 0,
  researchSpeedupMinutes: 0,
  trainingSpeedupMinutes: 0,
  expertSpeedupMinutes: 0,
  generalSpeedupMinutes: 0,
  generalSpeedupTarget: 'construction',
  presidentConstructionDay: 0,
  presidentResearchDay: 0,
  constructionBuffPercent: 0,
  trainingSpeedPercent: 0,
  useZinman: false,
  zinmanSkillLevel: 5,
  useLingXue: false,
  lingXueLevel: 5,
  useJasser: false,
  jasserLevel: 5,
  researchSpeedPercent: 0,
  consumables: {},
  heroGear: {},
  chiefGearSlots: Array.from({ length: CHIEF_GEAR_SLOTS }, () => -1),
  charmSlots: Array.from({ length: CHARM_COUNT }, () => 0),
  petLevels: {},
  experts: {},
  widgetLevels: {},
  gatherMarchQueues: 6,
  gatherSpeedPercent: Object.fromEntries(GATHER_RESOURCES.map(r => [r, 0])) as Record<
    GatherResource,
    number
  >,
  gatherOneWayMinutes: 2,
  gatherTileLevel: 8,
  gatherHeroLevels: Object.fromEntries(GATHER_RESOURCES.map(r => [r, 0])) as Record<
    GatherResource,
    number
  >,
  burdenBearerLevel: 0,
  allianceBuildingLeadMinutes: 0,
  allianceBuildingLifespanMinutes: 12 * 60,
  allianceBuildingOneWayMinutes: 1,
  allianceNodeUseBoost: false,
  gatherBoostMinutes: 0,
  gatherBoostPercent: 100,
  buildingLevels: {},
  troopsOwned: Object.fromEntries(TROOP_TYPES.map(t => [t, {}])) as Record<
    TroopType,
    Record<number, number>
  >,
  maxTier: Object.fromEntries(TROOP_TYPES.map(t => [t, 10])) as Record<TroopType, number>,
  trainingCapacity: Object.fromEntries(TROOP_TYPES.map(t => [t, 0])) as Record<TroopType, number>,
  useTrainingCapacityEnhance: false,
  appointmentWhenQueueing: 'none',
  useAdvancedTraining: false,
  useDoubleTime: false,
  useBuildersAide: false,
  buildersAideLevel: 5,
  heliosLevels: Object.fromEntries(TROOP_TYPES.map(t => [t, 0])) as Record<TroopType, number>,
  researchTrees: [...RESEARCH_TREES],
  researchLevels: {},
  researchTiersDone: Object.fromEntries(RESEARCH_TREES.map(t => [t, 0])) as Record<
    ResearchTree,
    number
  >,
});

/**
 * Generic shards of a rarity, plus hero-specific shards capped at what each
 * hero can still absorb. A hero at five stars consumes nothing more, so their
 * spare shards must not be counted as scoreable.
 */
export const genericShards = (inv: WhiteoutInventory, rarity: HeroRarity) =>
  Math.max(
    rarity === 'rare' ? inv.rareShards : rarity === 'epic' ? inv.epicShards : inv.mythicShards,
    0
  );

export interface ShardCapacity {
  /** Shards held of this rarity, generic and hero-specific together. */
  held: number;
  /** Shards that can actually go somewhere. */
  usable: number;
  /** Shards with nowhere to go, because every listed hero is full. */
  stranded: number;
  /** True when no hero of this rarity was listed, so nothing could be checked. */
  unknownRoster: boolean;
}

/**
 * What a shard stock can actually absorb.
 *
 * Holding shards is not the same as being able to spend them. A shard only goes
 * somewhere if a hero of that rarity still has room, and each hero's room is
 * claimed once: their own hero-specific shards go in first, and only the space
 * left over is open to the generic pile. Counting a hero's remaining shards
 * against both piles, as this used to, invents capacity that does not exist.
 *
 * With no hero of that rarity listed there is nothing to check against, so the
 * stock is taken at face value rather than written off. An empty roster is
 * missing information, not a full one.
 */
export const shardCapacity = (inv: WhiteoutInventory, rarity: HeroRarity): ShardCapacity => {
  const generic = genericShards(inv, rarity);
  const heroes = inv.heroShards.filter(h => h.rarity === rarity);
  const specificHeld = heroes.reduce((sum, h) => sum + Math.max(h.count, 0), 0);
  const held = generic + specificHeld;

  if (!heroes.length) {
    return { held, usable: held, stranded: 0, unknownRoster: generic > 0 };
  }

  let usable = 0;
  let spare = 0;
  for (const hero of heroes) {
    const room = shardsRemaining(hero.starLevel, hero.starTier, hero.owned);
    const own = Math.min(Math.max(hero.count, 0), room);
    usable += own;
    spare += room - own;
  }
  usable += Math.min(generic, spare);

  return { held, usable, stranded: held - usable, unknownRoster: false };
};

/** Shards of a rarity that can actually be spent. */
export const shardsOfRarity = (inv: WhiteoutInventory, rarity: HeroRarity) =>
  shardCapacity(inv, rarity).usable;

/** Shards of every rarity that cannot be spent, because the heroes are full. */
export const wastedHeroShards = (inv: WhiteoutInventory) =>
  HERO_RARITIES.reduce((sum, rarity) => sum + shardCapacity(inv, rarity).stranded, 0);

/**
 * Minutes available to one category: its own pile, plus the General pile when
 * that is where the player has pointed it.
 *
 * Every caller goes through this. Handing `general` to the construction
 * optimiser, the troop planner and the research planner separately, as used to
 * happen, spends the same minutes three times over.
 */
const OWN_PILE: Record<GeneralSpeedupTarget, keyof WhiteoutInventory> = {
  construction: 'constructionSpeedupMinutes',
  training: 'trainingSpeedupMinutes',
  research: 'researchSpeedupMinutes',
  learning: 'expertSpeedupMinutes',
};

export const speedupMinutesFor = (
  inv: WhiteoutInventory,
  target: GeneralSpeedupTarget
): number => {
  const own = inv[OWN_PILE[target]];
  const general = inv.generalSpeedupTarget === target ? inv.generalSpeedupMinutes : 0;
  return Math.max(typeof own === 'number' ? own : 0, 0) + Math.max(general, 0);
};

/** How many of a consumable is held. Absent ids read as zero. */
export const consumableCount = (inv: WhiteoutInventory, id: string) =>
  Math.max(inv.consumables[id] ?? 0, 0);

/** Sets one consumable without disturbing the rest of the bag. */
export const withConsumable = (
  inv: WhiteoutInventory,
  id: string,
  count: number
): WhiteoutInventory => ({
  ...inv,
  consumables: { ...inv.consumables, [id]: Math.max(count, 0) },
});

/**
 * Widgets available for hero exclusive gear. A generation chest is worth one
 * widget for any hero in that generation, and hero-specific widgets are worth
 * one each, so for an event that scores "use 1 widget" they are interchangeable.
 */
export const totalWidgets = (inv: WhiteoutInventory) =>
  ALL_WIDGET_IDS.reduce((total, id) => total + consumableCount(inv, id), 0);

/** Affinity the gift items in the backpack are worth, across all three gifts. */
export const totalGiftAffinity = (inv: WhiteoutInventory) =>
  EXPERT_GIFTS.reduce(
    (total, gift) => total + consumableCount(inv, gift.id) * gift.affinityPerGift,
    0
  );

/** Progress on one expert, falling back to untouched rather than undefined. */
/**
 * One expert's progress, with every field guaranteed present.
 *
 * Merged onto the defaults rather than returned as stored. A saved entry can
 * be missing `skillLevels` entirely: the revival migration backfills
 * `affinityLevel` and then skips the rest of the entry, and anything written
 * by an older build or edited by hand lands here untouched. Returning that
 * verbatim threw a TypeError out of expertGaps, which runs on every render of
 * the calculator, so one malformed entry took the whole page down instead of
 * costing one expert's advice.
 */
export const expertProgress = (inv: WhiteoutInventory, id: string): ExpertProgress => ({
  ...emptyExpertProgress(),
  ...inv.experts?.[id],
  skillLevels: { ...inv.experts?.[id]?.skillLevels },
});

/** Writes one expert's progress back, leaving the others alone. */
export const withExpertProgress = (
  inv: WhiteoutInventory,
  id: string,
  progress: Partial<ExpertProgress>
): WhiteoutInventory => ({
  ...inv,
  experts: {
    ...inv.experts,
    [id]: { ...expertProgress(inv, id), ...progress },
  },
});

/**
 * Gates this expert has paid for, clamped to what their level can have reached.
 *
 * A stored figure can never claim more gates than the level allows, so a level
 * typed downwards cannot leave a stale status behind it.
 */
export const gatesPaidFor = (inv: WhiteoutInventory, expertId: string) => {
  const progress = expertProgress(inv, expertId);
  const level = Math.max(progress.affinityLevel, 0);
  // Only a level sitting exactly on a multiple of ten leaves any choice: one
  // below it the gate cannot have been paid, one above it must have been. So
  // the window is one gate wide at best, and usually not a window at all.
  const floorGates = gatesAssumed(level);
  const ceiling = gatesReachable(level);
  const stored = progress.gatesPaid;
  if (typeof stored !== 'number' || !Number.isFinite(stored)) return floorGates;
  return Math.min(Math.max(Math.floor(stored), floorGates), ceiling);
};

/** Level of one expert skill, defaulting to zero for untouched skills. */
export const expertSkillLevel = (inv: WhiteoutInventory, expertId: string, skillId: string) =>
  Math.max(expertProgress(inv, expertId).skillLevels[skillId] ?? 0, 0);

export interface ExpertGap {
  expert: ExpertDefinition;
  /** Where the relationship stands now. */
  affinityLevel: number;
  /** Gates paid, which is what the status follows. */
  gatesPaid: number;
  /** Relationship status name, Stranger through Intimate. */
  status: string;
  /** The talent's level, which follows the status. */
  talentLevel: number;
  /** Affinity to reach level 100 from where they are now. */
  affinity: number;
  /** Sigils to pass every remaining gate, in that expert's own Sigils. */
  sigils: number;
  /** The gate immediately ahead, or null at Intimate. */
  gate: ReturnType<typeof nextGate>;
  /** Books of Knowledge to max every non-talent skill. */
  books: number;
  /** Learning minutes for those same skill levels. */
  learningMinutes: number;
}

/**
 * What each unlocked expert still costs to finish. Locked experts are skipped,
 * because an event that scores Books of Knowledge cannot spend them on an expert
 * the player does not have.
 */
export const expertGaps = (inv: WhiteoutInventory): ExpertGap[] =>
  whiteoutExperts
    .filter(expert => expertProgress(inv, expert.id).unlocked)
    .map(expert => {
      const progress = expertProgress(inv, expert.id);
      const level = Math.max(progress.affinityLevel, 0);
      const paid = gatesPaidFor(inv, expert.id);
      return {
        expert,
        affinityLevel: level,
        gatesPaid: paid,
        status: statusName(paid),
        talentLevel: talentLevelForStatus(paid),
        affinity: affinityRemaining(expert, level),
        sigils: sigilsRemaining(expert, paid),
        gate: nextGate(expert, level, paid),
        books: expert.skills.reduce(
          (total, skill) =>
            total + booksRemaining(skill, progress.skillLevels[skill.id] ?? 0),
          0
        ),
        learningMinutes: expert.skills.reduce(
          (total, skill) =>
            total + learningMinutesRemaining(skill, progress.skillLevels[skill.id] ?? 0),
          0
        ),
      };
    });

/**
 * Books of Knowledge that cannot be spent, because every unlocked expert's
 * skills are already maxed. Worth warning about: an event scoring book spend
 * pays nothing for books with nowhere to go.
 */
export const unspendableBooks = (inv: WhiteoutInventory) => {
  const room = expertGaps(inv).reduce((total, gap) => total + gap.books, 0);
  return Math.max(0, consumableCount(inv, 'book-of-knowledge') - room);
};

/** Books of Knowledge that DO have somewhere to go. */
export const spendableBooks = (inv: WhiteoutInventory) =>
  Math.max(0, consumableCount(inv, 'book-of-knowledge') - unspendableBooks(inv));

/**
 * Expert Sigils that can actually be spent.
 *
 * A gate costs an EXACT number of that expert's own sigils and takes no part
 * payment, so this counts whole gates rather than taking min(held, owed) the
 * way it used to. Common Sigils redeem into any one expert, so they count too,
 * where they finish a gate. See planSigilSpend for the whole argument.
 */
export const spendableExpertSigils = (inv: WhiteoutInventory) =>
  planSigilSpend(inv).totalSpent;

export { EXPERT_MAX_LEVEL, EXPERT_GATES };

/**
 * Widgets a hero can actually draw on: their generation's chests, which fit any
 * hero in that generation, plus their own hero-specific widgets.
 */
export const widgetsAvailableFor = (inv: WhiteoutInventory, widgetId: string) => {
  const generation = WIDGET_GENERATIONS.find(g => g.heroes.some(h => h.widgetId === widgetId));
  if (!generation) return consumableCount(inv, widgetId);
  return consumableCount(inv, generation.chestId) + consumableCount(inv, widgetId);
};

export const widgetLevel = (inv: WhiteoutInventory, widgetId: string) =>
  Math.min(Math.max(inv.widgetLevels[widgetId] ?? 0, 0), WIDGET_MAX_LEVEL);

export const withWidgetLevel = (
  inv: WhiteoutInventory,
  widgetId: string,
  level: number
): WhiteoutInventory => ({
  ...inv,
  widgetLevels: {
    ...inv.widgetLevels,
    [widgetId]: Math.min(Math.max(Math.round(level), 0), WIDGET_MAX_LEVEL),
  },
});

export interface WidgetPlan {
  level: number;
  available: number;
  /** Widgets for the very next level, or 0 at Lv 10. */
  nextCost: number;
  /** Whether the stock on hand covers that next level. */
  canUpgrade: boolean;
  /** Short by this many for the next level, 0 when it is affordable. */
  shortBy: number;
  /** Levels the stock buys outright, and where it lands. */
  levelsAffordable: number;
  toLevel: number;
  /** Widgets to reach Lv 10 from here. */
  toMax: number;
}

/** What a hero's widget stock actually buys, given where their widget is. */
export const widgetPlanFor = (inv: WhiteoutInventory, widgetId: string): WidgetPlan => {
  const level = widgetLevel(inv, widgetId);
  const available = widgetsAvailableFor(inv, widgetId);
  const nextCost = widgetCostForNextLevel(level);
  const afford = widgetLevelsAffordable(level, available);
  return {
    level,
    available,
    nextCost,
    canUpgrade: nextCost > 0 && available >= nextCost,
    shortBy: nextCost > 0 ? Math.max(0, nextCost - available) : 0,
    levelsAffordable: afford.levels,
    toLevel: afford.toLevel,
    toMax: widgetsToMax(level),
  };
};

/**
 * Typical round trip for one hunt, in minutes. The Polar Terror figure is
 * larger because a rally has to assemble before it marches.
 */
export const DEFAULT_POLAR_TERROR_MARCH_MINUTES = 3;
export const DEFAULT_BEAST_MARCH_MINUTES = 1.5;
/** How much of the Polar Terror figure is the rally assembly wait. */
export const RALLY_ASSEMBLY_MINUTES = 1.5;

export const CHIEF_STAMINA_VALUE = 10;

/**
 * Reads a number field that may not be one.
 *
 * An inventory is persisted to localStorage and revived across releases, so a
 * field added after a save was written is undefined until the merge fills it,
 * and a hot reload can hand a live component the shape from before the field
 * existed. `Math.max(undefined, 0)` is NaN, and NaN spreads silently through
 * every total downstream, so the reads are coerced here at the edge rather than
 * trusted. Anything not finite falls back.
 */
const num = (value: number | undefined | null, fallback = 0) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

/**
 * The stamina economy.
 *
 * Stamina is not a bag you fill once, it is an income. It trickles in on a
 * timer, arrives in two lumps from the Storehouse, and most of it is already
 * committed to Lighthouse Intel before a hunt event ever starts. Treating the
 * number on the HUD as the whole budget both understates what a player can
 * spend over several days and ignores what Intel takes back out.
 */

/** Natural regen: one stamina every five minutes. */
export const STAMINA_REGEN_MINUTES = 5;
export const STAMINA_REGEN_PER_DAY = (24 * 60) / STAMINA_REGEN_MINUTES;

/**
 * Where the timer stops.
 *
 * This is the single fact that decides how banking works. Natural regen fills
 * the meter to 200 and then stalls, so it can never build a hoard: over any
 * window it contributes the 200 it takes to fill the bar, plus whatever it
 * replaces as you spend, and not one point more. Storehouse claims and Chief
 * Stamina items go straight past the cap, which makes them the only things
 * that actually bank.
 *
 * The consequence is sharper than it first looks. A player sitting well above
 * the cap collects no regen at all, so their two daily claims go straight out
 * again on Intel and the hoard does not grow by a single point. Waiting longer
 * banks nothing; skipping Intel is what banks. Near the cap it is the other way
 * round, because the timer refills part of what Intel costs, so a skipped
 * mission saves less than the ten it cost.
 */
export const STAMINA_REGEN_CAP = 200;

/** Five minute ticks in a day, which is also the uncapped daily regen. */
const TICKS_PER_DAY = STAMINA_REGEN_PER_DAY;

/** Storehouse claims land at 00:00 and 12:00 UTC. */
const STOREHOUSE_TICKS = [0, 144];

/** The Lighthouse board refreshes at 00:00, 08:00 and 16:00 UTC. */
const INTEL_TICKS = [0, 96, 192];

/** Storehouse Chief Stamina, claimed at 00:00 and 12:00 UTC. */
export const STOREHOUSE_CLAIMS_PER_DAY = 2;
export const STOREHOUSE_BASE_STAMINA = 120;

/** Agnes, Optimization: extra stamina on each Storehouse claim, level 1 to 5. */
export const AGNES_OPTIMIZATION_BY_LEVEL = [10, 15, 20, 30, 40];

/** Agnes, Efficient Recon: extra Intel missions per day, level 1 to 5. */
export const AGNES_RECON_BY_LEVEL = [2, 3, 4, 6, 8];

/**
 * Lighthouse Intel: the board refreshes at 00:00, 08:00 and 16:00 UTC and
 * offers eight missions each time. Missions cost roughly ten stamina and pay
 * well enough that clearing them is the default, not a choice.
 */
export const INTEL_MISSIONS_PER_REFRESH = 8;
export const INTEL_REFRESHES_PER_DAY = 3;
export const INTEL_STAMINA_PER_MISSION = 10;

const levelled = (table: number[], level: number) =>
  level <= 0 ? 0 : table[Math.min(Math.round(level), table.length) - 1];

export const agnesOptimizationBonus = (level: number) =>
  levelled(AGNES_OPTIMIZATION_BY_LEVEL, level);

export const agnesReconBonus = (level: number) => levelled(AGNES_RECON_BY_LEVEL, level);

/**
 * Zinman's build-cost reduction by skill level, applied to meat, wood, coal and
 * iron. He also shortens build time, but that folds into the single speed buff
 * percentage the player enters, alongside Agnes, island buildings, President and
 * Chief Order buffs, pets, facilities, Tooling Up and VIP.
 */
export const ZINMAN_REDUCTION_BY_LEVEL = [0.03, 0.06, 0.09, 0.12, 0.15];

/** Ling Xue, Total Control: training speed, by level 1 to 5. */
export const LING_XUE_BY_LEVEL = [0.04, 0.08, 0.12, 0.16, 0.2];

/**
 * Agnes, Project Management: hours off a construction, by level 1 to 5.
 * This one is flat time, not a percentage, so it is applied after the speed
 * buff has divided the base time.
 */
export const AGNES_HOURS_BY_LEVEL = [2, 3, 4, 6, 8];

/** Jasser, Enlightened Warfare: research speed, by level 1 to 5. */
export const JASSER_BY_LEVEL = [0.03, 0.06, 0.09, 0.12, 0.15];

/** The presidential Mobilize skill, a flat training speed bonus. */
export const MOBILIZE_PERCENT = 30;

const atLevel = (table: number[], level: number) =>
  table[Math.min(Math.max(Math.round(level), 1), table.length) - 1];

export const agnesHours = (level: number) => levelled(AGNES_HOURS_BY_LEVEL, level);

/**
 * Seconds Agnes removes from a single upgrade, 0 until Project Management is
 * levelled.
 *
 * Agnes is an expert, not a hero. She used to be asked for twice: once as a
 * tick box and level in the Heroes card, and again as her real skill levels in
 * the Experts card, which could disagree with each other. Her other two skills
 * were already read from the Experts card, so this is now the third to do it
 * and the Heroes copy is gone.
 */
export const agnesSecondsOff = (inv: WhiteoutInventory) =>
  agnesHours(expertSkillLevel(inv, 'agnes', 'project-management')) * 3600;

export const lingXueBonus = (level: number) => atLevel(LING_XUE_BY_LEVEL, level);
export const jasserBonus = (level: number) => atLevel(JASSER_BY_LEVEL, level);

/**
 * Speed percentages the calculator actually uses. The hero skills are entered
 * separately so they are not lost in the manual total, and are added here, so
 * the manual field should hold everything except the hero.
 */
/** Training Capacity Enhance multiplies a camp's batch by this. */
export const TRAINING_CAPACITY_ENHANCE = 3;
/** Chief Order Advanced Training, a flat training speed bonus. */
export const ADVANCED_TRAINING_PERCENT = 20;

/**
 * Training speed counts the appointment in full, and that matters more than it
 * looks.
 *
 * Speedups substitute for remaining time one for one, so a batch needing
 * T / (1 + speed) seconds costs exactly that many speedup minutes to finish.
 * Raising training speed therefore does not merely make a batch land sooner, it
 * cuts the speedups the batch consumes at all. On a troop day that is the whole
 * ball game.
 *
 * The thirty minute slot is not a limit here: a troop day is three batches, one
 * per camp, and all three can be queued inside the window. Construction is the
 * opposite shape, hundreds of sequential upgrades over weeks, where only the one
 * or two begun inside the window would benefit, which is why the appointment is
 * still kept out of the construction and research figures.
 */
export const effectiveTrainingSpeed = (inv: WhiteoutInventory) =>
  inv.trainingSpeedPercent +
  (inv.useLingXue ? lingXueBonus(inv.lingXueLevel) * 100 : 0) +
  appointmentEffect(inv.appointmentWhenQueueing).training +
  (inv.useAdvancedTraining ? ADVANCED_TRAINING_PERCENT : 0);

/**
 * Construction speed the planner should use, which is the figure entered plus
 * the two Chief Order style buffs that are held separately so they are not
 * double counted in the manual total.
 */
/**
 * The appointment is left out here, unlike training. A build plan is hundreds of
 * upgrades run one after another over weeks, and a thirty minute slot only
 * reaches whatever is started inside it, so counting it across the whole plan
 * would inflate it. Double Time and Builder's Aide are included because they
 * work exactly that way by design: they buff what you begin next.
 */
export const buildersAideBonus = (level: number) =>
  levelled(BUILDERS_AIDE_BY_LEVEL, level);

export const effectiveConstructionSpeed = (inv: WhiteoutInventory) =>
  inv.constructionBuffPercent +
  (inv.useDoubleTime ? DOUBLE_TIME_PERCENT : 0) +
  (inv.useBuildersAide ? buildersAideBonus(inv.buildersAideLevel) : 0);

/**
 * Troops one camp can queue at once, with the buffs applied.
 *
 * The capacity item multiplies, the appointment adds, so stacking them is worth
 * more than either alone: three times a big camp plus another three hundred.
 */
export const effectiveTrainingCapacity = (inv: WhiteoutInventory, type: TroopType) =>
  Math.max(num(inv.trainingCapacity[type]), 0) *
    (inv.useTrainingCapacityEnhance ? TRAINING_CAPACITY_ENHANCE : 1) +
  appointmentEffect(inv.appointmentWhenQueueing).trainingCapacity;

export const effectiveResearchSpeed = (inv: WhiteoutInventory) =>
  inv.researchSpeedPercent + (inv.useJasser ? jasserBonus(inv.jasserLevel) * 100 : 0);

export const zinmanReduction = (level: number) => {
  const i = Math.min(Math.max(Math.round(level), 1), ZINMAN_REDUCTION_BY_LEVEL.length) - 1;
  return ZINMAN_REDUCTION_BY_LEVEL[i];
};

/** Base stamina cost per hunt, before any hero reduction. */
/** Beast levels run 1 to 30, and the scoring bands in State of Power stop there too. */
export const MAX_BEAST_LEVEL = 30;

export const STAMINA_COSTS = {
  polarTerror: 25,
  beast: 10,
} as const;

/**
 * Gina's Endurance Training, an Expedition skill: "reduce Stamina cost by X%".
 * Index 0 is level 1.
 */
export const GINA_REDUCTION_BY_LEVEL = [0.1, 0.12, 0.15, 0.18, 0.2];

export const ginaReduction = (level: number) => {
  const i = Math.min(Math.max(Math.round(level), 1), GINA_REDUCTION_BY_LEVEL.length) - 1;
  return GINA_REDUCTION_BY_LEVEL[i];
};

/**
 * Cost of a hunt when Gina is on that march.
 *
 * Rounded up, because the game's rounding is not documented and understating a
 * cost would overstate how many hunts are possible. At level 5 it makes no
 * difference: 25 and 10 both reduce to whole numbers (20 and 8).
 */
export const ginaCost = (baseCost: number, level: number) =>
  Math.ceil(baseCost * (1 - ginaReduction(level)));

/** Stamina sitting in the bag right now, items cashed in. */
export const totalStamina = (inv: WhiteoutInventory) =>
  Math.max(num(inv.stamina), 0) + Math.max(num(inv.chiefStaminaItems), 0) * CHIEF_STAMINA_VALUE;

/** Intel missions on offer in a day, Agnes included. */
export const intelMissionsPerDay = (inv: WhiteoutInventory) =>
  INTEL_MISSIONS_PER_REFRESH * INTEL_REFRESHES_PER_DAY +
  agnesReconBonus(expertSkillLevel(inv, 'agnes', 'efficient-recon'));

/** One Storehouse claim, Agnes included. */
export const storehouseClaim = (inv: WhiteoutInventory) =>
  STOREHOUSE_BASE_STAMINA + agnesOptimizationBonus(expertSkillLevel(inv, 'agnes', 'optimization'));

export interface StaminaBudget {
  /** On the meter when the numbers were entered. */
  onHand: number;
  /** Collected on the timer over the window, after the cap has had its say. */
  regen: number;
  /** How much of the timer the cap threw away. */
  regenWasted: number;
  /** Earned from Storehouse claims over the window. */
  storehouse: number;
  /** Chief Stamina items, cashed in at the end rather than banked early. */
  items: number;
  /** Intel missions available per day, and how many are actually run. */
  intelAvailablePerDay: number;
  intelRunPerDay: number;
  /** Stamina those missions take back out over the window. */
  intelSpend: number;
  /** Missions that could not be run because the meter was empty. */
  missionsMissed: number;
  /** What is left for hunting. */
  net: number;
  /**
   * What one more day of banking beforehand would have added.
   *
   * Shown rather than asked, because the player already tells us what is on the
   * meter. A banking question on top of that would be counted twice by anyone
   * who had banked and then entered the real number.
   */
  perExtraDay: number;
  /** What the player's Agnes levels are worth over the window, in stamina. */
  agnesGain: number;
}

/**
 * Walks the meter five minutes at a time.
 *
 * The cap makes this path dependent: how much regen you collect depends on how
 * far below 200 the meter was at each moment, which depends on when the claims
 * land and when the missions are run. Any closed form has to assume one of
 * those away, and the assumption is exactly where the answer goes wrong, so
 * this walks it instead. A month of banking is under nine thousand steps.
 */
const runMeter = (
  days: number,
  start: number,
  claim: number,
  missionsPerRefresh: number[]
) => {
  const ticks = Math.round(Math.max(days, 0) * TICKS_PER_DAY);
  let stamina = Math.max(start, 0);
  let regen = 0;
  let regenWasted = 0;
  let storehouse = 0;
  let intelSpend = 0;
  let missionsMissed = 0;

  for (let i = 0; i < ticks; i += 1) {
    const tick = i % TICKS_PER_DAY;

    if (STOREHOUSE_TICKS.includes(tick)) {
      stamina += claim;
      storehouse += claim;
    }

    const refresh = INTEL_TICKS.indexOf(tick);
    if (refresh >= 0) {
      const want = missionsPerRefresh[refresh] * INTEL_STAMINA_PER_MISSION;
      const paid = Math.min(want, stamina);
      stamina -= paid;
      intelSpend += paid;
      missionsMissed += (want - paid) / INTEL_STAMINA_PER_MISSION;
    }

    // One point per tick, and none of it once the bar is full.
    const gain = Math.min(1, STAMINA_REGEN_CAP - stamina);
    if (gain > 0) {
      stamina += gain;
      regen += gain;
    }
    regenWasted += 1 - Math.max(gain, 0);
  }

  return { stamina, regen, regenWasted, storehouse, intelSpend, missionsMissed };
};

/** How the day's missions fall across the three refreshes. */
const missionSplit = (inv: WhiteoutInventory) => {
  const bonus = agnesReconBonus(expertSkillLevel(inv, 'agnes', 'efficient-recon'));
  // Agnes's extra missions come once a day, so they land on the first refresh.
  const available = [
    INTEL_MISSIONS_PER_REFRESH + bonus,
    INTEL_MISSIONS_PER_REFRESH,
    INTEL_MISSIONS_PER_REFRESH,
  ];
  const total = available.reduce((a, b) => a + b, 0);
  const skipped = Math.min(Math.max(num(inv.intelMissionsSkippedPerDay), 0), total);
  const run = total - skipped;
  // Skipped missions come off every refresh in proportion, rather than picking
  // one of them arbitrarily and having the answer depend on that choice.
  return { available, total, run, perRefresh: available.map(a => (a * run) / total) };
};

/**
 * What a player can really spend on hunts.
 *
 * Note the Agnes result this falls out of: Optimization adds its bonus twice a
 * day, Efficient Recon adds missions that cost ten each, and at every one of
 * the five levels those two are exactly equal (10 and 2, 15 and 3, 20 and 4,
 * 30 and 6, 40 and 8). So a player who levels both together sees no change in
 * hunting stamina at all. The gain is in the mission rewards.
 */
const meterFor = (inv: WhiteoutInventory, days: number) => {
  const split = missionSplit(inv);
  return runMeter(days, Math.max(num(inv.stamina), 0), storehouseClaim(inv), split.perRefresh);
};

/** The same player with Agnes untrained, for costing her two skills. */
const withoutAgnes = (inv: WhiteoutInventory): WhiteoutInventory =>
  withExpertProgress(inv, 'agnes', {
    skillLevels: {
      ...expertProgress(inv, 'agnes').skillLevels,
      optimization: 0,
      'efficient-recon': 0,
    },
  });

/**
 * What the player can spend on hunts, over the scoring day.
 *
 * One day, from whatever is on their meter right now. That covers banking
 * without asking about it: a player who has hoarded types the hoarded number,
 * and the simulation sees a meter above the cap, stalls the timer and lets
 * Intel eat into the pile, which is exactly what the game does. A player at 50
 * sees the timer fill them back up. Asking for a banking window as well would
 * add the same days twice.
 */
export const staminaBudget = (inv: WhiteoutInventory): StaminaBudget => {
  const days = 1;
  const split = missionSplit(inv);
  const run = meterFor(inv, days);

  // Items are cracked when they are needed, not banked early, so they are added
  // at the end. Opening them up front would only stall the timer sooner.
  const items = Math.max(num(inv.chiefStaminaItems), 0) * CHIEF_STAMINA_VALUE;

  return {
    onHand: Math.max(num(inv.stamina), 0),
    regen: run.regen,
    regenWasted: run.regenWasted,
    storehouse: run.storehouse,
    items,
    intelAvailablePerDay: split.total,
    intelRunPerDay: split.run,
    intelSpend: run.intelSpend,
    missionsMissed: run.missionsMissed,
    net: Math.max(run.stamina + items, 0),
    // Measured rather than derived: one more day of the same routine.
    perExtraDay: meterFor(inv, days + 1).stamina - run.stamina,
    agnesGain: run.stamina - meterFor(withoutAgnes(inv), days).stamina,
  };
};

/** Rallies sent at once, clamped so the discount cycle is always valid. */
export const rallyCycle = (inv: WhiteoutInventory) =>
  Math.max(Math.round(num(inv.ralliesAtATime, 1)), 1);

/**
 * How many marches a stamina pool affords, walking the discount cycle rather
 * than averaging it, so the count is exact rather than off by one at the edges.
 *
 * Gina rides one march per batch, so one march in every `cycle` gets her
 * reduction. A player sending a single rally at a time gets it every time.
 */
export function marchesAffordable(
  pool: number,
  normalCost: number,
  discountedCost: number,
  cycle: number,
  useGina: boolean,
  startOffset = 0
): { marches: number; spent: number; discountedMarches: number } {
  const empty = { marches: 0, spent: 0, discountedMarches: 0 };
  // A non-finite pool used to run this loop to its 100,000 iteration ceiling
  // and report a plan built on nothing, so it stops here instead.
  if (!Number.isFinite(pool) || pool <= 0) return empty;
  if (!Number.isFinite(normalCost) || normalCost <= 0) return empty;
  const size = Math.max(Math.round(cycle), 1);
  let left = pool;
  let marches = 0;
  let spent = 0;
  let discountedMarches = 0;
  while (marches < 100000) {
    const isDiscounted = useGina && (marches + startOffset) % size === 0;
    const cost = isDiscounted ? discountedCost : normalCost;
    if (cost > left) break;
    left -= cost;
    spent += cost;
    marches += 1;
    if (isDiscounted) discountedMarches += 1;
  }
  return { marches, spent, discountedMarches };
}

export interface HuntPlan {
  polarTerrors: number;
  beasts: number;
  /** Where the spendable stamina came from. */
  budget: StaminaBudget;
  staminaAvailable: number;
  staminaSpent: number;
  staminaLeft: number;
  discountedMarches: number;
  /** Total march-minutes across every hunt, ignoring concurrency. */
  totalMarchMinutes: number;
  /** Real time to run them all, with `ralliesAtATime` going at once. */
  wallClockMinutes: number;
  polarTerrorCost: number;
  beastCost: number;
  ginaPolarTerrorCost: number;
  ginaBeastCost: number;
}

/**
 * Spends stamina on whichever hunt pays more per stamina, then puts whatever is
 * left into the other. Polar Terrors normally win, but the rates come from the
 * event table rather than being assumed.
 */
export function planHunts(
  inv: WhiteoutInventory,
  polarTerrorPoints: number,
  beastPoints: number
): HuntPlan {
  const budget = staminaBudget(inv);
  const pool = budget.net;
  const cycle = rallyCycle(inv);
  const hero = inv.useGina;
  const level = inv.ginaSkillLevel;

  const ptCost = STAMINA_COSTS.polarTerror;
  const bsCost = STAMINA_COSTS.beast;
  const ptGina = ginaCost(ptCost, level);
  const bsGina = ginaCost(bsCost, level);

  const ptRate = polarTerrorPoints / (hero ? ptGina : ptCost);
  const bsRate = beastPoints / (hero ? bsGina : bsCost);

  const ptFirst = ptRate >= bsRate;
  const firstNormal = ptFirst ? ptCost : bsCost;
  const firstGina = ptFirst ? ptGina : bsGina;
  const secondNormal = ptFirst ? bsCost : ptCost;
  const secondGina = ptFirst ? bsGina : ptGina;

  const a = marchesAffordable(pool, firstNormal, firstGina, cycle, hero);
  // The discount cycle carries on across the switch, so Gina is not handed out
  // twice within the same batch of rallies.
  const b = marchesAffordable(
    pool - a.spent,
    secondNormal,
    secondGina,
    cycle,
    hero,
    a.marches % cycle
  );

  const polarTerrors = ptFirst ? a.marches : b.marches;
  const beasts = ptFirst ? b.marches : a.marches;
  const staminaSpent = a.spent + b.spent;

  const ptMinutes = Math.max(num(inv.polarTerrorMarchMinutes, DEFAULT_POLAR_TERROR_MARCH_MINUTES), 0);
  const bsMinutes = Math.max(num(inv.beastMarchMinutes, DEFAULT_BEAST_MARCH_MINUTES), 0);
  const totalMarchMinutes = polarTerrors * ptMinutes + beasts * bsMinutes;

  return {
    polarTerrors,
    beasts,
    budget,
    staminaAvailable: pool,
    staminaSpent,
    staminaLeft: pool - staminaSpent,
    discountedMarches: a.discountedMarches + b.discountedMarches,
    totalMarchMinutes,
    wallClockMinutes: totalMarchMinutes / cycle,
    polarTerrorCost: ptCost,
    beastCost: bsCost,
    ginaPolarTerrorCost: ptGina,
    ginaBeastCost: bsGina,
  };
}

/* ---------------------------------------------------------------- Chief Gear */

/** Where one slot sits, clamped to the ladder. -1 is nothing built. */
export const chiefGearPosition = (inv: WhiteoutInventory, slot: number) => {
  const raw = inv.chiefGearSlots?.[slot];
  const n = typeof raw === 'number' && Number.isFinite(raw) ? Math.round(raw) : -1;
  return Math.min(Math.max(n, -1), CHIEF_GEAR_STEPS.length - 1);
};

/** All six positions, always six long whatever the saved shape held. */
/** One research node's level, clamped to that node's own level count. */
export const researchLevel = (inv: WhiteoutInventory, key: string) => {
  const node = researchByKey.get(key);
  const raw = Number(inv.researchLevels?.[key]);
  if (!node || !Number.isFinite(raw) || raw <= 0) return 0;
  return Math.min(Math.floor(raw), node.levels.length);
};

/** Every node's level, which is what the optimiser takes. */
export const researchLevels = (inv: WhiteoutInventory): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const node of whiteoutResearch) {
    const at = researchLevel(inv, node.key);
    if (at > 0) out[node.key] = at;
  }
  return out;
};

/**
 * The speed the player's own research tree is already giving, in percent.
 *
 * The buff percentage fields ask for a figure the game never shows in one place,
 * and the research tree is the largest and most tedious part of it: Tooling Up
 * alone runs to a dozen nodes across several rows. We already know every node's
 * level from the Tech Research card, so there is no reason to make anyone read
 * them off a second time. The help panels show this number so only the sources
 * we cannot see are left to add up by hand.
 */
export const researchTreeSpeed = (inv: WhiteoutInventory, stat: string) => {
  let total = 0;
  for (const node of whiteoutResearch) {
    if (node.stat !== stat) continue;
    const at = researchLevel(inv, node.key);
    for (let i = 0; i < at; i += 1) total += node.levels[i].statAddition;
  }
  return total;
};

/** The same stat with every node of it finished, so a panel can say what is left. */
export const researchTreeSpeedMax = (stat: string) => {
  let total = 0;
  for (const node of whiteoutResearch) {
    if (node.stat !== stat) continue;
    for (const level of node.levels) total += level.statAddition;
  }
  return total;
};

/** A copy of the inventory with one node moved, clamped at both ends. */
export const withResearchLevel = (
  inv: WhiteoutInventory,
  key: string,
  level: number
): WhiteoutInventory => {
  const node = researchByKey.get(key);
  if (!node) return inv;
  const capped = Math.min(Math.max(Math.floor(level) || 0, 0), node.levels.length);
  return { ...inv, researchLevels: { ...inv.researchLevels, [key]: capped } };
};

/** Sets every node in a tree to full, or to nothing. */
export const withTreeFilled = (
  inv: WhiteoutInventory,
  tree: ResearchTree,
  full: boolean
): WhiteoutInventory => {
  const next = { ...inv.researchLevels };
  for (const node of whiteoutResearch) {
    if (node.tree !== tree) continue;
    next[node.key] = full ? node.levels.length : 0;
  }
  return { ...inv, researchLevels: next };
};

/** One pet's level, clamped to that pet's own maximum. */
export const petLevel = (inv: WhiteoutInventory, petId: string) => {
  const pet = petById.get(petId);
  const raw = Number(inv.petLevels?.[petId]);
  if (!pet || !Number.isFinite(raw) || raw <= 0) return 0;
  return Math.min(Math.floor(raw), pet.maxLevel);
};

/** Every pet's level, with anything missing read as not owned. */
export const petLevels = (inv: WhiteoutInventory): Record<string, number> =>
  Object.fromEntries(whiteoutPets.map(p => [p.id, petLevel(inv, p.id)]));

/** A copy of the inventory with one pet moved. */
export const withPetLevel = (
  inv: WhiteoutInventory,
  petId: string,
  level: number
): WhiteoutInventory => {
  const pet = petById.get(petId);
  const capped = Math.min(Math.max(Math.floor(level) || 0, 0), pet?.maxLevel ?? 0);
  return { ...inv, petLevels: { ...inv.petLevels, [petId]: capped } };
};

/** One charm's position, clamped into the ladder. */
export const charmPosition = (inv: WhiteoutInventory, slot: number) => {
  const raw = inv.charmSlots?.[slot];
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(Math.floor(n), CHARM_STEP_TOTAL);
};

/** All eighteen positions, with anything missing read as not started. */
export const charmPositions = (inv: WhiteoutInventory) =>
  Array.from({ length: CHARM_COUNT }, (_, slot) => charmPosition(inv, slot));

/** A copy of the inventory with one charm moved. */
export const withCharmPosition = (
  inv: WhiteoutInventory,
  slot: number,
  position: number
): WhiteoutInventory => {
  const next = charmPositions(inv);
  next[slot] = Math.min(Math.max(Math.floor(position) || 0, 0), CHARM_STEP_TOTAL);
  return { ...inv, charmSlots: next };
};

export const chiefGearPositions = (inv: WhiteoutInventory) =>
  Array.from({ length: CHIEF_GEAR_SLOTS }, (_, slot) => chiefGearPosition(inv, slot));

/** Writes one slot back, leaving the rest alone. */
export const withChiefGearSlot = (
  inv: WhiteoutInventory,
  slot: number,
  position: number
): WhiteoutInventory => {
  const next = chiefGearPositions(inv);
  next[slot] = Math.min(Math.max(Math.round(position), -1), CHIEF_GEAR_STEPS.length - 1);
  return { ...inv, chiefGearSlots: next };
};

/** The Chief Gear materials, read out of the backpack. */
export const chiefGearStock = (inv: WhiteoutInventory) =>
  Object.fromEntries(
    CHIEF_GEAR_MATERIALS.map(m => [m, consumableCount(inv, CHIEF_GEAR_ITEM_IDS[m])])
  ) as Record<(typeof CHIEF_GEAR_MATERIALS)[number], number>;

/**
 * The Enhancement Material Exchange opens once ANY slot has finished the
 * unlock upgrade, not once all of them have, which is why this looks for the
 * furthest slot rather than the nearest.
 */
export const chiefGearExchangeOpen = (inv: WhiteoutInventory) => {
  const unlockStep = CHIEF_GEAR_STEPS.findIndex(
    s => s.upgrade === EXCHANGE_UNLOCK_UPGRADE && s.part === s.parts
  );
  if (unlockStep < 0) return false;
  return chiefGearPositions(inv).some(p => p >= unlockStep);
};

/* ------------------------------------------------------------- Hero Gear */

/** Where one of the twelve pieces sits, falling back to untouched. */
export const gearPiece = (inv: WhiteoutInventory, id: string): GearPieceState => ({
  ...emptyGearPiece(),
  ...(inv.heroGear?.[id] ?? {}),
});

/**
 * Mithril the twelve pieces can actually absorb, capped by what is held.
 *
 * Held Mithril on its own overstates the score: it is spent only at the
 * Legendary breakthroughs, so a player whose pieces are all finished scores
 * nothing with a full bag. Twelve untouched pieces have 1,800 ahead of them.
 */
export const mithrilSpendable = (inv: WhiteoutInventory) => {
  const room = GEAR_PIECES.reduce(
    (total, piece) => total + mithrilRemainingForPiece(gearPiece(inv, piece.id)),
    0
  );
  return Math.min(consumableCount(inv, 'mithril'), room);
};

/** Writes one piece back, leaving the other eleven alone. */
export const withGearPiece = (
  inv: WhiteoutInventory,
  id: string,
  patch: Partial<GearPieceState>
): WhiteoutInventory => {
  const next = { ...gearPiece(inv, id), ...patch };
  // Below the level where the game added stages there is only stage 0, so a
  // stage left over from a higher level would otherwise stick around invisibly.
  if (next.masteryLevel < MASTERY_FORGING.stagesFromLevel) next.masteryStage = 0;
  return {
    ...inv,
    heroGear: { ...inv.heroGear, [id]: next },
  };
};
