// Level ordering and the "cannot outrank your gate" rule.
//
// Building levels read "1" to "30", then "30-1" to "30-4", then "FC 1",
// "FC 1-1" to "FC 1-4", and so on to "FC 10". They sort as neither numbers nor
// strings, so everything here goes through parseLevel first.
//
// THE RULE. No building may pass the Furnace, and the Command Center may not
// pass the Embassy. The game measures that in whole tiers: a gate part way
// through a tier does not let the building it gates start that tier's
// sub-levels. So with the Embassy at FC 6-4, the Command Center stops at FC 6.
// Equivalently, reaching tier N needs the gate at tier N, and any sub-level
// inside tier N needs the gate at tier N+1.
//
// The tables already carry this for 510 of the 511 rows where it applies, but
// only where the wiki happened to print it: the Command Center, for instance,
// lists it on FC 5-1 and FC 6-1 and nowhere else. Deriving it instead of
// trusting the scrape closes those gaps. The one row that disagrees is
// "barricade 1 needs furnace 0", which is a no-op at the bottom of the ladder.
//
// The unlock gates in the tables (the Embassy needs Furnace 8 before it exists
// at all) are a separate, stricter constraint and are left exactly as scraped.

import type { BuildingTable, Prerequisite } from '../data/whiteoutBuildings';

/** Tier is the whole level, step is the Fire Crystal sub-level within it. */
export interface ParsedLevel {
  /** 1 to 30 for normal levels, 31 to 40 for FC 1 to FC 10. */
  tier: number;
  /** 0 to 4. Zero is the tier itself. */
  step: number;
}

const FC_OFFSET = 30;

export const parseLevel = (label: string | undefined): ParsedLevel | null => {
  if (!label) return null;
  const fc = /^FC\s*(\d+)(?:-(\d+))?$/.exec(label.trim());
  if (fc) return { tier: FC_OFFSET + Number(fc[1]), step: Number(fc[2] ?? 0) };
  const plain = /^(\d+)(?:-(\d+))?$/.exec(label.trim());
  if (plain) return { tier: Number(plain[1]), step: Number(plain[2] ?? 0) };
  return null;
};

/** A single comparable number, so levels can be sorted and clamped. */
export const levelRank = (label: string | undefined) => {
  const parsed = parseLevel(label);
  return parsed ? parsed.tier * 10 + parsed.step : -1;
};

/** Turns a tier back into the label the tables use. */
export const tierLabel = (tier: number) =>
  tier > FC_OFFSET ? `FC ${tier - FC_OFFSET}` : String(tier);

/**
 * Which buildings gate this one. The Furnace has none: its own prerequisites
 * come from the table, and they run the other way, since the Furnace needs the
 * Embassy at a matching level before it can advance.
 */
export const gatesFor = (slug: string): string[] => {
  if (slug === 'furnace') return [];
  if (slug === 'command-center') return ['furnace', 'embassy'];
  return ['furnace'];
};

/**
 * The gate levels a target level implies, on top of whatever the table lists.
 * Reaching a tier needs the gate at that tier; reaching a sub-level inside it
 * needs the gate a full tier higher.
 */
export const impliedPrereqs = (slug: string, level: string): Prerequisite[] => {
  const parsed = parseLevel(level);
  if (!parsed) return [];
  const needed = tierLabel(parsed.step === 0 ? parsed.tier : parsed.tier + 1);
  return gatesFor(slug).map(gate => ({ slug: gate, level: needed }));
};

/** Table prerequisites and implied gates together, with duplicates dropped. */
export const allPrereqs = (slug: string, level: string, listed: Prerequisite[]) => {
  const merged = [...listed];
  for (const implied of impliedPrereqs(slug, level)) {
    const at = merged.findIndex(p => p.slug === implied.slug);
    // Keep whichever is stricter, so an unlock gate is never loosened.
    if (at < 0) {
      merged.push(implied);
    } else if (levelRank(implied.level) > levelRank(merged[at].level)) {
      // Replace rather than assign into it. The spread above copies the array
      // but not the entries, so writing to one would rewrite the row inside
      // whiteoutBuildings for the rest of the session.
      merged[at] = { ...merged[at], level: implied.level };
    }
  }
  return merged;
};

/**
 * Highest rank this building may hold given where its gates are. Returns
 * Infinity when no gate has been entered yet, so a half-filled form is not
 * second-guessed: an unknown Furnace level is no information, not a cap of zero.
 */
export const levelCapRank = (slug: string, levels: Record<string, string>) => {
  let cap = Infinity;
  for (const gate of gatesFor(slug)) {
    const parsed = parseLevel(levels[gate]);
    if (!parsed) continue;
    cap = Math.min(cap, parsed.tier * 10);
  }
  return cap;
};

/** Whether a level is legal for this building given the current gates. */
export const isLevelAllowed = (slug: string, level: string, levels: Record<string, string>) =>
  levelRank(level) <= levelCapRank(slug, levels);

/**
 * Pulls every building back to its cap.
 *
 * Needed because the cap moves: dropping the Furnace to FC 5 makes an already
 * chosen Command Center of FC 7 illegal. Rather than leave an impossible state
 * on screen, each building falls back to the highest level it is still allowed.
 * Runs to a fixed point, since the Command Center's cap depends on the Embassy,
 * which the same pass may itself have lowered.
 */
export const clampLevels = (
  tables: BuildingTable[],
  levels: Record<string, string>
): Record<string, string> => {
  let current = { ...levels };
  for (let pass = 0; pass < gatesFor('command-center').length + 1; pass++) {
    let changed = false;
    const next = { ...current };
    for (const table of tables) {
      const chosen = current[table.slug];
      if (!chosen) continue;
      const cap = levelCapRank(table.slug, current);
      if (levelRank(chosen) <= cap) continue;
      // Highest level in this building's own ladder that is still under the cap.
      const allowed = [...table.levels].reverse().find(l => levelRank(l.level) <= cap);
      next[table.slug] = allowed ? allowed.level : '';
      changed = true;
    }
    current = next;
    if (!changed) break;
  }
  return current;
};
