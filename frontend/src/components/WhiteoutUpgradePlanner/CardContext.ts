import { createContext } from 'react';
import type { WhiteoutInventory } from '../../models/whiteoutInventory';

/**
 * Which account the inventory cards belong to, and what is in it.
 *
 * A context rather than fifteen pairs of props. The eight cards that live in
 * files of their own already take `inventory`, but the card shell needs the
 * ACCOUNT id too, and threading that through every one of them to reach a
 * detail of how a header is drawn would be a lot of noise for nothing.
 *
 * In a file of its own because a module that exports both a component and a
 * context breaks fast refresh.
 */
export const CardContext = createContext<{
  accountId: string;
  inventory: WhiteoutInventory | null;
}>({ accountId: '', inventory: null });
