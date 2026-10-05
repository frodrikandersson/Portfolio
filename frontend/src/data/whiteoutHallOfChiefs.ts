// Hall of Chiefs (Season 2, 7 day) scoring tables.
//
// Point values transcribed from the community calculator by Crazzyfloggo, linked from
// whiteoutsurvival.wiki. Every scoring rule in that sheet is a plain
// `quantity x pointsPerUnit`, which is why this file is mostly a list of rates.
//
// THIS FILE USED TO SCORE NOTHING. Measured against a full inventory it filled
// 0 of its 10 scoring groups, where the other events fill 69% to 100%. The
// cause was not the rates, which are fine: it was the row IDS. This was the
// first event transcribed and it named its rows after the community sheet's
// columns, while everything since has used the game's own wording. The engine
// matches on those ids, so `rare` never met `use-1-rare-hero-shard`, `t1`
// never met `train-1-lv-1-troop`, and every planner in the project walked past
// this event without seeing a thing it recognised.
//
// The ids below are now the shared ones. Nothing about the SCORING changed:
// every rate is the same number the sheet gives, and the two conversions that
// look like rewrites were checked first.
//
//   CHIEF GEAR. The sheet's rates are the shared gear ladder exactly: all 14
//   directly comparable rows matched at a ratio of 1.000, so the group is the
//   ladder at one point per gear score. The sheet abbreviates, collapsing the
//   twelve identical Mythic steps into one "Mythic (all level)" row at 6,250
//   and naming the Legendary tiers "red-2 Step 3" and so on. That naming stops
//   lining up with the ladder part way through the Legendary tiers, so the
//   LADDER is treated as the authority and the abbreviation is dropped.
//
//   CHIEF CHARMS. The sheet's per-level rates are the instalment sums of the
//   shared charm ladder, at one point per charm score. Checked on every level
//   it lists: Lv. 5 is 2,813 + 2,812 + 2,813 + 2,812 = 11,250, Lv. 12 is
//   3,400 x 5 = 17,000, Lv. 16 is 4,200 x 5 = 21,000. The sheet stops at
//   Lv. 16 and the ladder runs to Lv. 18; the rows above 16 are carried at the
//   same one point per score, which is an inference rather than a transcription.
//
// EDIT FREELY: these are community-sourced and can lag game updates. Correcting a
// number here is all that is needed - nothing in the scoring code hardcodes a value.

import type { PointsEvent, ScoringGroup, ScoringRow } from '../models/whiteoutInterface';
import { CHIEF_GEAR_SCORE_ROWS } from './whiteoutChiefGear';
import { CHARM_SCORE_ROWS } from './whiteoutChiefCharms';

/**
 * Power gained, on days 1 and 5.
 *
 * The building row carries the id the upgrade planner fills. Note the engine
 * will often leave it empty on purpose: burning construction speedups and
 * banking the power they produce are the same speedups counted twice, so it
 * takes whichever placement is worth more and says which it dropped.
 */
const power: ScoringGroup = {
  id: 'power',
  label: 'Power gained',
  note: 'Points per point of power. Construction power and construction speedups come from the same minutes, so only one of them is ever counted.',
  rows: [
    { id: 'build-up-1-building-power', label: 'Raise 1 Power Construction', pointsPerUnit: 30 },
    { id: 'research-up-1-tech-power', label: 'Raise 1 Power Research', pointsPerUnit: 30 },
    { id: 'train-or-promote-up-1-troop-power', label: 'Raise 1 Power Troops', pointsPerUnit: 20 },
  ],
};

const heroShards: ScoringGroup = {
  id: 'hero-shards',
  label: 'Hero shards',
  note: 'Points per shard used to ascend heroes.',
  rows: [
    { id: 'use-1-rare-hero-shard', label: 'Rare', pointsPerUnit: 4000 },
    { id: 'use-1-epic-hero-shard', label: 'Epic', pointsPerUnit: 14000 },
    { id: 'use-1-mythic-hero-shard', label: 'Mythic', pointsPerUnit: 35000 },
  ],
};

/**
 * Gathering, and the one group left on the sheet's own terms.
 *
 * Every other event pays per N resources gathered, which is what the gathering
 * planner knows how to fill. This one pays per TILE of a given tier, which is
 * a different quantity entirely, and no amount of renaming makes the planner
 * able to answer it. Left as a manual entry rather than converted into
 * something the data does not say.
 */
const gather: ScoringGroup = {
  id: 'gather',
  label: 'Gather resources',
  note: 'Points per stated amount gathered in the wilderness, which is the same shape every other event uses, so the gathering planner can fill it.',
  rows: [
    { id: 'gather-200-meat', label: 'Gather 200 Meat', pointsPerUnit: 15 },
    { id: 'gather-200-wood', label: 'Gather 200 Wood', pointsPerUnit: 15 },
    { id: 'gather-40-coal', label: 'Gather 40 Coal', pointsPerUnit: 15 },
    { id: 'gather-10-iron', label: 'Gather 10 Iron', pointsPerUnit: 15 },
  ],
};

/** Troops, Lv. 1 to Lv. 10. The sheet has no Lv. 11 row. */
const TROOP_POINTS = [90, 120, 180, 265, 385, 595, 830, 1130, 1485, 1960];

const troops: ScoringGroup = {
  id: 'train',
  label: 'Troops trained',
  note: 'Points per troop trained. Promotion scores the difference between the two levels.',
  rows: TROOP_POINTS.map((points, index): ScoringRow => ({
    id: `train-1-lv-${index + 1}-troop`,
    label: `T${index + 1}`,
    pointsPerUnit: points,
  })),
};

const chiefCharms: ScoringGroup = {
  id: 'charms',
  label: 'Chief charms',
  note: 'The game pays 1,000 points per 1 Charm score. Each instalment of a level scores on its own, so a part-finished level still pays.',
  pointsPerSourceValue: 1_000,
  rows: CHARM_SCORE_ROWS,
};

const chiefGear: ScoringGroup = {
  id: 'gear',
  label: 'Chief gear upgrades',
  note: 'The game pays 500 points per 1 Chief Gear score, so a single Uncommon upgrade is 562,500. Charms are scored separately.',
  pointsPerSourceValue: 500,
  rows: CHIEF_GEAR_SCORE_ROWS,
};

/**
 * Speedups, at 300 a minute.
 *
 * The sheet lists three denominations, a day at 432,000, an hour at 18,000 and
 * a minute at 300, which are the same rate three times over: 1,440 x 300 and
 * 60 x 300. Carrying all three invited a player to enter their pile twice, and
 * none of the three said which POOL the minutes came from, which is what the
 * planner needs. One row per pool at 300 a minute says the same thing, lets
 * the planner fill it, and cannot be double counted.
 */
const speedups: ScoringGroup = {
  id: 'speedups',
  label: 'Speedups',
  note: 'Points per minute, the same rate for all four. The sheet quotes 432,000 a day and 18,000 an hour, which are this same 300 a minute.',
  rows: [
    { id: 'construction-speedups-1-minute', label: 'Use 1m of Speedups for Construction', pointsPerUnit: 300 },
    { id: 'research-speedups-1-minute', label: 'Use 1m of Speedups for Research', pointsPerUnit: 300 },
    { id: 'troop-training-and-promotion-speedups-1-minute', label: 'Use 1m of Speedups for Troop Training/Promotion', pointsPerUnit: 300 },
    { id: 'expert-skill-speedups-1-minute', label: 'Use 1m of Speedups to Learn Expert Skills', pointsPerUnit: 300 },
  ],
};

export const hallOfChiefs: PointsEvent = {
  id: 'hall-of-chiefs',
  name: 'Hall of Chiefs',
  season: 'Generation 2, 7 stages',
  source: 'community',
  sourceLabel: "Crazzyfloggo's community calculator",
  sourceUrl: 'https://docs.google.com/spreadsheets/d/16TDsT0MDOi0yrq8lXoEySmZDoLmfK6Re9kchlfDGBLc/edit?usp=sharing',
  caveats: [
    'These values are a community reconstruction, not read from the game. Several of them disagree with in-game numbers seen for other events, so treat them as unverified until someone checks them against the live event.',
    'The Chief Gear and Chief Charm rates come from whiteoutdata.com and mobi.gg, which agree on 500 points per 1 gear score and 1,000 per 1 charm score. The community sheet this file started from listed the SCORE per upgrade and left the multiplier off, which is why its gear numbers matched the shared gear ladder exactly. Both were understated by those factors until this was corrected.',
    'The gathering rows are per amount gathered, from mobi.gg: 200 Meat and 10 Iron for 15 points each. The Wood and Coal amounts are inferred from the 20:1 meat to iron ratio every other event here uses, and are the only two numbers in this file not read off a source.',
    'The sheet also disagrees with whiteoutdata on stage 1 power, which it puts at 45 for both construction and research where this file has 30 and 30. mobi.gg gives construction as 30 and research as varying by stage, which is what is kept.',
    'The sheet has no Lv. 11 troop row, so troops stop at Lv. 10.',
  ],
  days: [
    { day: 1, label: 'Power push', groups: [power] },
    {
      day: 2,
      label: 'Wheel, shards & gathering',
      groups: [
        {
          id: 'lucky-wheel',
          label: 'Lucky Wheel',
          note: 'Points per spin.',
          rows: [{ id: 'play-lucky-wheel-1-time', label: 'Lucky Wheel', pointsPerUnit: 90000 }],
        },
        heroShards,
        gather,
      ],
    },
    { day: 3, label: 'Troop training', groups: [troops] },
    {
      day: 4,
      label: 'Research, charms & gathering',
      groups: [
        {
          id: 'research',
          label: 'Research power',
          note: 'Points per point of research power.',
          rows: [{ id: 'research-up-1-tech-power', label: 'Raise 1 Power Research', pointsPerUnit: 45 }],
        },
        chiefCharms,
        gather,
      ],
    },
    {
      day: 5,
      label: 'Power push & hero gear',
      groups: [
        power,
        {
          id: 'items',
          label: 'Items used',
          note: 'Points per item used.',
          rows: [
            { id: 'use-1-hero-gear-essence-stone', label: 'Use 1 Essence Stone', pointsPerUnit: 50000 },
            { id: 'use-1-widget-of-any-hero-exclusive-gear', label: 'Use 1 Widget Hero Exclusive Gear', pointsPerUnit: 100000 },
          ],
        },
      ],
    },
    { day: 6, label: 'Chief gear', groups: [chiefGear] },
    { day: 7, label: 'Shards & speedups', groups: [heroShards, speedups] },
  ],
};
