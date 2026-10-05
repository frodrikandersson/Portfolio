// Whiteout Survival pets: levelling food, advancement materials and score.
//
// Pet advancement is scored by events the same way Chief Gear is: the event pays
// a flat rate per 1 advancement score, and advancing a pet at Lv.10, 20, 30 and
// so on grants a fixed score. King of Icefield pays 50 points per advancement
// score, 1,150 per Common Wild Mark and 15,000 per Advanced Wild Mark.
//
// Scraped from wostools.net's pets calculator by running its data module.
// The advancement scores match Fredrik's in-game screenshots exactly
// (Lv.10 = 500, Lv.20 = 1,000, Lv.30 = 2,000, Lv.40 = 3,000, Lv.50 = 4,500).
//
// EDIT FREELY: nothing in the calculator hardcodes these numbers.

import type { ScoringRow } from '../models/whiteoutInterface';

export type PetRarity = 'Common' | 'N' | 'R' | 'SR' | 'SSR';

export const PET_RARITY_LABELS: Record<PetRarity, string> = {
  Common: 'Common',
  N: 'Uncommon',
  R: 'Rare',
  SR: 'Epic',
  SSR: 'Legendary',
};

export interface PetAdvancement {
  /** Level at which this advancement happens. */
  level: number;
  tamingManuals: number;
  energizingPotions: number;
  strengtheningSerums: number;
  /** Score granted, which is what events actually pay for. */
  advancementScore: number;
}

export interface Pet {
  id: string;
  name: string;
  rarity: PetRarity;
  maxLevel: number;
  /** Pet Food to go from each level to the next. Index 0 is level 1 to 2. */
  foodCosts: number[];
  advancementCosts: PetAdvancement[];
  /** Some pets only unlock once another has reached a level. */
  unlocksAfterPetId: string | null;
  unlocksAfterLevel: number | null;
}

export const whiteoutPets: Pet[] = [
  {
    id: "cave-hyena",
    name: "Cave Hyena",
    rarity: "Common",
    maxLevel: 50,
    unlocksAfterPetId: null,
    unlocksAfterLevel: null,
    foodCosts: [150, 160, 170, 180, 190, 200, 210, 220, 235, 250, 265, 280, 295, 310, 325, 340, 355, 370, 390, 410, 430, 450, 470, 490, 510, 530, 550, 570, 600, 630, 660, 690, 720, 750, 780, 810, 840, 870, 910, 950, 990, 1030, 1070, 1110, 1150, 1190, 1230, 1270, 1320],
    advancementCosts: [
      { level: 10, tamingManuals: 15, energizingPotions: 0, strengtheningSerums: 0, advancementScore: 500 },
      { level: 20, tamingManuals: 30, energizingPotions: 0, strengtheningSerums: 0, advancementScore: 1000 },
      { level: 30, tamingManuals: 45, energizingPotions: 10, strengtheningSerums: 0, advancementScore: 2000 },
      { level: 40, tamingManuals: 60, energizingPotions: 20, strengtheningSerums: 0, advancementScore: 3000 },
      { level: 50, tamingManuals: 90, energizingPotions: 30, strengtheningSerums: 10, advancementScore: 4500 },
    ],
  },
  {
    id: "arctic-wolf",
    name: "Arctic Wolf",
    rarity: "N",
    maxLevel: 60,
    unlocksAfterPetId: "cave-hyena",
    unlocksAfterLevel: 15,
    foodCosts: [200, 220, 240, 260, 280, 300, 320, 340, 370, 400, 430, 460, 490, 520, 550, 580, 610, 640, 680, 720, 760, 800, 840, 880, 920, 960, 1000, 1040, 1100, 1160, 1220, 1280, 1340, 1400, 1460, 1520, 1580, 1640, 1720, 1800, 1880, 1960, 2040, 2120, 2200, 2280, 2360, 2440, 2540, 2640, 2740, 2840, 2940, 3040, 3140, 3240, 3340, 3440, 3560],
    advancementCosts: [
      { level: 10, tamingManuals: 20, energizingPotions: 0, strengtheningSerums: 0, advancementScore: 500 },
      { level: 20, tamingManuals: 40, energizingPotions: 0, strengtheningSerums: 0, advancementScore: 1000 },
      { level: 30, tamingManuals: 60, energizingPotions: 10, strengtheningSerums: 0, advancementScore: 2000 },
      { level: 40, tamingManuals: 90, energizingPotions: 20, strengtheningSerums: 0, advancementScore: 3000 },
      { level: 50, tamingManuals: 130, energizingPotions: 30, strengtheningSerums: 10, advancementScore: 4500 },
      { level: 60, tamingManuals: 175, energizingPotions: 50, strengtheningSerums: 20, advancementScore: 6750 },
    ],
  },
  {
    id: "musk-ox",
    name: "Musk Ox",
    rarity: "N",
    maxLevel: 60,
    unlocksAfterPetId: "arctic-wolf",
    unlocksAfterLevel: 15,
    foodCosts: [200, 220, 240, 260, 280, 300, 320, 340, 370, 400, 430, 460, 490, 520, 550, 580, 610, 640, 680, 720, 760, 800, 840, 880, 920, 960, 1000, 1040, 1100, 1160, 1220, 1280, 1340, 1400, 1460, 1520, 1580, 1640, 1720, 1800, 1880, 1960, 2040, 2120, 2200, 2280, 2360, 2440, 2540, 2640, 2740, 2840, 2940, 3040, 3140, 3240, 3340, 3440, 3560],
    advancementCosts: [
      { level: 10, tamingManuals: 20, energizingPotions: 0, strengtheningSerums: 0, advancementScore: 500 },
      { level: 20, tamingManuals: 40, energizingPotions: 0, strengtheningSerums: 0, advancementScore: 1000 },
      { level: 30, tamingManuals: 60, energizingPotions: 10, strengtheningSerums: 0, advancementScore: 2000 },
      { level: 40, tamingManuals: 90, energizingPotions: 20, strengtheningSerums: 0, advancementScore: 3000 },
      { level: 50, tamingManuals: 130, energizingPotions: 30, strengtheningSerums: 10, advancementScore: 4500 },
      { level: 60, tamingManuals: 175, energizingPotions: 50, strengtheningSerums: 20, advancementScore: 6750 },
    ],
  },
  {
    id: "giant-tapir",
    name: "Giant Tapir",
    rarity: "R",
    maxLevel: 70,
    unlocksAfterPetId: "musk-ox",
    unlocksAfterLevel: 15,
    foodCosts: [300, 330, 360, 390, 420, 450, 480, 510, 555, 600, 645, 690, 735, 780, 825, 870, 915, 960, 1020, 1080, 1140, 1200, 1260, 1320, 1380, 1440, 1500, 1560, 1650, 1740, 1830, 1920, 2010, 2100, 2190, 2280, 2370, 2460, 2580, 2700, 2820, 2940, 3060, 3180, 3300, 3420, 3540, 3660, 3810, 3960, 4110, 4260, 4410, 4560, 4710, 4860, 5010, 5160, 5340, 5520, 5700, 5880, 6060, 6240, 6420, 6600, 6780, 6960, 7140],
    advancementCosts: [
      { level: 10, tamingManuals: 25, energizingPotions: 0, strengtheningSerums: 0, advancementScore: 500 },
      { level: 20, tamingManuals: 50, energizingPotions: 0, strengtheningSerums: 0, advancementScore: 1000 },
      { level: 30, tamingManuals: 75, energizingPotions: 10, strengtheningSerums: 0, advancementScore: 2000 },
      { level: 40, tamingManuals: 100, energizingPotions: 20, strengtheningSerums: 0, advancementScore: 3000 },
      { level: 50, tamingManuals: 155, energizingPotions: 30, strengtheningSerums: 10, advancementScore: 4500 },
      { level: 60, tamingManuals: 200, energizingPotions: 50, strengtheningSerums: 20, advancementScore: 6750 },
      { level: 70, tamingManuals: 255, energizingPotions: 80, strengtheningSerums: 40, advancementScore: 10000 },
    ],
  },
  {
    id: "titan-roc",
    name: "Titan Roc",
    rarity: "R",
    maxLevel: 70,
    unlocksAfterPetId: "giant-tapir",
    unlocksAfterLevel: 15,
    foodCosts: [300, 330, 360, 390, 420, 450, 480, 510, 555, 600, 645, 690, 735, 780, 825, 870, 915, 960, 1020, 1080, 1140, 1200, 1260, 1320, 1380, 1440, 1500, 1560, 1650, 1740, 1830, 1920, 2010, 2100, 2190, 2280, 2370, 2460, 2580, 2700, 2820, 2940, 3060, 3180, 3300, 3420, 3540, 3660, 3810, 3960, 4110, 4260, 4410, 4560, 4710, 4860, 5010, 5160, 5340, 5520, 5700, 5880, 6060, 6240, 6420, 6600, 6780, 6960, 7140],
    advancementCosts: [
      { level: 10, tamingManuals: 25, energizingPotions: 0, strengtheningSerums: 0, advancementScore: 500 },
      { level: 20, tamingManuals: 50, energizingPotions: 0, strengtheningSerums: 0, advancementScore: 1000 },
      { level: 30, tamingManuals: 75, energizingPotions: 10, strengtheningSerums: 0, advancementScore: 2000 },
      { level: 40, tamingManuals: 100, energizingPotions: 20, strengtheningSerums: 0, advancementScore: 3000 },
      { level: 50, tamingManuals: 155, energizingPotions: 30, strengtheningSerums: 10, advancementScore: 4500 },
      { level: 60, tamingManuals: 200, energizingPotions: 50, strengtheningSerums: 20, advancementScore: 6750 },
      { level: 70, tamingManuals: 255, energizingPotions: 80, strengtheningSerums: 40, advancementScore: 10000 },
    ],
  },
  {
    id: "giant-elk",
    name: "Giant Elk",
    rarity: "SR",
    maxLevel: 80,
    unlocksAfterPetId: "titan-roc",
    unlocksAfterLevel: 15,
    foodCosts: [400, 440, 480, 520, 560, 600, 640, 680, 740, 800, 860, 920, 980, 1040, 1100, 1160, 1220, 1280, 1360, 1440, 1520, 1600, 1680, 1760, 1840, 1920, 2000, 2080, 2200, 2320, 2440, 2560, 2680, 2800, 2920, 3040, 3160, 3280, 3440, 3600, 3760, 3920, 4080, 4240, 4400, 4560, 4720, 4880, 5080, 5280, 5480, 5680, 5880, 6080, 6280, 6480, 6680, 6880, 7120, 7360, 7600, 7840, 8080, 8320, 8560, 8800, 9040, 9280, 9520, 9760, 10000, 10240, 10480, 10720, 10960, 11200, 11440, 11680, 12000],
    advancementCosts: [
      { level: 10, tamingManuals: 30, energizingPotions: 0, strengtheningSerums: 0, advancementScore: 500 },
      { level: 20, tamingManuals: 60, energizingPotions: 0, strengtheningSerums: 0, advancementScore: 1000 },
      { level: 30, tamingManuals: 95, energizingPotions: 10, strengtheningSerums: 0, advancementScore: 2000 },
      { level: 40, tamingManuals: 125, energizingPotions: 20, strengtheningSerums: 0, advancementScore: 3000 },
      { level: 50, tamingManuals: 190, energizingPotions: 30, strengtheningSerums: 10, advancementScore: 4500 },
      { level: 60, tamingManuals: 250, energizingPotions: 50, strengtheningSerums: 20, advancementScore: 6750 },
      { level: 70, tamingManuals: 310, energizingPotions: 80, strengtheningSerums: 40, advancementScore: 10000 },
      { level: 80, tamingManuals: 380, energizingPotions: 100, strengtheningSerums: 60, advancementScore: 12000 },
    ],
  },
  {
    id: "snow-leopard",
    name: "Snow Leopard",
    rarity: "SR",
    maxLevel: 80,
    unlocksAfterPetId: "giant-elk",
    unlocksAfterLevel: 15,
    foodCosts: [400, 440, 480, 520, 560, 600, 640, 680, 740, 800, 860, 920, 980, 1040, 1100, 1160, 1220, 1280, 1360, 1440, 1520, 1600, 1680, 1760, 1840, 1920, 2000, 2080, 2200, 2320, 2440, 2560, 2680, 2800, 2920, 3040, 3160, 3280, 3440, 3600, 3760, 3920, 4080, 4240, 4400, 4560, 4720, 4880, 5080, 5280, 5480, 5680, 5880, 6080, 6280, 6480, 6680, 6880, 7120, 7360, 7600, 7840, 8080, 8320, 8560, 8800, 9040, 9280, 9520, 9760, 10000, 10240, 10480, 10720, 10960, 11200, 11440, 11680, 12000],
    advancementCosts: [
      { level: 10, tamingManuals: 30, energizingPotions: 0, strengtheningSerums: 0, advancementScore: 500 },
      { level: 20, tamingManuals: 60, energizingPotions: 0, strengtheningSerums: 0, advancementScore: 1000 },
      { level: 30, tamingManuals: 95, energizingPotions: 10, strengtheningSerums: 0, advancementScore: 2000 },
      { level: 40, tamingManuals: 125, energizingPotions: 20, strengtheningSerums: 0, advancementScore: 3000 },
      { level: 50, tamingManuals: 190, energizingPotions: 30, strengtheningSerums: 10, advancementScore: 4500 },
      { level: 60, tamingManuals: 250, energizingPotions: 50, strengtheningSerums: 20, advancementScore: 6750 },
      { level: 70, tamingManuals: 310, energizingPotions: 80, strengtheningSerums: 40, advancementScore: 10000 },
      { level: 80, tamingManuals: 380, energizingPotions: 100, strengtheningSerums: 60, advancementScore: 12000 },
    ],
  },
  {
    id: "cave-lion",
    name: "Cave Lion",
    rarity: "SSR",
    maxLevel: 100,
    unlocksAfterPetId: "snow-leopard",
    unlocksAfterLevel: 15,
    foodCosts: [500, 550, 600, 650, 700, 750, 800, 850, 925, 1000, 1075, 1150, 1225, 1300, 1375, 1450, 1525, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2750, 2900, 3050, 3200, 3350, 3500, 3650, 3800, 3950, 4100, 4300, 4500, 4700, 4900, 5100, 5300, 5500, 5700, 5900, 6100, 6350, 6600, 6850, 7100, 7350, 7600, 7850, 8100, 8350, 8600, 8900, 9200, 9500, 9800, 10100, 10400, 10700, 11000, 11300, 11600, 11900, 12200, 12500, 12800, 13100, 13400, 13700, 14000, 14300, 14600, 15000, 15400, 15800, 16200, 16600, 17000, 17400, 17800, 18200, 18600, 19000, 19400, 19800, 20200, 20600, 21000, 21400, 21800, 22200, 22600, 23100],
    advancementCosts: [
      { level: 10, tamingManuals: 35, energizingPotions: 0, strengtheningSerums: 0, advancementScore: 500 },
      { level: 20, tamingManuals: 70, energizingPotions: 0, strengtheningSerums: 0, advancementScore: 1000 },
      { level: 30, tamingManuals: 110, energizingPotions: 15, strengtheningSerums: 0, advancementScore: 2000 },
      { level: 40, tamingManuals: 145, energizingPotions: 35, strengtheningSerums: 0, advancementScore: 3000 },
      { level: 50, tamingManuals: 220, energizingPotions: 50, strengtheningSerums: 10, advancementScore: 4500 },
      { level: 60, tamingManuals: 290, energizingPotions: 65, strengtheningSerums: 20, advancementScore: 6750 },
      { level: 70, tamingManuals: 365, energizingPotions: 85, strengtheningSerums: 40, advancementScore: 10000 },
      { level: 80, tamingManuals: 440, energizingPotions: 100, strengtheningSerums: 60, advancementScore: 12000 },
      { level: 90, tamingManuals: 585, energizingPotions: 115, strengtheningSerums: 80, advancementScore: 14500 },
      { level: 100, tamingManuals: 730, energizingPotions: 135, strengtheningSerums: 100, advancementScore: 17500 },
    ],
  },
  {
    id: "snow-ape",
    name: "Snow Ape",
    rarity: "SSR",
    maxLevel: 100,
    unlocksAfterPetId: "cave-lion",
    unlocksAfterLevel: 30,
    foodCosts: [500, 550, 600, 650, 700, 750, 800, 850, 925, 1000, 1075, 1150, 1225, 1300, 1375, 1450, 1525, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2750, 2900, 3050, 3200, 3350, 3500, 3650, 3800, 3950, 4100, 4300, 4500, 4700, 4900, 5100, 5300, 5500, 5700, 5900, 6100, 6350, 6600, 6850, 7100, 7350, 7600, 7850, 8100, 8350, 8600, 8900, 9200, 9500, 9800, 10100, 10400, 10700, 11000, 11300, 11600, 11900, 12200, 12500, 12800, 13100, 13400, 13700, 14000, 14300, 14600, 15000, 15400, 15800, 16200, 16600, 17000, 17400, 17800, 18200, 18600, 19000, 19400, 19800, 20200, 20600, 21000, 21400, 21800, 22200, 22600, 23100],
    advancementCosts: [
      { level: 10, tamingManuals: 35, energizingPotions: 0, strengtheningSerums: 0, advancementScore: 500 },
      { level: 20, tamingManuals: 70, energizingPotions: 0, strengtheningSerums: 0, advancementScore: 1000 },
      { level: 30, tamingManuals: 110, energizingPotions: 15, strengtheningSerums: 0, advancementScore: 2000 },
      { level: 40, tamingManuals: 145, energizingPotions: 35, strengtheningSerums: 0, advancementScore: 3000 },
      { level: 50, tamingManuals: 220, energizingPotions: 50, strengtheningSerums: 10, advancementScore: 4500 },
      { level: 60, tamingManuals: 290, energizingPotions: 65, strengtheningSerums: 20, advancementScore: 6750 },
      { level: 70, tamingManuals: 365, energizingPotions: 85, strengtheningSerums: 40, advancementScore: 10000 },
      { level: 80, tamingManuals: 440, energizingPotions: 100, strengtheningSerums: 60, advancementScore: 12000 },
      { level: 90, tamingManuals: 585, energizingPotions: 115, strengtheningSerums: 80, advancementScore: 14500 },
      { level: 100, tamingManuals: 730, energizingPotions: 135, strengtheningSerums: 100, advancementScore: 17500 },
    ],
  },
  {
    id: "iron-rhino",
    name: "Iron Rhino",
    rarity: "SSR",
    maxLevel: 100,
    unlocksAfterPetId: "snow-ape",
    unlocksAfterLevel: 30,
    foodCosts: [500, 550, 600, 650, 700, 750, 800, 850, 925, 1000, 1075, 1150, 1225, 1300, 1375, 1450, 1525, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2750, 2900, 3050, 3200, 3350, 3500, 3650, 3800, 3950, 4100, 4300, 4500, 4700, 4900, 5100, 5300, 5500, 5700, 5900, 6100, 6350, 6600, 6850, 7100, 7350, 7600, 7850, 8100, 8350, 8600, 8900, 9200, 9500, 9800, 10100, 10400, 10700, 11000, 11300, 11600, 11900, 12200, 12500, 12800, 13100, 13400, 13700, 14000, 14300, 14600, 15000, 15400, 15800, 16200, 16600, 17000, 17400, 17800, 18200, 18600, 19000, 19400, 19800, 20200, 20600, 21000, 21400, 21800, 22200, 22600, 23100],
    advancementCosts: [
      { level: 10, tamingManuals: 35, energizingPotions: 0, strengtheningSerums: 0, advancementScore: 500 },
      { level: 20, tamingManuals: 70, energizingPotions: 0, strengtheningSerums: 0, advancementScore: 1000 },
      { level: 30, tamingManuals: 110, energizingPotions: 15, strengtheningSerums: 0, advancementScore: 2000 },
      { level: 40, tamingManuals: 145, energizingPotions: 35, strengtheningSerums: 0, advancementScore: 3000 },
      { level: 50, tamingManuals: 220, energizingPotions: 50, strengtheningSerums: 10, advancementScore: 4500 },
      { level: 60, tamingManuals: 290, energizingPotions: 65, strengtheningSerums: 20, advancementScore: 6750 },
      { level: 70, tamingManuals: 365, energizingPotions: 85, strengtheningSerums: 40, advancementScore: 10000 },
      { level: 80, tamingManuals: 440, energizingPotions: 100, strengtheningSerums: 60, advancementScore: 12000 },
      { level: 90, tamingManuals: 585, energizingPotions: 115, strengtheningSerums: 80, advancementScore: 14500 },
      { level: 100, tamingManuals: 730, energizingPotions: 135, strengtheningSerums: 100, advancementScore: 17500 },
    ],
  },
  {
    id: "saber-tooth-tiger",
    name: "Saber-tooth Tiger",
    rarity: "SSR",
    maxLevel: 100,
    unlocksAfterPetId: "iron-rhino",
    unlocksAfterLevel: 30,
    foodCosts: [500, 550, 600, 650, 700, 750, 800, 850, 925, 1000, 1075, 1150, 1225, 1300, 1375, 1450, 1525, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2750, 2900, 3050, 3200, 3350, 3500, 3650, 3800, 3950, 4100, 4300, 4500, 4700, 4900, 5100, 5300, 5500, 5700, 5900, 6100, 6350, 6600, 6850, 7100, 7350, 7600, 7850, 8100, 8350, 8600, 8900, 9200, 9500, 9800, 10100, 10400, 10700, 11000, 11300, 11600, 11900, 12200, 12500, 12800, 13100, 13400, 13700, 14000, 14300, 14600, 15000, 15400, 15800, 16200, 16600, 17000, 17400, 17800, 18200, 18600, 19000, 19400, 19800, 20200, 20600, 21000, 21400, 21800, 22200, 22600, 23100],
    advancementCosts: [
      { level: 10, tamingManuals: 35, energizingPotions: 0, strengtheningSerums: 0, advancementScore: 500 },
      { level: 20, tamingManuals: 70, energizingPotions: 0, strengtheningSerums: 0, advancementScore: 1000 },
      { level: 30, tamingManuals: 110, energizingPotions: 15, strengtheningSerums: 0, advancementScore: 2000 },
      { level: 40, tamingManuals: 145, energizingPotions: 35, strengtheningSerums: 0, advancementScore: 3000 },
      { level: 50, tamingManuals: 220, energizingPotions: 50, strengtheningSerums: 10, advancementScore: 4500 },
      { level: 60, tamingManuals: 290, energizingPotions: 65, strengtheningSerums: 20, advancementScore: 6750 },
      { level: 70, tamingManuals: 365, energizingPotions: 85, strengtheningSerums: 40, advancementScore: 10000 },
      { level: 80, tamingManuals: 440, energizingPotions: 100, strengtheningSerums: 60, advancementScore: 12000 },
      { level: 90, tamingManuals: 585, energizingPotions: 115, strengtheningSerums: 80, advancementScore: 14500 },
      { level: 100, tamingManuals: 730, energizingPotions: 135, strengtheningSerums: 100, advancementScore: 17500 },
    ],
  },
  {
    id: "mammoth",
    name: "Mammoth",
    rarity: "SSR",
    maxLevel: 100,
    unlocksAfterPetId: "saber-tooth-tiger",
    unlocksAfterLevel: 30,
    foodCosts: [500, 550, 600, 650, 700, 750, 800, 850, 925, 1000, 1075, 1150, 1225, 1300, 1375, 1450, 1525, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2750, 2900, 3050, 3200, 3350, 3500, 3650, 3800, 3950, 4100, 4300, 4500, 4700, 4900, 5100, 5300, 5500, 5700, 5900, 6100, 6350, 6600, 6850, 7100, 7350, 7600, 7850, 8100, 8350, 8600, 8900, 9200, 9500, 9800, 10100, 10400, 10700, 11000, 11300, 11600, 11900, 12200, 12500, 12800, 13100, 13400, 13700, 14000, 14300, 14600, 15000, 15400, 15800, 16200, 16600, 17000, 17400, 17800, 18200, 18600, 19000, 19400, 19800, 20200, 20600, 21000, 21400, 21800, 22200, 22600, 23100],
    advancementCosts: [
      { level: 10, tamingManuals: 35, energizingPotions: 0, strengtheningSerums: 0, advancementScore: 500 },
      { level: 20, tamingManuals: 70, energizingPotions: 0, strengtheningSerums: 0, advancementScore: 1000 },
      { level: 30, tamingManuals: 110, energizingPotions: 15, strengtheningSerums: 0, advancementScore: 2000 },
      { level: 40, tamingManuals: 145, energizingPotions: 35, strengtheningSerums: 0, advancementScore: 3000 },
      { level: 50, tamingManuals: 220, energizingPotions: 50, strengtheningSerums: 10, advancementScore: 4500 },
      { level: 60, tamingManuals: 290, energizingPotions: 65, strengtheningSerums: 20, advancementScore: 6750 },
      { level: 70, tamingManuals: 365, energizingPotions: 85, strengtheningSerums: 40, advancementScore: 10000 },
      { level: 80, tamingManuals: 440, energizingPotions: 100, strengtheningSerums: 60, advancementScore: 12000 },
      { level: 90, tamingManuals: 585, energizingPotions: 115, strengtheningSerums: 80, advancementScore: 14500 },
      { level: 100, tamingManuals: 730, energizingPotions: 135, strengtheningSerums: 100, advancementScore: 17500 },
    ],
  },
  {
    id: "frost-gorilla",
    name: "Frost Gorilla",
    rarity: "SSR",
    maxLevel: 100,
    unlocksAfterPetId: "mammoth",
    unlocksAfterLevel: 30,
    foodCosts: [500, 550, 600, 650, 700, 750, 800, 850, 925, 1000, 1075, 1150, 1225, 1300, 1375, 1450, 1525, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2750, 2900, 3050, 3200, 3350, 3500, 3650, 3800, 3950, 4100, 4300, 4500, 4700, 4900, 5100, 5300, 5500, 5700, 5900, 6100, 6350, 6600, 6850, 7100, 7350, 7600, 7850, 8100, 8350, 8600, 8900, 9200, 9500, 9800, 10100, 10400, 10700, 11000, 11300, 11600, 11900, 12200, 12500, 12800, 13100, 13400, 13700, 14000, 14300, 14600, 15000, 15400, 15800, 16200, 16600, 17000, 17400, 17800, 18200, 18600, 19000, 19400, 19800, 20200, 20600, 21000, 21400, 21800, 22200, 22600, 23100],
    advancementCosts: [
      { level: 10, tamingManuals: 35, energizingPotions: 0, strengtheningSerums: 0, advancementScore: 500 },
      { level: 20, tamingManuals: 70, energizingPotions: 0, strengtheningSerums: 0, advancementScore: 1000 },
      { level: 30, tamingManuals: 110, energizingPotions: 15, strengtheningSerums: 0, advancementScore: 2000 },
      { level: 40, tamingManuals: 145, energizingPotions: 35, strengtheningSerums: 0, advancementScore: 3000 },
      { level: 50, tamingManuals: 220, energizingPotions: 50, strengtheningSerums: 10, advancementScore: 4500 },
      { level: 60, tamingManuals: 290, energizingPotions: 65, strengtheningSerums: 20, advancementScore: 6750 },
      { level: 70, tamingManuals: 365, energizingPotions: 85, strengtheningSerums: 40, advancementScore: 10000 },
      { level: 80, tamingManuals: 440, energizingPotions: 100, strengtheningSerums: 60, advancementScore: 12000 },
      { level: 90, tamingManuals: 585, energizingPotions: 115, strengtheningSerums: 80, advancementScore: 14500 },
      { level: 100, tamingManuals: 730, energizingPotions: 135, strengtheningSerums: 100, advancementScore: 17500 },
    ],
  },
  {
    id: "frostscale-chameleon",
    name: "Frostscale Chameleon",
    rarity: "SSR",
    maxLevel: 100,
    unlocksAfterPetId: "frost-gorilla",
    unlocksAfterLevel: 30,
    foodCosts: [500, 550, 600, 650, 700, 750, 800, 850, 925, 1000, 1075, 1150, 1225, 1300, 1375, 1450, 1525, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2750, 2900, 3050, 3200, 3350, 3500, 3650, 3800, 3950, 4100, 4300, 4500, 4700, 4900, 5100, 5300, 5500, 5700, 5900, 6100, 6350, 6600, 6850, 7100, 7350, 7600, 7850, 8100, 8350, 8600, 8900, 9200, 9500, 9800, 10100, 10400, 10700, 11000, 11300, 11600, 11900, 12200, 12500, 12800, 13100, 13400, 13700, 14000, 14300, 14600, 15000, 15400, 15800, 16200, 16600, 17000, 17400, 17800, 18200, 18600, 19000, 19400, 19800, 20200, 20600, 21000, 21400, 21800, 22200, 22600, 23100],
    advancementCosts: [
      { level: 10, tamingManuals: 35, energizingPotions: 0, strengtheningSerums: 0, advancementScore: 500 },
      { level: 20, tamingManuals: 70, energizingPotions: 0, strengtheningSerums: 0, advancementScore: 1000 },
      { level: 30, tamingManuals: 110, energizingPotions: 15, strengtheningSerums: 0, advancementScore: 2000 },
      { level: 40, tamingManuals: 145, energizingPotions: 35, strengtheningSerums: 0, advancementScore: 3000 },
      { level: 50, tamingManuals: 220, energizingPotions: 50, strengtheningSerums: 10, advancementScore: 4500 },
      { level: 60, tamingManuals: 290, energizingPotions: 65, strengtheningSerums: 20, advancementScore: 6750 },
      { level: 70, tamingManuals: 365, energizingPotions: 85, strengtheningSerums: 40, advancementScore: 10000 },
      { level: 80, tamingManuals: 440, energizingPotions: 100, strengtheningSerums: 60, advancementScore: 12000 },
      { level: 90, tamingManuals: 585, energizingPotions: 115, strengtheningSerums: 80, advancementScore: 14500 },
      { level: 100, tamingManuals: 730, energizingPotions: 135, strengtheningSerums: 100, advancementScore: 17500 },
    ],
  },
];

export const petById = new Map(whiteoutPets.map(p => [p.id, p]));

/** Pet Food to take one pet from from to to. */
export const petFoodBetween = (pet: Pet, from: number, to: number) =>
  pet.foodCosts.slice(Math.max(from - 1, 0), Math.max(to - 1, 0)).reduce((s, n) => s + n, 0);

/** Advancements available between two levels, with their materials and score. */
export const advancementsBetween = (pet: Pet, from: number, to: number) =>
  pet.advancementCosts.filter(a => a.level > from && a.level <= to);

/** Total advancement score gained taking a pet from from to to. */
export const advancementScoreBetween = (pet: Pet, from: number, to: number) =>
  advancementsBetween(pet, from, to).reduce((s, a) => s + a.advancementScore, 0);

/**
 * Pet advancements as event scoring rows.
 *
 * Every pet grants the same score at a given level, so one row per level is the
 * whole table. Events pay a flat rate per 1 advancement score: King of Icefield
 * pays 50, which makes taking a pet to Lv. 100 worth 875,000 points on its own.
 *
 * Derived from the advancement costs above rather than retyped, so the two
 * cannot drift apart.
 */
export const PET_ADVANCEMENT_SCORE_ROWS: ScoringRow[] = [
  { id: 'advance-a-pet-at-lv-10', label: 'Advance a pet at Lv. 10', sourceValue: 500 },
  { id: 'advance-a-pet-at-lv-20', label: 'Advance a pet at Lv. 20', sourceValue: 1000 },
  { id: 'advance-a-pet-at-lv-30', label: 'Advance a pet at Lv. 30', sourceValue: 2000 },
  { id: 'advance-a-pet-at-lv-40', label: 'Advance a pet at Lv. 40', sourceValue: 3000 },
  { id: 'advance-a-pet-at-lv-50', label: 'Advance a pet at Lv. 50', sourceValue: 4500 },
  { id: 'advance-a-pet-at-lv-60', label: 'Advance a pet at Lv. 60', sourceValue: 6750 },
  { id: 'advance-a-pet-at-lv-70', label: 'Advance a pet at Lv. 70', sourceValue: 10000 },
  { id: 'advance-a-pet-at-lv-80', label: 'Advance a pet at Lv. 80', sourceValue: 12000 },
  { id: 'advance-a-pet-at-lv-90', label: 'Advance a pet at Lv. 90', sourceValue: 14500 },
  { id: 'advance-a-pet-at-lv-100', label: 'Advance a pet at Lv. 100', sourceValue: 17500 },
];
