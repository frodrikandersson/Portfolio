// VIP: the level ladder, what a level costs in gems, and VIP Time.
//
// TWO THINGS ARE CALLED "VIP" AND THEY ARE NOT THE SAME.
//
//   VIP LEVEL is permanent. It is bought with VIP Points, and the level is what
//   unlocks the deeper rows of the VIP shop.
//
//   VIP TIME is a subscription. It is what makes the VIP perks active at all,
//   and it runs out. Buying 30 days of it does nothing for your level.
//
// The in-game screen that sells VIP Time sells only Time, so gems spent there
// never move the level. Gems raise the level through VIP Points instead, at
// about 2 gems a point.
//
// SOURCING. The ladder was parsed out of the raw HTML of three sites rather
// than taken from a summary. Ten of the eleven steps were unanimous; the step
// into VIP 7 was not, with whiteoutdata.com and heaven-guardian.com on 70,000
// and wostools.net on 60,000. Fredrik read it off the game: it is 60,000, so
// wostools was right and the other two were wrong together.
//
// Worth remembering the shape of that mistake. Two sites agreeing is not two
// pieces of evidence when the sites copy each other, and picking the majority
// treated it as though it were. The totals now come out at 4,800,000 VIP
// Points to reach VIP 12, which is what wostools printed all along.
//
// EDIT FREELY: correcting a number here is all that is needed.

/** Gems for one VIP Point, the rate every source agrees on. */
export const GEMS_PER_VIP_POINT = 2;

/**
 * VIP Points to go from the level below up to this one.
 *
 * Per level, not cumulative: the game resets your points to zero on each level
 * up. Level 1 is where everyone starts, so there is no step into it.
 */
export const VIP_LEVEL_STEP: Record<number, number> = {
  2: 2_500,
  3: 5_000,
  4: 12_500,
  5: 30_000,
  6: 40_000,
  // Read off the game by Fredrik. Two community sites say 70,000; they are wrong.
  7: 60_000,
  8: 100_000,
  9: 350_000,
  10: 600_000,
  11: 1_200_000,
  12: 2_400_000,
};

export const VIP_MAX_LEVEL = 12;

/** VIP Points still to pay to get from `level` to `to`. */
export const vipPointsBetween = (level: number, to: number) => {
  let total = 0;
  for (let n = Math.max(level, 1) + 1; n <= Math.min(to, VIP_MAX_LEVEL); n += 1) {
    total += VIP_LEVEL_STEP[n] ?? 0;
  }
  return total;
};

/** Gems to buy that outright, which is the ceiling rather than the plan. */
export const vipGemsBetween = (level: number, to: number) =>
  vipPointsBetween(level, to) * GEMS_PER_VIP_POINT;

/**
 * VIP Time for gems, straight off the in-game "Obtain more" screen.
 *
 * Note the rate improves with the bundle: 30 days costs less per day than 24
 * hours does, which is the only choice on this screen worth making.
 */
export const VIP_TIME_PRICES = [
  { id: 'vip-time-24h', label: '24h VIP Time', hours: 24, gems: 1_000 },
  { id: 'vip-time-7d', label: '7d VIP Time', hours: 24 * 7, gems: 3_000 },
  { id: 'vip-time-30d', label: '30d VIP Time', hours: 24 * 30, gems: 10_000 },
] as const;
