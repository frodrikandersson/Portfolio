import { SIGIL_ITEMS, CONSUMABLE_GROUP_LABELS } from '../../data/whiteoutConsumables';
import type { WhiteoutInventory } from '../../models/whiteoutInventory';
import { consumableField } from './consumableField';
import classes from './WhiteoutUpgradePlanner.module.css';

interface SigilSectionProps {
  inventory: WhiteoutInventory;
  onChange: (inventory: WhiteoutInventory) => void;
}

/**
 * Expert Sigils, all ten of them.
 *
 * Nine of these used to sit behind a "Show all ten" toggle. Collapsing them
 * saved a little room and cost rather more: a sigil you cannot see is one you
 * do not fill in, and the gate costs on every expert are charged in their own
 * sigil, so a blank one quietly understates what an expert still needs.
 */
export const SigilSection = ({ inventory, onChange }: SigilSectionProps) => {
  const f = (id: string, label: string, hint?: string, note?: string) =>
    consumableField(inventory, onChange, id, label, hint, note);

  return (
    <div className={classes.widgetBlock}>
      <span className={classes.groupHeading}>{CONSUMABLE_GROUP_LABELS['expert-sigil']}</span>
      <div className={classes.itemGrid}>
        {f(SIGIL_ITEMS[0].id, SIGIL_ITEMS[0].name, SIGIL_ITEMS[0].hint, SIGIL_ITEMS[0].note)}
      </div>
      <div className={classes.itemGrid}>
        {SIGIL_ITEMS.slice(1).map(item => f(item.id, item.name, undefined, item.note))}
      </div>
    </div>
  );
};
