// Holiday Event scoring tables.
//
// Holiday events all follow the same 7 day shape: each day is a stage that pays points
// for spending a particular kind of resource. Only the stage mix and the rates change
// between them, so a new holiday event is a copy of this file with the numbers swapped,
// not a new scoring model.
//
// Transcribed directly from the in-game stage screens and tooltips, so these are the
// real values rather than a community reconstruction.
//
// EDIT FREELY: nothing in the scoring code hardcodes a number.

import type { PointsEvent } from '../models/whiteoutInterface';
import { CHIEF_GEAR_SCORE_ROWS } from './whiteoutChiefGear';

export const holidayEvent: PointsEvent = {
  id: 'holiday-event',
  name: 'Holiday Event',
  season: '7 days',
  source: 'in-game',
  sourceLabel: 'the in-game stage screens and tooltips',
  caveats: [
    'Day 4 is assumed to be the troop training stage. The stage screen was not captured, only its Tips popup, so the stage name and any other rows on it are unconfirmed.',
    'The Chief Gear score list is transcribed from a scrolling tooltip and ends at LegendaryT6 (3-Star). Any tiers past that are missing.',
  ],
  days: [
    {
      day: 1,
      label: "Power Boost",
      groups: [
        {
          id: "power",
          label: "Power gained",
          note: "Points per 1 power gained.",
          rows: [
            { id: "build-up-1-building-power", label: "Build up 1 Building Power", pointsPerUnit: 1 },
            { id: "research-up-1-tech-power", label: "Research up 1 Tech Power", pointsPerUnit: 1 },
            { id: "train-or-promote-up-1-troop-power", label: "Train or promote up 1 Troop Power", pointsPerUnit: 1 },
          ],
        },
        {
          id: "recruitment",
          label: "Recruitment",
          note: "Points per recruitment used.",
          rows: [
            { id: "use-epic-recruitment-1-time", label: "Use Epic Recruitment 1 time", pointsPerUnit: 11000 },
            { id: "use-advanced-recruitment-1-time", label: "Use Advanced Recruitment 1 time", pointsPerUnit: 3300 },
          ],
        },
        {
          id: "shards",
          label: "Hero shards",
          note: "Points per shard used to ascend heroes.",
          rows: [
            { id: "use-1-rare-hero-shard", label: "Use 1 Rare Hero Shard", pointsPerUnit: 500 },
            { id: "use-1-epic-hero-shard", label: "Use 1 Epic Hero Shard", pointsPerUnit: 2200 },
            { id: "use-1-mythic-hero-shard", label: "Use 1 Mythic Hero Shard", pointsPerUnit: 6000 },
          ],
        },
      ],
    },
    {
      day: 2,
      label: "Beast Slay",
      groups: [
        {
          id: "beasts",
          label: "Beasts",
          note: "Points per kill.",
          rows: [
            { id: "call-rally-and-hunt-down-1-polar-terror", label: "Call rally and hunt down 1 Polar Terror", pointsPerUnit: 30000 },
            { id: "kill-a-lv-1-30-beast", label: "Kill a Lv.1-30 Beast", pointsPerUnit: 9900 },
          ],
        },
      ],
    },
    {
      day: 3,
      label: "Hero Development",
      groups: [
        {
          id: "recruitment",
          label: "Recruitment",
          note: "Points per recruitment used.",
          rows: [
            { id: "use-epic-recruitment-1-time", label: "Use Epic Recruitment 1 time", pointsPerUnit: 11000 },
            { id: "use-advanced-recruitment-1-time", label: "Use Advanced Recruitment 1 time", pointsPerUnit: 3300 },
          ],
        },
        {
          id: "shards",
          label: "Hero shards",
          note: "Points per shard used to ascend heroes.",
          rows: [
            { id: "use-1-rare-hero-shard", label: "Use 1 Rare Hero Shard", pointsPerUnit: 500 },
            { id: "use-1-epic-hero-shard", label: "Use 1 Epic Hero Shard", pointsPerUnit: 2200 },
            { id: "use-1-mythic-hero-shard", label: "Use 1 Mythic Hero Shard", pointsPerUnit: 6000 },
          ],
        },
        {
          id: "speedups",
          label: "Speedups",
          note: "Points per minute of speedup. Gem speedups are excluded by the game.",
          rows: [
            { id: "construction-speedups-1-minute", label: "Construction speedups (1 minute)", pointsPerUnit: 60 },
            { id: "research-speedups-1-minute", label: "Research speedups (1 minute)", pointsPerUnit: 60 },
            { id: "troop-training-and-promotion-speedups-1-minute", label: "Troop training and promotion speedups (1 minute)", pointsPerUnit: 60 },
            { id: "expert-skill-speedups-1-minute", label: "Expert skill speedups (1 minute)", pointsPerUnit: 60 },
          ],
        },
      ],
    },
    {
      day: 4,
      label: "Troop Training",
      groups: [
        {
          id: "train",
          label: "Troops trained",
          note: "Points per troop trained. Promotion scores the difference between the two levels.",
          rows: [
            { id: "train-1-lv-1-troop", label: "Train 1 Lv.1 Troop", pointsPerUnit: 5 },
            { id: "train-1-lv-2-troop", label: "Train 1 Lv.2 Troop", pointsPerUnit: 7 },
            { id: "train-1-lv-3-troop", label: "Train 1 Lv.3 Troop", pointsPerUnit: 10 },
            { id: "train-1-lv-4-troop", label: "Train 1 Lv.4 Troop", pointsPerUnit: 16 },
            { id: "train-1-lv-5-troop", label: "Train 1 Lv.5 Troop", pointsPerUnit: 23 },
            { id: "train-1-lv-6-troop", label: "Train 1 Lv.6 Troop", pointsPerUnit: 36 },
            { id: "train-1-lv-7-troop", label: "Train 1 Lv.7 Troop", pointsPerUnit: 50 },
            { id: "train-1-lv-8-troop", label: "Train 1 Lv.8 Troop", pointsPerUnit: 68 },
            { id: "train-1-lv-9-troop", label: "Train 1 Lv.9 Troop", pointsPerUnit: 90 },
            { id: "train-1-lv-10-troop", label: "Train 1 Lv.10 Troop", pointsPerUnit: 118 },
            { id: "train-1-lv-11-troop", label: "Train 1 Lv.11 Troop", pointsPerUnit: 140 },
          ],
        },
      ],
    },
    {
      day: 5,
      label: "Hero Gear",
      groups: [
        {
          id: "items",
          label: "Items used",
          note: "Points per item used.",
          rows: [
            { id: "use-1-hero-gear-essence-stone", label: "Use 1 Hero Gear Essence Stone", pointsPerUnit: 25000 },
            { id: "use-1-widget-of-any-hero-exclusive-gear", label: "Use 1 Widget of any Hero Exclusive Gear", pointsPerUnit: 50000 },
            { id: "use-1-gem", label: "Use 1 Gem", pointsPerUnit: 10 },
          ],
        },
      ],
    },
    {
      day: 6,
      label: "Gather Resources",
      groups: [
        {
          id: "gather",
          label: "Gathering",
          note: "Points per stated amount gathered in the wilderness.",
          rows: [
            { id: "gather-1-000-meat", label: "Gather 1,000 Meat", pointsPerUnit: 10 },
            { id: "gather-1-000-wood", label: "Gather 1,000 Wood", pointsPerUnit: 10 },
            { id: "gather-200-coal", label: "Gather 200 Coal", pointsPerUnit: 10 },
            { id: "gather-50-iron", label: "Gather 50 Iron", pointsPerUnit: 10 },
          ],
        },
        {
          id: "power",
          label: "Power gained",
          note: "Points per 1 power gained.",
          rows: [
            { id: "build-up-1-building-power", label: "Build up 1 Building Power", pointsPerUnit: 1 },
            { id: "research-up-1-tech-power", label: "Research up 1 Tech Power", pointsPerUnit: 1 },
            { id: "train-or-promote-up-1-troop-power", label: "Train or promote up 1 Troop Power", pointsPerUnit: 1 },
          ],
        },
      ],
    },
    {
      day: 7,
      label: "Chief Gear",
      groups: [
        {
          id: "gear",
          label: "Chief Gear level ups",
          note: "The game pays 50 points per 1 Chief Gear score, and each level up raises that score by the amount shown. Charms are excluded.",
          pointsPerSourceValue: 50,
          rows: CHIEF_GEAR_SCORE_ROWS,
        },
        {
          id: "speedups",
          label: "Speedups",
          note: "Points per minute of speedup. Gem speedups are excluded by the game.",
          rows: [
            { id: "construction-speedups-1-minute", label: "Construction speedups (1 minute)", pointsPerUnit: 60 },
            { id: "research-speedups-1-minute", label: "Research speedups (1 minute)", pointsPerUnit: 60 },
            { id: "troop-training-and-promotion-speedups-1-minute", label: "Troop training and promotion speedups (1 minute)", pointsPerUnit: 60 },
            { id: "expert-skill-speedups-1-minute", label: "Expert skill speedups (1 minute)", pointsPerUnit: 60 },
          ],
        },
      ],
    },
  ],
};
