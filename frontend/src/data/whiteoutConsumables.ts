// The backpack: every consumable the calculator tracks, grouped by what it
// advances, so the form reads like the in-game Items tab rather than one long
// column of numbers.
//
// Everything lives in a single `inventory.consumables` bag keyed by the ids
// below, which means adding an item here is the only edit needed. Nothing hard
// codes a field name for it.
//
// Hero exclusive gear widgets are the exception to the flat list, because they
// are not one item. Every generation of mythic heroes gets its own Custom Hero
// Widget Chest, and a chest is worth one widget for any hero in that generation.
// Players also hold hero-specific widgets that only fit one hero. Both are
// counted, because an event that scores "use 1 widget" does not care which kind
// it was, but a player deciding what to spend very much does.
//
// EDIT FREELY: add an item to CONSUMABLES and it appears in the form.

import { whiteoutHeroes } from './whiteoutHeroes';
import { whiteoutExperts } from './whiteoutExperts';

export type ConsumableGroup =
  | 'hero-gear'
  | 'expert'
  | 'expert-sigil'
  | 'pet'
  | 'charm'
  | 'chief-gear'
  | 'other';

export interface ConsumableItem {
  /** Key inside `inventory.consumables`. */
  id: string;
  name: string;
  group: ConsumableGroup;
  /**
   * Two or three words at most. It sits inline beside the label, so anything
   * longer pushes the number field out of shape.
   */
  hint?: string;
  /** The full explanation, shown on hover. */
  note?: string;
}

export const CONSUMABLE_GROUP_LABELS: Record<ConsumableGroup, string> = {
  'hero-gear': 'Hero gear',
  expert: 'Experts',
  'expert-sigil': 'Expert Sigils',
  pet: 'Pets',
  charm: 'Chief Charms',
  'chief-gear': 'Chief Gear',
  other: 'Other',
};

/** Groups in the order the form shows them. */
export const CONSUMABLE_GROUP_ORDER: ConsumableGroup[] = [
  'hero-gear',
  'expert',
  'expert-sigil',
  'pet',
  'charm',
  'chief-gear',
  'other',
];

const FLAT_ITEMS: ConsumableItem[] = [
  // Hero gear. Essence Stones carry the early tiers, Mithril the mythic ones.
  { id: 'essence-stone', name: 'Essence Stones', group: 'hero-gear', note: 'Levels and enhances hero gear.' },
  {
    id: 'mithril',
    name: 'Mithril',
    group: 'hero-gear',
    hint: 'legendary only',
    note: 'Spent at the Legendary breakthroughs, 150 per piece.',
  },
  {
    id: 'mythic-gear',
    name: 'Mythic Gear',
    group: 'hero-gear',
    hint: 'spare pieces',
    note:
      'Spare Mythic gear fed into Mastery Forging. Needed from Lv 11 upward, ' +
      '55 per piece, and it is what actually limits how far Essence Stones go.',
  },

  // Experts. The three gifts buy affinity, which is what raises expert level.
  {
    id: 'sail-of-conquest',
    name: 'Sail of Conquest',
    group: 'expert',
    hint: '1,000 affinity',
    note: 'Expert affinity gift, worth 1,000 affinity each.',
  },
  {
    id: 'fiery-heart',
    name: 'Fiery Heart',
    group: 'expert',
    hint: '100 affinity',
    note: 'Expert affinity gift, worth 100 affinity each.',
  },
  {
    id: 'compass',
    name: 'Compass',
    group: 'expert',
    hint: '10 affinity',
    note: 'Expert affinity gift, worth 10 affinity each.',
  },
  {
    id: 'book-of-knowledge',
    name: 'Book of Knowledge',
    group: 'expert',
    hint: 'expert skills',
    note: 'Raises expert skill levels, alongside learning time.',
  },

  // Pets.
  { id: 'pet-food', name: 'Pet Food', group: 'pet', note: 'Levels a pet. Nothing scores until the next advancement level, so food on its own pays nothing.' },
  { id: 'strengthening-serum', name: 'Strengthening Serum', group: 'pet', note: 'Pet advancement, from Lv. 50 up.' },
  { id: 'energizing-potion', name: 'Energizing Potion', group: 'pet', note: 'Pet advancement, from Lv. 30 up.' },
  { id: 'taming-manual', name: 'Taming Manual', group: 'pet', note: 'Unlocks and tames pets.' },
  {
    id: 'advanced-wild-mark',
    name: 'Advanced Wild Mark',
    group: 'pet',
    note: 'Pet advancement, the higher tier.',
  },
  { id: 'common-wild-mark', name: 'Common Wild Mark', group: 'pet', note: 'Pet advancement.' },

  // Chief Charms, on troop gear.
  { id: 'charm-secrets', name: 'Charm Secrets', group: 'charm', note: 'Levels a charm.' },
  { id: 'charm-design', name: 'Charm Design', group: 'charm', note: 'Raises a charm tier.' },
  {
    id: 'charm-guide',
    name: 'Charm Guide',
    group: 'charm',
    note: 'Levels a charm, the higher tier.',
  },

  // Chief Gear. Lunar Amber only appears past Gold T2 three star.
  { id: 'design-plans', name: 'Design Plans', group: 'chief-gear' },
  { id: 'polishing-solution', name: 'Polishing Solution', group: 'chief-gear' },
  { id: 'hardened-alloy', name: 'Hardened Alloy', group: 'chief-gear' },
  {
    id: 'lunar-amber',
    name: 'Lunar Amber',
    group: 'chief-gear',
    hint: 'legendary only',
    note: 'Legendary Chief Gear only, from Pink 0 star upward.',
  },

  { id: 'gems', name: 'Gems', group: 'other' },
];

/**
 * A generation of mythic heroes, and the chest that covers them. Gen 1 has four
 * heroes; every generation after it has three.
 */
export interface WidgetGeneration {
  gen: number;
  /** Id of the generation's Custom Hero Widget Chest. */
  chestId: string;
  chestName: string;
  heroes: { name: string; widgetId: string }[];
}

const heroWidgetId = (name: string) => `widget-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

/**
 * Built from the hero roster rather than typed out, so a new generation of
 * mythics arrives with its chest already in place.
 */
export const WIDGET_GENERATIONS: WidgetGeneration[] = [
  ...new Set(whiteoutHeroes.filter(h => h.rarity === 'mythic').map(h => h.gen)),
]
  .sort((a, b) => b - a)
  .map(gen => ({
    gen,
    chestId: `widget-chest-gen-${gen}`,
    chestName: `Gen ${gen} Custom Hero Widget Chest`,
    heroes: whiteoutHeroes
      .filter(h => h.rarity === 'mythic' && h.gen === gen)
      .map(h => ({ name: h.name, widgetId: heroWidgetId(h.name) })),
  }));

/** Every expert's own Sigil, plus the Common Sigil that stands in for any of them. */
export const SIGIL_ITEMS: ConsumableItem[] = [
  {
    id: 'common-expert-sigil',
    name: 'Common Expert Sigil',
    group: 'expert-sigil',
    note: 'Substitutes for any expert’s own Sigil.',
  },
  ...whiteoutExperts.map(expert => ({
    id: `sigil-${expert.id}`,
    name: `${expert.name} Sigil`,
    group: 'expert-sigil' as ConsumableGroup,
    note: `Raises ${expert.name}’s friendship level.`,
  })),
];

/** Widget chests and hero-specific widgets, as consumable entries. */
export const WIDGET_ITEMS: ConsumableItem[] = WIDGET_GENERATIONS.flatMap(generation => [
  {
    id: generation.chestId,
    name: generation.chestName,
    group: 'hero-gear' as ConsumableGroup,
    hint: `gen ${generation.gen}`,
    note: `One widget for ${generation.heroes.map(h => h.name).join(', ')}.`,
  },
  ...generation.heroes.map(hero => ({
    id: hero.widgetId,
    name: `${hero.name} Widget`,
    group: 'hero-gear' as ConsumableGroup,
    note: `Only fits ${hero.name}’s exclusive gear.`,
  })),
]);

/** Everything, in one list, for lookups and for totalling. */
export const CONSUMABLES: ConsumableItem[] = [...FLAT_ITEMS, ...WIDGET_ITEMS, ...SIGIL_ITEMS];

const byId = new Map(CONSUMABLES.map(item => [item.id, item]));
export const consumableById = (id: string) => byId.get(id);

/** The plain items of a group, with widgets and Sigils handled separately. */
export const flatItemsInGroup = (group: ConsumableGroup) =>
  FLAT_ITEMS.filter(item => item.group === group);

/** Every widget id, chests and hero-specific alike. */
export const ALL_WIDGET_IDS = WIDGET_ITEMS.map(item => item.id);

/**
 * A hero's exclusive gear widget runs Lv 0 to 10, and each level costs five more
 * widgets than the last: 5 for the first, 50 for the tenth, 275 to max a hero.
 *
 * This is why a widget count on its own says nothing useful. Nine chests take a
 * hero from Lv 0 to Lv 1, but a hero already at Lv 2 needs fifteen for their
 * next level and those same nine buy nothing at all.
 */
export const WIDGET_MAX_LEVEL = 10;

export const WIDGET_COST_PER_LEVEL = Array.from(
  { length: WIDGET_MAX_LEVEL },
  (_, i) => (i + 1) * 5
);

const clampWidgetLevel = (level: number) =>
  Math.min(Math.max(Math.floor(level) || 0, 0), WIDGET_MAX_LEVEL);

/** Widgets to go from `level` to the next one, or 0 when already maxed. */
export const widgetCostForNextLevel = (level: number) => {
  const current = clampWidgetLevel(level);
  return current >= WIDGET_MAX_LEVEL ? 0 : WIDGET_COST_PER_LEVEL[current];
};

/** Widgets to take a hero from `level` all the way to Lv 10. */
export const widgetsToMax = (level: number) =>
  WIDGET_COST_PER_LEVEL.slice(clampWidgetLevel(level)).reduce((total, cost) => total + cost, 0);

/**
 * How far `available` widgets carry a hero from `level`. Levels are bought
 * whole, so a stack that falls short of the next one buys nothing.
 */
export const widgetLevelsAffordable = (level: number, available: number) => {
  const from = clampWidgetLevel(level);
  let at = from;
  let left = Math.max(available, 0);
  let spent = 0;
  while (at < WIDGET_MAX_LEVEL && WIDGET_COST_PER_LEVEL[at] <= left) {
    left -= WIDGET_COST_PER_LEVEL[at];
    spent += WIDGET_COST_PER_LEVEL[at];
    at += 1;
  }
  return { levels: at - from, toLevel: at, spent, leftOver: left };
};
