// King of Icefield scoring tables.
//
// Seven stages, one a day, running Monday through Sunday. Same shape as the
// Holiday Event: each stage pays for spending a particular kind of thing, and
// the same thing is often worth a different amount on a different day.
//
// WHAT THIS EVENT ADDS that the Holiday Event does not have:
//
//   MITHRIL, at 40,000 a piece, which is the first row in the calculator that
//   pays for the hero gear ladder. Twelve pieces taken through every Legendary
//   breakthrough is 1,800 Mithril, so 72,000,000 points.
//
//   CHIEF CHARMS, paid per 1 Charm score at 70. Separate from Chief Gear score,
//   which this event pays at 36.
//
//   PET ADVANCEMENT, paid per 1 advancement score at 50, plus Wild Marks.
//
//   FIRE CRYSTALS, which pay for the upgrade itself rather than for the power
//   it grants.
//
// SOURCING. Stages 2 through 7 are transcribed from Fredrik's in-game stage
// screens. Stage 1 was not captured and is reconstructed; see the caveats.
// Which day carries which system is cross-checked against a community week
// planner spreadsheet that lays all seven days out side by side, and it agrees
// with every stage screen we do have.
//
// EDIT FREELY: nothing in the scoring code hardcodes a number.

import type { PointsEvent, ScoringGroup, ScoringRow } from '../models/whiteoutInterface';
import { CHIEF_GEAR_SCORE_ROWS } from './whiteoutChiefGear';
import { CHARM_SCORE_ROWS } from './whiteoutChiefCharms';
import { PET_ADVANCEMENT_SCORE_ROWS } from './whiteoutPets';

/* ------------------------------------------------------------------ *
 * Groups that repeat across days.
 *
 * Several stages are the same table twice over, so they are declared once
 * and shared. A group is only ever read, never mutated, so sharing the
 * object is safe and keeps a rate change to a single edit.
 * ------------------------------------------------------------------ */

/** Fire Crystals pay for the upgrade itself, not for the power it grants. */
const fireCrystals: ScoringGroup = {
  id: 'fire-crystals',
  label: 'Fire Crystals',
  note:
    'Points per crystal spent. Unlike the power days this pays for the material going into the upgrade, so the two building rows are filled from what the upgrade plan actually consumes. The Research row is left to you: the research tables here carry no shard costs.',
  rows: [
    { id: 'use-1-fire-crystal-to-upgrade-buildings', label: 'Use 1 Fire Crystal to upgrade buildings', pointsPerUnit: 2000 },
    { id: 'use-1-fire-crystal-shard-for-research', label: 'Use 1 Fire Crystal Shard for Research', pointsPerUnit: 1000 },
    { id: 'use-1-refined-fire-crystal-to-upgrade-buildings', label: 'Use 1 Refined Fire Crystal to upgrade buildings', pointsPerUnit: 30000 },
  ],
};

/**
 * Speedups, at a flat 30 a minute.
 *
 * The row ids match the Holiday Event's on purpose: the planner reads them to
 * decide which pile a day can absorb, so reusing them means the speedup advice
 * works here without a line of new code. Note there is no Learning row, so
 * General speedups pointed at Learning score nothing in this event.
 */
const speedups: ScoringGroup = {
  id: 'speedups',
  label: 'Speedups',
  note: 'Points per minute. Gem speedups are excluded by the game, and this event has no Learning row.',
  rows: [
    { id: 'construction-speedups-1-minute', label: 'Use 1m of Speedups for Construction', pointsPerUnit: 30 },
    { id: 'research-speedups-1-minute', label: 'Use 1m of Speedups for Research', pointsPerUnit: 30 },
    { id: 'troop-training-and-promotion-speedups-1-minute', label: 'Use 1m of Speedups for Training (Training, Promotion)', pointsPerUnit: 30 },
  ],
};

const shards: ScoringGroup = {
  id: 'shards',
  label: 'Hero shards',
  note: 'Points per shard used to ascend heroes.',
  rows: [
    { id: 'use-1-rare-hero-shard', label: 'Use 1 Rare Hero Shard', pointsPerUnit: 350 },
    { id: 'use-1-epic-hero-shard', label: 'Use 1 Epic Hero Shard', pointsPerUnit: 1220 },
    { id: 'use-1-mythic-hero-shard', label: 'Use 1 Mythic Hero Shard', pointsPerUnit: 3040 },
  ],
};

const luckyWheel: ScoringGroup = {
  id: 'wheel',
  label: 'Lucky Wheel',
  note: 'Points per spin.',
  rows: [{ id: 'play-lucky-wheel-1-time', label: 'Play Lucky Wheel 1 time', pointsPerUnit: 8000 }],
};

/** Hero gear materials. Mithril is far and away the biggest row in the event. */
const heroGearItems: ScoringGroup = {
  id: 'items',
  label: 'Hero gear materials',
  note: 'Points per item used. Mithril is only ever spent at the Legendary breakthroughs, 150 per piece.',
  rows: [
    { id: 'use-1-hero-gear-essence-stone', label: 'Use 1 Hero Gear Essence Stone', pointsPerUnit: 4000 },
    { id: 'use-1-widget-of-any-hero-exclusive-gear', label: 'Use 1 Widget of any Hero Exclusive Gear', pointsPerUnit: 8000 },
    { id: 'use-1-mithril', label: 'Use 1 Mithril', pointsPerUnit: 40000 },
  ],
};

const wildMarks: ScoringGroup = {
  id: 'wild-marks',
  label: 'Pet refining',
  note: 'Points per Wild Mark used to refine pets.',
  rows: [
    { id: 'use-1-advanced-wild-mark-to-refine-pets', label: 'Use 1 Advanced Wild Mark to refine pets', pointsPerUnit: 15000 },
    { id: 'use-1-common-wild-mark-to-refine-pets', label: 'Use 1 Common Wild Mark to refine pets', pointsPerUnit: 1150 },
  ],
};

const petAdvancement: ScoringGroup = {
  id: 'pets',
  label: 'Pet advancement',
  note: 'The game pays 50 points per 1 advancement score, and advancing a pet grants the score shown. Every pet grants the same score at a given level.',
  pointsPerSourceValue: 50,
  rows: PET_ADVANCEMENT_SCORE_ROWS,
};

const chiefCharms: ScoringGroup = {
  id: 'charms',
  label: 'Chief Charm level ups',
  note: 'The game pays 70 points per 1 Charm score. Eighteen charms sit three to a gear piece and level on their own ladder, separate from Chief Gear score. Each instalment of a level scores on its own, so a part-finished level still pays.',
  pointsPerSourceValue: 70,
  rows: CHARM_SCORE_ROWS,
};

const chiefGear: ScoringGroup = {
  id: 'gear',
  label: 'Chief Gear level ups',
  note: 'The game pays 36 points per 1 Chief Gear score, and each level up raises that score by the amount shown. Charms are scored separately.',
  pointsPerSourceValue: 36,
  rows: CHIEF_GEAR_SCORE_ROWS,
};

/**
 * Troops, Lv. 1 through Lv. 11.
 *
 * The game's own footnote: points from a promotion are the difference between
 * the two levels' training points, so promoting a Lv. 10 to a Lv. 11 pays
 * 49 - 39 = 10.
 */
const TROOP_POINTS = [1, 2, 3, 5, 7, 11, 16, 23, 30, 39, 49];

const troops: ScoringGroup = {
  id: 'train',
  label: 'Troops trained',
  note: 'Points per troop trained. Promotion scores the difference between the two levels.',
  rows: TROOP_POINTS.map((points, index): ScoringRow => ({
    id: `train-1-lv-${index + 1}-troop`,
    label: `Train 1 Lv.${index + 1} Troop`,
    pointsPerUnit: points,
  })),
};

/**
 * Gathering, at a flat 3 points per stated amount.
 *
 * The step sizes differ per resource and are read out of the row, so the
 * gathering planner needs no change: 2,000 Meat and 100 Iron both pay 3.
 */
const gathering: ScoringGroup = {
  id: 'gather',
  label: 'Gathering',
  note: 'Points per stated amount gathered in the wilderness.',
  rows: [
    { id: 'gather-2-000-meat', label: 'Gather 2,000 Meat in the Wilderness', pointsPerUnit: 3 },
    { id: 'gather-2-000-wood', label: 'Gather 2,000 Wood in the Wilderness', pointsPerUnit: 3 },
    { id: 'gather-400-coal', label: 'Gather 400 Coal in the Wilderness', pointsPerUnit: 3 },
    { id: 'gather-100-iron', label: 'Gather 100 Iron in the Wilderness', pointsPerUnit: 3 },
  ],
};

export const kingOfIcefield: PointsEvent = {
  id: 'king-of-icefield',
  name: 'King of Icefield',
  season: '7 days, Monday to Sunday',
  source: 'in-game',
  sourceLabel:
    'the in-game stage screens for Days 2 to 7, Gen 3+, with Day 1 reconstructed from its Tips popup',
  sourceUrl: 'https://www.whiteoutsurvival.wiki/events/king-of-icefield/',
  dailyMilestones: {
    perDay: 4,
    // Not a gap in the research, a gap in the world. wosguru, whiteoutdata,
    // heaven-guardian and mobi.gg all describe this track and not one of them
    // prints a threshold, because the targets move with the state's age. They
    // have to be read off the event panel.
    points: null,
    note:
      'Four targets a day. The third and fourth each pay a Medal of Honor, so two a day and ' +
      'fourteen across the event, which is what the Medal of Honor shop is stocked against. ' +
      'The point values are not published anywhere and scale with the state, so they need ' +
      'capturing from the in-game panel. Nothing is planned against them until they are: a ' +
      'guessed target produces advice that looks precise and is not.',
  },
  caveats: [
    'Day 1 was not captured in game. Its Fire Crystal, speedup and Chief Charm rows come from the stage Tips popup, and the hero shard group is placed there on the strength of a community week planner. The rates are the ones every other day uses, so the risk is a missing group rather than a wrong number.',
    'Days 4 and 6 are both Combat Training and are identical apart from one paying for Chief Charms and the other for Chief Gear score. Day 6 is written out that way, but only its troop rows were actually captured.',
    'The Chief Charm rate of 70 per score is from the stage screen; the per-step scores it multiplies are in whiteoutChiefCharms.ts and are checked against the in-game popup.',
    'The Chief Gear score list ends at LegendaryT6 (3-Star), the same limit as the Holiday Event table it shares.',
  ],
  days: [
    {
      day: 1,
      label: 'City Construction',
      groups: [fireCrystals, speedups, chiefCharms, shards],
    },
    {
      day: 2,
      label: 'Hero Development',
      groups: [fireCrystals, speedups, luckyWheel, shards, heroGearItems],
    },
    {
      day: 3,
      label: 'Basic Skills Up',
      groups: [petAdvancement, wildMarks, chiefCharms, luckyWheel, shards],
    },
    {
      day: 4,
      label: 'Combat Training',
      groups: [chiefCharms, heroGearItems, troops],
    },
    {
      day: 5,
      label: 'Basic Skills Up',
      groups: [fireCrystals, speedups, heroGearItems],
    },
    {
      day: 6,
      label: 'Combat Training',
      groups: [chiefGear, heroGearItems, troops],
    },
    {
      day: 7,
      label: 'Hero Development',
      groups: [petAdvancement, wildMarks, fireCrystals, speedups, chiefGear, gathering, shards],
    },
  ],
};
