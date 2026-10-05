import { completedThroughTier } from '../data/whiteoutResearch';
import { RENAMED_HEROES } from '../data/whiteoutHeroes';
import { useCallback, useEffect, useState } from 'react';
import { emptyInventory, seedHeroIds, type WhiteoutInventory } from '../models/whiteoutInventory';
import { WIDGET_GENERATIONS } from '../data/whiteoutConsumables';

const STORAGE_KEY = 'whiteoutInventory';

/** Plenty for the players who run alts, few enough to fit a row of tabs. */
export const MAX_ACCOUNTS = 5;

export interface WhiteoutAccount {
  /** Stable key for React and for pointing `activeId` at a row. */
  id: string;
  name: string;
  inventory: WhiteoutInventory;
  eventSlug: string | null;
}

export interface StoredState {
  accounts: WhiteoutAccount[];
  activeId: string;
}

/** The shape saved before accounts existed: a single unnamed inventory. */
interface LegacyState {
  inventory?: WhiteoutInventory;
  eventSlug?: string | null;
}

/**
 * Essence Stones, widgets and gems used to be three fields on the inventory
 * before the backpack became a keyed bag. A saved inventory from then still has
 * them, so they are folded in rather than silently dropped.
 */
interface LegacyConsumables {
  heroGearEssenceStones?: number;
  heroExclusiveGearWidgets?: number;
  gems?: number;
}

const LEGACY_KEYS: [keyof LegacyConsumables, string][] = [
  ['heroGearEssenceStones', 'essence-stone'],
  // The old field was "any widget", which no longer exists as an item. The
  // newest generation's chest is the closest thing, since a widget stock is
  // usually current-season, but it is a guess and the player can move it.
  ['heroExclusiveGearWidgets', WIDGET_GENERATIONS[0].chestId],
  ['gems', 'gems'],
];

/**
 * Experts were modelled as two tracks before it was clear the game runs one:
 * a level 1 to 100 and a separate friendship 1 to 10. The relationship level is
 * the same 1 to 100 scale, so the old level carries straight over. A save that
 * only ever set friendship is read as ten levels per friendship tier, which is
 * where those gates sit.
 */
interface LegacyExpert {
  level?: number;
  friendship?: number;
  affinityLevel?: number;
}

const migrateExperts = (inventory: WhiteoutInventory) => {
  for (const [id, progress] of Object.entries(inventory.experts)) {
    const legacy = progress as LegacyExpert;
    if (typeof legacy.affinityLevel === 'number') continue;
    const fromLevel = typeof legacy.level === 'number' ? legacy.level : 0;
    const fromFriendship = typeof legacy.friendship === 'number' ? legacy.friendship * 10 : 0;
    inventory.experts[id] = {
      ...progress,
      affinityLevel: Math.min(Math.max(fromLevel, fromFriendship, 0), 100),
    };
  }
};

/**
 * Turns an old "finished through tier N" answer into per-node levels.
 *
 * Only when the save has no per-node levels of its own, so this runs once and
 * then never touches the player's own edits again. The expansion is exactly
 * what the tier answer meant: every level of every node at or below that tier.
 */
const migrateResearch = (
  saved: WhiteoutInventory | undefined,
  inventory: WhiteoutInventory
) => {
  if (!saved) return;
  const hasLevels = Object.keys(inventory.researchLevels ?? {}).length > 0;
  if (hasLevels) return;
  const tiers = saved.researchTiersDone;
  if (!tiers || Object.values(tiers).every(v => !v)) return;
  inventory.researchLevels = completedThroughTier(tiers);
};

const migrateConsumables = (saved: LegacyConsumables, inventory: WhiteoutInventory) => {
  for (const [oldKey, id] of LEGACY_KEYS) {
    const value = saved[oldKey];
    if (typeof value === 'number' && value > 0 && !inventory.consumables[id]) {
      inventory.consumables[id] = value;
    }
  }
};

let idCounter = 0;
const newId = () => `acct-${Date.now().toString(36)}-${++idCounter}`;

/**
 * Carries shard rows across a hero being renamed in game.
 *
 * These rows are keyed by name, so without this a saved "Walis Bokan" would no
 * longer match anything in the roster: the picker would show nothing chosen and
 * the count beside it would look like it belonged to nobody.
 */
const migrateHeroNames = (inventory: WhiteoutInventory) => {
  inventory.heroShards = inventory.heroShards.map(hero =>
    RENAMED_HEROES[hero.name] ? { ...hero, name: RENAMED_HEROES[hero.name] } : hero
  );
};

/**
 * Merges a saved inventory onto a fresh one, so fields added since the save
 * still exist and nested objects are never shared with the parsed JSON.
 */
const reviveInventory = (saved: WhiteoutInventory | undefined): WhiteoutInventory => {
  const base = emptyInventory();
  if (!saved || typeof saved !== 'object') return base;
  const inventory: WhiteoutInventory = {
    ...base,
    ...saved,
    researchLevels: { ...saved.researchLevels },
    resources: { ...saved.resources },
    heroShards: Array.isArray(saved.heroShards) ? saved.heroShards : [],
    buildingLevels: { ...saved.buildingLevels },
    consumables: { ...saved.consumables },
    experts: { ...saved.experts },
    widgetLevels: { ...saved.widgetLevels },
  };
  // The saved shape may predate the bag, so it is read through the legacy view.
  migrateConsumables(saved as LegacyConsumables, inventory);
  migrateExperts(inventory);
  migrateResearch(saved, inventory);
  migrateHeroNames(inventory);
  return inventory;
};

const makeAccount = (name: string, defaultEventSlug: string): WhiteoutAccount => ({
  id: newId(),
  name,
  inventory: emptyInventory(),
  eventSlug: defaultEventSlug,
});

/**
 * Keeps every account across reloads and tab switches.
 *
 * This matters more than it looks: only the active editor tab is mounted, so
 * without persistence everything the player typed is thrown away the moment
 * they look at another tab.
 *
 * Reads and writes are wrapped because storage throws in private mode and when
 * site data is blocked, and the calculator has to keep working when it does.
 */
const read = (defaultEventSlug: string): StoredState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredState> & LegacyState;
    if (!parsed || typeof parsed !== 'object') return null;

    // A save from before accounts carries one bare inventory. It becomes the
    // first account rather than being thrown away.
    if (!Array.isArray(parsed.accounts)) {
      if (!parsed.inventory) return null;
      const inventory = reviveInventory(parsed.inventory);
      seedHeroIds(inventory.heroShards);
      const account: WhiteoutAccount = {
        id: newId(),
        name: 'Main',
        inventory,
        eventSlug: parsed.eventSlug ?? defaultEventSlug,
      };
      return { accounts: [account], activeId: account.id };
    }

    const accounts = parsed.accounts
      .slice(0, MAX_ACCOUNTS)
      .filter(a => a && typeof a === 'object')
      .map((a, i) => {
        const inventory = reviveInventory(a.inventory);
        seedHeroIds(inventory.heroShards);
        return {
          id: typeof a.id === 'string' && a.id ? a.id : newId(),
          name: typeof a.name === 'string' && a.name.trim() ? a.name : `Account ${i + 1}`,
          inventory,
          eventSlug: a.eventSlug ?? defaultEventSlug,
        };
      });
    if (!accounts.length) return null;

    const activeId = accounts.some(a => a.id === parsed.activeId)
      ? (parsed.activeId as string)
      : accounts[0].id;
    return { accounts, activeId };
  } catch {
    return null;
  }
};

export const useWhiteoutInventory = (defaultEventSlug: string) => {
  const [state, setState] = useState<StoredState>(() => {
    const restored = read(defaultEventSlug);
    if (restored) return restored;
    const first = makeAccount('Main', defaultEventSlug);
    return { accounts: [first], activeId: first.id };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable; the session still works, it just will not persist.
    }
  }, [state]);

  const active = state.accounts.find(a => a.id === state.activeId) ?? state.accounts[0];

  /** Rewrites the active account, leaving the others untouched. */
  const patchActive = useCallback(
    (patch: Partial<WhiteoutAccount>) =>
      setState(prev => ({
        ...prev,
        accounts: prev.accounts.map(a => (a.id === prev.activeId ? { ...a, ...patch } : a)),
      })),
    []
  );

  const setInventory = useCallback(
    (inventory: WhiteoutInventory) => patchActive({ inventory }),
    [patchActive]
  );

  const setEventSlug = useCallback(
    (eventSlug: string) => patchActive({ eventSlug }),
    [patchActive]
  );

  /** Clears the active account's data without removing the account itself. */
  const reset = useCallback(
    () => patchActive({ inventory: emptyInventory(), eventSlug: defaultEventSlug }),
    [patchActive, defaultEventSlug]
  );

  const selectAccount = useCallback(
    (id: string) => setState(prev => (prev.accounts.some(a => a.id === id) ? { ...prev, activeId: id } : prev)),
    []
  );

  const addAccount = useCallback(
    (name: string) =>
      setState(prev => {
        if (prev.accounts.length >= MAX_ACCOUNTS) return prev;
        const account = makeAccount(
          name.trim() || `Account ${prev.accounts.length + 1}`,
          defaultEventSlug
        );
        return { accounts: [...prev.accounts, account], activeId: account.id };
      }),
    [defaultEventSlug]
  );

  const renameAccount = useCallback(
    (id: string, name: string) =>
      setState(prev => ({
        ...prev,
        accounts: prev.accounts.map(a => (a.id === id ? { ...a, name: name.trim() || a.name } : a)),
      })),
    []
  );

  /**
   * Removing the last account would leave nothing to edit, so the final one is
   * emptied instead of deleted.
   */
  const removeAccount = useCallback(
    (id: string) =>
      setState(prev => {
        if (prev.accounts.length <= 1) {
          const first = makeAccount('Main', defaultEventSlug);
          return { accounts: [first], activeId: first.id };
        }
        const accounts = prev.accounts.filter(a => a.id !== id);
        const activeId = accounts.some(a => a.id === prev.activeId) ? prev.activeId : accounts[0].id;
        return { accounts, activeId };
      }),
    [defaultEventSlug]
  );

  return {
    inventory: active.inventory,
    setInventory,
    eventSlug: active.eventSlug ?? defaultEventSlug,
    setEventSlug,
    reset,
    accounts: state.accounts,
    activeAccountId: active.id,
    activeAccountName: active.name,
    canAddAccount: state.accounts.length < MAX_ACCOUNTS,
    selectAccount,
    addAccount,
    renameAccount,
    removeAccount,
  };
};
