// State of Power (SvS) scoring tables, the Preparation Phase.
//
// FIVE DAYS, NOT SIX OR SEVEN. The in-game Personal Point Ranking screen shows
// the phase strip as I, II, III, IV, V and then a combined total, with the
// Battle Phase on a separate tab. So the five stages below are the whole of the
// scoring, and the battle that follows is not a spending event.
//
// WHAT MAKES THIS EVENT DIFFERENT:
//
//   HALF YOUR POINTS MAY NOT COUNT FOR THE STATE. Every stage screen carries
//   the same warning: "You can currently contribute 50% of your points to your
//   state. Reach Furnace Lv. Fire Crystal 4 to contribute all points." That is
//   a multiplier on what reaches the state total, and it is why a Furnace below
//   FC 4 changes what this event is worth to an alliance. See
//   STATE_CONTRIBUTION.
//
//   BEASTS ARE PAID BY LEVEL BAND, five of them, where other events have a
//   single flat row. A Lv. 26 to 30 kill pays a third more than a Lv. 1 to 10.
//
//   MITHRIL IS THE LARGEST SINGLE ROW ANYWHERE IN THIS PROJECT at 144,000, and
//   it appears on two of the five days.
//
// SOURCING. Every row is transcribed from Fredrik's in-game stage screens, all
// five days captured in full. The pet advancement figures were cross-checked
// against the game's own Details popup, which reproduces the table already in
// whiteoutPets.ts exactly.
//
// EDIT FREELY: nothing in the scoring code hardcodes a number.

import type { PointsEvent, ScoringGroup } from '../models/whiteoutInterface';
import { CHIEF_GEAR_SCORE_ROWS } from './whiteoutChiefGear';
import { CHARM_SCORE_ROWS } from './whiteoutChiefCharms';
import { PET_ADVANCEMENT_SCORE_ROWS } from './whiteoutPets';

/**
 * How much of a player's score reaches the state total.
 *
 * Below Furnace Fire Crystal 4 only half of it does. The personal milestones
 * and the personal ranking are unaffected as far as the stage screens say, so
 * this is modelled as a note rather than as a multiplier on the score: halving
 * a number the player can see would be wrong, and the screens do not say the
 * personal side is touched.
 */
export const STATE_CONTRIBUTION = {
  belowThreshold: 0.5,
  thresholdLabel: 'Furnace Fire Crystal 4',
  note:
    'Below Furnace Fire Crystal 4 only half of your points reach the state total. Your own ' +
    'milestones and ranking are scored on the full figure as far as the stage screens say, so ' +
    'this matters for what you are worth to the alliance rather than for what you collect.',
};

const fireCrystals: ScoringGroup = {
  id: 'fire-crystals',
  label: 'Fire Crystals',
  note: 'Points per crystal spent. The two building rows are filled from what the upgrade plan actually consumes; the Research row is left to you, because the research tables here carry no shard costs.',
  rows: [
    { id: 'use-1-refined-fire-crystal-to-upgrade-buildings', label: 'Use 1 Refined Fire Crystal to upgrade buildings', pointsPerUnit: 30_000 },
    { id: 'use-1-fire-crystal-to-upgrade-buildings', label: 'Use 1 Fire Crystal to upgrade buildings', pointsPerUnit: 2_000 },
    { id: 'use-1-fire-crystal-shard-for-research', label: 'Use 1 Fire Crystal Shard for Research', pointsPerUnit: 1_000 },
  ],
};

/** All four piles, Learning included, at a flat 30 a minute. */
const speedups: ScoringGroup = {
  id: 'speedups',
  label: 'Speedups',
  note: 'Points per minute, the same rate for all four. Gem speedups are excluded by the game. Learning is on the list, so the General pile scores wherever it is pointed.',
  rows: [
    { id: 'construction-speedups-1-minute', label: 'Use 1m of Speedups for Construction', pointsPerUnit: 30 },
    { id: 'research-speedups-1-minute', label: 'Use 1m of Speedups for Research', pointsPerUnit: 30 },
    { id: 'troop-training-and-promotion-speedups-1-minute', label: 'Use 1m of Speedups for Troop Training/Promotion', pointsPerUnit: 30 },
    { id: 'expert-skill-speedups-1-minute', label: 'Use 1m of Speedups to Learn Expert Skills', pointsPerUnit: 30 },
  ],
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

const luckyWheel: ScoringGroup = {
  id: 'wheel',
  label: 'Lucky Wheel',
  note: 'Points per spin. The wheel’s own bonus shards count once per event, so the total spun is what earns them.',
  rows: [{ id: 'play-lucky-wheel-1-time', label: 'Play Lucky Wheel 1 time', pointsPerUnit: 8_000 }],
};

const experts: ScoringGroup = {
  id: 'experts',
  label: 'Experts',
  note: 'Common Sigils are excluded by the game, so only an expert’s own Sigils score. Books and Sigils with no unlocked expert to spend them on pay nothing.',
  rows: [
    { id: 'use-any-1-expert-sigil', label: 'Use any 1 Expert Sigil (excluding Common Sigils)', pointsPerUnit: 6_000 },
    { id: 'use-1-book-of-knowledge', label: 'Use 1 Book of Knowledge', pointsPerUnit: 60 },
  ],
};

const gathering: ScoringGroup = {
  id: 'gather',
  label: 'Gathering',
  note: 'Points per stated amount gathered in the wilderness.',
  rows: [
    { id: 'gather-1-000-meat', label: 'Gather 1,000 Meat', pointsPerUnit: 2 },
    { id: 'gather-1-000-wood', label: 'Gather 1,000 Wood', pointsPerUnit: 2 },
    { id: 'gather-200-coal', label: 'Gather 200 Coal', pointsPerUnit: 2 },
    { id: 'gather-50-iron', label: 'Gather 50 Iron', pointsPerUnit: 2 },
  ],
};

const petAdvancement: ScoringGroup = {
  id: 'pets',
  label: 'Pet advancement',
  pointsPerSourceValue: 50,
  rows: PET_ADVANCEMENT_SCORE_ROWS,
};

const wildMarks: ScoringGroup = {
  id: 'wild-marks',
  label: 'Pet refining',
  note: 'Points per Wild Mark used to refine pets.',
  rows: [
    { id: 'use-1-advanced-wild-mark-to-refine-pets', label: 'Use 1 Advanced Wild Mark to refine pets', pointsPerUnit: 15_000 },
    { id: 'use-1-common-wild-mark-to-refine-pets', label: 'Use 1 Common Wild Mark to refine pets', pointsPerUnit: 1_150 },
  ],
};

const chiefCharms: ScoringGroup = {
  id: 'charms',
  label: 'Chief Charm level ups',
  note: 'The game pays 70 points per 1 Charm score. Each instalment of a level scores on its own, so a part-finished level still pays.',
  pointsPerSourceValue: 70,
  rows: CHARM_SCORE_ROWS,
};

const chiefGear: ScoringGroup = {
  id: 'gear',
  label: 'Chief Gear level ups',
  note: 'The game pays 36 points per 1 Chief Gear score. Charms are scored separately.',
  pointsPerSourceValue: 36,
  rows: CHIEF_GEAR_SCORE_ROWS,
};

const heroGearItems: ScoringGroup = {
  id: 'items',
  label: 'Hero gear materials',
  note: 'Points per item used. Mithril at 144,000 is the largest single row in this event by a wide margin, and it is only ever spent at the Legendary breakthroughs, 150 per piece.',
  rows: [
    { id: 'use-1-hero-gear-essence-stone', label: 'Use 1 Hero Gear Essence Stone', pointsPerUnit: 4_000 },
    { id: 'use-1-widget-of-any-hero-exclusive-gear', label: 'Use 1 Widget of any Hero Exclusive Gear', pointsPerUnit: 8_000 },
    { id: 'use-1-mithril', label: 'Use 1 Mithril', pointsPerUnit: 144_000 },
  ],
};

/**
 * Beasts, paid by level band.
 *
 * Other events here have a single flat beast row. This one splits it five ways,
 * and the top band pays a third more than the bottom, so which beasts a player
 * can actually kill changes what a point of stamina is worth.
 */
const beasts: ScoringGroup = {
  id: 'beasts',
  label: 'Beasts',
  note:
    'Points per kill. The band matters: a Lv. 26 to 30 kill pays a third more than a Lv. 1 to 10 ' +
    'for the same 10 stamina. Worth knowing before you plan the day, a top-band beast works out ' +
    'at exactly the same 1,200 points per stamina as a Polar Terror, so if you cannot fill ' +
    'rallies you lose nothing by hunting beasts instead. Below the top band the rally wins.',
  rows: [
    { id: 'call-rally-and-hunt-down-1-polar-terror', label: 'Call rally and hunt down 1 Polar Terror', pointsPerUnit: 30_000 },
    { id: 'defeat-1-lv-1-to-10-beast', label: 'Defeat 1 Lv. 1 to 10 Beast', pointsPerUnit: 9_000 },
    { id: 'defeat-1-lv-11-to-15-beast', label: 'Defeat 1 Lv. 11 to 15 Beast', pointsPerUnit: 9_750 },
    { id: 'defeat-1-lv-16-to-20-beast', label: 'Defeat 1 Lv. 16 to 20 Beast', pointsPerUnit: 10_500 },
    { id: 'defeat-1-lv-21-to-25-beast', label: 'Defeat 1 Lv. 21 to 25 Beast', pointsPerUnit: 11_250 },
    { id: 'defeat-1-lv-26-to-30-beast', label: 'Defeat 1 Lv. 26 to 30 Beast', pointsPerUnit: 12_000 },
  ],
};

/**
 * Troops, Lv. 1 to 12.
 *
 * A different ladder to King of Icefield's, and steeper: a Lv. 11 troop pays 75
 * here against 49 there. The game's own footnote applies, that a promotion pays
 * the difference between the two levels.
 *
 * THE LV. 12 ROW was read off the Day 4 details popup at 94 points, and it
 * carries on the same step the rest of the ladder uses: 60, then 75, then 94,
 * each about 1.25 times the one before.
 *
 * It can be planned now, but on DERIVED training costs: nothing publishes a
 * per-troop T12 cost, so whiteoutTroops.ts works it out from the published
 * promotion cost and flags the row. The Troops card says so where a plan leans
 * on it. Correcting those costs is the one thing that makes this row exact.
 */
const TROOP_POINTS = [3, 4, 5, 8, 12, 18, 25, 35, 45, 60, 75, 94];

const troops: ScoringGroup = {
  id: 'train',
  label: 'Troops trained',
  note: 'Points per troop trained. Promotion scores the difference between the two levels.',
  rows: TROOP_POINTS.map((points, index) => ({
    id: `train-1-lv-${index + 1}-troop`,
    label: `Train 1 Lv.${index + 1} Troop`,
    pointsPerUnit: points,
  })),
};

export const stateOfPower: PointsEvent = {
  id: 'svs-state-of-power',
  name: 'SVS State Of Power',
  season: '5 days, the Preparation Phase',
  source: 'in-game',
  sourceLabel: 'the in-game stage screens, all five days',
  sourceUrl: 'https://www.whiteoutsurvival.wiki/events/svs-state-of-power/',
  caveats: [
    'Only the Preparation Phase is scored here. The Battle Phase that follows is on its own tab in game and is not a spending event, so it has no table.',
    'Day 1 was captured from its Point Sources popup, which carries the rows but not the stage name. The other four are named from their own headers.',
    'The personal milestones move with the season hero’s skill, not with the day. Two sets were captured on Phase I: 30,000 / 100,000 / 200,000 with the Hero of the Season at Lv. 5, and 100,000 / 200,000 / 350,000 at Lv. 20, where the reward popup also carries a "Bonus Rewards from Valeria’s Skill" line. So the track is personal to the account and has to be read off the panel; no figures are recorded here as fact.',
    'Alliance milestones were 145,000 / 996,000 / 3,500,000 on both captures, so those look fixed where the personal ones do not.',
    'Troops score up to Lv. 12 here, read off the Day 4 details popup at 94 points. The training cost of a T12 troop is not in this project yet, so the planner cannot fill that row in and it has to be entered by hand.',
    'Expert skills can raise what this event pays. One reads "Increases State of Power Preparation Phase point gains and adds bonus daily Personal Point tiers", up to +20% and +3 tiers at Lv. 10. The tables here are the unbuffed rates, so a player running that skill scores above what the calculator shows.',
  ],
  days: [
    {
      day: 1,
      label: 'City Construction',
      groups: [fireCrystals, speedups, chiefCharms],
    },
    {
      day: 2,
      label: 'Basic Skills Up',
      groups: [fireCrystals, speedups, luckyWheel, shards, gathering, experts],
    },
    {
      day: 3,
      label: 'Beast Slay',
      groups: [beasts, petAdvancement, wildMarks, chiefCharms, luckyWheel, shards, experts],
    },
    {
      day: 4,
      label: 'Hero Development',
      groups: [chiefCharms, heroGearItems, troops],
    },
    {
      day: 5,
      label: 'Power Boost',
      groups: [petAdvancement, wildMarks, heroGearItems, chiefGear, fireCrystals, speedups],
    },
  ],
};
