// Expert NPCs: the ten experts, their affinity ladders, Sigil costs and skills.
//
// Experts advance on two tracks:
//
//   - RELATIONSHIP, Lv 1 to 100. Gift items buy affinity, which raises the
//     level (Compass 10, Fiery Heart 100, Sail of Conquest 1000 affinity each).
//     Affinity alone is not enough: every multiple of ten is a gate that also
//     costs that expert's own Sigils, or Common Expert Sigils which stand in for
//     any of them, and each gate costs more than the last. That is what the ten
//     sigilCosts entries are, and they sum to totalSigils.
//
//     The eleven relationship statuses run Stranger, Acquaintance 1 to 3,
//     Casual 1 to 3, Close 1 to 3, Intimate, one per gate plus the start.
//
//   - SKILLS, five per expert, levelled with Books of Knowledge plus learning
//     time, which is what Learning speedups are spent on.
//
// One skill per expert is a talent. It is not bought with books at all: it sits
// at max level 11, one level per relationship status, and rises on its own as
// the relationship does. Its book costs are all zero and it is marked isTalent.
//
// Scraped from wostools' experts calculator by running its data module, then
// checked against the in-game numbers Fredrik supplied for Agnes's Project
// Management (2h, 3h, 4h, 6h, 8h over five levels).
//
// ORDER MATTERS AND IS NOT ALPHABETICAL. Both the backpack's Sigil list and the
// Experts card read this array in order, and it follows the order the game
// itself lists them in. Fabian sits before Baldur for that reason, which is the
// one place the order is not what you would guess from their generation.
//
// Ronne and Kathy carry estimated: true upstream, because their affinity ladder
// is a straight interpolation rather than measured values. The UI says so rather
// than presenting them as solid.
//
// EDIT FREELY: correcting a number here is enough, nothing else reads the raw
// arrays directly.

export interface ExpertSkill {
  id: string;
  name: string;
  maxLevel: number;
  /** Talents come from friendship, not books, so every book cost is zero. */
  isTalent: boolean;
  /** Books of Knowledge to reach each level. Index 0 is level 1, always free. */
  bookCosts: number[];
  /** Learning minutes to reach each level. Index 0 is level 1, always free. */
  learningTimeMinutes: number[];
  description: string;
}

export interface ExpertDefinition {
  id: string;
  name: string;
  /** Release generation, used to sort the newest experts last. */
  generation: number;
  /** What the expert is built for, e.g. "Bear Hunt". */
  focus: string;
  /** True when the affinity ladder is interpolated rather than measured. */
  estimated: boolean;
  /** Affinity per level. Index 0 unlocks the expert, index n reaches level n+1. */
  affinityCosts: number[];
  /** That expert's own Sigils per friendship level, 1 to 10. */
  sigilCosts: number[];
  totalSigils: number;
  skills: ExpertSkill[];
}

export interface ExpertGift {
  id: string;
  name: string;
  affinityPerGift: number;
}

/**
 * Proficiency a minute of learning grants.
 *
 * The Learn Skills dialog offers six fixed durations and states that
 * "proficiency gained per unit time is the same". It is, exactly: 10 minutes
 * gives 600, two hours 7,200, five days 432,000. All six work out at 60.
 *
 * This is the bridge between the learning table below, which is in minutes,
 * and the numbers the game shows, which are in proficiency.
 */
export const PROFICIENCY_PER_MINUTE = 60;

/**
 * Gems to finish a learning session on the spot.
 *
 * 1,600 for two hours, 8,000 for ten, 96,000 for five days: a flat 40/3 gems
 * a minute, rounded up. Ten minutes costs 134 rather than 133.33, which is
 * what fixes the rounding direction.
 *
 * Worth seeing in proficiency: 4.5 proficiency a gem.
 */
export const LEARNING_GEMS_PER_MINUTE = 40 / 3;

export const learningProficiency = (minutes: number) => minutes * PROFICIENCY_PER_MINUTE;
export const learningGemsToFinish = (minutes: number) =>
  Math.ceil(minutes * LEARNING_GEMS_PER_MINUTE);

/** The six durations the dialog offers, in minutes. */
export const LEARNING_TIME_OPTIONS = [10, 120, 600, 1380, 4320, 7200];

/**
 * ONE SKILL AT A TIME, across every expert.
 *
 * This is the constraint that matters. The books and the affinity are things
 * a player can stockpile; learning time is a single queue, so the fifty skills
 * do not progress in parallel however much is in the backpack. Taking all ten
 * experts to the end is about 4,987 days of it, which is why the question
 * "which skill should be learning right now" is the only one worth answering.
 */
export const EXPERTS_LEARN_ONE_AT_A_TIME = true;

export const EXPERT_MAX_LEVEL = 100;
/** Sigil gates on the relationship track, one at each multiple of ten. */
export const EXPERT_GATES = 10;

/** The three affinity gifts, cheapest first. */
export const EXPERT_GIFTS: ExpertGift[] = [
  { id: "compass", name: "Compass", affinityPerGift: 10 },
  { id: "fieryHeart", name: "Fiery Heart", affinityPerGift: 100 },
  { id: "sailConquest", name: "Sail of Conquest", affinityPerGift: 1000 },
];

export const whiteoutExperts: ExpertDefinition[] = [
  {
    id: "cyrille",
    name: "Cyrille",
    generation: 1,
    focus: "Bear Hunt",
    estimated: false,
    totalSigils: 275,
    sigilCosts: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
    affinityCosts: [
      1000,200,210,220,230,240,260,280,300,320,
      340,360,380,400,420,440,460,480,500,520,
      540,560,580,600,620,640,660,680,700,730,
      760,790,820,850,880,910,940,970,1000,1040,
      1080,1120,1160,1200,1240,1280,1320,1360,1400,1450,
      1500,1550,1600,1650,1700,1750,1800,1850,1900,1950,
      2000,2050,2100,2150,2200,2250,2300,2350,2400,2450,
      2500,2550,2600,2650,2700,2750,2800,2850,2900,2950,
      3000,3050,3100,3150,3200,3250,3300,3350,3400,3450,
      3500,3550,3600,3650,3700,3750,3800,3850,3900,3950,
    ],
    skills: [
    {
      id: "entrapment",
      name: "Entrapment",
      maxLevel: 10,
      isTalent: false,
      bookCosts: [0, 70, 140, 210, 280, 350, 420, 490, 560, 630],
      learningTimeMinutes: [0, 60, 120, 180, 240, 300, 360, 420, 480, 540],
      description: "Increases Bear Hunt Rally Capacity. +30,000 per level, up to +300,000 at Lv. 10.",
    },
    {
      id: "scavenging",
      name: "Scavenging",
      maxLevel: 5,
      isTalent: false,
      bookCosts: [0, 400, 800, 1600, 3200],
      learningTimeMinutes: [0, 460, 920, 1840, 3680],
      description: "Grants x100 Enhancement XP Component rewards every Bear Hunt. +1 per level, up to +5 at Lv. 5.",
    },
    {
      id: "weapon-master",
      name: "Weapon Master",
      maxLevel: 5,
      isTalent: false,
      bookCosts: [0, 500, 1000, 2000, 4000],
      learningTimeMinutes: [0, 720, 1440, 2880, 5760],
      description: "Boosts Essence Stone rewards obtained in Bear Hunt. +1 per level, up to +5 at Lv. 5.",
    },
    {
      id: "hunters-heart",
      name: "Hunter's Heart",
      maxLevel: 11,
      isTalent: true,
      bookCosts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      learningTimeMinutes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      description: "Enhances Bear Hunt Damage Points by up to +30%. Auto-upgrades with relationship level.",
    },
    {
      id: "ursas-bane",
      name: "Ursa's Bane",
      maxLevel: 10,
      isTalent: false,
      bookCosts: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900],
      learningTimeMinutes: [0, 170, 340, 510, 690, 860, 1030, 1210, 1380, 1550],
      description: "Increases Bear Hunt Troops Deployment capacity. +3,000 per level, up to +30,000 at Lv. 10.",
    },
    ],
  },
  {
    id: "agnes",
    name: "Agnes",
    generation: 1,
    focus: "City Economy",
    estimated: false,
    totalSigils: 275,
    sigilCosts: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
    affinityCosts: [
      1000,240,260,270,280,290,320,340,360,390,
      410,440,460,480,510,530,560,580,600,630,
      650,680,700,720,750,770,800,820,840,880,
      920,950,990,1020,1060,1100,1130,1170,1200,1250,
      1300,1350,1400,1440,1490,1540,1590,1640,1680,1740,
      1800,1860,1920,1980,2040,2100,2160,2220,2280,2340,
      2400,2460,2520,2580,2640,2700,2760,2820,2880,2940,
      3000,3060,3120,3180,3240,3300,3360,3420,3480,3540,
      3600,3660,3720,3780,3840,3900,3960,4020,4080,4140,
      4200,4260,4320,4380,4440,4500,4560,4620,4680,4740,
    ],
    skills: [
    {
      id: "efficient-recon",
      name: "Efficient Recon",
      maxLevel: 5,
      isTalent: false,
      bookCosts: [0, 500, 1000, 2000, 4000],
      learningTimeMinutes: [0, 720, 1440, 2880, 5760],
      description: "Extra Lighthouse Intel missions, once per day, refreshing at 00:00 UTC. +2, +3, +4, +6, +8 by level.",
    },
    {
      id: "optimization",
      name: "Optimization",
      maxLevel: 5,
      isTalent: false,
      bookCosts: [0, 400, 800, 1600, 3200],
      learningTimeMinutes: [0, 570, 1150, 2300, 4600],
      description: "Extra Chief Stamina on each Storehouse claim, so twice a day. +10, +15, +20, +30, +40 by level.",
    },
    {
      id: "project-management",
      name: "Project Management",
      maxLevel: 5,
      isTalent: false,
      bookCosts: [0, 200, 400, 800, 1600],
      learningTimeMinutes: [0, 230, 460, 920, 1840],
      description: "Accelerates building development and research. Up to -8 hours on every new build and +5% Research Speed at Lv. 5.",
    },
    {
      id: "earthbreaker",
      name: "Earthbreaker",
      maxLevel: 11,
      isTalent: true,
      bookCosts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      learningTimeMinutes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      description: "Produces Seeker Chests during resource gathering containing Fire Crystals, Gems, and more. Auto-upgrades with relationship level.",
    },
    {
      id: "covert-knowledge",
      name: "Covert Knowledge",
      maxLevel: 10,
      isTalent: false,
      bookCosts: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900],
      learningTimeMinutes: [0, 170, 340, 510, 690, 860, 1030, 1210, 1380, 1550],
      description: "Grants additional Mystery Badges upon daily mission completion and free refreshes at the Mystery Shop. Up to +120 badges and +4 refreshes at Lv. 10.",
    },
    ],
  },
  {
    id: "holger",
    name: "Holger",
    generation: 1,
    focus: "Arena",
    estimated: false,
    totalSigils: 440,
    sigilCosts: [8, 16, 24, 32, 40, 48, 56, 64, 72, 80],
    affinityCosts: [
      1000,600,630,660,690,720,780,840,900,960,
      1020,1080,1140,1200,1260,1320,1380,1440,1500,1560,
      1620,1680,1740,1800,1860,1920,1980,2040,2100,2190,
      2280,2370,2460,2550,2640,2730,2820,2910,3000,3120,
      3240,3360,3480,3600,3720,3840,3960,4080,4200,4350,
      4500,4650,4800,4950,5100,5250,5400,5550,5700,5850,
      6000,6150,6300,6450,6600,6750,6900,7050,7200,7350,
      7500,7650,7800,7950,8100,8250,8400,8550,8700,8850,
      9000,9150,9300,9450,9600,9750,9900,10050,10200,10350,
      10500,10650,10800,10950,11100,11250,11400,11550,11700,11850,
    ],
    skills: [
    {
      id: "arena-elite",
      name: "Arena Elite",
      maxLevel: 10,
      isTalent: false,
      bookCosts: [0, 600, 1200, 1800, 2400, 3000, 3600, 4200, 4800, 5400],
      learningTimeMinutes: [0, 1380, 2760, 4140, 5530, 6910, 8290, 9670, 11060, 12440],
      description: "Increases Arena heroes' Attack and Health. Up to +20% at Lv. 10.",
    },
    {
      id: "crowd-pleaser",
      name: "Crowd Pleaser",
      maxLevel: 10,
      isTalent: false,
      bookCosts: [0, 300, 600, 900, 1200, 1500, 1800, 2100, 2400, 2700],
      learningTimeMinutes: [0, 510, 1030, 1550, 2070, 2590, 3110, 3620, 4140, 4660],
      description: "Boosts daily and weekly Arena Token earnings. Up to +50% additional tokens at Lv. 10.",
    },
    {
      id: "arena-star",
      name: "Arena Star",
      maxLevel: 10,
      isTalent: false,
      bookCosts: [0, 300, 600, 900, 1200, 1500, 1800, 2100, 2400, 2700],
      learningTimeMinutes: [0, 510, 1030, 1550, 2070, 2590, 3110, 3620, 4140, 4660],
      description: "Expands Arena Shop with discounted items. Up to +3 items at 50% discount at Lv. 10.",
    },
    {
      id: "blade-dancing",
      name: "Blade Dancing",
      maxLevel: 11,
      isTalent: true,
      bookCosts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      learningTimeMinutes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      description: "Awards Arena Star Chests with randomized mythic shards, essence stones, and speedup items. Auto-upgrades with relationship level.",
    },
    {
      id: "legacy",
      name: "Legacy",
      maxLevel: 10,
      isTalent: false,
      bookCosts: [0, 600, 1200, 1800, 2400, 3000, 3600, 4200, 4800, 5400],
      learningTimeMinutes: [0, 1380, 2760, 4140, 5530, 6910, 8290, 9670, 11060, 12440],
      description: "Grants heroes additional Attack and Health in the Arena. Up to +20% at Lv. 10.",
    },
    ],
  },
  {
    id: "romulus",
    name: "Romulus",
    generation: 1,
    focus: "PvP / Military",
    estimated: false,
    totalSigils: 1820,
    sigilCosts: [20, 40, 80, 120, 160, 200, 240, 280, 320, 360],
    affinityCosts: [
      1000,1100,1160,1210,1270,1320,1430,1540,1650,1760,
      1870,1980,2090,2200,2310,2420,2530,2640,2750,2860,
      2970,3080,3190,3300,3410,3520,3630,3740,3850,4020,
      4180,4350,4510,4680,4840,5010,5170,5340,5500,5720,
      5940,6160,6380,6600,6820,7040,7260,7480,7700,7980,
      8250,8530,8800,9080,9350,9630,9900,10180,10450,10730,
      11000,11280,11550,11830,12100,12380,12650,12930,13200,13480,
      13750,14030,14300,14580,14850,15130,15400,15680,15950,16230,
      16500,16780,17050,17330,17600,17880,18150,18430,18700,18980,
      19250,19530,19800,20080,20350,20630,20900,21180,21450,21730,
    ],
    skills: [
    {
      id: "call-of-war",
      name: "Call of War",
      maxLevel: 10,
      isTalent: false,
      bookCosts: [0, 300, 600, 900, 1200, 1500, 1800, 2100, 2400, 2700],
      learningTimeMinutes: [0, 510, 1030, 1550, 2070, 2590, 3110, 3620, 4140, 4660],
      description: "Enables daily recruitment of additional high-level troops from any camp and grants Loyalty Tags. Up to +600 troops and +10 tags at Lv. 10.",
    },
    {
      id: "last-line",
      name: "Last Line",
      maxLevel: 20,
      isTalent: false,
      bookCosts: [0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 8000, 9000, 9000, 10000, 10000],
      learningTimeMinutes: [0, 1440, 2880, 4320, 5760, 7200, 8640, 10080, 11520, 12960, 14400, 15840, 17280, 20160, 23040, 23040, 25920, 25920, 28800, 28800],
      description: "Provides a tactical defensive boost to troops. Up to +10% Attack and Defense at Lv. 20.",
    },
    {
      id: "spirit-of-aeetis",
      name: "Spirit of Aeetis",
      maxLevel: 20,
      isTalent: false,
      bookCosts: [0, 800, 1500, 2200, 3000, 3800, 4500, 5200, 6000, 6800, 7500, 8200, 9000, 10500, 12000, 12000, 13500, 13500, 15000, 15000],
      learningTimeMinutes: [0, 2650, 4960, 7280, 9930, 12580, 14900, 17220, 19870, 22520, 24840, 27150, 29800, 34770, 39740, 39740, 44710, 44710, 49680, 49680],
      description: "Enhances combat effectiveness of troops. Up to +10% Lethality and Health at Lv. 20.",
    },
    {
      id: "commanders-crest",
      name: "Commander's Crest",
      maxLevel: 11,
      isTalent: true,
      bookCosts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      learningTimeMinutes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      description: "Expands heroes' expedition army size limits. Up to +10,000 troops at Lv. 11. Auto-upgrades with relationship level.",
    },
    {
      id: "one-heart",
      name: "One Heart",
      maxLevel: 20,
      isTalent: false,
      bookCosts: [0, 800, 1500, 2200, 3000, 3800, 4500, 5200, 6000, 6800, 7500, 8200, 9000, 10500, 12000, 12000, 13500, 13500, 15000, 15000],
      learningTimeMinutes: [0, 2990, 5610, 8230, 11230, 14220, 16840, 19460, 22460, 25460, 28080, 30700, 33690, 39310, 44920, 44920, 50540, 50540, 56160, 56160],
      description: "Increases rally capacity. Up to +100,000 at Lv. 20.",
    },
    ],
  },
  {
    id: "fabian",
    name: "Fabian",
    generation: 2,
    focus: "Foundry Battle",
    estimated: false,
    totalSigils: 660,
    sigilCosts: [12, 24, 36, 48, 60, 72, 84, 96, 108, 120],
    affinityCosts: [
      1000,1000,1050,1100,1150,1200,1300,1400,1500,1600,
      1700,1800,1900,2000,2100,2200,2300,2400,2500,2600,
      2700,2800,2900,3000,3100,3200,3300,3400,3500,3650,
      3800,3950,4100,4250,4400,4550,4700,4850,5000,5200,
      5400,5600,5800,6000,6200,6400,6600,6800,7000,7250,
      7500,7750,8000,8250,8500,8750,9000,9250,9500,9750,
      10000,10250,10500,10750,11000,11250,11500,11750,12000,12250,
      12500,12750,13000,13250,13500,13750,14000,14250,14500,14750,
      15000,15250,15500,15750,16000,16250,16500,16750,17000,17250,
      17500,17750,18000,18250,18500,18750,19000,19250,19500,19750,
    ],
    skills: [
    {
      id: "salvager",
      name: "Salvager",
      maxLevel: 10,
      isTalent: false,
      bookCosts: [0, 300, 600, 900, 1200, 1500, 1800, 2100, 2400, 2700],
      learningTimeMinutes: [0, 430, 860, 1290, 1720, 2160, 2590, 3020, 3450, 3880],
      description: "Increases Arsenal Token earnings from Foundry Battle. Up to +100% at Lv. 10.",
    },
    {
      id: "crisis-rescue",
      name: "Crisis Rescue",
      maxLevel: 10,
      isTalent: false,
      bookCosts: [0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500],
      learningTimeMinutes: [0, 551, 1790, 2680, 3580, 4480, 5370, 6270, 7160, 8060],
      description: "Enables instant recovery of troops during Foundry Battle and Tundra Hellfire. Up to 1,000,000 troops at Lv. 10.",
    },
    {
      id: "heightened-firepower",
      name: "Heightened Firepower",
      maxLevel: 20,
      isTalent: false,
      bookCosts: [0, 200, 500, 700, 1000, 1200, 1500, 1700, 2000, 2300, 2500, 2700, 3000, 3500, 4000, 4000, 4500, 4500, 5100, 5100],
      learningTimeMinutes: [0, 460, 1150, 1610, 2300, 2760, 3450, 3910, 4600, 5300, 5760, 6220, 6910, 8060, 9210, 9210, 10360, 10360, 11750, 11750],
      description: "Grants Foundry Battle and Tundra Hellfire troops Lethality and Health boosts. Up to +30% each at Lv. 20.",
    },
    {
      id: "craftsman-of-war",
      name: "Craftsman of War",
      maxLevel: 11,
      isTalent: true,
      bookCosts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      learningTimeMinutes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      description: "Grants allied troops in Foundry Battle and Tundra Hellfire Attack and Defense boosts. Up to +30% each at Lv. 11. Auto-upgrades with relationship level.",
    },
    {
      id: "battle-bulwark",
      name: "Battle Bulwark",
      maxLevel: 20,
      isTalent: false,
      bookCosts: [0, 300, 700, 1000, 1400, 1800, 2100, 2400, 2800, 3200, 3500, 3800, 4200, 4900, 5700, 5700, 6400, 6400, 7100, 7100],
      learningTimeMinutes: [0, 770, 1810, 2590, 3620, 4660, 5440, 6220, 7250, 8290, 9070, 9850, 10880, 12700, 14770, 14770, 16580, 16580, 18400, 18400],
      description: "Increases Rally Capacity in Foundry Battle and Tundra Hellfire. Up to +150,000 at Lv. 20.",
    },
    ],
  },
  {
    id: "baldur",
    name: "Baldur",
    generation: 2,
    focus: "Alliance Events",
    estimated: false,
    totalSigils: 330,
    sigilCosts: [6, 12, 18, 24, 30, 36, 42, 48, 54, 60],
    affinityCosts: [
      1000,400,420,440,460,480,520,560,600,640,
      680,720,760,800,840,880,920,960,1000,1040,
      1080,1120,1160,1200,1240,1280,1320,1360,1400,1460,
      1520,1580,1640,1700,1760,1820,1880,1940,2000,2080,
      2160,2240,2320,2400,2480,2560,2640,2720,2800,2900,
      3000,3100,3200,3300,3400,3500,3600,3700,3800,3900,
      4000,4100,4200,4300,4400,4500,4600,4700,4800,4900,
      5000,5100,5200,5300,5400,5500,5600,5700,5800,5900,
      6000,6100,6200,6300,6400,6500,6600,6700,6800,6900,
      7000,7100,7200,7300,7400,7500,7600,7700,7800,7900,
    ],
    skills: [
    {
      id: "blazing-sunrise",
      name: "Blazing Sunrise",
      maxLevel: 10,
      isTalent: false,
      bookCosts: [0, 300, 600, 900, 1200, 1500, 1800, 2100, 2400, 2700],
      learningTimeMinutes: [0, 430, 860, 1290, 1720, 2160, 2590, 3020, 3450, 3880],
      description: "Increases Alliance Mobilization Points and adds bonus milestone tiers. Up to +20% points and +3 tiers at Lv. 10.",
    },
    {
      id: "honored-conquest",
      name: "Honored Conquest",
      maxLevel: 10,
      isTalent: false,
      bookCosts: [0, 300, 600, 900, 1200, 1500, 1800, 2100, 2400, 2700],
      learningTimeMinutes: [0, 430, 860, 1290, 1720, 2160, 2590, 3020, 3450, 3880],
      description: "Grants additional Alliance Championship Badges and bonus shop items. Up to +50% badges and +3 items at Lv. 10.",
    },
    {
      id: "bounty-hunter",
      name: "Bounty Hunter",
      maxLevel: 10,
      isTalent: false,
      bookCosts: [0, 300, 600, 900, 1200, 1500, 1800, 2100, 2400, 2700],
      learningTimeMinutes: [0, 430, 860, 1290, 1720, 2160, 2590, 3020, 3450, 3880],
      description: "Increases Crazy Joe point rewards and awards bonus chests. Up to +50% points and +10 bonus chests per season at Lv. 10.",
    },
    {
      id: "master-negotiator",
      name: "Master Negotiator",
      maxLevel: 11,
      isTalent: true,
      bookCosts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      learningTimeMinutes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      description: "Reduces Alliance Shop prices and increases Personal Activity Triumph Chest Defense rewards. Auto-upgrades with relationship level.",
    },
    {
      id: "dawn-hymn",
      name: "Dawn Hymn",
      maxLevel: 10,
      isTalent: false,
      bookCosts: [0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500],
      learningTimeMinutes: [0, 860, 1720, 2590, 3450, 4320, 5180, 6040, 6910, 7770],
      description: "Increases Alliance Showdown points (excluding Tundra Trade Route) and adds daily milestone tiers. Up to +50% points and +3 tiers at Lv. 10.",
    },
    ],
  },
  {
    id: "valeria",
    name: "Valeria",
    generation: 2,
    focus: "SvS Battle Phase",
    estimated: false,
    totalSigils: 1100,
    sigilCosts: [20, 40, 60, 80, 100, 120, 140, 160, 180, 200],
    affinityCosts: [
      1000,1840,1940,2030,2120,2210,2400,2580,2760,2950,
      3130,3320,3500,3680,3870,4050,4240,4420,4600,4790,
      4970,5160,5340,5520,5710,5890,6080,6260,6440,6720,
      7000,7275,7550,7825,8100,8375,8650,8925,9200,9570,
      9940,10310,10680,11040,11410,11780,12150,12520,12880,13340,
      13800,14260,14720,15180,15640,16100,16560,17020,17480,17940,
      18400,18860,19320,19780,20240,20700,21160,21620,22080,22540,
      23000,23460,23920,24380,24840,25300,25760,26220,26680,27140,
      27600,28060,28520,28980,29440,29900,30360,30820,31280,31740,
      32200,32660,33120,33580,34040,34500,34960,35420,35880,36340,
    ],
    skills: [
    {
      id: "well-prepared",
      name: "Well Prepared",
      maxLevel: 10,
      isTalent: false,
      bookCosts: [0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500],
      learningTimeMinutes: [0, 720, 1440, 2160, 2880, 3600, 4320, 5040, 5760, 6480],
      description: "Increases State of Power Preparation Phase point gains and adds bonus daily Personal Point tiers. Up to +20% and +3 tiers at Lv. 10.",
    },
    {
      id: "radiant-honor",
      name: "Radiant Honor",
      maxLevel: 10,
      isTalent: false,
      bookCosts: [0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500],
      learningTimeMinutes: [0, 1000, 2010, 3020, 4030, 5040, 6040, 7050, 8060, 9070],
      description: "Boosts Sunfire Tokens earned from Medal Rewards and adds items to the State of Power Shop. Up to +50 tokens and +3 items at Lv. 10.",
    },
    {
      id: "battle-concerto",
      name: "Battle Concerto",
      maxLevel: 20,
      isTalent: false,
      bookCosts: [0, 800, 1500, 2200, 3000, 3800, 4500, 5200, 6000, 6800, 7500, 8200, 9000, 10500, 12000, 12000, 13500, 13500, 15000, 15000],
      learningTimeMinutes: [0, 1840, 3450, 5060, 6910, 8750, 10360, 11980, 13820, 15660, 17280, 18890, 20730, 24190, 27640, 27640, 31100, 31100, 34560, 34560],
      description: "Enhances all troops' Lethality and Health during State of Power Battle Phase. Up to +30% each at Lv. 20.",
    },
    {
      id: "conquerors-spirit",
      name: "Conqueror's Spirit",
      maxLevel: 11,
      isTalent: true,
      bookCosts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      learningTimeMinutes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      description: "Grants all troops Attack and Defense boosts in State of Power Battle Phase. Up to +30% each at Lv. 11. Auto-upgrades with relationship level.",
    },
    {
      id: "crushing-force",
      name: "Crushing Force",
      maxLevel: 20,
      isTalent: false,
      bookCosts: [0, 800, 1500, 2200, 3000, 3800, 4500, 5200, 6000, 6800, 7500, 8200, 9000, 10500, 12000, 12000, 13500, 13500, 15000, 15000],
      learningTimeMinutes: [0, 2070, 3880, 5700, 7770, 9850, 11660, 13470, 15550, 17620, 19440, 21250, 23320, 27210, 31100, 31100, 34990, 34990, 38880, 38880],
      description: "Increases Rally Capacity in State of Power Battle Phase. Up to +150,000 at Lv. 20.",
    },
    ],
  },
  {
    id: "ronne",
    name: "Ronne",
    generation: 2,
    focus: "Tundra Trade Route",
    estimated: true,
    totalSigils: 440,
    sigilCosts: [8, 16, 24, 32, 40, 48, 56, 64, 72, 80],
    affinityCosts: [
      678,678,678,678,678,678,678,678,678,678,
      1290,1290,1290,1290,1290,1290,1290,1290,1290,1290,
      1893,1893,1893,1893,1893,1893,1893,1893,1893,1893,
      2688,2688,2688,2688,2688,2688,2688,2688,2688,2688,
      3783,3783,3783,3783,3783,3783,3783,3783,3783,3783,
      5175,5175,5175,5175,5175,5175,5175,5175,5175,5175,
      6675,6675,6675,6675,6675,6675,6675,6675,6675,6675,
      8175,8175,8175,8175,8175,8175,8175,8175,8175,8175,
      9675,9675,9675,9675,9675,9675,9675,9675,9675,9675,
      11175,11175,11175,11175,11175,11175,11175,11175,11175,11175,
    ],
    skills: [
    {
      id: "cartographic-memory",
      name: "Cartographic Memory",
      maxLevel: 10,
      isTalent: false,
      bookCosts: [0, 300, 600, 900, 1200, 1500, 1800, 2100, 2400, 2700],
      learningTimeMinutes: [0, 430, 860, 1290, 1720, 2160, 2590, 3020, 3450, 3880],
      description: "Accelerates caravan arrival times and grants free truck refreshes. Up to +20% speed and +3 refreshes at Lv. 10.",
    },
    {
      id: "treasure-scent",
      name: "Treasure Scent",
      maxLevel: 10,
      isTalent: false,
      bookCosts: [0, 300, 600, 900, 1200, 1500, 1800, 2100, 2400, 2700],
      learningTimeMinutes: [0, 600, 1210, 1810, 2420, 3020, 3620, 4230, 4830, 5440],
      description: "Grants a chance of raiding extra cargo from trucks. Up to +100% chance of +1 extra cargo at Lv. 10.",
    },
    {
      id: "giving-back",
      name: "Giving Back",
      maxLevel: 10,
      isTalent: false,
      bookCosts: [0, 600, 1200, 1800, 2400, 3000, 3600, 4200, 4800, 5400],
      learningTimeMinutes: [0, 1380, 2760, 4140, 5530, 6910, 8290, 9670, 11060, 12440],
      description: "Provides a chance of recovering cargo when raided and escorts Elite Guardboxes. Up to +50% recovery chance and +2 guardboxes at Lv. 10.",
    },
    {
      id: "gold-class",
      name: "Gold Class",
      maxLevel: 10,
      isTalent: false,
      bookCosts: [0, 1200, 2400, 3600, 4800, 6000, 7200, 8400, 9600, 10800],
      learningTimeMinutes: [0, 3110, 6220, 9330, 12440, 15550, 18660, 21770, 24880, 27990],
      description: "Guarantees Legendary escort missions and allows escorting extra trucks daily. Up to 1 Legendary per 4 missions and +1 extra truck at Lv. 10.",
    },
    {
      id: "trade-dominion",
      name: "Trade Dominion",
      maxLevel: 11,
      isTalent: true,
      bookCosts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      learningTimeMinutes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      description: "When caravans are raided or attack other trucks, troops gain Attack and Defense boosts. Up to +30% each at Lv. 11. Auto-upgrades with relationship level.",
    },
    ],
  },
  {
    id: "kathy",
    name: "Kathy",
    generation: 3,
    focus: "Mining Specialist",
    estimated: true,
    totalSigils: 550,
    sigilCosts: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    affinityCosts: [
      1018,1018,1018,1018,1018,1018,1018,1018,1018,1018,
      1935,1935,1935,1935,1935,1935,1935,1935,1935,1935,
      2840,2840,2840,2840,2840,2840,2840,2840,2840,2840,
      4034,4034,4034,4034,4034,4034,4034,4034,4034,4034,
      5675,5675,5675,5675,5675,5675,5675,5675,5675,5675,
      7765,7765,7765,7765,7765,7765,7765,7765,7765,7765,
      10015,10015,10015,10015,10015,10015,10015,10015,10015,10015,
      12265,12265,12265,12265,12265,12265,12265,12265,12265,12265,
      14515,14515,14515,14515,14515,14515,14515,14515,14515,14515,
      16765,16765,16765,16765,16765,16765,16765,16765,16765,16765,
    ],
    skills: [
    {
      id: "icefire-hunter",
      name: "Icefire Hunter",
      maxLevel: 10,
      isTalent: false,
      bookCosts: [0, 300, 600, 900, 1200, 1500, 1800, 2100, 2400, 2700],
      learningTimeMinutes: [0, 430, 860, 1290, 1720, 2160, 2590, 3020, 3450, 3880],
      description: "Grants troops additional XP from defeating Mine Patrols for Frostfire Skill upgrades. +5% per level, up to +50% at Lv. 10.",
    },
    {
      id: "valorous-cold",
      name: "Valorous Cold",
      maxLevel: 10,
      isTalent: false,
      bookCosts: [0, 300, 600, 900, 1200, 1500, 1800, 2100, 2400, 2700],
      learningTimeMinutes: [0, 600, 1210, 1810, 2420, 3020, 3620, 4230, 4830, 5440],
      description: "Increases troop deployment capacity and shortens hero recovery after defeat in Frostfire Mine. +5,000 capacity and +6% faster recovery per level.",
    },
    {
      id: "winter-treasures",
      name: "Winter Treasures",
      maxLevel: 10,
      isTalent: false,
      bookCosts: [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000],
      learningTimeMinutes: [0, 2300, 4600, 6910, 9210, 11520, 13820, 16120, 18430, 20730],
      description: "Grants additional Charm Designs on obtaining 200,000 Orichalcum in Frostfire Mine. +6 per level, up to +60 at Lv. 10.",
    },
    {
      id: "child-of-frost",
      name: "Child of Frost",
      maxLevel: 11,
      isTalent: true,
      bookCosts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      learningTimeMinutes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      description: "Increases troops' Lethality and Health in Frostfire Mine battles. Auto-upgrades with relationship level, up to +30% at Lv. 11.",
    },
    {
      id: "efficient-mining",
      name: "Efficient Mining",
      maxLevel: 10,
      isTalent: false,
      bookCosts: [0, 1200, 2400, 3600, 4800, 6000, 7200, 8400, 9600, 10800],
      learningTimeMinutes: [0, 3110, 6220, 9330, 12440, 15550, 18660, 21770, 24880, 27990],
      description: "Earns Orichalcum per minute once the Frostfire Mine battle phase begins and grants additional Charm Guides on obtaining 200,000 Orichalcum. +500/min and +10 guides per level.",
    },
    ],
  },
  {
    id: "gareth",
    name: "Gareth",
    generation: 3,
    focus: "Troop Survivability",
    estimated: false,
    totalSigils: 2730,
    sigilCosts: [30, 60, 120, 180, 240, 300, 360, 420, 480, 540],
    affinityCosts: [
      1000,3000,3150,3300,3450,3600,3900,4200,4500,4800,
      5100,5400,5700,6000,6300,6600,6900,7200,7500,7800,
      8100,8400,8700,9000,9300,9600,9900,10200,10500,10950,
      11400,11850,12300,12750,13200,13650,14100,14550,15000,15600,
      16200,16800,17400,18000,18600,19200,19800,20400,21000,21750,
      22500,23250,24000,24750,25500,26250,27000,27750,28500,29250,
      30000,30750,31500,32250,33000,33750,34500,35250,36000,36750,
      37500,38250,39000,39750,40500,41250,42000,42750,43500,44250,
      45000,45750,46500,47250,48000,48750,49500,50250,51000,51750,
      52500,53250,54000,54750,55500,56250,57000,57750,58500,59250,
    ],
    skills: [
    {
      id: "gifts-of-iron",
      name: "Gifts of Iron",
      maxLevel: 10,
      isTalent: false,
      bookCosts: [0, 300, 600, 900, 1200, 1500, 1800, 2100, 2400, 2700],
      learningTimeMinutes: [0, 430, 860, 1290, 1720, 2160, 2590, 3020, 3450, 3880],
      description: "For every 100 troops trained, Gareth is granted Ironwrought Chests: 1 per 100 at Lv. 1–4, 2 at Lv. 5–9, 3 at Lv. 10; daily cap grows 6 → 30. Chest pool (both VERIFIED in-game): mostly 5-minute speedups, plus 1-hour speedups, 12-hour combat boosts and rare Fire Crystals (×5 at 4.4%, ×100 at 0.1%).",
    },
    {
      id: "porcupine",
      name: "Porcupine",
      maxLevel: 20,
      isTalent: false,
      bookCosts: [0, 1250, 2500, 3750, 5000, 6250, 7500, 8750, 10000, 11250, 12500, 13750, 15000, 17500, 20000, 20000, 22500, 22500, 25000, 25000],
      learningTimeMinutes: [0, 2880, 5760, 8640, 11520, 14400, 17280, 20160, 23040, 25920, 28800, 31680, 34560, 40320, 46080, 46080, 51840, 51840, 57600, 57600],
      description: "Close formations and iron discipline increase Troops' Defense. +1% at Lv. 1 up to +50% at Lv. 20 (non-linear: 5% at Lv. 5, 15% at Lv. 10, 30% at Lv. 15). VERIFIED in-game.",
    },
    {
      id: "undefeated-will",
      name: "Undefeated Will",
      maxLevel: 20,
      isTalent: false,
      bookCosts: [0, 1250, 2500, 3750, 5000, 6250, 7500, 8750, 10000, 11250, 12500, 13750, 15000, 17500, 20000, 20000, 22500, 22500, 25000, 25000],
      learningTimeMinutes: [0, 3240, 6480, 9720, 12960, 16200, 19440, 22680, 25920, 29160, 32400, 35640, 38880, 45360, 51840, 51840, 58320, 58320, 64800, 64800],
      description: "Gareth's encouragement and command unleash his soldiers' maximum potential, increasing Troops' Health. +1% at Lv. 1 up to +50% at Lv. 20 (same curve as Porcupine). VERIFIED in-game.",
    },
    {
      id: "fearsome-reputation",
      name: "Fearsome Reputation",
      maxLevel: 20,
      isTalent: false,
      bookCosts: [0, 4000, 8000, 12000, 16000, 20000, 24000, 28000, 32000, 36000, 40000, 44000, 48000, 56000, 64000, 64000, 72000, 72000, 80000, 80000],
      learningTimeMinutes: [0, 12670, 25340, 38010, 50680, 63360, 76030, 88700, 101370, 114040, 126720, 139390, 152060, 177400, 202750, 202750, 228090, 228090, 253440, 253440],
      description: "Fear of the “Spiked Commander” reduces enemy troops' Lethality: 0.25% per level, up to 5% at Lv. 20. VERIFIED in-game.",
    },
    {
      id: "rallying-cry",
      name: "Rallying Cry",
      maxLevel: 11,
      isTalent: true,
      bookCosts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      learningTimeMinutes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      description: "Increases Infirmary Capacity and Healing Speed: +50,000 / +3% at Lv. 1 up to +200,000 / +50% at Lv. 11. Auto-upgrades with relationship level. VERIFIED in-game.",
    },
    ],
  },
];

const byId = new Map(whiteoutExperts.map(e => [e.id, e]));
export const expertById = (id: string) => byId.get(id);

const sumFrom = (costs: number[], from: number) =>
  costs.slice(Math.max(from, 0)).reduce((total, cost) => total + cost, 0);

/**
 * Affinity still needed to take an expert from `level` to the cap. Level 0 means
 * not yet unlocked, so the unlock cost at index 0 is included.
 */
export const affinityRemaining = (expert: ExpertDefinition, level: number) =>
  sumFrom(expert.affinityCosts, Math.min(Math.max(level, 0), EXPERT_MAX_LEVEL));

/** Affinity to take an expert from `level` up by `steps` levels. */
export const affinityForLevels = (expert: ExpertDefinition, level: number, steps: number) =>
  expert.affinityCosts
    .slice(Math.max(level, 0), Math.max(level, 0) + Math.max(steps, 0))
    .reduce((total, cost) => total + cost, 0);

/**
 * The eleven relationship statuses, in order. Status 0 is where an expert
 * starts; the other ten each sit on a gate at a multiple of ten.
 */
export const EXPERT_STATUSES = [
  'Stranger',
  'Acquaintance 1',
  'Acquaintance 2',
  'Acquaintance 3',
  'Casual 1',
  'Casual 2',
  'Casual 3',
  'Close 1',
  'Close 2',
  'Close 3',
  'Intimate',
] as const;

/**
 * Troops' Defense granted by the status itself, on top of the talent.
 *
 * Read off the in-game Relationship Advancement Preview, which steps by 0.6%
 * per status to +6.60% at Intimate. Only one expert's preview was seen, so if a
 * future expert pays a different stat this is the line to correct.
 */
export const STATUS_DEFENCE_PERCENT = EXPERT_STATUSES.map((_, i) => (i + 1) * 0.6);

/**
 * The most gates a level COULD have paid for, which is not the same as how
 * many it has.
 *
 * Reaching Lv 70 does not make an expert Close 1. The level is what gifts buy;
 * the status is what sigils buy, and until the gate at 70 is paid the expert
 * sits at Lv 70 and Casual 3 at the same time. Treating this as the status was
 * wrong and it showed: the planner offered Cyrille's Entrapment Lv 10, which
 * needs Close 1, to a Cyrille who was Lv 70 and had not paid for it.
 *
 * So this is a CEILING on gates paid, used to stop a stored figure claiming
 * more gates than the level can have reached. Gates actually paid are stored
 * per expert, not derived here.
 */
export const gatesReachable = (level: number) =>
  Math.min(Math.floor(Math.max(level, 0) / 10), EXPERT_GATES);

/**
 * Gates a level must ALREADY have paid for, which is the floor rather than the
 * ceiling.
 *
 * Affinity will not carry an expert past a multiple of ten, so being at Lv 71
 * proves the gate at 70 was paid. Being at exactly Lv 70 proves nothing: you
 * arrive at the gate before you pay it, which is the one level where both
 * answers are possible. That ambiguity is the only thing the Status picker
 * exists to settle, and the safe default is the lower one, because that is
 * where you stand the moment you get there.
 *
 *   Lv 69 -> 6 gates, Lv 70 -> 6 gates (at the gate, unpaid), Lv 71 -> 7.
 */
export const gatesAssumed = (level: number) =>
  Math.min(Math.floor(Math.max(level - 1, 0) / 10), EXPERT_GATES);

/** Status index 0 to 10, taken from gates PAID, not from the level. */
export const statusIndex = (gatesPaid: number) =>
  Math.min(Math.max(Math.floor(gatesPaid), 0), EXPERT_GATES);

export const statusName = (gatesPaid: number) => EXPERT_STATUSES[statusIndex(gatesPaid)];

/** The talent level the status carries, 1 to 11. */
export const talentLevelForStatus = (gatesPaid: number) => statusIndex(gatesPaid) + 1;

export interface ExpertGate {
  /** The level this gate sits on: 10, 20, and so on to 100. */
  atLevel: number;
  /** That expert's own Sigils needed to pass it. */
  sigils: number;
  /** Affinity still needed to reach the gate from the current level. */
  affinity: number;
}

/** The next gate standing in the way, or null once Intimate is reached. */
export const nextGate = (
  expert: ExpertDefinition,
  level: number,
  gatesPaid: number
): ExpertGate | null => {
  const passed = statusIndex(gatesPaid);
  if (passed >= EXPERT_GATES) return null;
  const atLevel = (passed + 1) * 10;
  const here = Math.max(level, 0);
  return {
    atLevel,
    sigils: expert.sigilCosts[passed],
    // Zero once the level is already past the gate, which is the whole case
    // this rewrite exists for: the affinity is done and only sigils are left.
    affinity: here >= atLevel ? 0 : affinityForLevels(expert, here, atLevel - here),
  };
};

/** Sigils still needed to pass every remaining gate up to Intimate. */
export const sigilsRemaining = (expert: ExpertDefinition, gatesPaid: number) =>
  sumFrom(expert.sigilCosts, statusIndex(gatesPaid));

/** Books of Knowledge still needed to take a skill from `level` to its cap. */
export const booksRemaining = (skill: ExpertSkill, level: number) =>
  sumFrom(skill.bookCosts, Math.min(Math.max(level, 0), skill.maxLevel));

/** Learning minutes still needed to take a skill from `level` to its cap. */
export const learningMinutesRemaining = (skill: ExpertSkill, level: number) =>
  sumFrom(skill.learningTimeMinutes, Math.min(Math.max(level, 0), skill.maxLevel));

/** Books for the next `steps` levels of a skill, stopping at its cap. */
export const booksForLevels = (skill: ExpertSkill, level: number, steps: number) =>
  skill.bookCosts
    .slice(Math.max(level, 0), Math.min(Math.max(level, 0) + Math.max(steps, 0), skill.maxLevel))
    .reduce((total, cost) => total + cost, 0);

/** Learning minutes for the next `steps` levels of a skill. */
export const learningForLevels = (skill: ExpertSkill, level: number, steps: number) =>
  skill.learningTimeMinutes
    .slice(Math.max(level, 0), Math.min(Math.max(level, 0) + Math.max(steps, 0), skill.maxLevel))
    .reduce((total, cost) => total + cost, 0);

/** Affinity a stack of gifts is worth. */
export const affinityFromGifts = (counts: Record<string, number>) =>
  EXPERT_GIFTS.reduce(
    (total, gift) => total + Math.max(counts[gift.id] ?? 0, 0) * gift.affinityPerGift,
    0
  );
