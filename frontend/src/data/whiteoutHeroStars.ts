/**
 * Hero shard costs for raising star level.
 *
 * A star is not a single purchase: each one is reached through six tiers, and a
 * hero can sit part way through. Someone at four stars who has paid three of
 * the six tiers toward the fifth needs only the remaining three, so the model
 * tracks stars AND tier progress rather than assuming whole stars.
 *
 * Star totals are 10, 40, 115, 300 and 600, which is 1,065 to take a hero you
 * already own from zero to five stars. Unlocking a hero you do not own costs a
 * further 10, so the most a single hero can ever absorb is 1,075.
 *
 * Shards beyond that ceiling score nothing, which is why the calculator caps
 * them.
 */

/**
 * Shards per tier, for each star. Row 0 is the cost of reaching the first star,
 * row 4 the cost of reaching the fifth.
 */
export const STAR_TIER_COSTS: number[][] = [
  [1, 1, 2, 2, 2, 2],
  [5, 5, 5, 5, 5, 15],
  [15, 15, 15, 15, 15, 40],
  [40, 40, 40, 40, 40, 100],
  [100, 100, 100, 100, 100, 100],
];

/** Shards to complete each star: 10, 40, 115, 300, 600. */
export const STAR_TOTALS: number[] = STAR_TIER_COSTS.map(tiers =>
  tiers.reduce((sum, n) => sum + n, 0)
);

export const MAX_STARS = STAR_TOTALS.length;

/** Tiers within a single star. */
export const TIERS_PER_STAR = STAR_TIER_COSTS[0].length;

/** Shards to unlock a hero that is not owned yet. */
export const HERO_UNLOCK_SHARDS = 10;

/** 1,065 to go from owned-at-zero-stars to five stars. */
export const SHARDS_ZERO_TO_MAX = STAR_TOTALS.reduce((sum, n) => sum + n, 0);

/** 1,075, the most a single hero can ever take. */
export const SHARDS_LOCKED_TO_MAX = SHARDS_ZERO_TO_MAX + HERO_UNLOCK_SHARDS;

export interface HeroStarState {
  /** Stars fully completed, 0 to 5. */
  stars: number;
  /** Tiers paid toward the next star, 0 to 5. Ignored at max stars. */
  tier: number;
  owned: boolean;
}

const clampStars = (stars: number) => Math.min(Math.max(Math.round(stars), 0), MAX_STARS);
const clampTier = (tier: number) => Math.min(Math.max(Math.round(tier), 0), TIERS_PER_STAR - 1);

/**
 * How many more shards this hero can still absorb, counting the unfinished
 * tiers of the star in progress and every star after it.
 */
export const shardsRemaining = (stars: number, tier: number, owned: boolean): number => {
  const s = clampStars(stars);
  const unlock = owned ? 0 : HERO_UNLOCK_SHARDS;
  if (s >= MAX_STARS) return unlock;

  const t = clampTier(tier);
  const restOfCurrentStar = STAR_TIER_COSTS[s].slice(t).reduce((sum, n) => sum + n, 0);
  const laterStars = STAR_TOTALS.slice(s + 1).reduce((sum, n) => sum + n, 0);
  return unlock + restOfCurrentStar + laterStars;
};

/** Where a hero ends up after spending `shards`, and what is left unusable. */
export const applyShards = (
  stars: number,
  tier: number,
  owned: boolean,
  shards: number
): HeroStarState & { used: number; leftOver: number } => {
  let left = Math.max(shards, 0);
  let s = clampStars(stars);
  let t = s >= MAX_STARS ? 0 : clampTier(tier);
  let nowOwned = owned;

  if (!nowOwned) {
    if (left < HERO_UNLOCK_SHARDS) {
      return { stars: s, tier: t, owned: nowOwned, used: 0, leftOver: left };
    }
    left -= HERO_UNLOCK_SHARDS;
    nowOwned = true;
  }

  while (s < MAX_STARS) {
    const cost = STAR_TIER_COSTS[s][t];
    if (left < cost) break;
    left -= cost;
    t += 1;
    if (t >= TIERS_PER_STAR) {
      s += 1;
      t = 0;
    }
  }

  return {
    stars: s,
    tier: t,
    owned: nowOwned,
    used: Math.max(shards, 0) - left,
    leftOver: left,
  };
};
