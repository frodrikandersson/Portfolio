// Resource tiles: what each level holds and how long it takes to empty.
//
// THE RESULT THAT MATTERS. An event paying per unit gathered pays exactly the
// same for every resource. Tile amounts run 20 : 20 : 4 : 1 for meat, wood, coal
// and iron, and the Holiday Event pays 0.01, 0.01, 0.05 and 0.2 per unit, which
// cancels precisely. A Level 8 tile is worth 140,000 points whichever of the
// four it is, and the same parity holds at all eight levels. So the resource is
// a free choice; only the tile level and the march overhead move the score.
//
// Tile level matters much more than the gather rate suggests. Emptying a tile
// pays 14,078 points an hour at Level 1 against 19,053 at Level 8, only 35%
// better. But every march also costs travel, and that overhead is fixed, so with
// a 15 minute round trip a queue makes 56,700 points a day on Level 1 tiles and
// 560,000 on Level 8. Ten times, from the same queue.
//
// MEASURED, NOT DERIVED. These durations were read in game at a known gathering
// speed, recorded below. Everything else is rebased from them rather than fitted
// to a formula, because the underlying rate is not a clean function of level:
// units per second climb steadily with tile level, so a single "rate per troop"
// would be wrong.
//
// Troop count does not come into it. Soldiers take turns gathering, so sending a
// million is no faster than sending the count the game suggests.
//
// EDIT FREELY: re-measure at your own gathering speed and update MEASURED_AT to
// match, and every derived figure follows.

export type GatherResource = 'meat' | 'wood' | 'coal' | 'iron';

export const GATHER_RESOURCES: GatherResource[] = ['meat', 'wood', 'coal', 'iron'];

export const GATHER_TILE_NAMES: Record<GatherResource, string> = {
  meat: 'Abandoned Animal Farm',
  wood: 'Abandoned Lumberyard',
  coal: 'Abandoned Coal Mine',
  iron: 'Abandoned Smelter',
};

/**
 * The alliance's own gathering spot, which is NOT one of the tiles above.
 *
 * It used to borrow whichever tile name matched its resource, so a march
 * working the alliance node was labelled "Abandoned Animal Farm". It is its own
 * thing with its own name, and it behaves differently too: a trip on it can run
 * twelve hours, and Burden Bearer does not work there.
 */
export const ALLIANCE_NODE_NAME = 'Secured Alliance Gathering Node';

/**
 * Burden Bearer, the Musk Ox pet skill.
 *
 * Activating it makes the next wilderness tile a march reaches finish instantly,
 * so that march collects the whole tile and walks straight home. Secured
 * Alliance Gathering Nodes are excluded.
 *
 * The cooldown starts the moment the button is pressed, whether or not the
 * skill has fired yet, which is the whole trick: press it while every march is
 * already sitting on a tile and the cooldown runs during time you were going to
 * spend gathering anyway. The charge waits, armed, for the next arrival.
 *
 * Cooldowns by skill level, in minutes. Four hours comes off each level.
 */
export const BURDEN_BEARER_COOLDOWN_MINUTES = [
  35 * 60, // Lv. 1, 1d 11:00:00
  31 * 60, // Lv. 2, 1d 07:00:00
  27 * 60, // Lv. 3, 1d 03:00:00
  23 * 60, // Lv. 4, 23:00:00
  19 * 60, // Lv. 5, 19:00:00
  15 * 60, // Lv. 6, 15:00:00
];

export const BURDEN_BEARER_MAX_LEVEL = BURDEN_BEARER_COOLDOWN_MINUTES.length;

export const burdenBearerCooldown = (level: number) => {
  const i = Math.round(level) - 1;
  return i >= 0 && i < BURDEN_BEARER_COOLDOWN_MINUTES.length
    ? BURDEN_BEARER_COOLDOWN_MINUTES[i]
    : null;
};

/**
 * When each charge comes up, counted from the moment the button was pressed.
 *
 * `pressedAt` is normally NEGATIVE, and that is the whole point. The player
 * sends the evening batch out, waits for every march to be sitting on its tile,
 * and presses then. Nothing is reaching a tile, so no charge is spent, but the
 * cooldown is running. By the time the scoring day opens, several hours of it
 * are already gone.
 *
 * That moves the SECOND charge, which is what decides whether a level gets one
 * use or two. A Lv. 4 Musk Ox pressed at reset comes up again at 23:00, too
 * late for a march to go out and come back. Pressed seven hours early it comes
 * up at 16:00, with the rest of the day to spend it.
 *
 * Charges before the day are kept rather than clamped to zero: a charge is
 * armed and waits, so the scheduler gives it to the first arrival of the day.
 */
export const burdenBearerCharges = (
  level: number,
  windowMinutes: number,
  pressedAt = 0
): number[] => {
  const cooldown = burdenBearerCooldown(level);
  if (!cooldown || cooldown <= 0 || windowMinutes <= 0) return [];
  const out: number[] = [];
  for (let at = pressedAt; at < windowMinutes; at += cooldown) out.push(at);
  return out;
};

/**
 * The gathering speed the durations below were measured at.
 *
 * Meat and wood were read at +345.50% and coal and iron at +345%, which is why
 * their seconds differ by a few at the top levels. The small gap is kept rather
 * than averaged away, so nothing is invented.
 */
export const MEASURED_AT = { meat: 345.5, wood: 345.5, coal: 345, iron: 345 };

export interface GatherTile {
  level: number;
  /** Units the tile holds, by resource. */
  amount: Record<GatherResource, number>;
  /** Seconds to empty it at MEASURED_AT, by resource. */
  seconds: Record<GatherResource, number>;
}

export const MAX_GATHER_TILE_LEVEL = 8;

export const whiteoutGatherTiles: GatherTile[] = [
  {
    level: 1,
    amount: { meat: 70_000, wood: 70_000, coal: 14_000, iron: 3_500 },
    seconds: { meat: 179, wood: 179, coal: 179, iron: 179 },
  },
  {
    level: 2,
    amount: { meat: 150_000, wood: 150_000, coal: 30_000, iron: 7_500 },
    seconds: { meat: 365, wood: 365, coal: 365, iron: 365 },
  },
  {
    level: 3,
    amount: { meat: 300_000, wood: 300_000, coal: 60_000, iron: 15_000 },
    seconds: { meat: 696, wood: 696, coal: 697, iron: 697 },
  },
  {
    level: 4,
    amount: { meat: 600_000, wood: 600_000, coal: 120_000, iron: 30_000 },
    seconds: { meat: 1_331, wood: 1_331, coal: 1_333, iron: 1_333 },
  },
  {
    level: 5,
    amount: { meat: 1_200_000, wood: 1_200_000, coal: 240_000, iron: 60_000 },
    seconds: { meat: 2_551, wood: 2_551, coal: 2_554, iron: 2_554 },
  },
  {
    level: 6,
    amount: { meat: 3_000_000, wood: 3_000_000, coal: 600_000, iron: 150_000 },
    seconds: { meat: 6_122, wood: 6_122, coal: 6_129, iron: 6_129 },
  },
  {
    level: 7,
    amount: { meat: 6_000_000, wood: 6_000_000, coal: 1_200_000, iron: 300_000 },
    seconds: { meat: 11_773, wood: 11_773, coal: 11_786, iron: 11_786 },
  },
  {
    level: 8,
    amount: { meat: 14_000_000, wood: 14_000_000, coal: 2_800_000, iron: 700_000 },
    seconds: { meat: 26_453, wood: 26_453, coal: 26_483, iron: 26_483 },
  },
];

export const gatherTile = (level: number) =>
  whiteoutGatherTiles.find(t => t.level === Math.round(level));

/**
 * The four heroes with a gathering skill, one per resource.
 *
 * Each is worth 5% per skill level up to 25%, and only for its own resource.
 * This is the one thing that breaks the point parity above: whichever resource
 * you put a hero behind gathers faster, so it fits more marches into the day.
 */
export const GATHER_HEROES: Record<GatherResource, { hero: string; skill: string }> = {
  meat: { hero: 'Cloris', skill: 'Predator' },
  wood: { hero: 'Eugene', skill: 'Master Woodcutter' },
  coal: { hero: 'Charlie', skill: 'Coal Extraction' },
  iron: { hero: 'Smith', skill: 'Craftmanship' },
};

/** Gathering speed per skill level, 1 to 5, as a percentage. */
export const GATHER_HERO_BY_LEVEL = [5, 10, 15, 20, 25];

export const gatherHeroBonus = (level: number) =>
  level <= 0 ? 0 : GATHER_HERO_BY_LEVEL[Math.min(Math.round(level), 5) - 1];

/**
 * Seconds to empty a tile at a gathering speed of `speedPercent`.
 *
 * Rebased from the measured figure the same way every other speed works here:
 * time = base / (1 + sum/100), so the measured speed is divided back out first.
 */
export const gatherSecondsAt = (
  level: number,
  resource: GatherResource,
  speedPercent: number
): number | null => {
  const tile = gatherTile(level);
  if (!tile) return null;
  const measured = 1 + MEASURED_AT[resource] / 100;
  const wanted = 1 + Math.max(speedPercent, -99) / 100;
  if (wanted <= 0) return null;
  return (tile.seconds[resource] * measured) / wanted;
};
