// Which inventory fields are still unanswered, named, for every card.
//
// THE RULE IS ONE LINE: a field is unanswered when it sits at zero, or unset,
// or "not built". Those are what the form shows before anyone has touched it,
// and the planner treats every one of them as a real quantity. A building left
// on "Not built" is not read as "ask me later", it is read as "this building
// does not exist", and the upgrade plan is built on that.
//
// A CLEARED FIELD AND A GENUINE ZERO ARE THE SAME NUMBER. The inputs store a
// number, so emptying one writes 0 exactly as typing 0 does, and nothing in
// the data can tell "I forgot Meat" from "I have no Meat". So this cannot
// promise that a flagged field is wrong, only that nothing has been said about
// it. That is also why the warning can be dismissed: for plenty of accounts
// the zeros are simply the truth.
//
// Fields with a deliberate non-zero default are not flagged, because they
// already carry an answer: rallies at a time starts at 1, the march times at
// the averages the card explains, beast level at 30. Only zero means nothing
// was said. The one explicit exception is Intel skipped, where 0 is itself the
// meaningful answer, "I run all of them".

import { whiteoutBuildings, WHITEOUT_RESOURCES, RESOURCE_LABELS } from '../data/whiteoutBuildings';
import { GATHER_RESOURCES } from '../data/whiteoutGatherTiles';
import { CONSUMABLES } from '../data/whiteoutConsumables';
import { whiteoutPets } from '../data/whiteoutPets';
import { whiteoutExperts } from '../data/whiteoutExperts';
import { whiteoutResearch } from '../data/whiteoutResearch';
import { TROOP_TYPES, TROOP_TYPE_LABELS } from '../data/whiteoutTroops';
import { CHIEF_GEAR_SLOTS, CHIEF_GEAR_SLOT_NAMES } from '../data/whiteoutChiefGear';
import { CHARM_TYPES, CHARMS_PER_TYPE } from '../data/whiteoutChiefCharms';
import { GEAR_PIECES, GEAR_CLASS_LABELS, GEAR_SLOT_LABELS } from '../data/whiteoutHeroGear';
import type { WhiteoutInventory } from '../models/whiteoutInventory';

export type InventoryCardId =
  | 'resources'
  | 'crystal-lab'
  | 'keys-and-shards'
  | 'speedups'
  | 'heroes'
  | 'stamina'
  | 'gathering'
  | 'experts'
  | 'hero-gear'
  | 'chief-gear'
  | 'charms'
  | 'pets'
  | 'research'
  | 'troops'
  | 'buildings';

/**
 * One entry on a card.
 *
 * `value` is here for more than the emptiness test: it is what a dismissed
 * warning is remembered against, so that editing anything on the card brings
 * the warning back.
 */
interface CardField {
  label: string;
  value: unknown;
  missing: boolean;
}

/** A field is answered when it holds something above zero. */
const unset = (value: unknown) => {
  const n = Number(value);
  return !Number.isFinite(n) || n <= 0;
};

const numeric = (entries: { label: string; value: unknown }[]): CardField[] =>
  entries.map(e => ({ ...e, missing: unset(e.value) }));

const FIELDS: Record<InventoryCardId, (inv: WhiteoutInventory) => CardField[]> = {
  resources: inv =>
    numeric(WHITEOUT_RESOURCES.map(r => ({ label: RESOURCE_LABELS[r], value: inv.resources?.[r] }))),

  // Zero is both the default and a real answer here, on any Monday. It is
  // flagged anyway, because a player who has refined and not said so gets a
  // worse plan than one who has not refined at all, and Ignore is there for
  // the Mondays when zero is the truth.
  'crystal-lab': inv =>
    numeric([{ label: 'Super Refinements this week', value: inv.superRefinesDone }]),

  'keys-and-shards': inv =>
    numeric([
      { label: 'Gold Keys', value: inv.goldKeys },
      { label: 'Platinum Keys', value: inv.platinumKeys },
      { label: 'Rare Shards', value: inv.rareShards },
      { label: 'Epic Shards', value: inv.epicShards },
      { label: 'Mythic Shards', value: inv.mythicShards },
    ]),

  speedups: inv =>
    numeric([
      { label: 'General', value: inv.generalSpeedupMinutes },
      { label: 'Troop Training', value: inv.trainingSpeedupMinutes },
      { label: 'Construction', value: inv.constructionSpeedupMinutes },
      { label: 'Research', value: inv.researchSpeedupMinutes },
      { label: 'Learning', value: inv.expertSpeedupMinutes },
      { label: 'Construction speed buff', value: inv.constructionBuffPercent },
      { label: 'Troop Training speed', value: inv.trainingSpeedPercent },
      { label: 'Research speed', value: inv.researchSpeedPercent },
    ]),

  // Every hero here is a toggle that is off by default, so the gap is a hero
  // switched on without a skill level behind it. The all-off case is said once
  // rather than five times, because listing them would read as a complaint
  // about not owning heroes.
  heroes: inv => {
    const heroes = [
      { label: 'Zinman', on: inv.useZinman, level: inv.zinmanSkillLevel },
      { label: 'Ling Xue', on: inv.useLingXue, level: inv.lingXueLevel },
      { label: 'Jasser', on: inv.useJasser, level: inv.jasserLevel },
      { label: 'Gina', on: inv.useGina, level: inv.ginaSkillLevel },
    ];
    if (heroes.every(h => !h.on)) {
      const state = heroes.map(h => `${h.on ? 1 : 0}:${h.level}`).join('|');
      return [{ label: 'No heroes switched on', value: state, missing: true }];
    }
    return heroes.map(h => ({
      label: `${h.label} skill level`,
      value: `${h.on ? 1 : 0}:${h.level}`,
      missing: h.on && unset(h.level),
    }));
  },

  stamina: inv =>
    numeric([
      { label: 'Stamina', value: inv.stamina },
      { label: 'Chief Stamina', value: inv.chiefStaminaItems },
      { label: 'Rallies at a time', value: inv.ralliesAtATime },
      { label: 'Polar Terror march', value: inv.polarTerrorMarchMinutes },
      { label: 'Beast march', value: inv.beastMarchMinutes },
      { label: 'Beast level', value: inv.huntBeastLevel },
    ]),

  gathering: inv =>
    numeric([
      ...GATHER_RESOURCES.map(r => ({
        label: `${RESOURCE_LABELS[r]} gathering speed`,
        value: inv.gatherSpeedPercent?.[r],
      })),
      ...GATHER_RESOURCES.map(r => ({
        label: `${RESOURCE_LABELS[r]} gathering hero level`,
        value: inv.gatherHeroLevels?.[r],
      })),
      { label: 'March queues', value: inv.gatherMarchQueues },
      { label: 'Tile level', value: inv.gatherTileLevel },
      { label: 'One-way march', value: inv.gatherOneWayMinutes },
    ]),

  // Recruiting an expert is the answer; an unlocked one with no relationship
  // level behind it is the gap. The none-recruited case is said once, for the
  // same reason the heroes one is.
  experts: inv => {
    const unlocked = whiteoutExperts.filter(e => inv.experts?.[e.id]?.unlocked);
    if (unlocked.length === 0) {
      const state = whiteoutExperts
        .map(e => `${inv.experts?.[e.id]?.unlocked ? 1 : 0}:${inv.experts?.[e.id]?.affinityLevel ?? 0}`)
        .join('|');
      return [{ label: 'No experts recruited', value: state, missing: true }];
    }
    return unlocked.map(e => ({
      label: `${e.name} relationship level`,
      value: inv.experts?.[e.id]?.affinityLevel,
      missing: unset(inv.experts?.[e.id]?.affinityLevel),
    }));
  },

  'hero-gear': inv =>
    GEAR_PIECES.map(p => {
      const g = inv.heroGear?.[p.id];
      return {
        label: `${GEAR_CLASS_LABELS[p.cls]} ${GEAR_SLOT_LABELS[p.slot]}`,
        value: g ? `${g.tier}:${g.enhanceLevel}:${g.masteryLevel}:${g.masteryStage}` : '',
        missing: !g || (unset(g.enhanceLevel) && unset(g.masteryLevel) && unset(g.masteryStage)),
      };
    }),

  // Slots sit at -1 for "nothing built", which is below the usual zero.
  'chief-gear': inv =>
    Array.from({ length: CHIEF_GEAR_SLOTS }, (_, slot) => ({
      label: CHIEF_GEAR_SLOT_NAMES[slot],
      value: inv.chiefGearSlots?.[slot],
      missing: !(Number(inv.chiefGearSlots?.[slot]) >= 0),
    })),

  charms: inv =>
    numeric([
      ...CONSUMABLES.filter(c => c.group === 'charm').map(c => ({
        label: c.name,
        value: inv.consumables?.[c.id],
      })),
      ...CHARM_TYPES.flatMap((type, t) =>
        Array.from({ length: CHARMS_PER_TYPE }, (_, i) => ({
          label: `${type.label} ${i + 1}`,
          value: inv.charmSlots?.[t * CHARMS_PER_TYPE + i],
        }))
      ),
    ]),

  pets: inv =>
    numeric([
      ...whiteoutPets.map(p => ({ label: p.name, value: inv.petLevels?.[p.id] })),
      ...CONSUMABLES.filter(c => c.group === 'pet').map(c => ({
        label: c.name,
        value: inv.consumables?.[c.id],
      })),
    ]),

  research: inv =>
    numeric(whiteoutResearch.map(n => ({ label: n.name, value: inv.researchLevels?.[n.key] }))),

  troops: inv =>
    numeric([
      ...TROOP_TYPES.map(t => ({
        label: `${TROOP_TYPE_LABELS[t]} highest tier`,
        value: inv.maxTier?.[t],
      })),
      ...TROOP_TYPES.map(t => ({
        label: `${TROOP_TYPE_LABELS[t]} camp capacity`,
        value: inv.trainingCapacity?.[t],
      })),
    ]),

  // "Not built" is stored as an empty string, so this is a different test to
  // the numeric one. It is also the case that prompted all of this: a building
  // left on "Not built" was taken at face value by the upgrade planner.
  buildings: inv =>
    whiteoutBuildings.map(b => {
      const level = (inv.buildingLevels?.[b.slug] ?? '').trim();
      return { label: `${b.name} (not built)`, value: level, missing: !level };
    }),
};

const fieldsFor = (inventory: WhiteoutInventory, id: string): CardField[] => {
  const build = FIELDS[id as InventoryCardId];
  if (!build) return [];
  try {
    return build(inventory);
  } catch {
    // A half-migrated save should not stop the card rendering.
    return [];
  }
};

/** What still looks unanswered on this card, as field names. */
export const cardGaps = (inventory: WhiteoutInventory, id: string): string[] =>
  fieldsFor(inventory, id)
    .filter(f => f.missing)
    .map(f => f.label);

/**
 * A stamp of everything this card currently holds.
 *
 * What a dismissed warning is remembered against. Comparing stamps is how
 * "only comes back if a field on that card is updated" is enforced without
 * having to watch for edits: if the stamp has moved, something on the card
 * changed, whatever it was and whichever way it went.
 */
export const cardSignature = (inventory: WhiteoutInventory, id: string): string =>
  fieldsFor(inventory, id)
    .map(f => String(f.value ?? ''))
    .join('\u0001');

/** How many fields the badge should own up to, before it just counts them. */
const NAMED = 5;

/** One line for the badge's tooltip, naming the first few fields. */
export const describeGaps = (gaps: string[], title: string): string => {
  if (gaps.length === 0) return '';
  // The two general lines are sentences, not field names, so they read on
  // their own rather than being listed.
  if (gaps.length === 1 && gaps[0].startsWith('No ')) return `${gaps[0]}.`;
  const shown = gaps.slice(0, NAMED).join(', ');
  const rest = gaps.length > NAMED ? ` and ${gaps.length - NAMED} more` : '';
  // Buildings do not take a number, so telling the player to enter 0 would be
  // advice they cannot follow. Their field says "Not built" instead.
  const how = gaps[0].endsWith('(not built)')
    ? 'Set a level, or leave it if the building really is not built.'
    : 'Enter a value, or 0 only if you really have none.';
  return `${gaps.length} still unanswered under ${title}: ${shown}${rest}. ${how}`;
};
