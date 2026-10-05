// Armament Competition scoring tables.
//
// TWO RUNS, AND THEY ARE NOT THE SAME LIST. Both are called Armament
// Competition in game and both last two days, but one pays for expert sigils,
// books and hero shards while the other pays for Mithril, Essence Stones and
// Widgets. The three Fire Crystal rows and the Chief Gear rate are all they
// share. They are named below after the reward track, because that is what the
// event panel shows you first.
//
// Two days, Friday and Saturday, and unlike every other event here it has NO
// STAGES. There is one list of tasks and one running score for the whole
// event, with point milestones and a leaderboard at the end. That is why this
// file has a single entry in `days`: there is nothing to spread across, and
// nothing to hold back for a better day.
//
// THE POINT SCALE IS ITS OWN. A minute of speedup pays 1 here, 30 in King of
// Icefield, 60 in the Holiday Event, and those numbers do not compare: every
// event scores in its own currency and the score resets each time the event
// comes round. Nothing a player does moves points between events, so this file
// carries no advice about which event is "worth more". The only comparisons
// that mean anything are between rows inside this one list.
//
// SOURCING. Transcribed from Fredrik's in-game Tips popup, every row of it.
//
// EDIT FREELY: nothing in the scoring code hardcodes a number.

import type { PointsEvent, ScoringGroup } from '../models/whiteoutInterface';
import { CHIEF_GEAR_SCORE_ROWS } from './whiteoutChiefGear';

const experts: ScoringGroup = {
  id: 'experts',
  label: 'Experts',
  note: 'Common Sigils are excluded by the game, so only an expert’s own Sigils score. Books and Sigils with no unlocked expert to spend them on pay nothing.',
  rows: [
    { id: 'use-any-1-expert-sigil', label: 'Use any 1 Expert Sigil (excluding Common Sigils)', pointsPerUnit: 200 },
    { id: 'use-1-book-of-knowledge', label: 'Use 1 Book of Knowledge', pointsPerUnit: 2 },
  ],
};

const fireCrystals: ScoringGroup = {
  id: 'fire-crystals',
  label: 'Fire Crystals',
  note: 'Points per crystal spent. The two building rows are filled from what the upgrade plan actually consumes; the Research row is left to you, because the research tables here carry no shard costs.',
  rows: [
    { id: 'use-1-fire-crystal-to-upgrade-buildings', label: 'Use 1 Fire Crystal to upgrade buildings', pointsPerUnit: 100 },
    { id: 'use-1-fire-crystal-shard-for-research', label: 'Use 1 Fire Crystal Shard for Research', pointsPerUnit: 50 },
    { id: 'use-1-refined-fire-crystal-to-upgrade-buildings', label: 'Use 1 Refined Fire Crystal to upgrade buildings', pointsPerUnit: 1500 },
  ],
};

/**
 * Chief Gear, at 3 points per 1 gear score.
 *
 * The rows are the shared ladder, and that sharing is not an assumption.
 * Fredrik read the whole "Notes on Chief Gear score" popup out of THIS event
 * and it was diffed against the one transcribed from the Holiday Event: 150
 * rows, zero differences, the same 461,880 total. So the ladder is a property
 * of the gear and the rate is the only part any event owns.
 *
 * Three is not a small rate, it is this event's rate. Reading it next to the
 * Holiday Event's 50 says nothing, because the two scores are separate
 * currencies that reset independently.
 */
const chiefGear: ScoringGroup = {
  id: 'gear',
  label: 'Chief Gear level ups',
  note: 'The game pays 3 points per 1 Chief Gear score, and each level up raises that score by the amount shown. Charms are excluded by the game.',
  pointsPerSourceValue: 3,
  rows: CHIEF_GEAR_SCORE_ROWS,
};

const shards: ScoringGroup = {
  id: 'shards',
  label: 'Hero shards',
  note: 'Points per shard used to ascend heroes.',
  rows: [
    { id: 'use-1-rare-hero-shard', label: 'Use 1 Rare Hero Shard', pointsPerUnit: 15 },
    { id: 'use-1-epic-hero-shard', label: 'Use 1 Epic Hero Shard', pointsPerUnit: 50 },
    { id: 'use-1-mythic-hero-shard', label: 'Use 1 Mythic Hero Shard', pointsPerUnit: 125 },
  ],
};

/**
 * Speedups, a flat 1 a minute across all four piles.
 *
 * All four, Learning included. That matters for the General pile, which the
 * player points at one pool: here every choice scores, which is not true of
 * every event's list.
 */
const speedups: ScoringGroup = {
  id: 'speedups',
  label: 'Speedups',
  note: 'Points per minute, the same rate for all four. Gem speedups are excluded by the game. Learning is on the list here, so the General pile scores wherever it is pointed.',
  rows: [
    { id: 'construction-speedups-1-minute', label: 'Use 1m of Speedups for Construction', pointsPerUnit: 1 },
    { id: 'research-speedups-1-minute', label: 'Use 1m of Speedups for Research', pointsPerUnit: 1 },
    { id: 'troop-training-and-promotion-speedups-1-minute', label: 'Use 1m of Speedups for Troop Training/Promotion', pointsPerUnit: 1 },
    { id: 'expert-skill-speedups-1-minute', label: 'Use 1m of Speedups to Learn Expert Skills', pointsPerUnit: 1 },
  ],
};

export const armamentCompetition: PointsEvent = {
  id: 'armament-competition',
  name: 'Armament Competition (Design Plan)',
  season: '2 days, Friday and Saturday',
  source: 'in-game',
  sourceLabel: 'the in-game Tips popup, transcribed in full',
  sourceUrl: 'https://www.whiteoutsurvival.wiki/events/armament-competition/',
  dailyMilestones: {
    // Four targets, and unlike King of Icefield these are REAL, read straight
    // off Fredrik's event panel rather than estimated. Event-wide rather than
    // daily, because this event runs as one stage across its two days.
    perDay: 4,
    points: [680, 5_100, 12_000, 20_000],
    note:
      'Four point targets, paid to everyone who passes them regardless of rank. Transcribed ' +
      'from the in-game panel. The rewards behind them are resources, Hero EXP, speedups, gems ' +
      'and manuals; the exact items are not recorded here because several are only identifiable ' +
      'from their icon.',
  },
  rankingRewards: {
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
      'Top 100 chiefs over 4,000 points. The bands are step changes rather than a gradient: ' +
      'first place takes 50,000 gems and ten Mythic General Hero Shards, 51st to 100th take ' +
      '1,000 gems and some five-minute speedups. Below 4,000 points the ladder pays nothing at ' +
      'all, which makes that figure the only hard floor in the event.',
  },
  caveats: [
    'This event has no stages: one task list and one score across both days, with point milestones and a leaderboard. It is written here as a single stage for that reason, so there is no "save it for a better day" advice to give.',
    'Community guides list Essence Stone and Widget rows for this event, and this list does not have them. Both are true: those rows belong to the Fire Crystal run, at 800 and 1,600, and that run has no sigils, books or hero shards in exchange. Check which one is live before planning against either.',
    'This run pays no Mithril. The Fire Crystal run pays 28,800 for it.',
  ],
  days: [
    {
      day: 1,
      label: 'Every task, both days',
      groups: [experts, fireCrystals, chiefGear, shards, speedups],
    },
  ],
};

/* ------------------------------------------------------------------ *
 * The Fire Crystal run.
 *
 * Same two days, same milestones-and-ladder shape, a different list. The Fire
 * Crystal rows and the Chief Gear rate are carried over unchanged, which is
 * not an assumption: both were read off this run's own Tips popup and matched
 * the Design Plan run's values exactly.
 * ------------------------------------------------------------------ */

/** Hero gear materials, which the Design Plan run does not pay for at all. */
const fcHeroGearItems: ScoringGroup = {
  id: 'items',
  label: 'Hero gear materials',
  note: 'Points per item used. Mithril is far and away the biggest row on this run and is only ever spent at the Legendary breakthroughs, 150 per piece.',
  rows: [
    { id: 'use-1-hero-gear-essence-stone', label: 'Use 1 Hero Gear Essence Stone', pointsPerUnit: 800 },
    { id: 'use-1-widget-of-any-hero-exclusive-gear', label: 'Use 1 Widget of any Hero Exclusive Gear', pointsPerUnit: 1_600 },
    { id: 'use-1-mithril', label: 'Use 1 Mithril', pointsPerUnit: 28_800 },
  ],
};

export const armamentCompetitionFireCrystal: PointsEvent = {
  id: 'armament-competition-fire-crystal',
  name: 'Armament Competition (Fire Crystal)',
  season: '2 days, one stage',
  source: 'in-game',
  sourceLabel: 'the in-game Tips popup, transcribed in full',
  sourceUrl: 'https://www.whiteoutsurvival.wiki/events/armament-competition/',
  dailyMilestones: {
    perDay: 4,
    points: [1_300, 9_700, 24_000, 38_000],
    note:
      'Four point targets, paid to everyone who passes them regardless of rank, read off the ' +
      'in-game panel. They do not match the Design Plan run\u2019s, so the two runs are not ' +
      'interchangeable even on the reward side.',
  },
  rankingRewards: {
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
      'Top 100 chiefs over 4,000 points, the same ladder the Design Plan run uses. First place ' +
      'takes 50,000 gems and ten Mythic General Decoration Components; 51st to 100th take 1,000 ' +
      'gems and some five-minute speedups. Below 4,000 points it pays nothing.',
  },
  caveats: [
    'This run pays no expert sigils, no Books of Knowledge and no hero shards. The Design Plan run pays all three, and pays no Mithril, Essence Stones or Widgets in exchange.',
    'No stages: one task list and one score across both days, written here as a single stage, so there is no "save it for a better day" advice to give.',
    'All four speedup piles score here, Learning included, which means the General pile pays wherever it is pointed.',
  ],
  days: [
    {
      day: 1,
      label: 'Every task, both days',
      groups: [fireCrystals, fcHeroGearItems, chiefGear, speedups],
    },
  ],
};
