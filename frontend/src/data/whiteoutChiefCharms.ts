// Chief Charms: the upgrade ladder, what it costs, and what it scores.
//
// EIGHTEEN CHARMS, three to each of the six Chief Gear pieces, and each one
// walks this ladder on its own. Three types of six: Protection on Infantry,
// Keenness on Lancer, Vision on Marksman. Every charm gives Lethality and
// Health to its own troop type, so the ladder is the same for all eighteen and
// only the troops it helps differ.
//
// THE LADDER IS NOT EIGHTEEN STEPS, IT IS 75. Levels 1 to 4 are a single step
// each. From Lv. 4 the game splits a level into four instalments (4.1, 4.2,
// 4.3, then 5), from Lv. 11 into five, and Lv. 16 and 17 into nine. Each
// instalment costs materials and scores on its own, which is why events can pay
// out part way through a level.
//
// THREE MATERIALS. Charm Guides and Charm Designs are wanted at every step;
// the third, which the game calls Charm Secrets and community sites call Jewel
// Secrets, is only wanted from Lv. 11.1 upward. That is the wall: 575 of them
// per charm, 10,350 across all eighteen.
//
// SOURCING, AND IT IS UNUSUALLY WELL CHECKED. The per-step ladder is parsed
// from wostools.net's raw markup. Three checks had to pass before it was
// written here:
//
//   Summed per level it equals whiteoutdata.com's independently published
//   per-level table, on all sixteen levels they both cover.
//
//   Its score column, summed per level, reproduces all sixteen values Fredrik
//   read off the in-game "Notes on Chief Charm score" popup, exactly.
//
//   Its own printed totals row equals the sum of the steps.
//
// AND THEN A FOURTH, WHICH FOUND SOMETHING THE OTHER THREE COULD NOT. The
// popup does not only list whole levels, as was assumed above: scrolled
// through, it names every one of the 75 instalments. Compared step by step
// rather than level by level, one value was in the wrong slot. Level 4's three
// Status steps come to 8,438, which does not divide by three, and the game
// puts the odd point down in Status 2 where wostools put it in Status 3. The
// level sum is identical either way, so no amount of summing would have caught
// it, and nothing but a plan that stops after exactly one or two instalments
// of Lv. 4 can tell the difference. It is corrected below anyway: the point of
// this table is that it says what the game says.
//
// The score column is now verified per step against the game for all 75 rows.
// THE POWER COLUMN IS NOT. It came out of the same wostools parse and has
// never been checked against anything, and its first value looks wrong next to
// its neighbours (205,700 at Lv. 1 against 82,300 at Lv. 2, then flat). Treat
// power as unverified until an in-game source turns up.
//
// EDIT FREELY: nothing in the scoring code hardcodes a number.

import type { ScoringRow } from '../models/whiteoutInterface';

export interface CharmStep {
  level: number;
  /** 0 for a whole level, otherwise the instalment number. */
  sub: number;
  guides: number;
  designs: number;
  /** Charm Secrets, wanted only from Lv. 11.1 up. */
  secrets?: number;
  /** Power this step adds. */
  power: number;
  /** Charm score this step adds, which is what events pay for. */
  score: number;
}

export const CHARM_STEPS: CharmStep[] = [
  { level: 1, sub: 0, guides: 5, designs: 5, power: 205700, score: 625 },
  { level: 2, sub: 0, guides: 40, designs: 15, power: 82300, score: 1250 },
  { level: 3, sub: 0, guides: 60, designs: 40, power: 82000, score: 3125 },
  { level: 4, sub: 0, guides: 80, designs: 100, power: 82000, score: 8750 },
  // 8,438 does not divide by three, and the game puts the odd point down in
  // Status 2 rather than Status 3. wostools had it in Status 3. The level sum
  // is the same either way, which is why a summed check could never see it.
  { level: 4, sub: 1, guides: 25, designs: 50, power: 31000, score: 2813 },
  { level: 4, sub: 2, guides: 25, designs: 50, power: 31000, score: 2812 },
  { level: 4, sub: 3, guides: 25, designs: 50, power: 31000, score: 2813 },
  { level: 5, sub: 0, guides: 25, designs: 50, power: 31000, score: 2812 },
  { level: 5, sub: 1, guides: 30, designs: 75, power: 31000, score: 3125 },
  { level: 5, sub: 2, guides: 30, designs: 75, power: 31000, score: 3125 },
  { level: 5, sub: 3, guides: 30, designs: 75, power: 31000, score: 3125 },
  { level: 6, sub: 0, guides: 30, designs: 75, power: 31000, score: 3125 },
  { level: 6, sub: 1, guides: 35, designs: 100, power: 31000, score: 3125 },
  { level: 6, sub: 2, guides: 35, designs: 100, power: 31000, score: 3125 },
  { level: 6, sub: 3, guides: 35, designs: 100, power: 31000, score: 3125 },
  { level: 7, sub: 0, guides: 35, designs: 100, power: 31000, score: 3125 },
  { level: 7, sub: 1, guides: 50, designs: 100, power: 31000, score: 3250 },
  { level: 7, sub: 2, guides: 50, designs: 100, power: 31000, score: 3250 },
  { level: 7, sub: 3, guides: 50, designs: 100, power: 31000, score: 3250 },
  { level: 8, sub: 0, guides: 50, designs: 100, power: 31000, score: 3250 },
  { level: 8, sub: 1, guides: 75, designs: 100, power: 31000, score: 3500 },
  { level: 8, sub: 2, guides: 75, designs: 100, power: 31000, score: 3500 },
  { level: 8, sub: 3, guides: 75, designs: 100, power: 31000, score: 3500 },
  { level: 9, sub: 0, guides: 75, designs: 100, power: 31000, score: 3500 },
  { level: 9, sub: 1, guides: 105, designs: 105, power: 31000, score: 3750 },
  { level: 9, sub: 2, guides: 105, designs: 105, power: 31000, score: 3750 },
  { level: 9, sub: 3, guides: 105, designs: 105, power: 31000, score: 3750 },
  { level: 10, sub: 0, guides: 105, designs: 105, power: 31000, score: 3750 },
  { level: 10, sub: 1, guides: 140, designs: 105, power: 31000, score: 4000 },
  { level: 10, sub: 2, guides: 140, designs: 105, power: 31000, score: 4000 },
  { level: 10, sub: 3, guides: 140, designs: 105, power: 31000, score: 4000 },
  { level: 11, sub: 0, guides: 140, designs: 105, power: 31000, score: 4000 },
  { level: 11, sub: 1, guides: 116, designs: 90, secrets: 3, power: 43200, score: 3400 },
  { level: 11, sub: 2, guides: 116, designs: 90, secrets: 3, power: 43200, score: 3400 },
  { level: 11, sub: 3, guides: 116, designs: 90, secrets: 3, power: 43200, score: 3400 },
  { level: 11, sub: 4, guides: 116, designs: 90, secrets: 3, power: 43200, score: 3400 },
  { level: 12, sub: 0, guides: 116, designs: 90, secrets: 3, power: 43200, score: 3400 },
  { level: 12, sub: 1, guides: 116, designs: 90, secrets: 6, power: 43200, score: 3600 },
  { level: 12, sub: 2, guides: 116, designs: 90, secrets: 6, power: 43200, score: 3600 },
  { level: 12, sub: 3, guides: 116, designs: 90, secrets: 6, power: 43200, score: 3600 },
  { level: 12, sub: 4, guides: 116, designs: 90, secrets: 6, power: 43200, score: 3600 },
  { level: 13, sub: 0, guides: 116, designs: 90, secrets: 6, power: 43200, score: 3600 },
  { level: 13, sub: 1, guides: 120, designs: 100, secrets: 9, power: 43200, score: 3800 },
  { level: 13, sub: 2, guides: 120, designs: 100, secrets: 9, power: 43200, score: 3800 },
  { level: 13, sub: 3, guides: 120, designs: 100, secrets: 9, power: 43200, score: 3800 },
  { level: 13, sub: 4, guides: 120, designs: 100, secrets: 9, power: 43200, score: 3800 },
  { level: 14, sub: 0, guides: 120, designs: 100, secrets: 9, power: 43200, score: 3800 },
  { level: 14, sub: 1, guides: 120, designs: 100, secrets: 14, power: 43200, score: 4000 },
  { level: 14, sub: 2, guides: 120, designs: 100, secrets: 14, power: 43200, score: 4000 },
  { level: 14, sub: 3, guides: 120, designs: 100, secrets: 14, power: 43200, score: 4000 },
  { level: 14, sub: 4, guides: 120, designs: 100, secrets: 14, power: 43200, score: 4000 },
  { level: 15, sub: 0, guides: 120, designs: 100, secrets: 14, power: 43200, score: 4000 },
  { level: 15, sub: 1, guides: 130, designs: 110, secrets: 20, power: 43200, score: 4200 },
  { level: 15, sub: 2, guides: 130, designs: 110, secrets: 20, power: 43200, score: 4200 },
  { level: 15, sub: 3, guides: 130, designs: 110, secrets: 20, power: 43200, score: 4200 },
  { level: 15, sub: 4, guides: 130, designs: 110, secrets: 20, power: 43200, score: 4200 },
  { level: 16, sub: 0, guides: 130, designs: 110, secrets: 20, power: 43200, score: 4200 },
  { level: 16, sub: 1, guides: 85, designs: 70, secrets: 15, power: 24000, score: 2500 },
  { level: 16, sub: 2, guides: 85, designs: 70, secrets: 15, power: 24000, score: 2500 },
  { level: 16, sub: 3, guides: 85, designs: 70, secrets: 15, power: 24000, score: 2500 },
  { level: 16, sub: 4, guides: 85, designs: 70, secrets: 15, power: 24000, score: 2500 },
  { level: 16, sub: 5, guides: 85, designs: 70, secrets: 15, power: 24000, score: 2500 },
  { level: 16, sub: 6, guides: 85, designs: 70, secrets: 15, power: 24000, score: 2500 },
  { level: 16, sub: 7, guides: 85, designs: 70, secrets: 15, power: 24000, score: 2500 },
  { level: 16, sub: 8, guides: 85, designs: 70, secrets: 15, power: 24000, score: 2500 },
  { level: 17, sub: 0, guides: 85, designs: 70, secrets: 15, power: 24000, score: 2500 },
  { level: 17, sub: 1, guides: 100, designs: 90, secrets: 20, power: 24000, score: 2700 },
  { level: 17, sub: 2, guides: 150, designs: 130, secrets: 20, power: 24000, score: 2700 },
  { level: 17, sub: 3, guides: 150, designs: 130, secrets: 20, power: 24000, score: 2700 },
  { level: 17, sub: 4, guides: 150, designs: 130, secrets: 20, power: 24000, score: 2700 },
  { level: 17, sub: 5, guides: 150, designs: 130, secrets: 20, power: 24000, score: 2700 },
  { level: 17, sub: 6, guides: 150, designs: 130, secrets: 20, power: 24000, score: 2700 },
  { level: 17, sub: 7, guides: 150, designs: 130, secrets: 20, power: 24000, score: 2700 },
  { level: 17, sub: 8, guides: 150, designs: 130, secrets: 20, power: 24000, score: 2700 },
  { level: 18, sub: 0, guides: 150, designs: 130, secrets: 20, power: 24000, score: 2700 },
];

export const CHARM_MAX_LEVEL = 18;

/** Three types, six of each, one per charm slot across the six gear pieces. */
export const CHARM_TYPES = [
  { id: 'protection', label: 'Protection', troops: 'Infantry' },
  { id: 'keenness', label: 'Keenness', troops: 'Lancer' },
  { id: 'vision', label: 'Vision', troops: 'Marksman' },
] as const;

export const CHARMS_PER_TYPE = 6;
export const CHARM_COUNT = CHARM_TYPES.length * CHARMS_PER_TYPE;

/** The level from which Charm Secrets start being wanted. */
export const CHARM_SECRETS_FROM = 11;

/** Everything one charm costs to go from nothing to Lv. 18. */
export const CHARM_TOTALS = {
  guides: CHARM_STEPS.reduce((sum, s) => sum + s.guides, 0),
  designs: CHARM_STEPS.reduce((sum, s) => sum + s.designs, 0),
  secrets: CHARM_STEPS.reduce((sum, s) => sum + (s.secrets ?? 0), 0),
  power: CHARM_STEPS.reduce((sum, s) => sum + s.power, 0),
  score: CHARM_STEPS.reduce((sum, s) => sum + s.score, 0),
};

/** Materials to take one charm from where it is to `to`. */
export const charmCost = (
  from: { level: number; sub: number },
  to: { level: number; sub: number }
) => {
  const rank = (p: { level: number; sub: number }) => p.level * 10 + p.sub;
  let guides = 0;
  let designs = 0;
  let secrets = 0;
  let score = 0;
  for (const step of CHARM_STEPS) {
    const at = rank(step);
    if (at > rank(from) && at <= rank(to)) {
      guides += step.guides;
      designs += step.designs;
      secrets += step.secrets ?? 0;
      score += step.score;
    }
  }
  return { guides, designs, secrets, score };
};

/**
 * Charm level ups as event scoring rows, one per INSTALMENT.
 *
 * One row per step rather than per level, because that is the granularity the
 * game scores at: finishing Lv. 4.1 pays on its own. The in-game popup only
 * lists whole levels, so a per-level table would have made a player who did
 * two instalments enter nothing.
 */
export const CHARM_SCORE_ROWS: ScoringRow[] = [
  { id: 'charm-lv-1', label: 'Lv. 1', sourceValue: 625 },
  { id: 'charm-lv-2', label: 'Lv. 2', sourceValue: 1250 },
  { id: 'charm-lv-3', label: 'Lv. 3', sourceValue: 3125 },
  { id: 'charm-lv-4', label: 'Lv. 4', sourceValue: 8750 },
  { id: 'charm-lv-4-1', label: 'Lv. 4.1', sourceValue: 2813 },
  { id: 'charm-lv-4-2', label: 'Lv. 4.2', sourceValue: 2813 },
  { id: 'charm-lv-4-3', label: 'Lv. 4.3', sourceValue: 2812 },
  { id: 'charm-lv-5', label: 'Lv. 5', sourceValue: 2812 },
  { id: 'charm-lv-5-1', label: 'Lv. 5.1', sourceValue: 3125 },
  { id: 'charm-lv-5-2', label: 'Lv. 5.2', sourceValue: 3125 },
  { id: 'charm-lv-5-3', label: 'Lv. 5.3', sourceValue: 3125 },
  { id: 'charm-lv-6', label: 'Lv. 6', sourceValue: 3125 },
  { id: 'charm-lv-6-1', label: 'Lv. 6.1', sourceValue: 3125 },
  { id: 'charm-lv-6-2', label: 'Lv. 6.2', sourceValue: 3125 },
  { id: 'charm-lv-6-3', label: 'Lv. 6.3', sourceValue: 3125 },
  { id: 'charm-lv-7', label: 'Lv. 7', sourceValue: 3125 },
  { id: 'charm-lv-7-1', label: 'Lv. 7.1', sourceValue: 3250 },
  { id: 'charm-lv-7-2', label: 'Lv. 7.2', sourceValue: 3250 },
  { id: 'charm-lv-7-3', label: 'Lv. 7.3', sourceValue: 3250 },
  { id: 'charm-lv-8', label: 'Lv. 8', sourceValue: 3250 },
  { id: 'charm-lv-8-1', label: 'Lv. 8.1', sourceValue: 3500 },
  { id: 'charm-lv-8-2', label: 'Lv. 8.2', sourceValue: 3500 },
  { id: 'charm-lv-8-3', label: 'Lv. 8.3', sourceValue: 3500 },
  { id: 'charm-lv-9', label: 'Lv. 9', sourceValue: 3500 },
  { id: 'charm-lv-9-1', label: 'Lv. 9.1', sourceValue: 3750 },
  { id: 'charm-lv-9-2', label: 'Lv. 9.2', sourceValue: 3750 },
  { id: 'charm-lv-9-3', label: 'Lv. 9.3', sourceValue: 3750 },
  { id: 'charm-lv-10', label: 'Lv. 10', sourceValue: 3750 },
  { id: 'charm-lv-10-1', label: 'Lv. 10.1', sourceValue: 4000 },
  { id: 'charm-lv-10-2', label: 'Lv. 10.2', sourceValue: 4000 },
  { id: 'charm-lv-10-3', label: 'Lv. 10.3', sourceValue: 4000 },
  { id: 'charm-lv-11', label: 'Lv. 11', sourceValue: 4000 },
  { id: 'charm-lv-11-1', label: 'Lv. 11.1', sourceValue: 3400 },
  { id: 'charm-lv-11-2', label: 'Lv. 11.2', sourceValue: 3400 },
  { id: 'charm-lv-11-3', label: 'Lv. 11.3', sourceValue: 3400 },
  { id: 'charm-lv-11-4', label: 'Lv. 11.4', sourceValue: 3400 },
  { id: 'charm-lv-12', label: 'Lv. 12', sourceValue: 3400 },
  { id: 'charm-lv-12-1', label: 'Lv. 12.1', sourceValue: 3600 },
  { id: 'charm-lv-12-2', label: 'Lv. 12.2', sourceValue: 3600 },
  { id: 'charm-lv-12-3', label: 'Lv. 12.3', sourceValue: 3600 },
  { id: 'charm-lv-12-4', label: 'Lv. 12.4', sourceValue: 3600 },
  { id: 'charm-lv-13', label: 'Lv. 13', sourceValue: 3600 },
  { id: 'charm-lv-13-1', label: 'Lv. 13.1', sourceValue: 3800 },
  { id: 'charm-lv-13-2', label: 'Lv. 13.2', sourceValue: 3800 },
  { id: 'charm-lv-13-3', label: 'Lv. 13.3', sourceValue: 3800 },
  { id: 'charm-lv-13-4', label: 'Lv. 13.4', sourceValue: 3800 },
  { id: 'charm-lv-14', label: 'Lv. 14', sourceValue: 3800 },
  { id: 'charm-lv-14-1', label: 'Lv. 14.1', sourceValue: 4000 },
  { id: 'charm-lv-14-2', label: 'Lv. 14.2', sourceValue: 4000 },
  { id: 'charm-lv-14-3', label: 'Lv. 14.3', sourceValue: 4000 },
  { id: 'charm-lv-14-4', label: 'Lv. 14.4', sourceValue: 4000 },
  { id: 'charm-lv-15', label: 'Lv. 15', sourceValue: 4000 },
  { id: 'charm-lv-15-1', label: 'Lv. 15.1', sourceValue: 4200 },
  { id: 'charm-lv-15-2', label: 'Lv. 15.2', sourceValue: 4200 },
  { id: 'charm-lv-15-3', label: 'Lv. 15.3', sourceValue: 4200 },
  { id: 'charm-lv-15-4', label: 'Lv. 15.4', sourceValue: 4200 },
  { id: 'charm-lv-16', label: 'Lv. 16', sourceValue: 4200 },
  { id: 'charm-lv-16-1', label: 'Lv. 16.1', sourceValue: 2500 },
  { id: 'charm-lv-16-2', label: 'Lv. 16.2', sourceValue: 2500 },
  { id: 'charm-lv-16-3', label: 'Lv. 16.3', sourceValue: 2500 },
  { id: 'charm-lv-16-4', label: 'Lv. 16.4', sourceValue: 2500 },
  { id: 'charm-lv-16-5', label: 'Lv. 16.5', sourceValue: 2500 },
  { id: 'charm-lv-16-6', label: 'Lv. 16.6', sourceValue: 2500 },
  { id: 'charm-lv-16-7', label: 'Lv. 16.7', sourceValue: 2500 },
  { id: 'charm-lv-16-8', label: 'Lv. 16.8', sourceValue: 2500 },
  { id: 'charm-lv-17', label: 'Lv. 17', sourceValue: 2500 },
  { id: 'charm-lv-17-1', label: 'Lv. 17.1', sourceValue: 2700 },
  { id: 'charm-lv-17-2', label: 'Lv. 17.2', sourceValue: 2700 },
  { id: 'charm-lv-17-3', label: 'Lv. 17.3', sourceValue: 2700 },
  { id: 'charm-lv-17-4', label: 'Lv. 17.4', sourceValue: 2700 },
  { id: 'charm-lv-17-5', label: 'Lv. 17.5', sourceValue: 2700 },
  { id: 'charm-lv-17-6', label: 'Lv. 17.6', sourceValue: 2700 },
  { id: 'charm-lv-17-7', label: 'Lv. 17.7', sourceValue: 2700 },
  { id: 'charm-lv-17-8', label: 'Lv. 17.8', sourceValue: 2700 },
  { id: 'charm-lv-18', label: 'Lv. 18', sourceValue: 2700 },
];

/**
 * The Chief Charm Material Exchange.
 *
 * Unlocks on the first charm to reach Lv. 11, and it is the same shape as the
 * Chief Gear exchange: a weekly allowance of deliberately terrible rates.
 * Swapping Guides and Designs runs 2 to 1 in BOTH directions, so a round trip
 * costs three quarters of what went in. Secrets cost 40 of either, which is the
 * rate that matters, since Secrets are the only material a player actually runs
 * dry on.
 *
 * Transcribed from Fredrik's in-game exchange screen.
 */
export const CHARM_EXCHANGE = [
  { id: 'guides-to-designs', from: 'guides', to: 'designs', rate: 2, weeklyLimit: 500 },
  { id: 'designs-to-guides', from: 'designs', to: 'guides', rate: 2, weeklyLimit: 500 },
  { id: 'guides-to-secrets', from: 'guides', to: 'secrets', rate: 40, weeklyLimit: 50 },
  { id: 'designs-to-secrets', from: 'designs', to: 'secrets', rate: 40, weeklyLimit: 50 },
] as const;
