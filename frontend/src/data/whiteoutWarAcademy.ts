// Whiteout Survival War Academy Fire Crystal tech.
//
// 264 levels across 30 nodes, three troop trees, 54,017,400 power in total.
//
// WHY THIS FILE EXISTS. whiteoutResearch.ts covers the Research Center only:
// its Growth, Economy and Battle trees come to 7,881,698 power across 720
// levels. The War Academy is a separate building with its own tech, and it was
// missing entirely, which mattered because it holds the single biggest power
// item in the game: the Helios unlock is 8,000,000 power on its own, more than
// the whole Research Center tree put together.
//
// Costs are meat, wood, coal, iron, Steel and Fire Crystal Shards. That closes
// an old caveat too: shards were said to be unspent by anything, because the
// only thing that spends them was not in the data.
//
// The Helios unlock takes 91.3 days of base research, so it is the classic
// upgrade to start well before a power event and finish with speedups on the
// scoring day.
//
// Scraped from wostools.net's War Academy calculator, which embeds the tables
// as JSON. Requirement strings such as "War Academy FC Lv. 5, Flame Legion
// Lv. 12" are parsed into structured prerequisites; all 224 distinct strings
// parsed cleanly. Not verified against the game.
//
// EDIT FREELY: nothing in the optimiser hardcodes a number.

export type WarAcademyTroop = 'infantry' | 'lancer' | 'marksman';

export const WAR_ACADEMY_TROOPS: WarAcademyTroop[] = ['infantry', 'lancer', 'marksman'];

export interface WarAcademyLevel {
  level: number;
  /** Power gained by taking this single level. */
  power: number;
  /** Base research time in seconds, before any research speed buff. */
  seconds: number;
  cost: {
    meat: number;
    wood: number;
    coal: number;
    iron: number;
    steel: number;
    fireCrystalShard: number;
  };
  /** Minimum War Academy Fire Crystal level, 0 when unstated. */
  requiresAcademyFc: number;
  /** Other nodes in the same tree that must already be at the given level. */
  requiresResearch: { key: string; level: number }[];
  /** What the level grants, as the game words it. */
  unlocks: string;
}

export interface WarAcademyNode {
  key: string;
  name: string;
  troop: WarAcademyTroop;
  levels: WarAcademyLevel[];
}

export const whiteoutWarAcademy: WarAcademyNode[] = [
  {
    key: "flameSquad",
    name: "Flame Squad",
    troop: "infantry",
    levels: [
      { level: 1, power: 60000, seconds: 28800, cost: { meat: 300000, wood: 300000, coal: 60000, iron: 15000, steel: 5000, fireCrystalShard: 16 }, requiresAcademyFc: 1, requiresResearch: [], unlocks: "+200 Troop Deployment Capacity" },
      { level: 2, power: 60000, seconds: 46080, cost: { meat: 480000, wood: 480000, coal: 96000, iron: 24000, steel: 8000, fireCrystalShard: 25 }, requiresAcademyFc: 1, requiresResearch: [{ key: "flameSquad", level: 1 }], unlocks: "+200 Troop Deployment Capacity" },
      { level: 3, power: 60000, seconds: 74880, cost: { meat: 780000, wood: 780000, coal: 150000, iron: 39000, steel: 13000, fireCrystalShard: 41 }, requiresAcademyFc: 1, requiresResearch: [{ key: "flameSquad", level: 2 }], unlocks: "+200 Troop Deployment Capacity" },
      { level: 4, power: 60000, seconds: 123840, cost: { meat: 1200000, wood: 1200000, coal: 250000, iron: 64000, steel: 21000, fireCrystalShard: 68 }, requiresAcademyFc: 1, requiresResearch: [{ key: "flameSquad", level: 3 }], unlocks: "+200 Troop Deployment Capacity" },
      { level: 5, power: 60000, seconds: 194400, cost: { meat: 2000000, wood: 2000000, coal: 400000, iron: 100000, steel: 33000, fireCrystalShard: 108 }, requiresAcademyFc: 1, requiresResearch: [{ key: "flameSquad", level: 4 }], unlocks: "+200 Troop Deployment Capacity" },
    ],
  },
  {
    key: "flameShield",
    name: "Flame Shield",
    troop: "infantry",
    levels: [
      { level: 1, power: 82500, seconds: 72000, cost: { meat: 800000, wood: 800000, coal: 160000, iron: 40000, steel: 10000, fireCrystalShard: 40 }, requiresAcademyFc: 1, requiresResearch: [{ key: "flameSquad", level: 3 }], unlocks: "+1.50% Infantry Health" },
      { level: 2, power: 74250, seconds: 100800, cost: { meat: 1100000, wood: 1100000, coal: 220000, iron: 56000, steel: 14000, fireCrystalShard: 56 }, requiresAcademyFc: 2, requiresResearch: [{ key: "flameShield", level: 1 }], unlocks: "+1.50% Infantry Health" },
      { level: 3, power: 90750, seconds: 133200, cost: { meat: 1400000, wood: 1400000, coal: 290000, iron: 74000, steel: 18000, fireCrystalShard: 74 }, requiresAcademyFc: 2, requiresResearch: [{ key: "flameShield", level: 2 }], unlocks: "+3.00% Infantry Health" },
      { level: 4, power: 99000, seconds: 183600, cost: { meat: 2000000, wood: 2000000, coal: 400000, iron: 100000, steel: 25000, fireCrystalShard: 102 }, requiresAcademyFc: 2, requiresResearch: [{ key: "flameSquad", level: 4 }, { key: "flameShield", level: 3 }], unlocks: "+3.00% Infantry Health" },
      { level: 5, power: 95700, seconds: 244800, cost: { meat: 2700000, wood: 2700000, coal: 540000, iron: 130000, steel: 34000, fireCrystalShard: 136 }, requiresAcademyFc: 3, requiresResearch: [{ key: "flameSquad", level: 5 }, { key: "flameShield", level: 4 }], unlocks: "+3.00% Infantry Health" },
      { level: 6, power: 98175, seconds: 331200, cost: { meat: 3600000, wood: 3600000, coal: 730000, iron: 180000, steel: 46000, fireCrystalShard: 184 }, requiresAcademyFc: 3, requiresResearch: [{ key: "flameShield", level: 5 }], unlocks: "+3.00% Infantry Health" },
      { level: 7, power: 122925, seconds: 446400, cost: { meat: 4900000, wood: 4900000, coal: 990000, iron: 240000, steel: 62000, fireCrystalShard: 248 }, requiresAcademyFc: 4, requiresResearch: [{ key: "flameShield", level: 6 }], unlocks: "+5.00% Infantry Health" },
      { level: 8, power: 120450, seconds: 601200, cost: { meat: 6600000, wood: 6600000, coal: 1300000, iron: 330000, steel: 83000, fireCrystalShard: 334 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameShield", level: 7 }], unlocks: "+5.00% Infantry Health" },
    ],
  },
  {
    key: "flameStrike",
    name: "Flame Strike",
    troop: "infantry",
    levels: [
      { level: 1, power: 82500, seconds: 72000, cost: { meat: 800000, wood: 800000, coal: 160000, iron: 40000, steel: 10000, fireCrystalShard: 40 }, requiresAcademyFc: 1, requiresResearch: [{ key: "flameSquad", level: 3 }], unlocks: "+1.50% Infantry Lethality" },
      { level: 2, power: 74250, seconds: 100800, cost: { meat: 1100000, wood: 1100000, coal: 220000, iron: 56000, steel: 14000, fireCrystalShard: 56 }, requiresAcademyFc: 2, requiresResearch: [{ key: "flameStrike", level: 1 }], unlocks: "+1.50% Infantry Lethality" },
      { level: 3, power: 90750, seconds: 133200, cost: { meat: 1400000, wood: 1400000, coal: 290000, iron: 74000, steel: 18000, fireCrystalShard: 74 }, requiresAcademyFc: 2, requiresResearch: [{ key: "flameStrike", level: 2 }], unlocks: "+3.00% Infantry Lethality" },
      { level: 4, power: 99000, seconds: 183600, cost: { meat: 2000000, wood: 2000000, coal: 400000, iron: 100000, steel: 25000, fireCrystalShard: 102 }, requiresAcademyFc: 2, requiresResearch: [{ key: "flameSquad", level: 4 }, { key: "flameStrike", level: 3 }], unlocks: "+3.00% Infantry Lethality" },
      { level: 5, power: 95700, seconds: 244800, cost: { meat: 2700000, wood: 2700000, coal: 540000, iron: 130000, steel: 34000, fireCrystalShard: 136 }, requiresAcademyFc: 3, requiresResearch: [{ key: "flameSquad", level: 5 }, { key: "flameStrike", level: 4 }], unlocks: "+3.00% Infantry Lethality" },
      { level: 6, power: 98175, seconds: 331200, cost: { meat: 3600000, wood: 3600000, coal: 730000, iron: 180000, steel: 46000, fireCrystalShard: 184 }, requiresAcademyFc: 3, requiresResearch: [{ key: "flameStrike", level: 5 }], unlocks: "+3.00% Infantry Lethality" },
      { level: 7, power: 122925, seconds: 446400, cost: { meat: 4900000, wood: 4900000, coal: 990000, iron: 240000, steel: 62000, fireCrystalShard: 248 }, requiresAcademyFc: 4, requiresResearch: [{ key: "flameStrike", level: 6 }], unlocks: "+5.00% Infantry Lethality" },
      { level: 8, power: 120450, seconds: 601200, cost: { meat: 6600000, wood: 6600000, coal: 1300000, iron: 330000, steel: 83000, fireCrystalShard: 334 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameStrike", level: 7 }], unlocks: "+5.00% Infantry Lethality" },
    ],
  },
  {
    key: "flameTomahawk",
    name: "Flame Tomahawk",
    troop: "infantry",
    levels: [
      { level: 1, power: 120000, seconds: 68140, cost: { meat: 700000, wood: 700000, coal: 140000, iron: 35000, steel: 15000, fireCrystalShard: 54 }, requiresAcademyFc: 3, requiresResearch: [{ key: "flameStrike", level: 6 }], unlocks: "+2.00% Infantry Attack" },
      { level: 2, power: 108000, seconds: 83812, cost: { meat: 860000, wood: 860000, coal: 170000, iron: 43000, steel: 18000, fireCrystalShard: 66 }, requiresAcademyFc: 3, requiresResearch: [{ key: "flameTomahawk", level: 1 }], unlocks: "+2.00% Infantry Attack" },
      { level: 3, power: 103200, seconds: 102210, cost: { meat: 1000000, wood: 1000000, coal: 210000, iron: 52000, steel: 22000, fireCrystalShard: 81 }, requiresAcademyFc: 4, requiresResearch: [{ key: "flameTomahawk", level: 2 }], unlocks: "+2.00% Infantry Attack" },
      { level: 4, power: 103200, seconds: 122652, cost: { meat: 1200000, wood: 1200000, coal: 250000, iron: 63000, steel: 27000, fireCrystalShard: 97 }, requiresAcademyFc: 4, requiresResearch: [{ key: "flameTomahawk", level: 3 }], unlocks: "+2.50% Infantry Attack" },
      { level: 5, power: 101100, seconds: 149908, cost: { meat: 1500000, wood: 1500000, coal: 300000, iron: 77000, steel: 33000, fireCrystalShard: 118 }, requiresAcademyFc: 4, requiresResearch: [{ key: "flameTomahawk", level: 4 }], unlocks: "+2.50% Infantry Attack" },
      { level: 6, power: 103800, seconds: 183978, cost: { meat: 1800000, wood: 1800000, coal: 370000, iron: 94000, steel: 40000, fireCrystalShard: 145 }, requiresAcademyFc: 4, requiresResearch: [{ key: "flameTomahawk", level: 5 }], unlocks: "+3.00% Infantry Attack" },
      { level: 7, power: 106200, seconds: 224862, cost: { meat: 2300000, wood: 2300000, coal: 460000, iron: 110000, steel: 49000, fireCrystalShard: 178 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameStrike", level: 7 }, { key: "flameTomahawk", level: 6 }], unlocks: "+3.00% Infantry Attack" },
      { level: 8, power: 107400, seconds: 272560, cost: { meat: 2800000, wood: 2800000, coal: 560000, iron: 140000, steel: 60000, fireCrystalShard: 216 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameStrike", level: 8 }, { key: "flameTomahawk", level: 7 }], unlocks: "+3.00% Infantry Attack" },
      { level: 9, power: 123000, seconds: 340700, cost: { meat: 3500000, wood: 3500000, coal: 700000, iron: 170000, steel: 75000, fireCrystalShard: 270 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameTomahawk", level: 8 }], unlocks: "+5.00% Infantry Attack" },
      { level: 10, power: 123000, seconds: 408840, cost: { meat: 4200000, wood: 4200000, coal: 840000, iron: 210000, steel: 90000, fireCrystalShard: 324 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameTomahawk", level: 9 }], unlocks: "+5.00% Infantry Attack" },
      { level: 11, power: 120000, seconds: 490608, cost: { meat: 5000000, wood: 5000000, coal: 1000000, iron: 250000, steel: 100000, fireCrystalShard: 388 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameTomahawk", level: 10 }], unlocks: "+5.00% Infantry Attack" },
      { level: 12, power: 126000, seconds: 606446, cost: { meat: 6200000, wood: 6200000, coal: 1200000, iron: 310000, steel: 130000, fireCrystalShard: 480 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameTomahawk", level: 11 }], unlocks: "+5.00% Infantry Attack" },
    ],
  },
  {
    key: "flameProtection",
    name: "Flame Protection",
    troop: "infantry",
    levels: [
      { level: 1, power: 120000, seconds: 68140, cost: { meat: 700000, wood: 700000, coal: 140000, iron: 35000, steel: 15000, fireCrystalShard: 54 }, requiresAcademyFc: 3, requiresResearch: [{ key: "flameShield", level: 6 }], unlocks: "+2.00% Infantry Defense" },
      { level: 2, power: 108000, seconds: 83812, cost: { meat: 860000, wood: 860000, coal: 170000, iron: 43000, steel: 18000, fireCrystalShard: 66 }, requiresAcademyFc: 3, requiresResearch: [{ key: "flameProtection", level: 1 }], unlocks: "+2.00% Infantry Defense" },
      { level: 3, power: 103200, seconds: 102210, cost: { meat: 1000000, wood: 1000000, coal: 210000, iron: 52000, steel: 22000, fireCrystalShard: 81 }, requiresAcademyFc: 4, requiresResearch: [{ key: "flameProtection", level: 2 }], unlocks: "+2.00% Infantry Defense" },
      { level: 4, power: 103200, seconds: 122652, cost: { meat: 1200000, wood: 1200000, coal: 250000, iron: 63000, steel: 27000, fireCrystalShard: 97 }, requiresAcademyFc: 4, requiresResearch: [{ key: "flameProtection", level: 3 }], unlocks: "+2.50% Infantry Defense" },
      { level: 5, power: 101100, seconds: 149908, cost: { meat: 1500000, wood: 1500000, coal: 300000, iron: 77000, steel: 33000, fireCrystalShard: 118 }, requiresAcademyFc: 4, requiresResearch: [{ key: "flameProtection", level: 4 }], unlocks: "+2.50% Infantry Defense" },
      { level: 6, power: 103800, seconds: 183978, cost: { meat: 1800000, wood: 1800000, coal: 370000, iron: 94000, steel: 40000, fireCrystalShard: 145 }, requiresAcademyFc: 4, requiresResearch: [{ key: "flameProtection", level: 5 }], unlocks: "+3.00% Infantry Defense" },
      { level: 7, power: 106200, seconds: 224862, cost: { meat: 2300000, wood: 2300000, coal: 460000, iron: 110000, steel: 49000, fireCrystalShard: 178 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameShield", level: 7 }, { key: "flameProtection", level: 6 }], unlocks: "+3.00% Infantry Defense" },
      { level: 8, power: 107400, seconds: 272560, cost: { meat: 2800000, wood: 2800000, coal: 560000, iron: 140000, steel: 60000, fireCrystalShard: 216 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameShield", level: 8 }, { key: "flameProtection", level: 7 }], unlocks: "+3.00% Infantry Defense" },
      { level: 9, power: 123000, seconds: 340700, cost: { meat: 3500000, wood: 3500000, coal: 700000, iron: 170000, steel: 75000, fireCrystalShard: 270 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameProtection", level: 8 }], unlocks: "+5.00% Infantry Defense" },
      { level: 10, power: 123000, seconds: 408840, cost: { meat: 4200000, wood: 4200000, coal: 840000, iron: 210000, steel: 90000, fireCrystalShard: 324 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameProtection", level: 9 }], unlocks: "+5.00% Infantry Defense" },
      { level: 11, power: 120000, seconds: 490608, cost: { meat: 5000000, wood: 5000000, coal: 1000000, iron: 250000, steel: 100000, fireCrystalShard: 388 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameProtection", level: 10 }], unlocks: "+5.00% Infantry Defense" },
      { level: 12, power: 126000, seconds: 606446, cost: { meat: 6200000, wood: 6200000, coal: 1200000, iron: 310000, steel: 130000, fireCrystalShard: 480 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameProtection", level: 11 }], unlocks: "+5.00% Infantry Defense" },
    ],
  },
  {
    key: "flameLegion",
    name: "Flame Legion",
    troop: "infantry",
    levels: [
      { level: 1, power: 150000, seconds: 105617, cost: { meat: 1000000, wood: 1000000, coal: 210000, iron: 54000, steel: 23000, fireCrystalShard: 83 }, requiresAcademyFc: 4, requiresResearch: [{ key: "flameStrike", level: 6 }, { key: "flameShield", level: 6 }], unlocks: "+1,500 Rally Capacity" },
      { level: 2, power: 135000, seconds: 129908, cost: { meat: 1300000, wood: 1300000, coal: 260000, iron: 66000, steel: 28000, fireCrystalShard: 102 }, requiresAcademyFc: 4, requiresResearch: [{ key: "flameLegion", level: 1 }], unlocks: "+1,500 Rally Capacity" },
      { level: 3, power: 175000, seconds: 158425, cost: { meat: 1600000, wood: 1600000, coal: 320000, iron: 81000, steel: 34000, fireCrystalShard: 125 }, requiresAcademyFc: 4, requiresResearch: [{ key: "flameLegion", level: 2 }], unlocks: "+2,000 Rally Capacity" },
      { level: 4, power: 135000, seconds: 190110, cost: { meat: 1900000, wood: 1900000, coal: 390000, iron: 97000, steel: 41000, fireCrystalShard: 150 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameLegion", level: 3 }], unlocks: "+2,000 Rally Capacity" },
      { level: 5, power: 174500, seconds: 232357, cost: { meat: 2300000, wood: 2300000, coal: 470000, iron: 110000, steel: 51000, fireCrystalShard: 184 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameLegion", level: 4 }], unlocks: "+2,500 Rally Capacity" },
      { level: 6, power: 142500, seconds: 285165, cost: { meat: 2900000, wood: 2900000, coal: 580000, iron: 140000, steel: 62000, fireCrystalShard: 225 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameLegion", level: 5 }], unlocks: "+2,500 Rally Capacity" },
      { level: 7, power: 146500, seconds: 348536, cost: { meat: 3500000, wood: 3500000, coal: 710000, iron: 170000, steel: 76000, fireCrystalShard: 276 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameShield", level: 7 }, { key: "flameStrike", level: 7 }, { key: "flameLegion", level: 6 }], unlocks: "+2,500 Rally Capacity" },
      { level: 8, power: 184000, seconds: 422468, cost: { meat: 4300000, wood: 4300000, coal: 860000, iron: 210000, steel: 93000, fireCrystalShard: 334 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameShield", level: 8 }, { key: "flameStrike", level: 8 }, { key: "flameLegion", level: 7 }], unlocks: "+3,000 Rally Capacity" },
      { level: 9, power: 122500, seconds: 528085, cost: { meat: 5400000, wood: 5400000, coal: 1000000, iron: 270000, steel: 110000, fireCrystalShard: 418 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameLegion", level: 8 }], unlocks: "+3,500 Rally Capacity" },
      { level: 10, power: 160000, seconds: 633702, cost: { meat: 6500000, wood: 6500000, coal: 1300000, iron: 320000, steel: 130000, fireCrystalShard: 502 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameLegion", level: 9 }], unlocks: "+4,000 Rally Capacity" },
      { level: 11, power: 157000, seconds: 760442, cost: { meat: 7800000, wood: 7800000, coal: 1500000, iron: 390000, steel: 160000, fireCrystalShard: 602 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameLegion", level: 10 }], unlocks: "+4,000 Rally Capacity" },
      { level: 12, power: 194000, seconds: 939991, cost: { meat: 9600000, wood: 9600000, coal: 1900000, iron: 480000, steel: 200000, fireCrystalShard: 744 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameLegion", level: 11 }], unlocks: "+4,500 Rally Capacity" },
    ],
  },
  {
    key: "heliosInfantry",
    name: "Helios Infantry",
    troop: "infantry",
    levels: [
      { level: 1, power: 8000000, seconds: 7892100, cost: { meat: 85000000, wood: 85000000, coal: 17000000, iron: 4200000, steel: 1000000, fireCrystalShard: 2236 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameTomahawk", level: 12 }, { key: "flameProtection", level: 12 }, { key: "flameLegion", level: 12 }], unlocks: "Unlock XI Helios Infantry" },
    ],
  },
  {
    key: "heliosInfantryTraining",
    name: "Helios Infantry Training",
    troop: "infantry",
    levels: [
      { level: 1, power: 65000, seconds: 180000, cost: { meat: 2500000, wood: 2500000, coal: 500000, iron: 120000, steel: 30000, fireCrystalShard: 102 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosInfantry", level: 1 }], unlocks: "Helios Infantry Training Cost Reduction: 5%, +100 Troops Deployment Capacity" },
      { level: 2, power: 65000, seconds: 243000, cost: { meat: 3300000, wood: 3300000, coal: 670000, iron: 160000, steel: 40000, fireCrystalShard: 137 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosInfantryTraining", level: 1 }], unlocks: "Helios Infantry Training Cost Reduction: 5%, +100 Troops Deployment Capacity" },
      { level: 3, power: 65000, seconds: 333000, cost: { meat: 4600000, wood: 4600000, coal: 920000, iron: 230000, steel: 55000, fireCrystalShard: 188 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosInfantryTraining", level: 2 }], unlocks: "Helios Infantry Training Cost Reduction: 5%, +100 Troops Deployment Capacity" },
      { level: 4, power: 65000, seconds: 450000, cost: { meat: 6200000, wood: 6200000, coal: 1200000, iron: 310000, steel: 75000, fireCrystalShard: 255 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosInfantryTraining", level: 3 }], unlocks: "Helios Infantry Training Cost Reduction: 5%, +100 Troops Deployment Capacity" },
      { level: 5, power: 65000, seconds: 603000, cost: { meat: 8300000, wood: 8300000, coal: 1600000, iron: 410000, steel: 100000, fireCrystalShard: 341 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosInfantryTraining", level: 4 }], unlocks: "Helios Infantry Training Cost Reduction: 5%, +100 Troops Deployment Capacity" },
      { level: 6, power: 65000, seconds: 810000, cost: { meat: 11000000, wood: 11000000, coal: 2200000, iron: 560000, steel: 130000, fireCrystalShard: 459 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosInfantryTraining", level: 5 }], unlocks: "Helios Infantry Training Cost Reduction: 5%, +100 Troops Deployment Capacity" },
      { level: 7, power: 65000, seconds: 1080000, cost: { meat: 15000000, wood: 15000000, coal: 3000000, iron: 750000, steel: 180000, fireCrystalShard: 612 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosInfantryTraining", level: 6 }], unlocks: "Helios Infantry Training Cost Reduction: 5%, +100 Troops Deployment Capacity" },
      { level: 8, power: 65000, seconds: 1476000, cost: { meat: 20000000, wood: 20000000, coal: 4100000, iron: 1000000, steel: 240000, fireCrystalShard: 836 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosInfantryTraining", level: 7 }], unlocks: "Helios Infantry Training Cost Reduction: 5%, +100 Troops Deployment Capacity" },
      { level: 9, power: 65000, seconds: 1980000, cost: { meat: 27000000, wood: 27000000, coal: 5500000, iron: 1300000, steel: 330000, fireCrystalShard: 1122 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosInfantryTraining", level: 8 }], unlocks: "Helios Infantry Training Cost Reduction: 5%, +100 Troops Deployment Capacity" },
      { level: 10, power: 65000, seconds: 2700000, cost: { meat: 37000000, wood: 37000000, coal: 7500000, iron: 1800000, steel: 450000, fireCrystalShard: 1530 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosInfantryTraining", level: 9 }], unlocks: "Helios Infantry Training Cost Reduction: 5%, +100 Troops Deployment Capacity" },
    ],
  },
  {
    key: "heliosInfantryHealing",
    name: "Helios Infantry Healing",
    troop: "infantry",
    levels: [
      { level: 1, power: 155000, seconds: 180000, cost: { meat: 2500000, wood: 2500000, coal: 500000, iron: 120000, steel: 30000, fireCrystalShard: 102 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosInfantry", level: 1 }], unlocks: "Helios Infantry Healing Cost Reduction: 5%, +2.00% Infantry Attack" },
      { level: 2, power: 155000, seconds: 243000, cost: { meat: 3300000, wood: 3300000, coal: 670000, iron: 160000, steel: 40000, fireCrystalShard: 137 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosInfantryHealing", level: 1 }], unlocks: "Helios Infantry Healing Cost Reduction: 5%, +2.00% Infantry Attack" },
      { level: 3, power: 155000, seconds: 333000, cost: { meat: 4600000, wood: 4600000, coal: 920000, iron: 230000, steel: 55000, fireCrystalShard: 188 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosInfantryHealing", level: 2 }], unlocks: "Helios Infantry Healing Cost Reduction: 5%, +2.00% Infantry Attack" },
      { level: 4, power: 155000, seconds: 450000, cost: { meat: 6200000, wood: 6200000, coal: 1200000, iron: 310000, steel: 75000, fireCrystalShard: 255 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosInfantryHealing", level: 3 }], unlocks: "Helios Infantry Healing Cost Reduction: 5%, +2.00% Infantry Attack" },
      { level: 5, power: 155000, seconds: 603000, cost: { meat: 8300000, wood: 8300000, coal: 1600000, iron: 410000, steel: 100000, fireCrystalShard: 341 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosInfantryHealing", level: 4 }], unlocks: "Helios Infantry Healing Cost Reduction: 5%, +2.00% Infantry Attack" },
      { level: 6, power: 155000, seconds: 810000, cost: { meat: 11000000, wood: 11000000, coal: 2200000, iron: 560000, steel: 130000, fireCrystalShard: 459 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosInfantryHealing", level: 5 }], unlocks: "Helios Infantry Healing Cost Reduction: 5%, +2.00% Infantry Attack" },
      { level: 7, power: 155000, seconds: 1080000, cost: { meat: 15000000, wood: 15000000, coal: 3000000, iron: 750000, steel: 180000, fireCrystalShard: 612 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosInfantryHealing", level: 6 }], unlocks: "Helios Infantry Healing Cost Reduction: 5%, +2.00% Infantry Attack" },
      { level: 8, power: 155000, seconds: 1476000, cost: { meat: 20000000, wood: 20000000, coal: 4100000, iron: 1000000, steel: 240000, fireCrystalShard: 836 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosInfantryHealing", level: 7 }], unlocks: "Helios Infantry Healing Cost Reduction: 5%, +2.00% Infantry Attack" },
      { level: 9, power: 155000, seconds: 1980000, cost: { meat: 27000000, wood: 27000000, coal: 5500000, iron: 1300000, steel: 330000, fireCrystalShard: 1122 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosInfantryHealing", level: 8 }], unlocks: "Helios Infantry Healing Cost Reduction: 5%, +2.00% Infantry Attack" },
      { level: 10, power: 155000, seconds: 2700000, cost: { meat: 37000000, wood: 37000000, coal: 7500000, iron: 1800000, steel: 450000, fireCrystalShard: 1530 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosInfantryHealing", level: 9 }], unlocks: "Helios Infantry Healing Cost Reduction: 5%, +2.00% Infantry Attack" },
    ],
  },
  {
    key: "heliosInfantryFirstAid",
    name: "Helios Infantry First Aid",
    troop: "infantry",
    levels: [
      { level: 1, power: 137250, seconds: 90000, cost: { meat: 1200000, wood: 1200000, coal: 250000, iron: 62000, steel: 15000, fireCrystalShard: 51 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosInfantry", level: 1 }], unlocks: "Helios Infantry Healing Time Reduction: 1.50%, +2.00% Infantry Defense" },
      { level: 2, power: 137250, seconds: 121500, cost: { meat: 1600000, wood: 1600000, coal: 330000, iron: 84000, steel: 20000, fireCrystalShard: 68 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosInfantryFirstAid", level: 1 }], unlocks: "Helios Infantry Healing Time Reduction: 1.50%, +2.00% Infantry Defense" },
      { level: 3, power: 137250, seconds: 166500, cost: { meat: 2300000, wood: 2300000, coal: 460000, iron: 110000, steel: 27000, fireCrystalShard: 94 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosInfantryFirstAid", level: 2 }], unlocks: "Helios Infantry Healing Time Reduction: 1.50%, +2.00% Infantry Defense" },
      { level: 4, power: 137250, seconds: 225000, cost: { meat: 3100000, wood: 3100000, coal: 620000, iron: 150000, steel: 37000, fireCrystalShard: 127 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosInfantryFirstAid", level: 3 }], unlocks: "Helios Infantry Healing Time Reduction: 1.50%, +2.00% Infantry Defense" },
      { level: 5, power: 137250, seconds: 301500, cost: { meat: 4100000, wood: 4100000, coal: 830000, iron: 200000, steel: 50000, fireCrystalShard: 170 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosInfantryFirstAid", level: 4 }], unlocks: "Helios Infantry Healing Time Reduction: 1.50%, +2.00% Infantry Defense" },
      { level: 6, power: 137250, seconds: 405000, cost: { meat: 5600000, wood: 5600000, coal: 1100000, iron: 280000, steel: 67000, fireCrystalShard: 229 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosInfantryFirstAid", level: 5 }], unlocks: "Helios Infantry Healing Time Reduction: 1.50%, +2.00% Infantry Defense" },
      { level: 7, power: 137250, seconds: 540000, cost: { meat: 7500000, wood: 7500000, coal: 1500000, iron: 370000, steel: 90000, fireCrystalShard: 308 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosInfantryFirstAid", level: 6 }], unlocks: "Helios Infantry Healing Time Reduction: 1.50%, +2.00% Infantry Defense" },
      { level: 8, power: 137250, seconds: 738000, cost: { meat: 10000000, wood: 10000000, coal: 2000000, iron: 510000, steel: 120000, fireCrystalShard: 418 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosInfantryFirstAid", level: 7 }], unlocks: "Helios Infantry Healing Time Reduction: 1.50%, +2.00% Infantry Defense" },
      { level: 9, power: 137250, seconds: 990000, cost: { meat: 13000000, wood: 13000000, coal: 2700000, iron: 680000, steel: 160000, fireCrystalShard: 561 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosInfantryFirstAid", level: 8 }], unlocks: "Helios Infantry Healing Time Reduction: 1.50%, +2.00% Infantry Defense" },
      { level: 10, power: 137250, seconds: 1350000, cost: { meat: 18000000, wood: 18000000, coal: 3700000, iron: 930000, steel: 220000, fireCrystalShard: 765 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosInfantryFirstAid", level: 9 }], unlocks: "Helios Infantry Healing Time Reduction: 1.50%, +2.00% Infantry Defense" },
    ],
  },
  {
    key: "flameSquad",
    name: "Flame Squad",
    troop: "lancer",
    levels: [
      { level: 1, power: 60000, seconds: 28800, cost: { meat: 300000, wood: 300000, coal: 60000, iron: 15000, steel: 5000, fireCrystalShard: 16 }, requiresAcademyFc: 1, requiresResearch: [], unlocks: "+200 Troop Deployment Capacity" },
      { level: 2, power: 60000, seconds: 46080, cost: { meat: 480000, wood: 480000, coal: 96000, iron: 24000, steel: 8000, fireCrystalShard: 25 }, requiresAcademyFc: 1, requiresResearch: [{ key: "flameSquad", level: 1 }], unlocks: "+200 Troop Deployment Capacity" },
      { level: 3, power: 60000, seconds: 74880, cost: { meat: 780000, wood: 780000, coal: 150000, iron: 39000, steel: 13000, fireCrystalShard: 41 }, requiresAcademyFc: 1, requiresResearch: [{ key: "flameSquad", level: 2 }], unlocks: "+200 Troop Deployment Capacity" },
      { level: 4, power: 60000, seconds: 123840, cost: { meat: 1200000, wood: 1200000, coal: 250000, iron: 64000, steel: 21000, fireCrystalShard: 68 }, requiresAcademyFc: 1, requiresResearch: [{ key: "flameSquad", level: 3 }], unlocks: "+200 Troop Deployment Capacity" },
      { level: 5, power: 60000, seconds: 194400, cost: { meat: 2000000, wood: 2000000, coal: 400000, iron: 100000, steel: 33000, fireCrystalShard: 108 }, requiresAcademyFc: 1, requiresResearch: [{ key: "flameSquad", level: 4 }], unlocks: "+200 Troop Deployment Capacity" },
    ],
  },
  {
    key: "blazingArmor",
    name: "Blazing Armor",
    troop: "lancer",
    levels: [
      { level: 1, power: 82500, seconds: 72000, cost: { meat: 800000, wood: 800000, coal: 160000, iron: 40000, steel: 10000, fireCrystalShard: 40 }, requiresAcademyFc: 1, requiresResearch: [{ key: "flameSquad", level: 3 }], unlocks: "+1.50% Lancer Health" },
      { level: 2, power: 74250, seconds: 100800, cost: { meat: 1100000, wood: 1100000, coal: 220000, iron: 56000, steel: 14000, fireCrystalShard: 56 }, requiresAcademyFc: 2, requiresResearch: [{ key: "blazingArmor", level: 1 }], unlocks: "+1.50% Lancer Health" },
      { level: 3, power: 90750, seconds: 133200, cost: { meat: 1400000, wood: 1400000, coal: 290000, iron: 74000, steel: 18000, fireCrystalShard: 74 }, requiresAcademyFc: 2, requiresResearch: [{ key: "blazingArmor", level: 2 }], unlocks: "+3.00% Lancer Health" },
      { level: 4, power: 99000, seconds: 183600, cost: { meat: 2000000, wood: 2000000, coal: 400000, iron: 100000, steel: 25000, fireCrystalShard: 102 }, requiresAcademyFc: 2, requiresResearch: [{ key: "flameSquad", level: 4 }, { key: "blazingArmor", level: 3 }], unlocks: "+3.00% Lancer Health" },
      { level: 5, power: 95700, seconds: 244800, cost: { meat: 2700000, wood: 2700000, coal: 540000, iron: 130000, steel: 34000, fireCrystalShard: 136 }, requiresAcademyFc: 3, requiresResearch: [{ key: "flameSquad", level: 5 }, { key: "blazingArmor", level: 4 }], unlocks: "+3.00% Lancer Health" },
      { level: 6, power: 98175, seconds: 331200, cost: { meat: 3600000, wood: 3600000, coal: 730000, iron: 180000, steel: 46000, fireCrystalShard: 184 }, requiresAcademyFc: 3, requiresResearch: [{ key: "blazingArmor", level: 5 }], unlocks: "+3.00% Lancer Health" },
      { level: 7, power: 122925, seconds: 446400, cost: { meat: 4900000, wood: 4900000, coal: 990000, iron: 240000, steel: 46000, fireCrystalShard: 248 }, requiresAcademyFc: 4, requiresResearch: [{ key: "blazingArmor", level: 6 }], unlocks: "+5.00% Lancer Health" },
      { level: 8, power: 120450, seconds: 601200, cost: { meat: 6600000, wood: 6600000, coal: 1300000, iron: 330000, steel: 83000, fireCrystalShard: 334 }, requiresAcademyFc: 5, requiresResearch: [{ key: "blazingArmor", level: 7 }], unlocks: "+5.00% Lancer Health" },
    ],
  },
  {
    key: "blazingCharge",
    name: "Blazing Charge",
    troop: "lancer",
    levels: [
      { level: 1, power: 82500, seconds: 72000, cost: { meat: 800000, wood: 800000, coal: 160000, iron: 40000, steel: 10000, fireCrystalShard: 40 }, requiresAcademyFc: 1, requiresResearch: [{ key: "flameSquad", level: 3 }], unlocks: "+1.50% Lancer Lethality" },
      { level: 2, power: 74250, seconds: 100800, cost: { meat: 1100000, wood: 1100000, coal: 220000, iron: 56000, steel: 14000, fireCrystalShard: 56 }, requiresAcademyFc: 2, requiresResearch: [{ key: "blazingCharge", level: 1 }], unlocks: "+1.50% Lancer Lethality" },
      { level: 3, power: 90750, seconds: 133200, cost: { meat: 1400000, wood: 1400000, coal: 290000, iron: 74000, steel: 18000, fireCrystalShard: 74 }, requiresAcademyFc: 2, requiresResearch: [{ key: "blazingCharge", level: 2 }], unlocks: "+3.00% Lancer Lethality" },
      { level: 4, power: 99000, seconds: 183600, cost: { meat: 2000000, wood: 2000000, coal: 400000, iron: 100000, steel: 25000, fireCrystalShard: 102 }, requiresAcademyFc: 2, requiresResearch: [{ key: "flameSquad", level: 4 }, { key: "blazingCharge", level: 3 }], unlocks: "+3.00% Lancer Lethality" },
      { level: 5, power: 95700, seconds: 244800, cost: { meat: 2700000, wood: 2700000, coal: 540000, iron: 130000, steel: 34000, fireCrystalShard: 136 }, requiresAcademyFc: 3, requiresResearch: [{ key: "flameSquad", level: 5 }, { key: "blazingCharge", level: 4 }], unlocks: "+3.00% Lancer Lethality" },
      { level: 6, power: 98175, seconds: 331200, cost: { meat: 3600000, wood: 3600000, coal: 730000, iron: 180000, steel: 46000, fireCrystalShard: 184 }, requiresAcademyFc: 3, requiresResearch: [{ key: "blazingCharge", level: 5 }], unlocks: "+3.00% Lancer Lethality" },
      { level: 7, power: 122925, seconds: 446400, cost: { meat: 4900000, wood: 4900000, coal: 990000, iron: 240000, steel: 62000, fireCrystalShard: 248 }, requiresAcademyFc: 4, requiresResearch: [{ key: "blazingCharge", level: 6 }], unlocks: "+5.00% Lancer Lethality" },
      { level: 8, power: 120450, seconds: 601200, cost: { meat: 6600000, wood: 6600000, coal: 1300000, iron: 330000, steel: 83000, fireCrystalShard: 334 }, requiresAcademyFc: 5, requiresResearch: [{ key: "blazingCharge", level: 7 }], unlocks: "+5.00% Lancer Lethality" },
    ],
  },
  {
    key: "blazingLance",
    name: "Blazing Lance",
    troop: "lancer",
    levels: [
      { level: 1, power: 120000, seconds: 68140, cost: { meat: 700000, wood: 700000, coal: 140000, iron: 35000, steel: 15000, fireCrystalShard: 54 }, requiresAcademyFc: 3, requiresResearch: [{ key: "blazingCharge", level: 6 }], unlocks: "+2.00% Lancer Attack" },
      { level: 2, power: 108000, seconds: 83812, cost: { meat: 860000, wood: 860000, coal: 170000, iron: 43000, steel: 18000, fireCrystalShard: 66 }, requiresAcademyFc: 3, requiresResearch: [{ key: "blazingLance", level: 1 }], unlocks: "+2.00% Lancer Attack" },
      { level: 3, power: 103200, seconds: 102210, cost: { meat: 1000000, wood: 1000000, coal: 210000, iron: 52000, steel: 22000, fireCrystalShard: 81 }, requiresAcademyFc: 4, requiresResearch: [{ key: "blazingLance", level: 2 }], unlocks: "+2.00% Lancer Attack" },
      { level: 4, power: 103200, seconds: 122652, cost: { meat: 1200000, wood: 1200000, coal: 250000, iron: 63000, steel: 27000, fireCrystalShard: 97 }, requiresAcademyFc: 4, requiresResearch: [{ key: "blazingLance", level: 3 }], unlocks: "+2.50% Lancer Attack" },
      { level: 5, power: 101100, seconds: 149908, cost: { meat: 1500000, wood: 1500000, coal: 300000, iron: 77000, steel: 33000, fireCrystalShard: 118 }, requiresAcademyFc: 4, requiresResearch: [{ key: "blazingLance", level: 4 }], unlocks: "+2.50% Lancer Attack" },
      { level: 6, power: 103800, seconds: 183978, cost: { meat: 1800000, wood: 1800000, coal: 370000, iron: 94000, steel: 40000, fireCrystalShard: 145 }, requiresAcademyFc: 4, requiresResearch: [{ key: "blazingLance", level: 5 }], unlocks: "+3.00% Lancer Attack" },
      { level: 7, power: 106200, seconds: 224862, cost: { meat: 2300000, wood: 2300000, coal: 460000, iron: 110000, steel: 49000, fireCrystalShard: 178 }, requiresAcademyFc: 5, requiresResearch: [{ key: "blazingCharge", level: 7 }, { key: "blazingLance", level: 6 }], unlocks: "+3.00% Lancer Attack" },
      { level: 8, power: 107400, seconds: 272560, cost: { meat: 2800000, wood: 2800000, coal: 560000, iron: 140000, steel: 60000, fireCrystalShard: 216 }, requiresAcademyFc: 5, requiresResearch: [{ key: "blazingCharge", level: 8 }, { key: "blazingLance", level: 7 }], unlocks: "+3.00% Lancer Attack" },
      { level: 9, power: 123000, seconds: 340700, cost: { meat: 3500000, wood: 3500000, coal: 700000, iron: 170000, steel: 75000, fireCrystalShard: 270 }, requiresAcademyFc: 5, requiresResearch: [{ key: "blazingLance", level: 8 }], unlocks: "+5.00% Lancer Attack" },
      { level: 10, power: 123000, seconds: 408840, cost: { meat: 4200000, wood: 4200000, coal: 840000, iron: 210000, steel: 90000, fireCrystalShard: 324 }, requiresAcademyFc: 5, requiresResearch: [{ key: "blazingLance", level: 9 }], unlocks: "+5.00% Lancer Attack" },
      { level: 11, power: 120000, seconds: 490608, cost: { meat: 5000000, wood: 5000000, coal: 1000000, iron: 250000, steel: 100000, fireCrystalShard: 388 }, requiresAcademyFc: 5, requiresResearch: [{ key: "blazingLance", level: 10 }], unlocks: "+5.00% Lancer Attack" },
      { level: 12, power: 126000, seconds: 606446, cost: { meat: 6200000, wood: 6200000, coal: 1200000, iron: 310000, steel: 130000, fireCrystalShard: 480 }, requiresAcademyFc: 5, requiresResearch: [{ key: "blazingLance", level: 11 }], unlocks: "+5.00% Lancer Attack" },
    ],
  },
  {
    key: "blazingGuardian",
    name: "Blazing Guardian",
    troop: "lancer",
    levels: [
      { level: 1, power: 120000, seconds: 68140, cost: { meat: 700000, wood: 700000, coal: 140000, iron: 35000, steel: 15000, fireCrystalShard: 54 }, requiresAcademyFc: 3, requiresResearch: [{ key: "blazingArmor", level: 6 }], unlocks: "+2.00% Lancer Defense" },
      { level: 2, power: 108000, seconds: 83812, cost: { meat: 860000, wood: 860000, coal: 170000, iron: 43000, steel: 18000, fireCrystalShard: 66 }, requiresAcademyFc: 3, requiresResearch: [{ key: "blazingGuardian", level: 1 }], unlocks: "+2.00% Lancer Defense" },
      { level: 3, power: 103200, seconds: 102210, cost: { meat: 1000000, wood: 1000000, coal: 210000, iron: 52000, steel: 22000, fireCrystalShard: 81 }, requiresAcademyFc: 4, requiresResearch: [{ key: "blazingGuardian", level: 2 }], unlocks: "+2.00% Lancer Defense" },
      { level: 4, power: 103200, seconds: 122652, cost: { meat: 1200000, wood: 1200000, coal: 250000, iron: 63000, steel: 27000, fireCrystalShard: 97 }, requiresAcademyFc: 4, requiresResearch: [{ key: "blazingGuardian", level: 3 }], unlocks: "+2.50% Lancer Defense" },
      { level: 5, power: 101100, seconds: 149908, cost: { meat: 1500000, wood: 1500000, coal: 300000, iron: 77000, steel: 33000, fireCrystalShard: 118 }, requiresAcademyFc: 4, requiresResearch: [{ key: "blazingGuardian", level: 4 }], unlocks: "+2.50% Lancer Defense" },
      { level: 6, power: 103800, seconds: 183978, cost: { meat: 1800000, wood: 1800000, coal: 370000, iron: 94000, steel: 40000, fireCrystalShard: 145 }, requiresAcademyFc: 4, requiresResearch: [{ key: "blazingGuardian", level: 5 }], unlocks: "+3.00% Lancer Defense" },
      { level: 7, power: 106200, seconds: 224862, cost: { meat: 2300000, wood: 2300000, coal: 460000, iron: 110000, steel: 49000, fireCrystalShard: 178 }, requiresAcademyFc: 5, requiresResearch: [{ key: "blazingArmor", level: 7 }, { key: "blazingGuardian", level: 6 }], unlocks: "+3.00% Lancer Defense" },
      { level: 8, power: 107400, seconds: 272560, cost: { meat: 2800000, wood: 2800000, coal: 560000, iron: 140000, steel: 60000, fireCrystalShard: 216 }, requiresAcademyFc: 5, requiresResearch: [{ key: "blazingArmor", level: 8 }, { key: "blazingGuardian", level: 7 }], unlocks: "+3.00% Lancer Defense" },
      { level: 9, power: 123000, seconds: 340700, cost: { meat: 3500000, wood: 3500000, coal: 700000, iron: 170000, steel: 75000, fireCrystalShard: 270 }, requiresAcademyFc: 5, requiresResearch: [{ key: "blazingGuardian", level: 8 }], unlocks: "+5.00% Lancer Defense" },
      { level: 10, power: 123000, seconds: 408840, cost: { meat: 4200000, wood: 4200000, coal: 840000, iron: 210000, steel: 90000, fireCrystalShard: 324 }, requiresAcademyFc: 5, requiresResearch: [{ key: "blazingGuardian", level: 9 }], unlocks: "+5.00% Lancer Defense" },
      { level: 11, power: 120000, seconds: 490608, cost: { meat: 5000000, wood: 5000000, coal: 1000000, iron: 250000, steel: 100000, fireCrystalShard: 388 }, requiresAcademyFc: 5, requiresResearch: [{ key: "blazingGuardian", level: 10 }], unlocks: "+5.00% Lancer Defense" },
      { level: 12, power: 126000, seconds: 606446, cost: { meat: 6200000, wood: 6200000, coal: 1200000, iron: 310000, steel: 130000, fireCrystalShard: 480 }, requiresAcademyFc: 5, requiresResearch: [{ key: "blazingGuardian", level: 11 }], unlocks: "+5.00% Lancer Defense" },
    ],
  },
  {
    key: "flameLegion",
    name: "Flame Legion",
    troop: "lancer",
    levels: [
      { level: 1, power: 150000, seconds: 105617, cost: { meat: 1000000, wood: 1000000, coal: 210000, iron: 54000, steel: 23000, fireCrystalShard: 83 }, requiresAcademyFc: 4, requiresResearch: [{ key: "blazingArmor", level: 6 }, { key: "blazingCharge", level: 6 }], unlocks: "+1,500 Rally Capacity" },
      { level: 2, power: 135000, seconds: 129908, cost: { meat: 1300000, wood: 1300000, coal: 260000, iron: 66000, steel: 28000, fireCrystalShard: 102 }, requiresAcademyFc: 4, requiresResearch: [{ key: "flameLegion", level: 1 }], unlocks: "+1,500 Rally Capacity" },
      { level: 3, power: 175000, seconds: 158425, cost: { meat: 1600000, wood: 1600000, coal: 320000, iron: 81000, steel: 34000, fireCrystalShard: 125 }, requiresAcademyFc: 4, requiresResearch: [{ key: "flameLegion", level: 2 }], unlocks: "+2,000 Rally Capacity" },
      { level: 4, power: 135000, seconds: 190110, cost: { meat: 1900000, wood: 1900000, coal: 390000, iron: 97000, steel: 41000, fireCrystalShard: 150 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameLegion", level: 3 }], unlocks: "+2,000 Rally Capacity" },
      { level: 5, power: 174500, seconds: 232357, cost: { meat: 2300000, wood: 2300000, coal: 470000, iron: 110000, steel: 51000, fireCrystalShard: 184 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameLegion", level: 4 }], unlocks: "+2,500 Rally Capacity" },
      { level: 6, power: 142500, seconds: 285165, cost: { meat: 2900000, wood: 2900000, coal: 580000, iron: 140000, steel: 62000, fireCrystalShard: 225 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameLegion", level: 5 }], unlocks: "+2,500 Rally Capacity" },
      { level: 7, power: 146500, seconds: 348536, cost: { meat: 3500000, wood: 3500000, coal: 710000, iron: 170000, steel: 76000, fireCrystalShard: 276 }, requiresAcademyFc: 5, requiresResearch: [{ key: "blazingArmor", level: 7 }, { key: "blazingCharge", level: 7 }, { key: "flameLegion", level: 6 }], unlocks: "+2,500 Rally Capacity" },
      { level: 8, power: 184000, seconds: 422468, cost: { meat: 4300000, wood: 4300000, coal: 860000, iron: 210000, steel: 93000, fireCrystalShard: 334 }, requiresAcademyFc: 5, requiresResearch: [{ key: "blazingArmor", level: 8 }, { key: "blazingCharge", level: 8 }, { key: "flameLegion", level: 7 }], unlocks: "+3,000 Rally Capacity" },
      { level: 9, power: 122500, seconds: 528085, cost: { meat: 5400000, wood: 5400000, coal: 1000000, iron: 270000, steel: 110000, fireCrystalShard: 418 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameLegion", level: 8 }], unlocks: "+3,500 Rally Capacity" },
      { level: 10, power: 160000, seconds: 633702, cost: { meat: 6500000, wood: 6500000, coal: 1300000, iron: 320000, steel: 130000, fireCrystalShard: 502 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameLegion", level: 9 }], unlocks: "+4,000 Rally Capacity" },
      { level: 11, power: 157000, seconds: 760442, cost: { meat: 7800000, wood: 7800000, coal: 1500000, iron: 390000, steel: 160000, fireCrystalShard: 602 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameLegion", level: 10 }], unlocks: "+4,000 Rally Capacity" },
      { level: 12, power: 194000, seconds: 939991, cost: { meat: 9600000, wood: 9600000, coal: 1900000, iron: 480000, steel: 200000, fireCrystalShard: 744 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameLegion", level: 11 }], unlocks: "+4,500 Rally Capacity" },
    ],
  },
  {
    key: "heliosLancer",
    name: "Helios Lancer",
    troop: "lancer",
    levels: [
      { level: 1, power: 8000000, seconds: 7892100, cost: { meat: 85000000, wood: 85000000, coal: 17000000, iron: 4200000, steel: 1000000, fireCrystalShard: 2236 }, requiresAcademyFc: 5, requiresResearch: [{ key: "blazingLance", level: 12 }, { key: "blazingGuardian", level: 12 }, { key: "flameLegion", level: 12 }], unlocks: "Unlock XI Helios Lancer" },
    ],
  },
  {
    key: "heliosLancerTraining",
    name: "Helios Lancer Training",
    troop: "lancer",
    levels: [
      { level: 1, power: 65000, seconds: 180000, cost: { meat: 2500000, wood: 2500000, coal: 500000, iron: 120000, steel: 30000, fireCrystalShard: 102 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosLancer", level: 1 }], unlocks: "Helios Lancer Training Cost Reduction: 5%, +100 Troops Deployment Capacity" },
      { level: 2, power: 65000, seconds: 243000, cost: { meat: 3300000, wood: 3300000, coal: 670000, iron: 160000, steel: 40000, fireCrystalShard: 137 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosLancerTraining", level: 1 }], unlocks: "Helios Lancer Training Cost Reduction: 5%, +100 Troops Deployment Capacity" },
      { level: 3, power: 65000, seconds: 333000, cost: { meat: 4600000, wood: 4600000, coal: 920000, iron: 230000, steel: 55000, fireCrystalShard: 188 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosLancerTraining", level: 2 }], unlocks: "Helios Lancer Training Cost Reduction: 5%, +100 Troops Deployment Capacity" },
      { level: 4, power: 65000, seconds: 450000, cost: { meat: 6200000, wood: 6200000, coal: 1200000, iron: 310000, steel: 75000, fireCrystalShard: 255 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosLancerTraining", level: 3 }], unlocks: "Helios Lancer Training Cost Reduction: 5%, +100 Troops Deployment Capacity" },
      { level: 5, power: 65000, seconds: 603000, cost: { meat: 8300000, wood: 8300000, coal: 1600000, iron: 410000, steel: 100000, fireCrystalShard: 341 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosLancerTraining", level: 4 }], unlocks: "Helios Lancer Training Cost Reduction: 5%, +100 Troops Deployment Capacity" },
      { level: 6, power: 65000, seconds: 810000, cost: { meat: 11000000, wood: 11000000, coal: 2200000, iron: 560000, steel: 130000, fireCrystalShard: 459 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosLancerTraining", level: 5 }], unlocks: "Helios Lancer Training Cost Reduction: 5%, +100 Troops Deployment Capacity" },
      { level: 7, power: 65000, seconds: 1080000, cost: { meat: 15000000, wood: 15000000, coal: 3000000, iron: 750000, steel: 180000, fireCrystalShard: 612 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosLancerTraining", level: 6 }], unlocks: "Helios Lancer Training Cost Reduction: 5%, +100 Troops Deployment Capacity" },
      { level: 8, power: 65000, seconds: 1476000, cost: { meat: 20000000, wood: 20000000, coal: 4100000, iron: 1000000, steel: 240000, fireCrystalShard: 836 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosLancerTraining", level: 7 }], unlocks: "Helios Lancer Training Cost Reduction: 5%, +100 Troops Deployment Capacity" },
      { level: 9, power: 65000, seconds: 1980000, cost: { meat: 27000000, wood: 27000000, coal: 5500000, iron: 1300000, steel: 330000, fireCrystalShard: 1122 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosLancerTraining", level: 8 }], unlocks: "Helios Lancer Training Cost Reduction: 5%, +100 Troops Deployment Capacity" },
      { level: 10, power: 65000, seconds: 2700000, cost: { meat: 37000000, wood: 37000000, coal: 7500000, iron: 1800000, steel: 450000, fireCrystalShard: 1530 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosLancerTraining", level: 9 }], unlocks: "Helios Lancer Training Cost Reduction: 5%, +100 Troops Deployment Capacity" },
    ],
  },
  {
    key: "heliosLancerHealing",
    name: "Helios Lancer Healing",
    troop: "lancer",
    levels: [
      { level: 1, power: 155000, seconds: 180000, cost: { meat: 2500000, wood: 2500000, coal: 500000, iron: 120000, steel: 30000, fireCrystalShard: 102 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosLancer", level: 1 }], unlocks: "Helios Lancer Healing Cost Reduction: 5%, +2.00% Lancer Attack" },
      { level: 2, power: 155000, seconds: 243000, cost: { meat: 3300000, wood: 3300000, coal: 670000, iron: 160000, steel: 40000, fireCrystalShard: 137 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosLancerHealing", level: 1 }], unlocks: "Helios Lancer Healing Cost Reduction: 5%, +2.00% Lancer Attack" },
      { level: 3, power: 155000, seconds: 333000, cost: { meat: 4600000, wood: 4600000, coal: 920000, iron: 230000, steel: 55000, fireCrystalShard: 188 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosLancerHealing", level: 2 }], unlocks: "Helios Lancer Healing Cost Reduction: 5%, +2.00% Lancer Attack" },
      { level: 4, power: 155000, seconds: 450000, cost: { meat: 6200000, wood: 6200000, coal: 1200000, iron: 310000, steel: 75000, fireCrystalShard: 255 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosLancerHealing", level: 3 }], unlocks: "Helios Lancer Healing Cost Reduction: 5%, +2.00% Lancer Attack" },
      { level: 5, power: 155000, seconds: 603000, cost: { meat: 8300000, wood: 8300000, coal: 1600000, iron: 410000, steel: 100000, fireCrystalShard: 341 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosLancerHealing", level: 4 }], unlocks: "Helios Lancer Healing Cost Reduction: 5%, +2.00% Lancer Attack" },
      { level: 6, power: 155000, seconds: 810000, cost: { meat: 11000000, wood: 11000000, coal: 2200000, iron: 560000, steel: 130000, fireCrystalShard: 459 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosLancerHealing", level: 5 }], unlocks: "Helios Lancer Healing Cost Reduction: 5%, +2.00% Lancer Attack" },
      { level: 7, power: 155000, seconds: 1080000, cost: { meat: 15000000, wood: 15000000, coal: 3000000, iron: 750000, steel: 180000, fireCrystalShard: 612 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosLancerHealing", level: 6 }], unlocks: "Helios Lancer Healing Cost Reduction: 5%, +2.00% Lancer Attack" },
      { level: 8, power: 155000, seconds: 1476000, cost: { meat: 20000000, wood: 20000000, coal: 4100000, iron: 1000000, steel: 240000, fireCrystalShard: 836 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosLancerHealing", level: 7 }], unlocks: "Helios Lancer Healing Cost Reduction: 5%, +2.00% Lancer Attack" },
      { level: 9, power: 155000, seconds: 1980000, cost: { meat: 27000000, wood: 27000000, coal: 5500000, iron: 1300000, steel: 330000, fireCrystalShard: 1122 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosLancerHealing", level: 8 }], unlocks: "Helios Lancer Healing Cost Reduction: 5%, +2.00% Lancer Attack" },
      { level: 10, power: 155000, seconds: 2700000, cost: { meat: 37000000, wood: 37000000, coal: 7500000, iron: 1800000, steel: 450000, fireCrystalShard: 1530 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosLancerHealing", level: 9 }], unlocks: "Helios Lancer Healing Cost Reduction: 5%, +2.00% Lancer Attack" },
    ],
  },
  {
    key: "heliosLancerFirstAid",
    name: "Helios Lancer First Aid",
    troop: "lancer",
    levels: [
      { level: 1, power: 137250, seconds: 90000, cost: { meat: 1200000, wood: 1200000, coal: 250000, iron: 62000, steel: 15000, fireCrystalShard: 51 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosLancer", level: 1 }], unlocks: "Helios Lancer Healing Time Reduction: 1.50%, +2.00% Lancer Defense" },
      { level: 2, power: 137250, seconds: 121500, cost: { meat: 1600000, wood: 1600000, coal: 330000, iron: 84000, steel: 20000, fireCrystalShard: 68 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosLancerFirstAid", level: 1 }], unlocks: "Helios Lancer Healing Time Reduction: 1.50%, +2.00% Lancer Defense" },
      { level: 3, power: 137250, seconds: 166500, cost: { meat: 2300000, wood: 2300000, coal: 460000, iron: 110000, steel: 27000, fireCrystalShard: 94 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosLancerFirstAid", level: 2 }], unlocks: "Helios Lancer Healing Time Reduction: 1.50%, +2.00% Lancer Defense" },
      { level: 4, power: 137250, seconds: 225000, cost: { meat: 3100000, wood: 3100000, coal: 620000, iron: 150000, steel: 37000, fireCrystalShard: 127 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosLancerFirstAid", level: 3 }], unlocks: "Helios Lancer Healing Time Reduction: 1.50%, +2.00% Lancer Defense" },
      { level: 5, power: 137250, seconds: 301500, cost: { meat: 4100000, wood: 4100000, coal: 830000, iron: 200000, steel: 50000, fireCrystalShard: 170 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosLancerFirstAid", level: 4 }], unlocks: "Helios Lancer Healing Time Reduction: 1.50%, +2.00% Lancer Defense" },
      { level: 6, power: 137250, seconds: 405000, cost: { meat: 5600000, wood: 5600000, coal: 1100000, iron: 280000, steel: 67000, fireCrystalShard: 229 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosLancerFirstAid", level: 5 }], unlocks: "Helios Lancer Healing Time Reduction: 1.50%, +2.00% Lancer Defense" },
      { level: 7, power: 137250, seconds: 540000, cost: { meat: 7500000, wood: 7500000, coal: 1500000, iron: 370000, steel: 90000, fireCrystalShard: 308 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosLancerFirstAid", level: 6 }], unlocks: "Helios Lancer Healing Time Reduction: 1.50%, +2.00% Lancer Defense" },
      { level: 8, power: 137250, seconds: 738000, cost: { meat: 10000000, wood: 10000000, coal: 2000000, iron: 510000, steel: 120000, fireCrystalShard: 418 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosLancerFirstAid", level: 7 }], unlocks: "Helios Lancer Healing Time Reduction: 1.50%, +2.00% Lancer Defense" },
      { level: 9, power: 137250, seconds: 990000, cost: { meat: 13000000, wood: 13000000, coal: 2700000, iron: 680000, steel: 160000, fireCrystalShard: 561 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosLancerFirstAid", level: 8 }], unlocks: "Helios Lancer Healing Time Reduction: 1.50%, +2.00% Lancer Defense" },
      { level: 10, power: 137250, seconds: 1350000, cost: { meat: 18000000, wood: 18000000, coal: 3700000, iron: 930000, steel: 220000, fireCrystalShard: 765 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosLancerFirstAid", level: 9 }], unlocks: "Helios Lancer Healing Time Reduction: 1.50%, +2.00% Lancer Defense" },
    ],
  },
  {
    key: "flameSquad",
    name: "Flame Squad",
    troop: "marksman",
    levels: [
      { level: 1, power: 60000, seconds: 28800, cost: { meat: 300000, wood: 300000, coal: 60000, iron: 15000, steel: 5000, fireCrystalShard: 16 }, requiresAcademyFc: 1, requiresResearch: [], unlocks: "+200 Troop Deployment Capacity" },
      { level: 2, power: 60000, seconds: 46080, cost: { meat: 480000, wood: 480000, coal: 96000, iron: 24000, steel: 8000, fireCrystalShard: 25 }, requiresAcademyFc: 1, requiresResearch: [{ key: "flameSquad", level: 1 }], unlocks: "+200 Troop Deployment Capacity" },
      { level: 3, power: 60000, seconds: 74880, cost: { meat: 780000, wood: 780000, coal: 150000, iron: 39000, steel: 13000, fireCrystalShard: 41 }, requiresAcademyFc: 1, requiresResearch: [{ key: "flameSquad", level: 2 }], unlocks: "+200 Troop Deployment Capacity" },
      { level: 4, power: 60000, seconds: 123840, cost: { meat: 1200000, wood: 1200000, coal: 250000, iron: 64000, steel: 21000, fireCrystalShard: 68 }, requiresAcademyFc: 1, requiresResearch: [{ key: "flameSquad", level: 3 }], unlocks: "+200 Troop Deployment Capacity" },
      { level: 5, power: 60000, seconds: 194400, cost: { meat: 2000000, wood: 2000000, coal: 400000, iron: 100000, steel: 33000, fireCrystalShard: 108 }, requiresAcademyFc: 1, requiresResearch: [{ key: "flameSquad", level: 4 }], unlocks: "+200 Troop Deployment Capacity" },
    ],
  },
  {
    key: "crystalArmor",
    name: "Crystal Armor",
    troop: "marksman",
    levels: [
      { level: 1, power: 82500, seconds: 72000, cost: { meat: 800000, wood: 800000, coal: 160000, iron: 40000, steel: 10000, fireCrystalShard: 40 }, requiresAcademyFc: 1, requiresResearch: [{ key: "flameSquad", level: 3 }], unlocks: "+1.50% Marksman Health" },
      { level: 2, power: 74250, seconds: 100800, cost: { meat: 1100000, wood: 1100000, coal: 220000, iron: 56000, steel: 14000, fireCrystalShard: 56 }, requiresAcademyFc: 2, requiresResearch: [{ key: "crystalArmor", level: 1 }], unlocks: "+1.50% Marksman Health" },
      { level: 3, power: 90750, seconds: 133200, cost: { meat: 1400000, wood: 1400000, coal: 290000, iron: 74000, steel: 18000, fireCrystalShard: 74 }, requiresAcademyFc: 2, requiresResearch: [{ key: "crystalArmor", level: 2 }], unlocks: "+3.00% Marksman Health" },
      { level: 4, power: 99000, seconds: 183600, cost: { meat: 2000000, wood: 2000000, coal: 400000, iron: 100000, steel: 25000, fireCrystalShard: 102 }, requiresAcademyFc: 2, requiresResearch: [{ key: "flameSquad", level: 4 }, { key: "crystalArmor", level: 3 }], unlocks: "+3.00% Marksman Health" },
      { level: 5, power: 95700, seconds: 244800, cost: { meat: 2700000, wood: 2700000, coal: 540000, iron: 130000, steel: 34000, fireCrystalShard: 136 }, requiresAcademyFc: 3, requiresResearch: [{ key: "flameSquad", level: 5 }, { key: "crystalArmor", level: 4 }], unlocks: "+3.00% Marksman Health" },
      { level: 6, power: 98175, seconds: 331200, cost: { meat: 3600000, wood: 3600000, coal: 730000, iron: 180000, steel: 46000, fireCrystalShard: 184 }, requiresAcademyFc: 3, requiresResearch: [{ key: "crystalArmor", level: 5 }], unlocks: "+3.00% Marksman Health" },
      { level: 7, power: 122925, seconds: 446400, cost: { meat: 4900000, wood: 4900000, coal: 990000, iron: 240000, steel: 62000, fireCrystalShard: 248 }, requiresAcademyFc: 4, requiresResearch: [{ key: "crystalArmor", level: 6 }], unlocks: "+5.00% Marksman Health" },
      { level: 8, power: 120450, seconds: 601200, cost: { meat: 6600000, wood: 6600000, coal: 1300000, iron: 330000, steel: 83000, fireCrystalShard: 334 }, requiresAcademyFc: 5, requiresResearch: [{ key: "crystalArmor", level: 7 }], unlocks: "+5.00% Marksman Health" },
    ],
  },
  {
    key: "crystalVision",
    name: "Crystal Vision",
    troop: "marksman",
    levels: [
      { level: 1, power: 82500, seconds: 72000, cost: { meat: 800000, wood: 800000, coal: 160000, iron: 40000, steel: 10000, fireCrystalShard: 40 }, requiresAcademyFc: 1, requiresResearch: [{ key: "flameSquad", level: 3 }], unlocks: "+1.50% Marksman Lethality" },
      { level: 2, power: 74250, seconds: 100800, cost: { meat: 1100000, wood: 1100000, coal: 220000, iron: 56000, steel: 14000, fireCrystalShard: 56 }, requiresAcademyFc: 2, requiresResearch: [{ key: "crystalVision", level: 1 }], unlocks: "+1.50% Marksman Lethality" },
      { level: 3, power: 90750, seconds: 133200, cost: { meat: 1400000, wood: 1400000, coal: 290000, iron: 74000, steel: 18000, fireCrystalShard: 74 }, requiresAcademyFc: 2, requiresResearch: [{ key: "crystalVision", level: 2 }], unlocks: "+3.00% Marksman Lethality" },
      { level: 4, power: 99000, seconds: 183600, cost: { meat: 2000000, wood: 2000000, coal: 400000, iron: 100000, steel: 25000, fireCrystalShard: 102 }, requiresAcademyFc: 2, requiresResearch: [{ key: "flameSquad", level: 4 }, { key: "crystalVision", level: 3 }], unlocks: "+3.00% Marksman Lethality" },
      { level: 5, power: 95700, seconds: 244800, cost: { meat: 2700000, wood: 2700000, coal: 540000, iron: 130000, steel: 34000, fireCrystalShard: 136 }, requiresAcademyFc: 3, requiresResearch: [{ key: "flameSquad", level: 5 }, { key: "crystalVision", level: 4 }], unlocks: "+3.00% Marksman Lethality" },
      { level: 6, power: 98175, seconds: 331200, cost: { meat: 3600000, wood: 3600000, coal: 730000, iron: 180000, steel: 46000, fireCrystalShard: 184 }, requiresAcademyFc: 3, requiresResearch: [{ key: "crystalVision", level: 5 }], unlocks: "+3.00% Marksman Lethality" },
      { level: 7, power: 122925, seconds: 446400, cost: { meat: 4900000, wood: 4900000, coal: 990000, iron: 240000, steel: 62000, fireCrystalShard: 248 }, requiresAcademyFc: 4, requiresResearch: [{ key: "crystalVision", level: 6 }], unlocks: "+5.00% Marksman Lethality" },
      { level: 8, power: 120450, seconds: 601200, cost: { meat: 6600000, wood: 6600000, coal: 1300000, iron: 330000, steel: 83000, fireCrystalShard: 334 }, requiresAcademyFc: 5, requiresResearch: [{ key: "crystalVision", level: 7 }], unlocks: "+5.00% Marksman Lethality" },
    ],
  },
  {
    key: "crystalArrow",
    name: "Crystal Arrow",
    troop: "marksman",
    levels: [
      { level: 1, power: 120000, seconds: 68140, cost: { meat: 700000, wood: 700000, coal: 140000, iron: 35000, steel: 15000, fireCrystalShard: 54 }, requiresAcademyFc: 3, requiresResearch: [{ key: "crystalVision", level: 6 }], unlocks: "+2.00% Marksman Attack" },
      { level: 2, power: 108000, seconds: 83812, cost: { meat: 860000, wood: 860000, coal: 170000, iron: 43000, steel: 18000, fireCrystalShard: 66 }, requiresAcademyFc: 3, requiresResearch: [{ key: "crystalArrow", level: 1 }], unlocks: "+2.00% Marksman Attack" },
      { level: 3, power: 103200, seconds: 102210, cost: { meat: 1000000, wood: 1000000, coal: 210000, iron: 52000, steel: 22000, fireCrystalShard: 81 }, requiresAcademyFc: 4, requiresResearch: [{ key: "crystalArrow", level: 2 }], unlocks: "+2.00% Marksman Attack" },
      { level: 4, power: 103200, seconds: 122652, cost: { meat: 1200000, wood: 1200000, coal: 250000, iron: 63000, steel: 27000, fireCrystalShard: 97 }, requiresAcademyFc: 4, requiresResearch: [{ key: "crystalArrow", level: 3 }], unlocks: "+2.50% Marksman Attack" },
      { level: 5, power: 101100, seconds: 149908, cost: { meat: 1500000, wood: 1500000, coal: 300000, iron: 77000, steel: 33000, fireCrystalShard: 118 }, requiresAcademyFc: 4, requiresResearch: [{ key: "crystalArrow", level: 4 }], unlocks: "+2.50% Marksman Attack" },
      { level: 6, power: 103800, seconds: 183978, cost: { meat: 1800000, wood: 1800000, coal: 370000, iron: 94000, steel: 40000, fireCrystalShard: 145 }, requiresAcademyFc: 4, requiresResearch: [{ key: "crystalArrow", level: 5 }], unlocks: "+3.00% Marksman Attack" },
      { level: 7, power: 106200, seconds: 224862, cost: { meat: 2300000, wood: 2300000, coal: 460000, iron: 110000, steel: 49000, fireCrystalShard: 178 }, requiresAcademyFc: 5, requiresResearch: [{ key: "crystalVision", level: 7 }, { key: "crystalArrow", level: 6 }], unlocks: "+3.00% Marksman Attack" },
      { level: 8, power: 107400, seconds: 272560, cost: { meat: 2800000, wood: 2800000, coal: 560000, iron: 140000, steel: 60000, fireCrystalShard: 216 }, requiresAcademyFc: 5, requiresResearch: [{ key: "crystalVision", level: 8 }, { key: "crystalArrow", level: 7 }], unlocks: "+3.00% Marksman Attack" },
      { level: 9, power: 123000, seconds: 340700, cost: { meat: 3500000, wood: 3500000, coal: 700000, iron: 170000, steel: 75000, fireCrystalShard: 270 }, requiresAcademyFc: 5, requiresResearch: [{ key: "crystalArrow", level: 8 }], unlocks: "+5.00% Marksman Attack" },
      { level: 10, power: 123000, seconds: 408840, cost: { meat: 4200000, wood: 4200000, coal: 840000, iron: 210000, steel: 90000, fireCrystalShard: 324 }, requiresAcademyFc: 5, requiresResearch: [{ key: "crystalArrow", level: 9 }], unlocks: "+5.00% Marksman Attack" },
      { level: 11, power: 120000, seconds: 490608, cost: { meat: 5000000, wood: 5000000, coal: 1000000, iron: 250000, steel: 100000, fireCrystalShard: 388 }, requiresAcademyFc: 5, requiresResearch: [{ key: "crystalArrow", level: 10 }], unlocks: "+5.00% Marksman Attack" },
      { level: 12, power: 126000, seconds: 606446, cost: { meat: 6200000, wood: 6200000, coal: 1200000, iron: 310000, steel: 130000, fireCrystalShard: 480 }, requiresAcademyFc: 5, requiresResearch: [{ key: "crystalArrow", level: 11 }], unlocks: "+5.00% Marksman Attack" },
    ],
  },
  {
    key: "crystalProtection",
    name: "Crystal Protection",
    troop: "marksman",
    levels: [
      { level: 1, power: 120000, seconds: 68140, cost: { meat: 700000, wood: 700000, coal: 140000, iron: 35000, steel: 15000, fireCrystalShard: 54 }, requiresAcademyFc: 3, requiresResearch: [{ key: "crystalArmor", level: 6 }], unlocks: "+2.00% Marksman Defense" },
      { level: 2, power: 108000, seconds: 83812, cost: { meat: 860000, wood: 860000, coal: 170000, iron: 43000, steel: 18000, fireCrystalShard: 66 }, requiresAcademyFc: 3, requiresResearch: [{ key: "crystalProtection", level: 1 }], unlocks: "+2.00% Marksman Defense" },
      { level: 3, power: 103200, seconds: 102210, cost: { meat: 1000000, wood: 1000000, coal: 210000, iron: 52000, steel: 22000, fireCrystalShard: 81 }, requiresAcademyFc: 4, requiresResearch: [{ key: "crystalProtection", level: 2 }], unlocks: "+2.00% Marksman Defense" },
      { level: 4, power: 103200, seconds: 122652, cost: { meat: 1200000, wood: 1200000, coal: 250000, iron: 63000, steel: 27000, fireCrystalShard: 97 }, requiresAcademyFc: 4, requiresResearch: [{ key: "crystalProtection", level: 3 }], unlocks: "+2.50% Marksman Defense" },
      { level: 5, power: 101100, seconds: 149908, cost: { meat: 1500000, wood: 1500000, coal: 300000, iron: 77000, steel: 33000, fireCrystalShard: 118 }, requiresAcademyFc: 4, requiresResearch: [{ key: "crystalProtection", level: 4 }], unlocks: "+2.50% Marksman Defense" },
      { level: 6, power: 103800, seconds: 183978, cost: { meat: 1800000, wood: 1800000, coal: 370000, iron: 94000, steel: 40000, fireCrystalShard: 145 }, requiresAcademyFc: 4, requiresResearch: [{ key: "crystalProtection", level: 5 }], unlocks: "+3.00% Marksman Defense" },
      { level: 7, power: 106200, seconds: 224862, cost: { meat: 2300000, wood: 2300000, coal: 460000, iron: 110000, steel: 49000, fireCrystalShard: 178 }, requiresAcademyFc: 5, requiresResearch: [{ key: "crystalArmor", level: 7 }, { key: "crystalProtection", level: 6 }], unlocks: "+3.00% Marksman Defense" },
      { level: 8, power: 107400, seconds: 272560, cost: { meat: 2800000, wood: 2800000, coal: 560000, iron: 140000, steel: 60000, fireCrystalShard: 216 }, requiresAcademyFc: 5, requiresResearch: [{ key: "crystalArmor", level: 8 }, { key: "crystalProtection", level: 7 }], unlocks: "+3.00% Marksman Defense" },
      { level: 9, power: 123000, seconds: 340700, cost: { meat: 3500000, wood: 3500000, coal: 700000, iron: 170000, steel: 75000, fireCrystalShard: 270 }, requiresAcademyFc: 5, requiresResearch: [{ key: "crystalProtection", level: 8 }], unlocks: "+5.00% Marksman Defense" },
      { level: 10, power: 123000, seconds: 408840, cost: { meat: 4200000, wood: 4200000, coal: 840000, iron: 210000, steel: 90000, fireCrystalShard: 324 }, requiresAcademyFc: 5, requiresResearch: [{ key: "crystalProtection", level: 9 }], unlocks: "+5.00% Marksman Defense" },
      { level: 11, power: 120000, seconds: 490608, cost: { meat: 5000000, wood: 5000000, coal: 1000000, iron: 250000, steel: 100000, fireCrystalShard: 388 }, requiresAcademyFc: 5, requiresResearch: [{ key: "crystalProtection", level: 10 }], unlocks: "+5.00% Marksman Defense" },
      { level: 12, power: 126000, seconds: 606446, cost: { meat: 6200000, wood: 6200000, coal: 1200000, iron: 310000, steel: 130000, fireCrystalShard: 480 }, requiresAcademyFc: 5, requiresResearch: [{ key: "crystalProtection", level: 11 }], unlocks: "+5.00% Marksman Defense" },
    ],
  },
  {
    key: "flameLegion",
    name: "Flame Legion",
    troop: "marksman",
    levels: [
      { level: 1, power: 150000, seconds: 105617, cost: { meat: 1000000, wood: 1000000, coal: 210000, iron: 54000, steel: 23000, fireCrystalShard: 83 }, requiresAcademyFc: 4, requiresResearch: [{ key: "crystalArmor", level: 6 }, { key: "crystalVision", level: 6 }], unlocks: "+1,500 Rally Capacity" },
      { level: 2, power: 135000, seconds: 129908, cost: { meat: 1300000, wood: 1300000, coal: 260000, iron: 66000, steel: 28000, fireCrystalShard: 102 }, requiresAcademyFc: 4, requiresResearch: [{ key: "flameLegion", level: 1 }], unlocks: "+1,500 Rally Capacity" },
      { level: 3, power: 175000, seconds: 158425, cost: { meat: 1600000, wood: 1600000, coal: 320000, iron: 81000, steel: 34000, fireCrystalShard: 125 }, requiresAcademyFc: 4, requiresResearch: [{ key: "flameLegion", level: 2 }], unlocks: "+2,000 Rally Capacity" },
      { level: 4, power: 135000, seconds: 190110, cost: { meat: 1900000, wood: 1900000, coal: 390000, iron: 97000, steel: 41000, fireCrystalShard: 150 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameLegion", level: 3 }], unlocks: "+2,000 Rally Capacity" },
      { level: 5, power: 174500, seconds: 232357, cost: { meat: 2300000, wood: 2300000, coal: 470000, iron: 110000, steel: 51000, fireCrystalShard: 184 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameLegion", level: 4 }], unlocks: "+2,500 Rally Capacity" },
      { level: 6, power: 142500, seconds: 285165, cost: { meat: 2900000, wood: 2900000, coal: 580000, iron: 140000, steel: 62000, fireCrystalShard: 225 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameLegion", level: 5 }], unlocks: "+2,500 Rally Capacity" },
      { level: 7, power: 146500, seconds: 348536, cost: { meat: 3500000, wood: 3500000, coal: 710000, iron: 170000, steel: 76000, fireCrystalShard: 276 }, requiresAcademyFc: 5, requiresResearch: [{ key: "crystalArmor", level: 7 }, { key: "crystalVision", level: 7 }, { key: "flameLegion", level: 6 }], unlocks: "+2,500 Rally Capacity" },
      { level: 8, power: 184000, seconds: 422468, cost: { meat: 4300000, wood: 4300000, coal: 860000, iron: 210000, steel: 76000, fireCrystalShard: 334 }, requiresAcademyFc: 5, requiresResearch: [{ key: "crystalArmor", level: 8 }, { key: "crystalVision", level: 8 }, { key: "flameLegion", level: 7 }], unlocks: "+3,000 Rally Capacity" },
      { level: 9, power: 122500, seconds: 528085, cost: { meat: 5400000, wood: 5400000, coal: 1000000, iron: 270000, steel: 110000, fireCrystalShard: 418 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameLegion", level: 8 }], unlocks: "+3,500 Rally Capacity" },
      { level: 10, power: 160000, seconds: 633702, cost: { meat: 6500000, wood: 6500000, coal: 1300000, iron: 320000, steel: 130000, fireCrystalShard: 502 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameLegion", level: 9 }], unlocks: "+4,000 Rally Capacity" },
      { level: 11, power: 157000, seconds: 760442, cost: { meat: 7800000, wood: 7800000, coal: 1500000, iron: 390000, steel: 160000, fireCrystalShard: 602 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameLegion", level: 10 }], unlocks: "+4,000 Rally Capacity" },
      { level: 12, power: 194000, seconds: 939991, cost: { meat: 9600000, wood: 9600000, coal: 1900000, iron: 480000, steel: 200000, fireCrystalShard: 744 }, requiresAcademyFc: 5, requiresResearch: [{ key: "flameLegion", level: 11 }], unlocks: "+4,500 Rally Capacity" },
    ],
  },
  {
    key: "heliosMarksman",
    name: "Helios Marksman",
    troop: "marksman",
    levels: [
      { level: 1, power: 8000000, seconds: 7892100, cost: { meat: 85000000, wood: 85000000, coal: 17000000, iron: 4200000, steel: 1000000, fireCrystalShard: 2236 }, requiresAcademyFc: 5, requiresResearch: [{ key: "crystalArrow", level: 12 }, { key: "crystalProtection", level: 12 }, { key: "flameLegion", level: 12 }], unlocks: "Unlock XI Helios Marksmen" },
    ],
  },
  {
    key: "heliosMarksmanTraining",
    name: "Helios Marksman Training",
    troop: "marksman",
    levels: [
      { level: 1, power: 65000, seconds: 180000, cost: { meat: 2500000, wood: 2500000, coal: 500000, iron: 120000, steel: 30000, fireCrystalShard: 102 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosMarksman", level: 1 }], unlocks: "Helios Marksman Training Cost Reduction: 5%, +100 Troops Deployment Capacity" },
      { level: 2, power: 65000, seconds: 243000, cost: { meat: 3300000, wood: 3300000, coal: 670000, iron: 160000, steel: 40000, fireCrystalShard: 137 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosMarksmanTraining", level: 1 }], unlocks: "Helios Marksman Training Cost Reduction: 5%, +100 Troops Deployment Capacity" },
      { level: 3, power: 65000, seconds: 333000, cost: { meat: 4600000, wood: 4600000, coal: 920000, iron: 230000, steel: 55000, fireCrystalShard: 188 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosMarksmanTraining", level: 2 }], unlocks: "Helios Marksman Training Cost Reduction: 5%, +100 Troops Deployment Capacity" },
      { level: 4, power: 65000, seconds: 450000, cost: { meat: 6200000, wood: 6200000, coal: 1200000, iron: 310000, steel: 75000, fireCrystalShard: 255 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosMarksmanTraining", level: 3 }], unlocks: "Helios Marksman Training Cost Reduction: 5%, +100 Troops Deployment Capacity" },
      { level: 5, power: 65000, seconds: 603000, cost: { meat: 8300000, wood: 8300000, coal: 1600000, iron: 410000, steel: 100000, fireCrystalShard: 341 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosMarksmanTraining", level: 4 }], unlocks: "Helios Marksman Training Cost Reduction: 5%, +100 Troops Deployment Capacity" },
      { level: 6, power: 65000, seconds: 810000, cost: { meat: 11000000, wood: 11000000, coal: 2200000, iron: 560000, steel: 130000, fireCrystalShard: 459 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosMarksmanTraining", level: 5 }], unlocks: "Helios Marksman Training Cost Reduction: 5%, +100 Troops Deployment Capacity" },
      { level: 7, power: 65000, seconds: 1080000, cost: { meat: 15000000, wood: 15000000, coal: 3000000, iron: 750000, steel: 180000, fireCrystalShard: 612 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosMarksmanTraining", level: 6 }], unlocks: "Helios Marksman Training Cost Reduction: 5%, +100 Troops Deployment Capacity" },
      { level: 8, power: 65000, seconds: 1476000, cost: { meat: 20000000, wood: 20000000, coal: 4100000, iron: 1000000, steel: 240000, fireCrystalShard: 836 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosMarksmanTraining", level: 7 }], unlocks: "Helios Marksman Training Cost Reduction: 5%, +100 Troops Deployment Capacity" },
      { level: 9, power: 65000, seconds: 1980000, cost: { meat: 27000000, wood: 27000000, coal: 5500000, iron: 1300000, steel: 330000, fireCrystalShard: 1122 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosMarksmanTraining", level: 8 }], unlocks: "Helios Marksman Training Cost Reduction: 5%, +100 Troops Deployment Capacity" },
      { level: 10, power: 65000, seconds: 2700000, cost: { meat: 37000000, wood: 37000000, coal: 7500000, iron: 1800000, steel: 450000, fireCrystalShard: 1530 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosMarksmanTraining", level: 9 }], unlocks: "Helios Marksman Training Cost Reduction: 5%, +100 Troops Deployment Capacity" },
    ],
  },
  {
    key: "heliosMarksmanHealing",
    name: "Helios Marksman Healing",
    troop: "marksman",
    levels: [
      { level: 1, power: 155000, seconds: 180000, cost: { meat: 2500000, wood: 2500000, coal: 500000, iron: 120000, steel: 30000, fireCrystalShard: 102 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosMarksman", level: 1 }], unlocks: "Helios Marksman Healing Cost Reduction: 5%, +2.00% Marksman Attack" },
      { level: 2, power: 155000, seconds: 243000, cost: { meat: 3300000, wood: 3300000, coal: 670000, iron: 160000, steel: 40000, fireCrystalShard: 137 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosMarksmanHealing", level: 1 }], unlocks: "Helios Marksman Healing Cost Reduction: 5%, +2.00% Marksman Attack" },
      { level: 3, power: 155000, seconds: 333000, cost: { meat: 4600000, wood: 4600000, coal: 920000, iron: 230000, steel: 55000, fireCrystalShard: 188 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosMarksmanHealing", level: 2 }], unlocks: "Helios Marksman Healing Cost Reduction: 5%, +2.00% Marksman Attack" },
      { level: 4, power: 155000, seconds: 450000, cost: { meat: 6200000, wood: 6200000, coal: 1200000, iron: 310000, steel: 75000, fireCrystalShard: 255 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosMarksmanHealing", level: 3 }], unlocks: "Helios Marksman Healing Cost Reduction: 5%, +2.00% Marksman Attack" },
      { level: 5, power: 155000, seconds: 603000, cost: { meat: 8300000, wood: 8300000, coal: 1600000, iron: 410000, steel: 100000, fireCrystalShard: 341 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosMarksmanHealing", level: 4 }], unlocks: "Helios Marksman Healing Cost Reduction: 5%, +2.00% Marksman Attack" },
      { level: 6, power: 155000, seconds: 810000, cost: { meat: 11000000, wood: 11000000, coal: 2200000, iron: 560000, steel: 130000, fireCrystalShard: 459 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosMarksmanHealing", level: 5 }], unlocks: "Helios Marksman Healing Cost Reduction: 5%, +2.00% Marksman Attack" },
      { level: 7, power: 155000, seconds: 1080000, cost: { meat: 15000000, wood: 15000000, coal: 3000000, iron: 750000, steel: 180000, fireCrystalShard: 612 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosMarksmanHealing", level: 6 }], unlocks: "Helios Marksman Healing Cost Reduction: 5%, +2.00% Marksman Attack" },
      { level: 8, power: 155000, seconds: 1476000, cost: { meat: 20000000, wood: 20000000, coal: 4100000, iron: 1000000, steel: 240000, fireCrystalShard: 836 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosMarksmanHealing", level: 7 }], unlocks: "Helios Marksman Healing Cost Reduction: 5%, +2.00% Marksman Attack" },
      { level: 9, power: 155000, seconds: 1980000, cost: { meat: 27000000, wood: 27000000, coal: 5500000, iron: 1300000, steel: 330000, fireCrystalShard: 1122 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosMarksmanHealing", level: 8 }], unlocks: "Helios Marksman Healing Cost Reduction: 5%, +2.00% Marksman Attack" },
      { level: 10, power: 155000, seconds: 2700000, cost: { meat: 37000000, wood: 37000000, coal: 7500000, iron: 1800000, steel: 450000, fireCrystalShard: 1530 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosMarksmanHealing", level: 9 }], unlocks: "Helios Marksman Healing Cost Reduction: 5%, +2.00% Marksman Attack" },
    ],
  },
  {
    key: "heliosMarksmanFirstAid",
    name: "Helios Marksman First Aid",
    troop: "marksman",
    levels: [
      { level: 1, power: 137250, seconds: 90000, cost: { meat: 1200000, wood: 1200000, coal: 250000, iron: 62000, steel: 15000, fireCrystalShard: 51 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosMarksman", level: 1 }], unlocks: "Helios Marksman Healing Time Reduction: 1.50%, +2.00% Marksman Defense" },
      { level: 2, power: 137250, seconds: 121500, cost: { meat: 1600000, wood: 1600000, coal: 330000, iron: 84000, steel: 20000, fireCrystalShard: 68 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosMarksmanFirstAid", level: 1 }], unlocks: "Helios Marksman Healing Time Reduction: 1.50%, +2.00% Marksman Defense" },
      { level: 3, power: 137250, seconds: 166500, cost: { meat: 2300000, wood: 2300000, coal: 460000, iron: 110000, steel: 27000, fireCrystalShard: 94 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosMarksmanFirstAid", level: 2 }], unlocks: "Helios Marksman Healing Time Reduction: 1.50%, +2.00% Marksman Defense" },
      { level: 4, power: 137250, seconds: 225000, cost: { meat: 3100000, wood: 3100000, coal: 620000, iron: 150000, steel: 37000, fireCrystalShard: 127 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosMarksmanFirstAid", level: 3 }], unlocks: "Helios Marksman Healing Time Reduction: 1.50%, +2.00% Marksman Defense" },
      { level: 5, power: 137250, seconds: 301500, cost: { meat: 4100000, wood: 4100000, coal: 830000, iron: 200000, steel: 50000, fireCrystalShard: 170 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosMarksmanFirstAid", level: 4 }], unlocks: "Helios Marksman Healing Time Reduction: 1.50%, +2.00% Marksman Defense" },
      { level: 6, power: 137250, seconds: 405000, cost: { meat: 5600000, wood: 5600000, coal: 1100000, iron: 280000, steel: 67000, fireCrystalShard: 229 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosMarksmanFirstAid", level: 5 }], unlocks: "Helios Marksman Healing Time Reduction: 1.50%, +2.00% Marksman Defense" },
      { level: 7, power: 137250, seconds: 540000, cost: { meat: 7500000, wood: 7500000, coal: 1500000, iron: 370000, steel: 90000, fireCrystalShard: 308 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosMarksmanFirstAid", level: 6 }], unlocks: "Helios Marksman Healing Time Reduction: 1.50%, +2.00% Marksman Defense" },
      { level: 8, power: 137250, seconds: 738000, cost: { meat: 10000000, wood: 10000000, coal: 2000000, iron: 510000, steel: 120000, fireCrystalShard: 418 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosMarksmanFirstAid", level: 7 }], unlocks: "Helios Marksman Healing Time Reduction: 1.50%, +2.00% Marksman Defense" },
      { level: 9, power: 137250, seconds: 990000, cost: { meat: 13000000, wood: 13000000, coal: 2700000, iron: 680000, steel: 160000, fireCrystalShard: 561 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosMarksmanFirstAid", level: 8 }], unlocks: "Helios Marksman Healing Time Reduction: 1.50%, +2.00% Marksman Defense" },
      { level: 10, power: 137250, seconds: 1350000, cost: { meat: 18000000, wood: 18000000, coal: 3700000, iron: 930000, steel: 220000, fireCrystalShard: 765 }, requiresAcademyFc: 5, requiresResearch: [{ key: "heliosMarksmanFirstAid", level: 9 }], unlocks: "Helios Marksman Healing Time Reduction: 1.50%, +2.00% Marksman Defense" },
    ],
  },
];

const byKey = new Map(whiteoutWarAcademy.map(n => [`${n.troop}:${n.key}`, n]));

/** A node within one troop's tree. The same key exists in all three trees. */
export const warAcademyNode = (troop: WarAcademyTroop, key: string) =>
  byKey.get(`${troop}:${key}`);

export const warAcademyTree = (troop: WarAcademyTroop) =>
  whiteoutWarAcademy.filter(n => n.troop === troop);

/** Total power still to gain on a node from `level` upward. */
export const warAcademyPowerRemaining = (node: WarAcademyNode, level: number) =>
  node.levels.slice(Math.max(level, 0)).reduce((total, l) => total + l.power, 0);

/** Base research seconds still to spend on a node from `level` upward. */
export const warAcademySecondsRemaining = (node: WarAcademyNode, level: number) =>
  node.levels.slice(Math.max(level, 0)).reduce((total, l) => total + l.seconds, 0);
