import {
  flatItemsInGroup,
  CONSUMABLE_GROUP_LABELS,
  type ConsumableGroup,
} from '../../data/whiteoutConsumables';
import type { WhiteoutInventory } from '../../models/whiteoutInventory';
import { consumableField } from './consumableField';
import classes from './WhiteoutUpgradePlanner.module.css';

interface ConsumableFieldsProps {
  inventory: WhiteoutInventory;
  onChange: (inventory: WhiteoutInventory) => void;
  /** Which backpack group to show. */
  group: ConsumableGroup;
  /** Shown above the fields. Omit where the card title already says it. */
  heading?: boolean;
}

/**
 * The backpack items belonging to one part of the game.
 *
 * These used to live together in a single Consumables card, which meant
 * entering Essence Stones in one place and the hero gear they go into in
 * another, several cards apart. Each group now sits in the card about the
 * thing it is spent on, so a player filling in pets does it all in one go.
 */
export const ConsumableFields = ({
  inventory,
  onChange,
  group,
  heading = false,
}: ConsumableFieldsProps) => {
  const items = flatItemsInGroup(group);
  if (!items.length) return null;
  return (
    <>
      {heading && <h4 className={classes.groupHeading}>{CONSUMABLE_GROUP_LABELS[group]}</h4>}
      <div className={classes.itemGrid}>
        {items.map(item =>
          consumableField(inventory, onChange, item.id, item.name, item.hint, item.note)
        )}
      </div>
    </>
  );
};
