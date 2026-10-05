// Scheduling gathering marches around a scoring day.
//
// THE MECHANIC THAT SHAPES THIS. A march can be recalled at any point and keeps
// everything it has gathered so far, so the length of a gather is a choice, not
// a fixed cost. Troops gather at a steady rate, and a tile only caps how long
// one trip can last before it runs dry. That turns the whole thing into one
// line:
//
//   gathering minutes in the day = window - (trips x round trip travel)
//
// Travel is the only real waste. Fewer, longer trips beat many short ones, which
// is why a Level 8 tile is worth so much more than a Level 5: not because it
// gathers faster, but because it lets one trip run for seven hours instead of
// forty minutes, so a queue pays the travel toll four times a day instead of
// twenty-five.
//
// An alliance gathering building raises that cap to twelve hours at the same
// rate. It does not gather faster, it just lets a trip run longer, which cuts
// the trip count again and lets the pre-sent march carry more.
//
// WHY PRE-SENDING WINS. Resources are credited when a march gets home, not when
// it is sent. A march sent the evening before and landing just after reset puts
// a full load into the scoring day having used none of the day's minutes. Every
// queue should be in flight at reset. That is also why an alliance building
// wants placing just under its own duration before the reset.
//
// Troop count does not come into it: soldiers take turns, so a march of a
// million gathers no faster than the count the game recommends.
//
// Speed buffs stack the usual way, time = base / (1 + sum/100), so a Gathering
// Speed Boost is worth less the more gathering speed is already running.

import {
  gatherTile,
  gatherSecondsAt,
  GATHER_TILE_NAMES,
  ALLIANCE_NODE_NAME,
  GATHER_HEROES,
  GATHER_RESOURCES,
  gatherHeroBonus,
  type GatherResource,
} from '../data/whiteoutGatherTiles';

/** A place the player can send a march to gather. */
export interface GatherSpot {
  id: string;
  label: string;
  /** Minutes one way. Unaffected by gathering buffs. */
  oneWayMinutes: number;
  /** Units gathered per minute, at the player's current gathering speed. */
  ratePerMinute: number;
  /** Longest one trip can gather before the spot runs dry. */
  maxGatherMinutes: number;
  /** Which resource this spot yields. */
  resource: GatherResource;
  /**
   * True for the alliance node. Two rules hang off it: only one march may work
   * it, and Burden Bearer does not fire there.
   */
  allianceNode?: boolean;
  /**
   * Total gathering speed behind this spot's rate, hero included.
   *
   * Carried on the spot rather than passed in once, because gathering speed is
   * per resource: a player can be at +345.5% on meat and +345% on iron, and a
   * hero lifts only its own. A boost has to be priced against the speed of the
   * resource it is actually covering.
   */
  speedPercent: number;
}

/**
 * One march queue and what it will be doing.
 *
 * Queues are not interchangeable. Only one march may sit on the alliance
 * gathering building, and a hero can only ride one march at a time, so with six
 * queues and four gathering heroes two marches go out with no hero at all.
 * Treating every queue as identical, as an earlier version did, overstated both
 * the building and the heroes.
 */
export interface GatherQueue {
  /** The spot this queue works during the day, once it is free. */
  spot: GatherSpot;
  /**
   * What this queue was already doing when the day began, if it differs.
   *
   * The alliance building needs this. It cannot be gathered before it is built,
   * its twelve hour timer starts the moment it goes up, and when it collapses
   * every march inside is sent home automatically. So the march's timing is set
   * by the alliance's placement, not by the player, and the queue is free again
   * afterwards rather than able to keep using a building that no longer exists.
   */
  preSend?: GatherPreSend;
  /** The hero riding this march, for explaining the plan. */
  hero?: string;
  /** Why this queue differs, e.g. "alliance building" or "no hero left". */
  note?: string;
}

/**
 * When every pre-sent march is finally sitting on its tile.
 *
 * This is the moment to press Burden Bearer: nothing is arriving anywhere, so
 * the charge is not consumed, but the cooldown starts. Normally negative,
 * because the evening batch goes out hours before reset.
 *
 * It is the LATEST of the arrivals, not the earliest. Press before the last
 * march has landed and that march's arrival eats the charge, on a gather that
 * finishes before the scoring day even opens.
 */
export const burdenBearerPressAt = (
  queues: GatherQueue[],
  landingMarginMinutes = 5
): number | null => {
  let latest: number | null = null;
  for (const queue of queues) {
    const spot = queue.preSend?.spot ?? queue.spot;
    const returnsAt = queue.preSend?.returnsAt ?? landingMarginMinutes;
    const gatherMinutes = queue.preSend?.gatherMinutes ?? spot.maxGatherMinutes;
    // Sent at returnsAt - (gather + both walks), so it lands a walk later.
    const arrivesAt = returnsAt - gatherMinutes - spot.oneWayMinutes;
    if (latest === null || arrivesAt > latest) latest = arrivesAt;
  }
  return latest;
};

/** A march already in flight when the scoring day begins. */
export interface GatherPreSend {
  spot: GatherSpot;
  /** Minutes after reset when it gets home. Should be a little above zero. */
  returnsAt: number;
  /** Minutes it spent gathering, all of them before the day began. */
  gatherMinutes: number;
}

export interface GatherInput {
  /** One entry per march queue, each with its own spot and hero. */
  queues: GatherQueue[];
  /** Length of the scoring day in minutes. Normally 1440. */
  windowMinutes: number;
  /** The Gathering Speed Boost item, if it will be used. */
  boost?: {
    /** Extra gathering speed, as a percentage. The item gives 100. */
    percent: number;
    /** How long the item lasts, in minutes. The item comes as 8h or 24h. */
    lastsMinutes: number;
    /** Minutes after reset when it is activated. */
    startMinutes: number;
  };
  /** Margin so a march lands just after reset rather than just before. */
  landingMarginMinutes?: number;
  /**
   * Minutes after reset when each Burden Bearer charge comes up.
   *
   * Empty when the player has no Musk Ox. A charge is spent by the next march
   * to reach an ordinary tile at or after its time, which is how the skill
   * behaves: it is armed and waits for an arrival.
   */
  burdenBearerAt?: number[];
}

export interface GatherTrip {
  queue: number;
  /** Minutes relative to reset. Negative means sent the day before. */
  sentAt: number;
  returnsAt: number;
  /** Minutes actually spent gathering, which may be a partial recall. */
  gatherMinutes: number;
  /** Units brought home. */
  amount: number;
  resource: GatherResource;
  /** The spot worked, so the plan can name it instead of guessing. */
  spotLabel: string;
  /** True when Burden Bearer finished this one the moment the march landed. */
  instant?: boolean;
  /** True for the march already in flight when the day began. */
  preSent: boolean;
  /** True when this trip was cut short by the end of the day, not by the tile. */
  recalledEarly: boolean;
}

export interface GatherPlan {
  trips: GatherTrip[];
  /** Tiles Burden Bearer finished on arrival, and what they brought home. */
  instantGathers: number;
  instantAmount: number;
  /**
   * When each charge came up, relative to reset. The first is when to press,
   * and it is normally negative: the evening before.
   */
  burdenBearerAt: number[];
  /** Charges that came up with no ordinary tile arrival left to spend on. */
  chargesUnused: number;
  /** Minutes spent gathering inside the day, across every queue. */
  gatheringMinutes: number;
  /** Minutes lost to travel, across every queue. */
  travelMinutes: number;
  totals: Record<GatherResource, number>;
  /** Trips per queue, which is what travel waste scales with. */
  tripsPerQueue: number;
}

/** time = base / (1 + sum/100), the game's usual stacking. */
export const applyGatherSpeed = (
  baseMinutes: number,
  fromPercent: number,
  toPercent: number
): number => {
  const from = 1 + Math.max(fromPercent, -99) / 100;
  const to = 1 + Math.max(toPercent, -99) / 100;
  if (to <= 0) return baseMinutes;
  return (baseMinutes * from) / to;
};

/**
 * Builds a spot from a tile the player can reach.
 *
 * A hero bonus only applies to its own resource, and is the one thing that
 * breaks the otherwise exact point parity between the four resources: a hero
 * behind one of them gathers it faster, so more fits into the day.
 */
export const spotFromTile = (
  level: number,
  resource: GatherResource,
  speedPercent: number,
  oneWayMinutes: number,
  heroSkillLevel = 0
): GatherSpot | null => {
  const tile = gatherTile(level);
  const total = speedPercent + gatherHeroBonus(heroSkillLevel);
  const seconds = gatherSecondsAt(level, resource, total);
  if (!tile || seconds === null || seconds <= 0) return null;
  const minutes = seconds / 60;
  return {
    id: `l${tile.level}-${resource}`,
    label: `Lv. ${tile.level} ${GATHER_TILE_NAMES[resource]}`,
    oneWayMinutes: Math.max(oneWayMinutes, 0),
    ratePerMinute: tile.amount[resource] / minutes,
    maxGatherMinutes: minutes,
    resource,
    speedPercent: total,
  };
};

/**
 * An alliance gathering building: the same rate as the tiles, but a trip can
 * run longer. Twelve hours in the live game.
 */
export const allianceSpot = (
  base: GatherSpot,
  maxGatherMinutes = 12 * 60,
  oneWayMinutes = base.oneWayMinutes
): GatherSpot => ({
  ...base,
  id: `${base.id}-alliance`,
  label: `${ALLIANCE_NODE_NAME} (${Math.round(maxGatherMinutes / 60)}h)`,
  allianceNode: true,
  oneWayMinutes: Math.max(oneWayMinutes, 0),
  maxGatherMinutes: Math.max(maxGatherMinutes, 0),
});

export interface AllianceBuilding {
  /** Minutes relative to reset when the alliance puts it up. Usually negative. */
  placedAt: number;
  /** How long it stands before collapsing. Twelve hours in the live game. */
  lifespanMinutes: number;
  /** Minutes from the player's city to it. Usually short. */
  oneWayMinutes: number;
}

/**
 * The march a player gets out of an alliance building.
 *
 * The building cannot be gathered before it exists, its timer starts the moment
 * it goes up, and when it collapses everything inside is sent home. So the
 * player's only real choice is whether to let it run to the collapse or recall
 * sooner to free the queue, which `recallAt` expresses.
 *
 * Returns null when the building is already gone, or when its collapse would
 * land the march before reset, where the whole load would score on the wrong
 * day.
 */
export const allianceBuildingPreSend = (
  base: GatherSpot,
  building: AllianceBuilding,
  recallAt?: number,
  /**
   * Extra gathering speed running for the whole node march.
   *
   * A boost applies to troops already sitting in the node, not just to marches
   * sent after it, so activating one part way through still speeds the rest.
   * Modelled as covering the whole march, which is the case worth planning for:
   * a boost timed to the node is started when the node goes up.
   */
  boostPercent = 0
): GatherPreSend | null => {
  const oneWay = Math.max(building.oneWayMinutes, 0);
  const lifespan = Math.max(building.lifespanMinutes, 0);
  const collapsesAt = building.placedAt + lifespan;
  // Send the moment it is up; nothing is gained by waiting.
  const arrivesAt = building.placedAt + oneWay;

  // The boost stacks into the same total, so it is worth less the faster the
  // player already gathers. It cannot raise the cap, only reach it sooner.
  const rate =
    boostPercent > 0
      ? base.ratePerMinute *
        ((1 + base.speedPercent / 100 + boostPercent / 100) / (1 + base.speedPercent / 100))
      : base.ratePerMinute;

  // Time is the only limit. The node holds no finite pool to drain, it simply
  // vanishes after its lifespan, so the haul is rate times hours and nothing
  // else. The "25 million" figure the community quotes is not a rule in the
  // game, it is just what twelve hours at a maxed gathering speed comes to.
  const leavesAt = Math.min(recallAt ?? collapsesAt, collapsesAt);
  const gatherMinutes = leavesAt - arrivesAt;
  if (gatherMinutes <= 0) return null;

  const returnsAt = leavesAt + oneWay;
  if (returnsAt < 0) return null;

  return {
    // Carries the boosted rate, so the haul reflects the boost that was running.
    spot: {
      ...allianceSpot(base, lifespan, oneWay),
      ratePerMinute: rate,
      speedPercent: base.speedPercent + boostPercent,
    },
    returnsAt,
    gatherMinutes,
  };
};

/**
 * How far before reset the alliance should place the building.
 *
 * Placing it so it collapses just after midnight is what lands every march
 * inside it on the right side of the reset. The march home is added because the
 * load is credited on arrival, not on collapse.
 */
export const alliancePlacementLead = (
  lifespanMinutes = 12 * 60,
  oneWayMinutes = 1,
  landingMarginMinutes = 2
) => lifespanMinutes + oneWayMinutes - landingMarginMinutes;

const emptyTotals = (): Record<GatherResource, number> => ({ meat: 0, wood: 0, coal: 0, iron: 0 });

/**
 * Schedules one queue at a time.
 *
 * Each queue begins with a march already in flight, sent the day before to land
 * just after reset. After that it re-sends the moment it gets home, gathering
 * either until the spot runs dry or until just enough time is left to walk back
 * before the day ends, whichever comes first. That last partial trip is the
 * point of being able to recall early: the minutes at the end of the day are
 * worth keeping rather than leaving on the table.
 */
export function planGathering(input: GatherInput): GatherPlan {
  const { queues, windowMinutes, boost, landingMarginMinutes = 5 } = input;

  const window = Math.max(windowMinutes, 0);
  const trips: GatherTrip[] = [];
  let gatheringMinutes = 0;
  let travelMinutes = 0;

  /**
   * What a stretch of gathering yields on a given spot, given the boost may
   * cover only part of it. The boost raises the rate, so this integrates rate
   * over the stretch rather than treating the boost as all or nothing.
   */
  const yieldOver = (spot: GatherSpot, start: number, minutes: number): number => {
    if (!boost || minutes <= 0) return spot.ratePerMinute * minutes;
    // Priced against this spot's own speed, since a boost on a resource you
    // are already fast at is worth less than on one you are slow at.
    const boosted =
      spot.ratePerMinute *
      ((1 + spot.speedPercent / 100 + boost.percent / 100) / (1 + spot.speedPercent / 100));
    const from = boost.startMinutes;
    const to = boost.startMinutes + boost.lastsMinutes;
    const overlap = Math.max(0, Math.min(start + minutes, to) - Math.max(start, from));
    return (minutes - overlap) * spot.ratePerMinute + overlap * boosted;
  };

  // Each queue's clock, starting from when its pre-sent march gets home.
  const clocks: number[] = [];
  queues.forEach((queue, q) => {
    if (window <= 0) return;
    const spot = queue.spot;

    // The march already in flight at reset. It gathered before the day began,
    // so no boost applies to it. An ordinary queue simply fills a tile and lands
    // on the margin; a queue coming off the alliance building lands whenever the
    // building let it go, which the caller works out.
    const pre: GatherPreSend = queue.preSend ?? {
      spot,
      returnsAt: Math.min(landingMarginMinutes, window),
      gatherMinutes: Math.max(spot.maxGatherMinutes, 0),
    };
    const preReturn = Math.min(Math.max(pre.returnsAt, 0), window);
    trips.push({
      queue: q,
      sentAt: preReturn - (pre.gatherMinutes + pre.spot.oneWayMinutes * 2),
      returnsAt: preReturn,
      gatherMinutes: pre.gatherMinutes,
      amount: pre.spot.ratePerMinute * pre.gatherMinutes,
      resource: pre.spot.resource,
      spotLabel: pre.spot.label,
      preSent: true,
      recalledEarly: pre.gatherMinutes < pre.spot.maxGatherMinutes,
    });
    clocks[q] = preReturn;
  });

  // Burden Bearer charges, earliest first. A charge is claimed by the next
  // march to REACH an ordinary tile once it is up, which is why the queues are
  // advanced in arrival order below rather than one queue at a time: whichever
  // march lands next is the one the game would give it to.
  const charges = [...(input.burdenBearerAt ?? [])].sort((a, b) => a - b);
  let nextCharge = 0;
  let instantGathers = 0;
  let instantAmount = 0;

  const finished = queues.map(() => window <= 0);
  let guard = 0;
  while (guard++ < 5000) {
    // The queue whose march would land at a spot soonest.
    let pick = -1;
    let pickStart = Infinity;
    for (let q = 0; q < queues.length; q += 1) {
      if (finished[q]) continue;
      const spot = queues[q].spot;
      const gatherStart = clocks[q] + spot.oneWayMinutes;
      if (window - gatherStart - spot.oneWayMinutes <= 0) {
        finished[q] = true;
        continue;
      }
      if (gatherStart < pickStart) {
        pickStart = gatherStart;
        pick = q;
      }
    }
    if (pick < 0) break;

    const spot = queues[pick].spot;
    const gatherStart = pickStart;
    const room = window - gatherStart - spot.oneWayMinutes;

    // The skill does not fire on the alliance node, so a march landing there
    // leaves the charge armed for whoever lands next.
    const canUseCharge =
      !spot.allianceNode && nextCharge < charges.length && charges[nextCharge] <= gatherStart;

    if (canUseCharge) {
      nextCharge += 1;
      instantGathers += 1;
      // A tile holds what it holds, so an instant finish brings home the whole
      // thing however fast the player gathers. rate x maxGatherMinutes IS the
      // tile's contents, which is why no boost applies here.
      const amount = spot.ratePerMinute * spot.maxGatherMinutes;
      instantAmount += amount;
      const returnsAt = gatherStart + spot.oneWayMinutes;
      trips.push({
        queue: pick,
        sentAt: clocks[pick],
        returnsAt,
        gatherMinutes: 0,
        amount,
        resource: spot.resource,
        spotLabel: spot.label,
        instant: true,
        preSent: false,
        recalledEarly: false,
      });
      travelMinutes += spot.oneWayMinutes * 2;
      clocks[pick] = returnsAt;
      continue;
    }

    const gather = Math.min(spot.maxGatherMinutes, room);
    if (gather <= 0) {
      finished[pick] = true;
      continue;
    }
    const returnsAt = gatherStart + gather + spot.oneWayMinutes;
    trips.push({
      queue: pick,
      sentAt: clocks[pick],
      returnsAt,
      gatherMinutes: gather,
      amount: yieldOver(spot, gatherStart, gather),
      resource: spot.resource,
      spotLabel: spot.label,
      preSent: false,
      recalledEarly: gather < spot.maxGatherMinutes,
    });
    gatheringMinutes += gather;
    travelMinutes += spot.oneWayMinutes * 2;
    clocks[pick] = returnsAt;
  }

  const totals = emptyTotals();
  for (const t of trips) totals[t.resource] += Math.max(t.amount, 0);

  return {
    trips,
    instantGathers,
    instantAmount,
    burdenBearerAt: charges,
    chargesUnused: Math.max(charges.length - nextCharge, 0),
    gatheringMinutes,
    travelMinutes,
    totals,
    tripsPerQueue: queues.length ? trips.filter(t => t.queue === 0 && !t.preSent).length : 0,
  };
}

/**
 * Assembles the queues under both of the game's constraints.
 *
 * Only one march may sit on the alliance building, and each gathering hero can
 * only ride one march at a time. There are four of them, one per resource, so a
 * player with six queues fields four hero marches and two without. The heroless
 * ones are not wasted: the event pays the same for every resource, so they take
 * whatever tile is nearest.
 *
 * Heroes are handed out to the ordinary tiles first. The alliance march is
 * already the longest trip of the day, so shaving its gather time is worth less
 * than shaving a queue that turns over four times.
 */
export function buildGatherQueues(options: {
  /** Simultaneous marches the player can field. */
  marchQueues: number;
  tileLevel: number;
  oneWayMinutes: number;
  /** Gathering speed per resource, before any hero bonus. */
  speedPercent: Record<GatherResource, number>;
  /** Skill level 0 to 5 for each resource's gathering hero. */
  heroLevels?: Partial<Record<GatherResource, number>>;
  alliance?: AllianceBuilding & {
    resource?: GatherResource;
    /** Recall before the collapse, to free the queue sooner. */
    recallAt?: number;
    /** Extra gathering speed running for the node march. */
    boostPercent?: number;
  };
  /**
   * Whether the FIRST node march carries a gathering hero.
   *
   * Only the first: the alliance rebuilds the node as a different resource, and
   * that resource's hero is out on a tile march by then. Sending it to the node
   * would mean recalling the tile march first, which is usually not worth it.
   *
   * Worth trying both ways rather than assuming. A hero on the node lifts one
   * twelve hour trip; left on a tile queue it lifts five shorter ones, which
   * adds up to more hours under the bonus. Which wins depends on tile level and
   * march time, so the caller runs both and keeps the better.
   */
  nodeTakesHero?: boolean;
}): GatherQueue[] {
  const {
    marchQueues,
    tileLevel,
    oneWayMinutes,
    speedPercent,
    heroLevels = {},
    alliance,
    nodeTakesHero = false,
  } = options;

  const count = Math.max(Math.floor(marchQueues), 0);
  const queues: GatherQueue[] = [];
  // Heroes worth using, best first, one per resource.
  const withHero = (Object.entries(heroLevels) as [GatherResource, number][])
    .filter(([, lv]) => lv > 0)
    .sort((a, b) => b[1] - a[1]);

  /**
   * What a march with no hero should work.
   *
   * Not worth asking about: an event that pays per unit gathered pays exactly
   * the same for all four, so the only thing separating them is how fast the
   * player gathers each. Whichever tile empties soonest turns over most often,
   * so that is the one to send to.
   */
  const fallbackResource = GATHER_RESOURCES.reduce((best, r) => {
    const here = gatherSecondsAt(tileLevel, r, speedPercent[r] ?? 0);
    const there = gatherSecondsAt(tileLevel, best, speedPercent[best] ?? 0);
    if (here === null) return best;
    if (there === null) return r;
    return here < there ? r : best;
  }, GATHER_RESOURCES[0]);

  let heroIndex = 0;
  for (let q = 0; q < count; q++) {
    // Only the first queue can be on the building, and only until it collapses.
    // Afterwards that queue works ordinary tiles like any other, so its `spot`
    // is a normal tile and the building lives in `preSend`.
    if (alliance && q === 0) {
      // The node march gets first call on a gathering hero, and the hero is
      // what picks the resource. It is the longest trip of the day by a mile,
      // twelve hours against seven, so a hero's percentage is worth more here
      // than on any tile march. It also has to CONSUME that hero, or the same
      // one rides two marches at once.
      const best = alliance.resource
        ? ([alliance.resource, heroLevels[alliance.resource] ?? 0] as [GatherResource, number])
        : withHero[heroIndex];
      const resource = best ? best[0] : fallbackResource;
      // A hero only rides the node when the caller asked for it, and then only
      // on the first trip. Taking one costs a tile queue its hero for the whole
      // day, which is why it is a choice rather than a default.
      const heroLevel = nodeTakesHero && best ? best[1] : 0;
      if (nodeTakesHero && best && !alliance.resource) heroIndex++;

      const base = spotFromTile(
        tileLevel,
        resource,
        speedPercent[resource] ?? 0,
        alliance.oneWayMinutes,
        heroLevel
      );
      // The march stays on the node all day rather than reverting to tiles.
      // An alliance rebuilds the node the moment it collapses, so the march is
      // home for a minute or two and goes straight back out. That is worth a
      // lot: a node trip carries twelve hours of gathering against a tile's
      // seven, and unlike a tile the node has no pool to run dry.
      //
      // Unboosted on purpose. The pre-send below bakes the boost into its own
      // rate because it happens before the day starts, but the later trips run
      // inside the day, where planGathering applies the boost itself. Baking it
      // in here as well would count it twice.
      // Later node trips carry NO hero, whatever the first one did. The
      // alliance rebuilds the node as a different resource, so the hero that
      // matches it is already out on a tile march. Building `onward` from
      // `base` would have silently handed the first trip's hero to every trip
      // after it, on resources that hero does not even gather.
      const laterBase = spotFromTile(
        tileLevel,
        resource,
        speedPercent[resource] ?? 0,
        alliance.oneWayMinutes
      );
      const onward = laterBase
        ? allianceSpot(laterBase, alliance.lifespanMinutes, alliance.oneWayMinutes)
        : null;
      const preSend = base
        ? allianceBuildingPreSend(base, alliance, alliance.recallAt, alliance.boostPercent ?? 0)
        : null;
      const heroNote = heroLevel > 0 ? `, ${GATHER_HEROES[resource].hero} riding it` : '';
      if (onward && preSend) {
        queues.push({
          spot: onward,
          preSend,
          hero: heroLevel > 0 ? GATHER_HEROES[resource].hero : undefined,
          note:
            `on the alliance node all day, rebuilt as it collapses${heroNote}` +
            (heroLevel > 0 ? ', first trip only' : ', no hero: each rebuild is a new resource'),
        });
        continue;
      }
      // No usable node, so this queue is just another tile march.
      const tileInstead = spotFromTile(
        tileLevel,
        resource,
        speedPercent[resource] ?? 0,
        oneWayMinutes,
        heroLevel
      );
      if (tileInstead) {
        queues.push({
          spot: tileInstead,
          hero: heroLevel > 0 ? GATHER_HEROES[resource].hero : undefined,
          note: `alliance node missed, ordinary tiles${heroNote}`,
        });
        continue;
      }
      // Nothing worked, so hand the hero back for a tile march to use.
      if (best && !alliance.resource) heroIndex--;
    }

    const hero = withHero[heroIndex];
    if (hero) {
      const [resource, level] = hero;
      heroIndex++;
      const spot = spotFromTile(tileLevel, resource, speedPercent[resource] ?? 0, oneWayMinutes, level);
      if (spot) {
        queues.push({
          spot,
          hero: GATHER_HEROES[resource].hero,
          note: `+${gatherHeroBonus(level)}% on ${resource}`,
        });
        continue;
      }
    }

    const spot = spotFromTile(
      tileLevel,
      fallbackResource,
      speedPercent[fallbackResource] ?? 0,
      oneWayMinutes
    );
    if (spot) queues.push({ spot, note: 'no hero left for this march' });
  }

  return queues;
}

/**
 * When to send the pre-positioned marches, as minutes before reset.
 *
 * The alliance needs this number too: a building that allows a longer trip wants
 * placing this far ahead of reset so the marches under it land the right side of
 * midnight.
 */
export const preSendLeadMinutes = (spot: GatherSpot, landingMarginMinutes = 5) =>
  spot.maxGatherMinutes + spot.oneWayMinutes * 2 - landingMarginMinutes;

/** Points from a plan, given what the event pays per unit of each resource. */
export const gatherPoints = (
  plan: GatherPlan,
  perUnit: Record<GatherResource, number>
) =>
  plan.totals.meat * perUnit.meat +
  plan.totals.wood * perUnit.wood +
  plan.totals.coal * perUnit.coal +
  plan.totals.iron * perUnit.iron;

/**
 * The best moment to start a timed boost.
 *
 * With early recall the boost no longer has to buy a whole extra trip to be
 * worth anything: it raises the rate for whatever it covers, so it always pays
 * something. It still pays most where it covers the most gathering, which is
 * not always the start of the day.
 */
export function bestBoostStart(
  input: GatherInput,
  percent: number,
  lastsMinutes: number,
  perUnit: Record<GatherResource, number>,
  stepMinutes = 15
): { startMinutes: number; points: number; gainedOverNoBoost: number } {
  const without = gatherPoints(planGathering({ ...input, boost: undefined }), perUnit);
  let best = { startMinutes: 0, points: without };

  for (let start = 0; start <= input.windowMinutes; start += Math.max(stepMinutes, 1)) {
    const points = gatherPoints(
      planGathering({ ...input, boost: { percent, lastsMinutes, startMinutes: start } }),
      perUnit
    );
    if (points > best.points + 1e-6) best = { startMinutes: start, points };
  }

  return { ...best, gainedOverNoBoost: best.points - without };
}
