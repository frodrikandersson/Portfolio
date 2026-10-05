import {
  CHIEF_GEAR_SLOTS,
  CHIEF_GEAR_SLOT_NAMES,
  CHIEF_GEAR_STEPS,
  CHIEF_GEAR_UPGRADES,
  chiefGearUpgradeLabel,
} from '../../data/whiteoutChiefGear';
import {
  chiefGearPositions,
  withChiefGearSlot,
  chiefGearExchangeOpen,
  type WhiteoutInventory,
} from '../../models/whiteoutInventory';
import { isUnpriced } from '../../utils/whiteoutChiefGearPlanner';
import { ConsumableFields } from './ConsumableFields';
import classes from './WhiteoutUpgradePlanner.module.css';
import { CollapsibleCard } from './CollapsibleCard';

interface ChiefGearCardProps {
  inventory: WhiteoutInventory;
  onChange: (inventory: WhiteoutInventory) => void;
}

/**
 * The ladder's own labels read like row ids: "MythicT2 (3-Star Status: 1)".
 * They have to stay that way in the data so they join the event's rows, so the
 * tidying happens here, where only a human sees it.
 */
const readable = (index: number) => {
  if (index < 0) return 'Nothing built';
  const step = CHIEF_GEAR_STEPS[index];
  const upgrade = CHIEF_GEAR_UPGRADES[step.upgrade];
  const name = chiefGearUpgradeLabel(upgrade);
  if (step.part === step.parts) return name;
  const previous = CHIEF_GEAR_UPGRADES[step.upgrade - 1];
  const from = previous ? chiefGearUpgradeLabel(previous) : 'start';
  return `${from}, part ${step.part} of ${step.parts} toward ${name}`;
};

/**
 * Where the six Chief Gear slots currently sit.
 *
 * Every slot walks the same ladder and they are independent, so this is six
 * copies of one question. The positions are step indices rather than tiers,
 * because the Status instalments score on their own and a slot can genuinely
 * be sitting part way through an upgrade.
 *
 * The materials are deliberately not repeated here. They are entered on the
 * Consumables card and shown again in the plan, and a third copy in between
 * was just something else to scroll past.
 */
export const ChiefGearCard = ({ inventory, onChange }: ChiefGearCardProps) => {
  const positions = chiefGearPositions(inventory);
  const open = chiefGearExchangeOpen(inventory);
  const stuck = positions.filter(p => isUnpriced(p)).length;

  const setSlot = (slot: number) => (value: number) =>
    onChange(withChiefGearSlot(inventory, slot, value));

  return (
    <CollapsibleCard id="chief-gear" title="Chief Gear" className={`${classes.buildingsCard}`}>
      <ConsumableFields inventory={inventory} onChange={onChange} group="chief-gear" heading />

      <div className={`${classes.fields} ${classes.gearSlots}`}>
        {Array.from({ length: CHIEF_GEAR_SLOTS }, (_, slot) => (
          <label key={slot} className={classes.field}>
            <span className={classes.fieldLabel}>{CHIEF_GEAR_SLOT_NAMES[slot]}</span>
            <select
              className={`${classes.input} ${positions[slot] < 0 ? classes.inputEmpty : ''}`}
              value={positions[slot]}
              onChange={e => setSlot(slot)(Number(e.target.value))}
            >
              <option value={-1}>Nothing built</option>
              {CHIEF_GEAR_STEPS.map((_, index) => (
                <option key={index} value={index}>
                  {readable(index)}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      {/* Only raised once a slot has unlocked the exchange. Before that it is
          not a choice the player has. */}
      {open && (
        <p className={classes.warnLine}>
          The exchange is open. Avoid breaking Design Plans down into Alloy or Polishing Solution
          unless you have to: a plan buys 300 Alloy and costs 1,000 to buy back.
        </p>
      )}

      {stuck > 0 && (
        <p className={classes.cardNote}>
          {stuck === CHIEF_GEAR_SLOTS ? 'Every slot' : `${stuck} slots`} sit at a step whose next
          cost nobody has, so the plan stops there.
        </p>
      )}
    </CollapsibleCard>
  );
};
