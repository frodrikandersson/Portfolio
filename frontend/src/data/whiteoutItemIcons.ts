// Item icons, lifted from the game and dropped in public/whiteout/items.
//
// These are identifiers rather than decoration. A player recognises the icon
// before they read the word, so an icon always sits beside its label and never
// replaces it: the text stays in the markup and the image is marked decorative
// so a screen reader hears the label once, not twice.
//
// Every lookup here may return nothing. There are fifteen widget generations
// and eight chest icons, no Steel icon at all, and event tables are edited by
// hand, so a missing icon is the normal case rather than a fault. Callers
// render text alone when one comes back null instead of showing a placeholder.

import type { WhiteoutResource } from './whiteoutBuildings';

const BASE = '/whiteout/items';
const CHARACTERS = '/whiteout/character';
const BUILDINGS = '/whiteout/buildings';
const EXPERTS = '/whiteout/experts';

/**
 * Where an item's art lives.
 *
 * The extension is a guess, and deliberately so. The folder holds a mix of
 * webp and png that shifts as art is re-exported, and any list of which is
 * which would be wrong again within a week. So this always says .webp and the
 * image components retry the same path as .png when that does not load. No
 * basename exists in both formats, so the retry cannot pick the wrong file.
 */
const icon = (file: string) => `${BASE}/${file}.webp`;

/** The other extension to try, or null when a path is not an item image. */
export const otherImageFormat = (src: string): string | null => {
  if (src.endsWith('.webp')) return `${src.slice(0, -5)}.png`;
  if (src.endsWith('.png')) return `${src.slice(0, -4)}.webp`;
  return null;
};

/** A speedup pile, named the way the Speedups card names them. */
export type SpeedupKind =
  | 'general'
  | 'construction'
  | 'research'
  | 'training'
  | 'learning'
  | 'healing';

const SPEEDUP_ICONS: Record<SpeedupKind, string> = {
  general: icon('general_speedup'),
  construction: icon('construction_speedup'),
  research: icon('research_speedup'),
  training: icon('training_speedup'),
  learning: icon('learning_speedup'),
  // Nothing scores or spends Troop Healing yet, so this is here for when
  // something does rather than being wired to a field that does not exist.
  healing: icon('healing_speedup'),
};

export const speedupIcon = (kind: SpeedupKind): string => SPEEDUP_ICONS[kind];

/** Every resource has art, so this is a total map rather than a partial one. */
const RESOURCE_ICONS: Record<WhiteoutResource, string> = {
  meat: icon('meat'),
  wood: icon('wood'),
  coal: icon('coal'),
  iron: icon('iron'),
  steel: icon('steel'),
  fireCrystal: icon('fire_crystal'),
  refinedFireCrystal: icon('refined_fire_crystal'),
  fireCrystalShard: icon('fire_crystal_shard'),
};

export const resourceIcon = (resource: WhiteoutResource): string | null =>
  RESOURCE_ICONS[resource] ?? null;

// The `?? null` above is not redundant defence: WHITEOUT_RESOURCES is edited by
// hand, and a resource added there without art would otherwise read as the
// string "undefined" in an src.

/** The two recruitment keys. Gold performs an Epic, Platinum an Advanced. */
export const recruitmentKeyIcon = (kind: 'gold' | 'platinum') => icon(`${kind}_key`);

export const CHIEF_STAMINA_ICON = icon('chief_stamina');

/**
 * Where a hero's portrait lives, whether or not one has been drawn yet.
 *
 * The art arrives a hero at a time, so this builds the path from the name
 * rather than keeping a list that would need editing with every new file. The
 * component handles the miss. "Wu Ming" becomes character_wu_ming.webp, which
 * is the convention the files already use.
 */
/**
 * Where a building's art lives, whether or not it has been drawn yet.
 *
 * Built from the slug so new files work the moment they are dropped in the
 * folder: "hunters-hut" becomes hunters_hut.png, which is the convention the
 * files already use. The component handles the miss.
 */
export const buildingArt = (slug: string) =>
  `${BUILDINGS}/${slug.replace(/-/g, '_')}.png`;

/**
 * An expert's portrait, whether or not it has been drawn yet.
 *
 * Keyed by id rather than name because the ids are already the filenames:
 * "agnes" becomes agnes.png. Nine of the ten have art; the component handles
 * the tenth, and handles it again for whoever is added next.
 */
export const expertPortrait = (id: string) => `${EXPERTS}/${id}.png`;

export const heroPortrait = (name: string) =>
  `${CHARACTERS}/character_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.webp`;

/**
 * Chief Gear upgrade materials, keyed by their backpack id.
 *
 * These four arrived as webp rather than png, which is why the extension is a
 * parameter rather than baked into the folder.
 */
const CHIEF_GEAR_ICONS: Record<string, string> = {
  'design-plans': icon('design_plan'),
  'polishing-solution': icon('polishing_solution'),
  'hardened-alloy': icon('hardened_alloy'),
  'lunar-amber': icon('lunar_amber'),
};

/** Chest art, one per generation that has any. */
const WIDGET_CHEST_GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

/**
 * Generations whose chest borrows another generation's art.
 *
 * Gen 17's chest has not surfaced in the game or anywhere online yet, so it
 * shows the Gen 1 chest as a stand-in. Drop widget_chest_gen_17.png into the
 * folder and delete the entry: the real art wins the moment it exists.
 */
const CHEST_STAND_INS: Record<number, number> = { 17: 1 };

export const widgetChestIcon = (gen: number): string | null => {
  if (WIDGET_CHEST_GENERATIONS.includes(gen)) return icon(`widget_chest_gen_${gen}`);
  const standIn = CHEST_STAND_INS[gen];
  return standIn ? icon(`widget_chest_gen_${standIn}`) : null;
};

/** True when the chest shown is a stand-in rather than that generation's art. */
export const widgetChestIsStandIn = (gen: number): boolean =>
  !WIDGET_CHEST_GENERATIONS.includes(gen) && CHEST_STAND_INS[gen] !== undefined;

/**
 * Hero-specific widget art, keyed by the backpack id the roster generates.
 *
 * Only the newer generations have art. A hero without one falls through to no
 * icon rather than borrowing their generation's chest, which would name a
 * different item.
 */
const HERO_WIDGET_ICONS: Record<string, string> = {
  'widget-ahmose': icon('widget_ahmose'),
  'widget-aiden': icon('widget_aiden'),
  'widget-aisling': icon('widget_aisling'),
  'widget-alonso': icon('widget_alonso'),
  'widget-bertha': icon('widget_bertha'),
  'widget-blanchette': icon('widget_blanchette'),
  'widget-bradley': icon('widget_bradley'),
  'widget-cara': icon('widget_cara'),
  'widget-dominic': icon('widget_dominic'),
  'widget-edith': icon('widget_edith'),
  'widget-eleanor': icon('widget_eleanor'),
  'widget-eleonora': icon('widget_eleonora'),
  'widget-elif': icon('widget_elif'),
  'widget-estrella': icon('widget_estrella'),
  'widget-flint': icon('widget_flint'),
  'widget-flora': icon('widget_flora'),
  'widget-fred': icon('widget_fred'),
  'widget-freya': icon('widget_freya'),
  'widget-gatot': icon('widget_gatot'),
  'widget-gisela': icon('widget_gisela'),
  'widget-gordon': icon('widget_gordon'),
  'widget-greg': icon('widget_greg'),
  'widget-gregory': icon('widget_gregory'),
  'widget-gwen': icon('widget_gwen'),
  'widget-hank': icon('widget_hank'),
  'widget-hector': icon('widget_hector'),
  'widget-hendrik': icon('widget_hendrik'),
  'widget-hervor': icon('widget_hervor'),
  'widget-jeronimo': icon('widget_jeronimo'),
  'widget-karol': icon('widget_karol'),
  'widget-ligeia': icon('widget_ligeia'),
  'widget-lloyd': icon('widget_lloyd'),
  'widget-logan': icon('widget_logan'),
  'widget-lynn': icon('widget_lynn'),
  'widget-magnus': icon('widget_magnus'),
  'widget-mia': icon('widget_mia'),
  'widget-molly': icon('widget_molly'),
  'widget-natalia': icon('widget_natalia'),
  'widget-norah': icon('widget_norah'),
  'widget-philly': icon('widget_philly'),
  'widget-reina': icon('widget_reina'),
  'widget-renee': icon('widget_renee'),
  'widget-rufus': icon('widget_rufus'),
  'widget-siegel': icon('widget_siegel'),
  'widget-sonya': icon('widget_sonya'),
  'widget-ursar': icon('widget_ursar'),
  'widget-viveca': icon('widget_viveca'),
  'widget-vulcanus': icon('widget_vulcanus'),
  'widget-wayne': icon('widget_wayne'),
  'widget-wu-ming': icon('widget_wu_ming'),
  'widget-xura': icon('widget_xura'),
  'widget-zinman': icon('widget_zinman'),
};

/** The icon for a backpack item id, when one exists. */
/**
 * Backpack ids whose file is not just the id with underscores.
 *
 * Kept as short as it can be. Anything not listed here is derived, so dropping
 * a new file in named after its id is all it takes to make it appear.
 */
const CONSUMABLE_FILE_ALIASES: Record<string, string> = {
  // The art is named for the plural, the id is singular.
  'essence-stone': 'essence_stones',
};

/**
 * Art for a backpack item.
 *
 * Widgets, chests and the four Chief Gear materials have their own maps because
 * their files do not follow the id. Everything else is derived: `mythic-gear`
 * becomes mythic_gear.png, `book-of-knowledge` becomes book_of_knowledge.png.
 * An expert's own Sigil is filed the other way round, `agnes_sigil.png` against
 * an id of `sigil-agnes`, so that one flips.
 */
export const consumableIcon = (id: string): string | null => {
  const chest = /^widget-chest-gen-(\d+)$/.exec(id);
  if (chest) return widgetChestIcon(Number(chest[1]));
  const known = HERO_WIDGET_ICONS[id] ?? CHIEF_GEAR_ICONS[id];
  if (known) return known;

  const sigil = /^sigil-(.+)$/.exec(id);
  if (sigil) return icon(`${sigil[1].replace(/-/g, '_')}_sigil`);

  const alias = CONSUMABLE_FILE_ALIASES[id];
  if (alias) return icon(alias);

  // Only ids that could be a filename, so a stray key cannot build a path out
  // of punctuation.
  if (!/^[a-z0-9-]+$/.test(id)) return null;
  return icon(id.replace(/-/g, '_'));
};

/**
 * Art for one hero's shards.
 *
 * Hero shards are not backpack items: they are rows the player adds, keyed by
 * the hero's name. "Wu Ming" becomes shard_wu_ming.png, which is the convention
 * the files already use, and a hero with no art yet renders as text.
 */
export const heroShardIcon = (heroName: string): string | null => {
  // Hyphens are kept rather than folded into underscores: the art for Seo-yoon
  // is filed as shard_seo-yoon.png, so flattening them lost the file.
  const slug = heroName.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '_').replace(/^_|_$/g, '');
  return slug ? icon(`shard_${slug}`) : null;
};

/** The two Enhancement XP components, which are sold by size rather than by id. */
export const enhancementComponentIcon = (xp: 10 | 100): string =>
  icon(`enhancement_xp_component(${xp})`);

/** General Hero Shards, the shop's rarity-keyed version of a hero shard. */
export const generalHeroShardIcon = (rarity: 'rare' | 'epic' | 'mythic'): string =>
  icon(`${rarity}_general_hero_shard`);

/**
 * Matched longest name first, so "Refined Fire Crystals" is not also read as
 * "Fire Crystals". Each match is cut out of the text before the next pattern
 * runs, which is what makes that ordering hold.
 */
const RESOURCE_PATTERNS: { resource: WhiteoutResource; pattern: RegExp }[] = [
  { resource: 'refinedFireCrystal', pattern: /refined fire crystals?/gi },
  { resource: 'fireCrystalShard', pattern: /fire crystal shards?/gi },
  { resource: 'fireCrystal', pattern: /fire crystals?/gi },
  { resource: 'meat', pattern: /\bmeat\b/gi },
  { resource: 'wood', pattern: /\bwood\b/gi },
  { resource: 'coal', pattern: /\bcoal\b/gi },
  { resource: 'iron', pattern: /\biron\b/gi },
  { resource: 'steel', pattern: /\bsteel\b/gi },
];

/**
 * Both wordings, which is the whole point of this list.
 *
 * Community tables say "construction speedups"; the in-game stage screens this
 * project transcribes say "Use 1m of Speedups for Construction". Only the
 * first was matched, so every speedup row in every event rendered without an
 * icon despite having one.
 *
 * Every pattern requires the word "speedup", so "Use 1 Fire Crystal Shard for
 * Research" cannot be read as a research speedup.
 */
const SPEEDUP_PATTERNS: { kind: SpeedupKind; pattern: RegExp }[] = [
  { kind: 'construction', pattern: /speed[- ]?ups?\s+for\s+construction|construction\s+speed[- ]?ups?/i },
  { kind: 'research', pattern: /speed[- ]?ups?\s+for\s+research|research\s+speed[- ]?ups?/i },
  { kind: 'training', pattern: /speed[- ]?ups?\s+for\s+(?:troop\s+)?training|(?:training|promotion)\s+speed[- ]?ups?/i },
  { kind: 'learning', pattern: /speed[- ]?ups?\s+to\s+learn|(?:expert skill|learning)\s+speed[- ]?ups?/i },
  { kind: 'healing', pattern: /healing\s+speed[- ]?ups?/i },
  { kind: 'general', pattern: /general\s+speed[- ]?ups?/i },
];

/**
 * Backpack items named in a row, longest and most specific first.
 *
 * Only items whose art stands for exactly what the row scores. A row naming
 * several things is left bare on purpose, which is the same rule the resource
 * matching below follows.
 */
const ITEM_PATTERNS: { pattern: RegExp; file: string }[] = [
  { pattern: /\brare hero shard/i, file: 'rare_general_hero_shard' },
  { pattern: /\bepic hero shard/i, file: 'epic_general_hero_shard' },
  { pattern: /\bmythic hero shard/i, file: 'mythic_general_hero_shard' },
  { pattern: /\badvanced wild mark/i, file: 'advanced_wild_mark' },
  { pattern: /\bcommon wild mark/i, file: 'common_wild_mark' },
  { pattern: /\bbook of knowledge/i, file: 'book_of_knowledge' },
  { pattern: /\bessence stone/i, file: 'essence_stones' },
  { pattern: /\bmithril\b/i, file: 'mithril' },
  { pattern: /\bmythic gear\b/i, file: 'mythic_gear' },
  { pattern: /\bcharm guide/i, file: 'charm_guide' },
  { pattern: /\bcharm design/i, file: 'charm_design' },
  { pattern: /\bcharm secret/i, file: 'charm_secrets' },
  { pattern: /\bpet food\b/i, file: 'pet_food' },
  { pattern: /\btaming manual/i, file: 'taming_manual' },
  { pattern: /\benergizing potion/i, file: 'energizing_potion' },
  { pattern: /\bstrengthening serum/i, file: 'strengthening_serum' },
  { pattern: /\bdesign plan/i, file: 'design_plan' },
  { pattern: /\bhardened alloy/i, file: 'hardened_alloy' },
  { pattern: /\bpolishing solution/i, file: 'polishing_solution' },
  { pattern: /\blunar amber/i, file: 'lunar_amber' },
  // The two recruitment rows are about the key they spend.
  { pattern: /\bepic recruitment/i, file: 'gold_key' },
  { pattern: /\badvanced recruitment/i, file: 'platinum_key' },
];

/**
 * The icon for a line of text, such as an event's scoring row or a step in the
 * day plan.
 *
 * Event tables are transcribed by hand and worded however the game words them,
 * so matching the text is the only mapping that survives a new event being
 * added. Anything naming more than one item gets no icon: "T8 (Meat, Wood,
 * Coal. Iron)" is about a tile tier, and picking one of the four to stand for
 * it would be a lie about what the row scores.
 */
export const iconForLabel = (label: string): string | null => {
  for (const { kind, pattern } of SPEEDUP_PATTERNS) {
    if (pattern.test(label)) return speedupIcon(kind);
  }

  if (/chief stamina/i.test(label)) return CHIEF_STAMINA_ICON;

  // Before the resources, so "Use 1 Hero Gear Essence Stone" is an Essence
  // Stone rather than being picked apart for the word "gear".
  for (const { pattern, file } of ITEM_PATTERNS) {
    if (pattern.test(label)) return icon(file);
  }

  let rest = label;
  const found = new Set<WhiteoutResource>();
  for (const { resource, pattern } of RESOURCE_PATTERNS) {
    // Cutting the match out is what enforces the longest-name-first ordering,
    // and going through `replace` rather than `test` keeps the global flag from
    // carrying a `lastIndex` between calls.
    const stripped = rest.replace(pattern, ' ');
    if (stripped === rest) continue;
    found.add(resource);
    rest = stripped;
  }
  if (found.size !== 1) return null;

  const [only] = found;
  return resourceIcon(only);
};
