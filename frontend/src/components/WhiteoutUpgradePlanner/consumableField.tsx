import { consumableCount, withConsumable, type WhiteoutInventory } from '../../models/whiteoutInventory';
import { consumableIcon } from '../../data/whiteoutItemIcons';
import { AmountInput } from './AmountInput';

/**
 * One backpack item's field, wherever it is shown.
 *
 * Exported because the widget and sigil blocks build their own rows out of it
 * and should not each reinvent the icon and the write-back.
 */
export const consumableField = (
  inventory: WhiteoutInventory,
  onChange: (inventory: WhiteoutInventory) => void,
  id: string,
  label: string,
  hint?: string,
  note?: string
) => (
  <AmountInput
    key={id}
    label={label}
    icon={consumableIcon(id)}
    hint={hint}
    title={note}
    value={consumableCount(inventory, id)}
    onChange={value => onChange(withConsumable(inventory, id, value))}
  />
);
