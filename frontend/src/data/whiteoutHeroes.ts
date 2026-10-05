// The hero roster, so a hero is picked from a list rather than typed by hand
// and their rarity comes from the data instead of being chosen by the player.
//
// Rarity and class codes are decoded exactly as wostools does:
//   rarity 0 = rare, 1 = epic, 2 = mythic
//   class  0 = infantry, 1 = lancer, 2 = marksman
//
// Scraped from wostools' hero upgrade calculator by running its data module.
// "gen" is the generation the hero was released in, which is handy for sorting
// newer heroes to the top.
//
// EDIT FREELY: add a hero here and it appears in the picker.

import type { HeroRarity } from '../models/whiteoutInventory';

export type HeroClass = 'infantry' | 'lancer' | 'marksman';

export interface HeroDefinition {
  name: string;
  rarity: HeroRarity;
  heroClass: HeroClass;
  /** Release generation. 0 is the starting roster. */
  gen: number;
}

/**
 * Heroes the game has renamed, old name to new.
 *
 * Shard rows are keyed by the hero's NAME rather than an id, so a rename
 * orphans every saved row holding the old one. Anything read back from storage
 * is passed through this first.
 */
export const RENAMED_HEROES: Record<string, string> = {
  'Walis Bokan': 'Lumak Bokan',
};

export const whiteoutHeroes: HeroDefinition[] = [
  { name: "Jeronimo", rarity: "mythic", heroClass: "infantry", gen: 1 },
  { name: "Molly", rarity: "mythic", heroClass: "lancer", gen: 1 },
  { name: "Natalia", rarity: "mythic", heroClass: "infantry", gen: 1 },
  { name: "Zinman", rarity: "mythic", heroClass: "marksman", gen: 1 },
  { name: "Alonso", rarity: "mythic", heroClass: "marksman", gen: 2 },
  { name: "Flint", rarity: "mythic", heroClass: "infantry", gen: 2 },
  { name: "Philly", rarity: "mythic", heroClass: "lancer", gen: 2 },
  { name: "Greg", rarity: "mythic", heroClass: "marksman", gen: 3 },
  { name: "Logan", rarity: "mythic", heroClass: "infantry", gen: 3 },
  { name: "Mia", rarity: "mythic", heroClass: "lancer", gen: 3 },
  { name: "Ahmose", rarity: "mythic", heroClass: "infantry", gen: 4 },
  { name: "Lynn", rarity: "mythic", heroClass: "marksman", gen: 4 },
  { name: "Reina", rarity: "mythic", heroClass: "lancer", gen: 4 },
  { name: "Gwen", rarity: "mythic", heroClass: "marksman", gen: 5 },
  { name: "Hector", rarity: "mythic", heroClass: "infantry", gen: 5 },
  { name: "Norah", rarity: "mythic", heroClass: "lancer", gen: 5 },
  { name: "Renee", rarity: "mythic", heroClass: "lancer", gen: 6 },
  { name: "Wayne", rarity: "mythic", heroClass: "marksman", gen: 6 },
  { name: "Wu Ming", rarity: "mythic", heroClass: "infantry", gen: 6 },
  { name: "Bradley", rarity: "mythic", heroClass: "marksman", gen: 7 },
  { name: "Edith", rarity: "mythic", heroClass: "infantry", gen: 7 },
  { name: "Gordon", rarity: "mythic", heroClass: "lancer", gen: 7 },
  { name: "Gatot", rarity: "mythic", heroClass: "infantry", gen: 8 },
  { name: "Hendrik", rarity: "mythic", heroClass: "marksman", gen: 8 },
  { name: "Sonya", rarity: "mythic", heroClass: "lancer", gen: 8 },
  { name: "Fred", rarity: "mythic", heroClass: "lancer", gen: 9 },
  { name: "Magnus", rarity: "mythic", heroClass: "infantry", gen: 9 },
  { name: "Xura", rarity: "mythic", heroClass: "marksman", gen: 9 },
  { name: "Blanchette", rarity: "mythic", heroClass: "marksman", gen: 10 },
  { name: "Freya", rarity: "mythic", heroClass: "lancer", gen: 10 },
  { name: "Gregory", rarity: "mythic", heroClass: "infantry", gen: 10 },
  { name: "Eleonora", rarity: "mythic", heroClass: "infantry", gen: 11 },
  { name: "Lloyd", rarity: "mythic", heroClass: "lancer", gen: 11 },
  { name: "Rufus", rarity: "mythic", heroClass: "marksman", gen: 11 },
  { name: "Hervor", rarity: "mythic", heroClass: "infantry", gen: 12 },
  { name: "Karol", rarity: "mythic", heroClass: "lancer", gen: 12 },
  { name: "Ligeia", rarity: "mythic", heroClass: "marksman", gen: 12 },
  { name: "Flora", rarity: "mythic", heroClass: "lancer", gen: 13 },
  { name: "Gisela", rarity: "mythic", heroClass: "infantry", gen: 13 },
  { name: "Vulcanus", rarity: "mythic", heroClass: "marksman", gen: 13 },
  { name: "Cara", rarity: "mythic", heroClass: "marksman", gen: 14 },
  { name: "Dominic", rarity: "mythic", heroClass: "lancer", gen: 14 },
  { name: "Elif", rarity: "mythic", heroClass: "infantry", gen: 14 },
  { name: "Estrella", rarity: "mythic", heroClass: "lancer", gen: 15 },
  { name: "Hank", rarity: "mythic", heroClass: "infantry", gen: 15 },
  { name: "Viveca", rarity: "mythic", heroClass: "marksman", gen: 15 },
  { name: "Siegel", rarity: "mythic", heroClass: "infantry", gen: 16 },
  { name: "Ursar", rarity: "mythic", heroClass: "lancer", gen: 16 },
  { name: "Aisling", rarity: "mythic", heroClass: "marksman", gen: 16 },
  { name: "Aiden", rarity: "mythic", heroClass: "infantry", gen: 17 },
  { name: "Bertha", rarity: "mythic", heroClass: "lancer", gen: 17 },
  { name: "Eleanor", rarity: "mythic", heroClass: "marksman", gen: 17 },
  { name: "Bahiti", rarity: "epic", heroClass: "marksman", gen: 0 },
  { name: "Gina", rarity: "epic", heroClass: "marksman", gen: 0 },
  { name: "Jasser", rarity: "epic", heroClass: "marksman", gen: 0 },
  { name: "Jessie", rarity: "epic", heroClass: "lancer", gen: 0 },
  { name: "Ling Shuang", rarity: "epic", heroClass: "lancer", gen: 0 },
  { name: "Patrick", rarity: "epic", heroClass: "lancer", gen: 0 },
  { name: "Seo-yoon", rarity: "epic", heroClass: "marksman", gen: 0 },
  { name: "Sergey", rarity: "epic", heroClass: "infantry", gen: 0 },
  { name: "Lumak Bokan", rarity: "epic", heroClass: "lancer", gen: 0 },
  { name: "Charlie", rarity: "rare", heroClass: "lancer", gen: 0 },
  { name: "Cloris", rarity: "rare", heroClass: "marksman", gen: 0 },
  { name: "Eugene", rarity: "rare", heroClass: "infantry", gen: 0 },
  { name: "Smith", rarity: "rare", heroClass: "infantry", gen: 0 },
];

export const heroByName = new Map(whiteoutHeroes.map(h => [h.name, h]));

/** Heroes grouped by rarity, for an optgroup picker. */
export const heroesByRarity = (rarity: HeroRarity) =>
  whiteoutHeroes.filter(h => h.rarity === rarity);
