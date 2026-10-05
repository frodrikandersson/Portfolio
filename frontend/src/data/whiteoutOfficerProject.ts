// Officer Project scoring tables.
//
// "Good tools are the key to good work". One stage, no days, running a little
// under two days, with four point targets and an Honor Ranking at the end. The
// same shape as the Armament Competition.
//
// IT COMES IN TWO VARIANTS AND THEY ARE NOT THE SAME EVENT. Both are called
// Officer Project in game, both pay 70 for a point of score, but they pay it
// for DIFFERENT score:
//
//   The Essence Stone run pays "Raise Chief Charm max score by 1" and adds the
//   eleven troop rows.
//
//   The Charm Design run pays "Raise max Chief Gear score by 1 (excluding
//   Charm)" and adds the three hero shard rows instead, with no troop rows.
//
// So a player who levels charms scores nothing from them on the Charm Design
// run, and the reverse. Picking the wrong one in the calculator is the one
// mistake that turns a planned spend into zero, which is why they are separate
// entries in the catalogue rather than one averaged table.
//
// The names are the ones Fredrik filed the screenshots under, taken from the
// reward track rather than from the scoring, because the reward is what the
// event panel shows you first.
//
// SOURCING. Both transcribed from the in-game Tips popup, each captured from
// its first row to its last. The milestones come from the event panel of the
// run that was open at the time.
//
// EDIT FREELY: nothing in the scoring code hardcodes a number.

import type { PointsEvent, ScoringGroup, ScoringRow } from '../models/whiteoutInterface';
import { CHIEF_GEAR_SCORE_ROWS } from './whiteoutChiefGear';
import { CHARM_SCORE_ROWS } from './whiteoutChiefCharms';

/**
 * Hero gear materials, shared by both variants at the same rates.
 *
 * Mithril at 216,000 is the heaviest row in either table by three orders of
 * magnitude, and it is spent only at the Legendary breakthroughs, 150 a piece.
 */
const heroGearItems: ScoringGroup = {
  id: 'items',
  label: 'Hero gear materials',
  note: 'Points per item used. Mithril dwarfs everything else here and is only ever spent at the Legendary breakthroughs, 150 per piece.',
  rows: [
    { id: 'use-1-hero-gear-essence-stone', label: 'Use 1 Hero Gear Essence Stone', pointsPerUnit: 6_000 },
    { id: 'use-1-widget-of-any-hero-exclusive-gear', label: 'Use 1 Widget of any Hero Exclusive Gear', pointsPerUnit: 12_000 },
    { id: 'use-1-mithril', label: 'Use 1 Mithril', pointsPerUnit: 216_000 },
  ],
};

/** Only on the Essence Stone run. The Charm Design run pays Chief Gear instead. */
const chiefCharms: ScoringGroup = {
  id: 'charms',
  label: 'Chief Charm level ups',
  note: 'The game pays 70 points per 1 Charm score. Each instalment of a level scores on its own, so a part-finished level still pays. Chief Gear score is NOT on this run.',
  pointsPerSourceValue: 70,
  rows: CHARM_SCORE_ROWS,
};

/** Only on the Charm Design run. The Essence Stone run pays Chief Charms instead. */
const chiefGear: ScoringGroup = {
  id: 'gear',
  label: 'Chief Gear level ups',
  note: 'The game pays 70 points per 1 Chief Gear score. Charms are excluded by the game on this run, and they are what the other run pays for.',
  pointsPerSourceValue: 70,
  rows: CHIEF_GEAR_SCORE_ROWS,
};

const shards: ScoringGroup = {
  id: 'shards',
  label: 'Hero shards',
  note: 'Points per shard used to ascend heroes.',
  rows: [
    { id: 'use-1-rare-hero-shard', label: 'Use 1 Rare Hero Shard', pointsPerUnit: 350 },
    { id: 'use-1-epic-hero-shard', label: 'Use 1 Epic Hero Shard', pointsPerUnit: 1_220 },
    { id: 'use-1-mythic-hero-shard', label: 'Use 1 Mythic Hero Shard', pointsPerUnit: 3_040 },
  ],
};

/**
 * Troops, Lv. 1 through Lv. 11, on the Essence Stone run only.
 *
 * The game's own footnote applies: a promotion pays the difference between the
 * two levels, so a Lv. 10 taken to Lv. 11 is 37 - 30 = 7.
 */
const TROOP_POINTS = [1, 2, 3, 4, 6, 9, 12, 17, 22, 30, 37];

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
 * The Honor Ranking, identical on both runs.
 *
 * Worth saying plainly: below 4,000 points the ladder pays nothing at all, so
 * that figure is the only hard floor in the event. Everything above it is a
 * step change rather than a gradient.
 */
const rankingRewards = {
  paidPlaces: 100,
  minimumPoints: 4_000,
  bands: [
    { from: 1, to: 1 },
    { from: 2, to: 2 },
    { from: 3, to: 3 },
    { from: 4, to: 5 },
    { from: 6, to: 10 },
    { from: 11, to: 20 },
    { from: 21, to: 50 },
    { from: 51, to: 100 },
  ],
  note:
    'Top 100 chiefs over 4,000 points. First place takes 50,000 gems, ten Mythic General ' +
    'Decoration Components and three gold keys; 51st to 100th take 1,000 gems and some ' +
    'five-minute speedups. Below 4,000 points the ladder pays nothing.',
};

const MILESTONE_NOTE =
  'Four point targets, paid to everyone who passes them regardless of rank. These were read ' +
  'off one run of this event and the two runs captured so far did not match: 13,000 / 76,000 / ' +
  '150,000 / 310,000 on one, 19,800 / 110,000 / 226,000 / 453,000 on the other, four days ' +
  'apart on the same account. So treat the figures here as the shape of the track rather than ' +
  'as fixed numbers, and read the real ones off the panel.';

/** The run whose rewards are Hero Gear Essence Stones. Pays Chief Charm score. */
export const officerProjectEssenceStone: PointsEvent = {
  id: 'officer-project-essence-stone',
  name: 'Officer Project (Essence Stone)',
  season: 'about 2 days, one stage',
  source: 'in-game',
  sourceLabel: 'the in-game Tips popup, transcribed in full',
  sourceUrl: 'https://www.whiteoutsurvival.wiki/events/officer-project/',
  dailyMilestones: {
    perDay: 4,
    points: [13_000, 76_000, 150_000, 310_000],
    note: MILESTONE_NOTE,
  },
  rankingRewards,
  caveats: [
    'This run pays Chief CHARM score, not Chief Gear. The Charm Design run is the other way round, so check which one is live before planning a gear spend against it.',
    'No stages: one task list and one score for the whole event, written here as a single stage. There is no "save it for a better day" advice to give.',
    'The game words the charm row "Raise Chief Charm max score by 1". It is scored here against the per-instalment charm ladder, the same one every other event uses, because that is what the in-game popup values reproduce.',
    'No speedup rows, no Fire Crystal rows and no hero shard rows on this run. The list was captured from its first row to its last, so they are absent rather than missed.',
  ],
  days: [
    {
      day: 1,
      label: 'Every task, the whole event',
      groups: [chiefCharms, heroGearItems, troops],
    },
  ],
};

/** The run whose rewards are Charm Designs. Pays Chief Gear score. */
export const officerProjectCharmDesign: PointsEvent = {
  id: 'officer-project-charm-design',
  name: 'Officer Project (Charm Design)',
  season: 'about 2 days, one stage',
  source: 'in-game',
  sourceLabel: 'the in-game Tips popup, transcribed in full',
  sourceUrl: 'https://www.whiteoutsurvival.wiki/events/officer-project/',
  dailyMilestones: {
    perDay: 4,
    points: [19_800, 110_000, 226_000, 453_000],
    note: MILESTONE_NOTE,
  },
  rankingRewards,
  caveats: [
    'This run pays Chief GEAR score and excludes Charms. The Essence Stone run is the other way round, so check which one is live before planning a charm spend against it.',
    'No stages: one task list and one score for the whole event, written here as a single stage.',
    'No troop rows on this run, where the Essence Stone run has eleven. It carries the three hero shard rows instead.',
    'No speedup rows and no Fire Crystal rows. The list was captured from its first row to its last, so they are absent rather than missed.',
  ],
  days: [
    {
      day: 1,
      label: 'Every task, the whole event',
      groups: [chiefGear, shards, heroGearItems],
    },
  ],
};
