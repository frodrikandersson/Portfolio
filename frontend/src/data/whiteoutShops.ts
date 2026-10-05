// Gem shops: what gems can be turned into.
//
// WHY THIS MATTERS FOR SCORING, and it matters more than it first looks.
// Fredrik confirmed that SPENDING GEMS IN A SHOP COUNTS AS USING THEM for the
// events that pay per gem. So a shop purchase scores twice: once for the gems
// going out, and again when the item itself is used on a row that pays for it,
// which can be a different day or a different event entirely. Buying is
// therefore never worse than sitting on the gems, and the only question is
// which row to buy into.
//
// TWO SHOPS, TWO BEHAVIOURS:
//
//   The general shop never runs out and never resets, so it is a standing
//   conversion rate with no ceiling.
//
//   The VIP shop resets every Monday and every row has a purchase limit, so it
//   is a weekly allowance. Its deeper rows are gated on VIP level, so the
//   allowance grows as the level does.
//
// PRICES FOR THE VIP-LOCKED ROWS ARE NOT KNOWN. The game shows "Reach VIP Lv. N
// to unlock" in place of the price until you qualify, so those entries carry
// their identity and their VIP requirement and a null price. They are here
// rather than omitted because what they ARE is the interesting part: Essence
// Stones, Design Plans, Polishing Solution and Charm Design are all sold for
// gems, which turns gems into chief gear and hero gear progress.
//
// SOURCING. Every name, price and limit below is transcribed from Fredrik's
// in-game Buy dialogs and item tooltips, not from an icon.
//
// EDIT FREELY: adding a row here is all that is needed.

export type ShopId = 'general' | 'vip';

export const SHOP_LABELS: Record<ShopId, string> = {
  general: 'General shop',
  vip: 'VIP shop',
};

export const SHOP_RESET: Record<ShopId, string> = {
  general: 'never resets, never runs out',
  vip: 'resets every Monday',
};

/** What a purchase turns into, where the calculator already models that thing. */
export interface ShopGrants {
  /** Backpack id, for anything that lands in `inventory.consumables`. */
  consumableId?: string;
  /** Minutes of General speedup. */
  speedupMinutes?: number;
  /** Chief Stamina restored. */
  stamina?: number;
  /** A resource bundle. */
  resource?: { kind: 'meat' | 'wood' | 'coal' | 'iron'; amount: number };
  /** Hero shards by rarity, for the General Hero Shard rows. */
  heroShard?: { rarity: 'rare' | 'epic' | 'mythic'; count: number };
  /** Hero gear Enhancement XP, for the component rows. */
  enhancementXp?: number;
  /** Hero EXP, which nothing scores yet. */
  heroExp?: number;
}

export interface ShopEntry {
  id: string;
  shop: ShopId;
  label: string;
  /** Gems per purchase, or null where the row is locked and shows no price. */
  gems: number | null;
  /** Purchases per reset, or null where the row never runs out. */
  limit: number | null;
  /** VIP level needed before the row appears at all. */
  vipRequired?: number;
  /** The discount badge the shop shows, which is flavour rather than price. */
  discountPercent?: number;
  grants: ShopGrants;
  note?: string;
}

export const SHOP_ENTRIES: ShopEntry[] = [
  // ---- general shop: no limits, no reset ---------------------------------
  { id: 'gen-chief-stamina', shop: 'general', label: 'Chief Stamina', gems: 300, limit: null, grants: { stamina: 10 } },
  { id: 'gen-hero-xp-1k', shop: 'general', label: '1,000 Hero XP', gems: 30, limit: null, grants: { heroExp: 1_000 } },
  { id: 'gen-gold-key', shop: 'general', label: 'Gold Key', gems: 1_500, limit: null, grants: { consumableId: 'gold-key' }, note: 'One Epic Recruitment.' },
  { id: 'gen-platinum-key', shop: 'general', label: 'Platinum Key', gems: 500, limit: null, grants: { consumableId: 'platinum-key' }, note: 'One Advanced Recruitment.' },
  { id: 'gen-rare-exploration', shop: 'general', label: 'Rare Exploration Manual', gems: 150, limit: null, grants: {} },
  { id: 'gen-epic-exploration', shop: 'general', label: 'Epic Exploration Manual', gems: 500, limit: null, grants: {} },
  { id: 'gen-rare-expedition', shop: 'general', label: 'Rare Expedition Skill Manual', gems: 150, limit: null, grants: {} },
  { id: 'gen-epic-expedition', shop: 'general', label: 'Epic Expedition Skill Manual', gems: 500, limit: null, grants: {} },
  { id: 'gen-megaphone', shop: 'general', label: 'Server Megaphone', gems: 400, limit: null, grants: {}, note: 'Cosmetic. Nothing scores it.' },
  { id: 'gen-loyalty-tag', shop: 'general', label: 'Loyalty Tag', gems: 1_000, limit: null, grants: {}, note: 'Worth 1,000 Loyalty for enlisting troops.' },
  { id: 'gen-common-wild-mark', shop: 'general', label: 'Common Wild Mark', gems: 500, limit: null, grants: { consumableId: 'common-wild-mark' } },

  // ---- VIP shop: weekly, Monday -------------------------------------------
  { id: 'vip-meat-10k', shop: 'vip', label: '10K Meat (Secured)', gems: 2, limit: 200, discountPercent: 60, grants: { resource: { kind: 'meat', amount: 10_000 } } },
  { id: 'vip-wood-10k', shop: 'vip', label: '10K Wood (Secured)', gems: 2, limit: 200, discountPercent: 60, grants: { resource: { kind: 'wood', amount: 10_000 } } },
  { id: 'vip-coal-10k', shop: 'vip', label: '10K Coal (Secured)', gems: 10, limit: 200, discountPercent: 60, grants: { resource: { kind: 'coal', amount: 10_000 } } },
  { id: 'vip-iron-10k', shop: 'vip', label: '10K Iron (Secured)', gems: 40, limit: 200, discountPercent: 60, grants: { resource: { kind: 'iron', amount: 10_000 } } },

  { id: 'vip-chief-stamina', shop: 'vip', label: 'Chief Stamina', gems: 100, limit: null, discountPercent: 67, grants: { stamina: 10 }, note: 'Was sold out when captured, so the weekly limit is unknown.' },

  { id: 'vip-speedup-5m', shop: 'vip', label: '5m General Speedup', gems: 40, limit: 50, discountPercent: 40, grants: { speedupMinutes: 5 } },
  { id: 'vip-speedup-1h', shop: 'vip', label: '1h General Speedup', gems: 500, limit: 20, discountPercent: 38, grants: { speedupMinutes: 60 } },
  { id: 'vip-speedup-3h', shop: 'vip', label: '3h General Speedup', gems: 1_500, limit: 5, discountPercent: 38, grants: { speedupMinutes: 180 } },

  { id: 'vip-hero-exp-5k', shop: 'vip', label: '5,000 Hero XP', gems: 90, limit: 20, discountPercent: 40, grants: { heroExp: 5_000 } },
  { id: 'vip-hero-exp-10k', shop: 'vip', label: '10,000 Hero XP', gems: 150, limit: 10, discountPercent: 50, grants: { heroExp: 10_000 } },

  { id: 'vip-rare-exploration', shop: 'vip', label: 'Rare Exploration Manual', gems: 75, limit: 20, discountPercent: 50, grants: {} },
  { id: 'vip-rare-expedition', shop: 'vip', label: 'Rare Expedition Skill Manual', gems: 75, limit: 20, discountPercent: 50, grants: {} },
  { id: 'vip-epic-exploration', shop: 'vip', label: 'Epic Exploration Manual', gems: 250, limit: 10, discountPercent: 50, grants: {} },
  { id: 'vip-epic-expedition', shop: 'vip', label: 'Epic Expedition Skill Manual', gems: 250, limit: 10, discountPercent: 50, grants: {} },
  { id: 'vip-mythic-exploration', shop: 'vip', label: 'Mythic Exploration Manual', gems: 500, limit: 5, discountPercent: 50, grants: {} },
  { id: 'vip-mythic-expedition', shop: 'vip', label: 'Mythic Expedition Skill Manual', gems: 500, limit: 5, discountPercent: 50, grants: {} },

  { id: 'vip-shard-rare', shop: 'vip', label: 'Rare General Hero Shard', gems: 250, limit: 20, discountPercent: 50, grants: { heroShard: { rarity: 'rare', count: 1 } } },
  { id: 'vip-shard-epic', shop: 'vip', label: 'Epic General Hero Shard', gems: 500, limit: 10, discountPercent: 50, grants: { heroShard: { rarity: 'epic', count: 1 } } },
  { id: 'vip-shard-mythic', shop: 'vip', label: 'Mythic General Hero Shard', gems: 2_500, limit: 10, vipRequired: 7, discountPercent: 50, grants: { heroShard: { rarity: 'mythic', count: 1 } }, note: 'Excludes Natalia and Jeronimo.' },

  { id: 'vip-enhancement-100', shop: 'vip', label: '100 Enhancement XP Component', gems: 250, limit: 5, discountPercent: 75, grants: { enhancementXp: 100 } },
  { id: 'vip-teleporter', shop: 'vip', label: 'Advanced Teleporter', gems: 2_000, limit: 2, discountPercent: 50, grants: {} },

  // ---- VIP shop, still locked: identity known, price not ------------------
  { id: 'vip-advanced-wild-mark', shop: 'vip', label: 'Advanced Wild Mark', gems: null, limit: null, vipRequired: 8, discountPercent: 50, grants: { consumableId: 'advanced-wild-mark' } },
  { id: 'vip-essence-stones', shop: 'vip', label: 'Essence Stones', gems: null, limit: null, vipRequired: 8, discountPercent: 40, grants: { consumableId: 'essence-stone' } },
  { id: 'vip-frontier-supply', shop: 'vip', label: 'Frontier Supply', gems: null, limit: null, vipRequired: 9, discountPercent: 40, grants: {} },
  { id: 'vip-polishing-solution', shop: 'vip', label: 'Polishing Solution', gems: null, limit: null, vipRequired: 9, discountPercent: 50, grants: { consumableId: 'polishing-solution' } },
  { id: 'vip-enemy-def-down', shop: 'vip', label: 'Enemy Troops Defense Down II (12hrs)', gems: null, limit: null, vipRequired: 9, discountPercent: 50, grants: {} },
  { id: 'vip-enemy-atk-down', shop: 'vip', label: 'Enemy Troops Attack Down II (12hrs)', gems: null, limit: null, vipRequired: 9, discountPercent: 50, grants: {} },
  { id: 'vip-speedup-8h', shop: 'vip', label: '8h General Speedup', gems: null, limit: null, vipRequired: 10, discountPercent: 38, grants: { speedupMinutes: 480 } },
  { id: 'vip-design-plans', shop: 'vip', label: 'Design Plans', gems: null, limit: null, vipRequired: 10, discountPercent: 40, grants: { consumableId: 'design-plans' } },
  { id: 'vip-troops-health-up', shop: 'vip', label: 'Troops Health Up II (12hrs)', gems: null, limit: null, vipRequired: 11, discountPercent: 50, grants: {} },
  { id: 'vip-troops-def-up', shop: 'vip', label: 'Troops Defense Up II (12hrs)', gems: null, limit: null, vipRequired: 11, discountPercent: 50, grants: {} },
  { id: 'vip-charm-design', shop: 'vip', label: 'Charm Design', gems: null, limit: null, vipRequired: 11, discountPercent: 40, grants: { consumableId: 'charm-design' } },
  { id: 'vip-troops-atk-up', shop: 'vip', label: 'Troops Attack Up II (12hrs)', gems: null, limit: null, vipRequired: 12, discountPercent: 50, grants: {} },
  { id: 'vip-deployment-boost', shop: 'vip', label: 'Deployment Capacity Boost II (12hrs)', gems: null, limit: null, vipRequired: 12, discountPercent: 50, grants: {} },
];

/** Rows a player can actually see and buy at a given VIP level. */
export const shopEntriesFor = (shop: ShopId, vipLevel: number) =>
  SHOP_ENTRIES.filter(e => e.shop === shop && (e.vipRequired ?? 0) <= vipLevel);

/** Rows that are visible but whose price nobody has captured yet. */
export const shopEntriesWithoutPrice = () => SHOP_ENTRIES.filter(e => e.gems === null);

/** Gems needed to clear a shop's limits once, for the rows that are priced. */
export const weeklyGemCeiling = (shop: ShopId, vipLevel = 99) =>
  shopEntriesFor(shop, vipLevel)
    .filter(e => e.gems !== null && e.limit !== null)
    .reduce((sum, e) => sum + (e.gems ?? 0) * (e.limit ?? 0), 0);
